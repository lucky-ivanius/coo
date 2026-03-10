;; title: core
;; version: 0.1.0
;; summary: Clarity Optimistic Oracle - Core Contract
;; description: Trustless Assertion Layer for the Stacks Ecosystem.

;; constants

;; Protocol parameters
(define-constant DEFAULT_LIVENESS u144)
(define-constant MIN_BOND_MULTIPLIER u2)
(define-constant PROTOCOL_FEE_BPS u0)

;; Status constants
(define-constant STATUS_REQUESTED u1)
(define-constant STATUS_ASSERTED u2)
(define-constant STATUS_DISPUTED u3)
(define-constant STATUS_SETTLED u4)
(define-constant STATUS_REJECTED u5)

;; error codes
(define-constant ERR_NOT_FOUND (err u100))
(define-constant ERR_ALREADY_ASSERTED (err u101))
(define-constant ERR_INVALID_STATUS (err u102))
(define-constant ERR_BOND_TOO_LOW (err u103))
(define-constant ERR_WINDOW_OPEN (err u104))
(define-constant ERR_WINDOW_CLOSED (err u105))
(define-constant ERR_ALREADY_DISPUTED (err u106))
(define-constant ERR_NOT_ARBITER (err u107))
(define-constant ERR_TRANSFER_FAILED (err u108))
(define-constant ERR_INVALID_REWARD (err u109))
(define-constant ERR_ALREADY_REQUESTED (err u110))
(define-constant ERR_INVALID_LIVENESS (err u111))
(define-constant ERR_UNAUTHORIZED (err u401))

;; data maps

(define-map request-map
  (buff 32)
  {
    requester: principal,
    reward-sats: uint,
    liveness: uint,
    status: uint,
    created-at-block: uint,
  }
)

(define-map assertion-map
  (buff 32)
  {
    asserter: principal,
    claim-hash: (buff 32),
    bond-sats: uint,
    asserted-at-block: uint,
  }
)

;; read-only functions

(define-read-only (get-default-liveness)
  DEFAULT_LIVENESS
)
(define-read-only (get-min-bond-multiplier)
  MIN_BOND_MULTIPLIER
)
(define-read-only (get-protocol-fee-bps)
  PROTOCOL_FEE_BPS
)

(define-read-only (get-request (statement-id (buff 32)))
  (map-get? request-map statement-id)
)

(define-read-only (get-assertion (statement-id (buff 32)))
  (map-get? assertion-map statement-id)
)

(define-read-only (is-liveness-expired (statement-id (buff 32)))
  (let (
      (request-entry (unwrap! (map-get? request-map statement-id) ERR_NOT_FOUND))
      (assertion-entry (unwrap! (map-get? assertion-map statement-id) ERR_NOT_FOUND))
    )
    (ok (>= stacks-block-height
      (+ (get asserted-at-block assertion-entry) (get liveness request-entry))
    ))
  )
)

;; public functions

(define-public (request
    (statement-id (buff 32))
    (reward-sats uint)
    (liveness uint)
  )
  (begin
    (asserts! (> reward-sats u0) ERR_INVALID_REWARD)
    (asserts! (> liveness u0) ERR_INVALID_LIVENESS)
    (asserts! (is-none (map-get? request-map statement-id)) ERR_ALREADY_REQUESTED)
    (try! (restrict-assets? contract-caller ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token "sbtc-token"
      reward-sats
    ))
      (unwrap!
        (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
          transfer reward-sats contract-caller current-contract none
        )
        ERR_TRANSFER_FAILED
      )
    ))
    (map-set request-map statement-id {
      requester: tx-sender,
      reward-sats: reward-sats,
      liveness: liveness,
      status: STATUS_REQUESTED,
      created-at-block: stacks-block-height,
    })
    (ok true)
  )
)

(define-public (assert
    (statement-id (buff 32))
    (claim-hash (buff 32))
    (bond-sats uint)
  )
  (let ((request-entry (unwrap! (map-get? request-map statement-id) ERR_NOT_FOUND)))
    (asserts! (is-eq (get status request-entry) STATUS_REQUESTED)
      ERR_ALREADY_ASSERTED
    )
    (asserts!
      (>= bond-sats (* MIN_BOND_MULTIPLIER (get reward-sats request-entry)))
      ERR_BOND_TOO_LOW
    )
    (try! (restrict-assets? contract-caller ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token "sbtc-token"
      bond-sats
    ))
      (unwrap!
        (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
          transfer bond-sats contract-caller current-contract none
        )
        ERR_TRANSFER_FAILED
      )
    ))
    (map-set assertion-map statement-id {
      asserter: tx-sender,
      claim-hash: claim-hash,
      bond-sats: bond-sats,
      asserted-at-block: stacks-block-height,
    })
    (map-set request-map statement-id
      (merge request-entry { status: STATUS_ASSERTED })
    )
    (ok true)
  )
)
