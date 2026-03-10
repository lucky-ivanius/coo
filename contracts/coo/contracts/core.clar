;; title: core
;; version: 0.1.0
;; summary: Clarity Optimistic Oracle - Core Contract
;; description: Trustless Assertion Layer for the Stacks Ecosystem.

;; constants

;; Protocol parameters
(define-constant DEFAULT_LIVENESS u144)
(define-constant MIN_LIVENESS u1)
(define-constant MIN_BOND_SATS u10000)

;; Status constants
(define-constant STATUS_ASSERTED u1)
(define-constant STATUS_DISPUTED u2)
(define-constant STATUS_SETTLED u3)
(define-constant STATUS_REJECTED u4)

;; Error codes
(define-constant ERR_NOT_FOUND (err u100))
(define-constant ERR_ALREADY_EXISTS (err u101))
(define-constant ERR_INVALID_STATUS (err u102))
(define-constant ERR_BOND_TOO_LOW (err u103))
(define-constant ERR_WINDOW_OPEN (err u104))
(define-constant ERR_WINDOW_CLOSED (err u105))
(define-constant ERR_ALREADY_DISPUTED (err u106))
(define-constant ERR_NOT_ARBITER (err u107))
(define-constant ERR_SERIALIZATION_FAILED (err u108))
(define-constant ERR_INVALID_LIVENESS (err u109))
(define-constant ERR_TRANSFER_FAILED (err u110))
(define-constant ERR_UNAUTHORIZED (err u401))

;; data maps

(define-map assertion-map
  (buff 32)
  {
    asserter: principal,
    claim-hash: (buff 32),
    bond-sats: uint,
    asserted-at-block: uint,
    liveness: uint,
    status: uint,
  }
)

;; private functions

(define-private (derive-assertion-id
    (identifier (buff 32))
    (claim (buff 2048))
    (bond-sats uint)
    (liveness uint)
  )
  (let (
      (bond-buff (unwrap! (to-consensus-buff? bond-sats) ERR_SERIALIZATION_FAILED))
      (liveness-buff (unwrap! (to-consensus-buff? liveness) ERR_SERIALIZATION_FAILED))
    )
    ;; identifier and claim are already buffs, pass directly into concat
    ;; sha256 over concatenated buffs -> (buff 32)
    (ok (sha256 (concat (concat (concat identifier claim) bond-buff) liveness-buff)))
  )
)

;; read-only functions

(define-read-only (get-default-liveness)
  DEFAULT_LIVENESS
)

(define-read-only (get-min-bond-sats)
  MIN_BOND_SATS
)

(define-read-only (get-assertion (assertion-id (buff 32)))
  (map-get? assertion-map assertion-id)
)

(define-read-only (is-liveness-expired (assertion-id (buff 32)))
  (let ((assertion-entry (unwrap! (map-get? assertion-map assertion-id) ERR_NOT_FOUND)))
    (ok (>= stacks-block-height
      (+ (get asserted-at-block assertion-entry) (get liveness assertion-entry))
    ))
  )
)

;; public functions

(define-public (assert
    (identifier (buff 32))
    (claim (buff 2048))
    (bond-sats uint)
    (liveness (optional uint))
  )
  (let ((resolved-liveness (default-to DEFAULT_LIVENESS liveness)))
    ;; only validate if caller provided a custom liveness
    (and
      (is-some liveness)
      (asserts! (>= resolved-liveness MIN_LIVENESS) ERR_INVALID_LIVENESS)
    )
    (let ((assertion-id (try! (derive-assertion-id identifier claim bond-sats resolved-liveness))))
      (asserts! (is-none (map-get? assertion-map assertion-id))
        ERR_ALREADY_EXISTS
      )
      (asserts! (>= bond-sats MIN_BOND_SATS) ERR_BOND_TOO_LOW)
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
      (map-set assertion-map assertion-id {
        asserter: tx-sender,
        claim-hash: (sha256 claim),
        bond-sats: bond-sats,
        asserted-at-block: stacks-block-height,
        liveness: resolved-liveness,
        status: STATUS_ASSERTED,
      })
      (print {
        event: "asserted",
        data: {
          assertion-id: assertion-id,
          identifier: identifier,
          claim: claim,
          bond-sats: bond-sats,
          liveness: resolved-liveness,
        },
      })
      (ok assertion-id)
    )
  )
)
