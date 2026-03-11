;; title: core
;; version: 0.1.0
;; summary: Clarity Optimistic Oracle - Core Contract
;; description: Trustless Assertion Layer for the Stacks Ecosystem.

;; constants

;; Protocol parameters
(define-constant DEFAULT_LIVENESS u1440)
(define-constant MIN_LIVENESS u1)
(define-constant MIN_BOND_SATS u10000)

;; Status constants
(define-constant STATUS_ASSERTED u1)
(define-constant STATUS_DISPUTED u2)
(define-constant STATUS_SETTLED u3)
(define-constant STATUS_REJECTED u4)

;; Error codes

;; 400 error codes
(define-constant ERR_ASSERTION_BOND_TOO_LOW (err u400103))
(define-constant ERR_ASSERTION_INVALID_LIVENESS (err u400104))
(define-constant ERR_WINDOW_OPEN (err u400001))
(define-constant ERR_WINDOW_CLOSED (err u400002))
(define-constant ERR_INVALID_STATUS (err u400003))
(define-constant ERR_TRANSFER_FAILED (err u400004))
;; 401 error codes
(define-constant ERR_UNAUTHORIZED (err u401001))
;; 404 error codes
(define-constant ERR_ASSERTION_NOT_FOUND (err u404101))
;; 409 error codes
(define-constant ERR_ASSERTION_ALREADY_EXISTS (err u409100))
;; 500 error codes
(define-constant ERR_SERIALIZATION_FAILED (err u500001))

;; data maps

(define-map assertion-map
  (buff 32)
  {
    asserter: principal,
    disputer: (optional principal),
    claim-hash: (buff 32),
    bond-sats: uint,
    liveness: uint,
    status: uint,
    asserted-at-block: uint,
    disputed-at-block: (optional uint),
    settled-at-block: (optional uint),
  }
)

;; private functions

(define-private (derive-assertion-id
    (identifier (buff 32))
    (claim (buff 2048))
    (bond-sats uint)
    (liveness uint)
    (asserted-at-block uint)
  )
  (let (
      (bond-buff (unwrap! (to-consensus-buff? bond-sats) ERR_SERIALIZATION_FAILED))
      (liveness-buff (unwrap! (to-consensus-buff? liveness) ERR_SERIALIZATION_FAILED))
      (asserted-buff (unwrap! (to-consensus-buff? asserted-at-block) ERR_SERIALIZATION_FAILED))
    )
    ;; identifier and claim are already buffs, pass directly into concat
    ;; sha256 over concatenated buffs -> (buff 32)
    (ok (sha256 (concat (concat (concat (concat identifier claim) bond-buff) liveness-buff)
      asserted-buff
    )))
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

(define-read-only (is-window-open (expiry-block uint))
  (>= expiry-block stacks-block-height)
)

(define-read-only (is-window-closed (expiry-block uint))
  (>= stacks-block-height expiry-block)
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
      (asserts! (>= resolved-liveness MIN_LIVENESS) ERR_ASSERTION_INVALID_LIVENESS)
    )
    (let (
        (asserted-at-block stacks-block-height)
        (assertion-id (try! (derive-assertion-id identifier claim bond-sats resolved-liveness
          asserted-at-block
        )))
      )
      (asserts! (is-none (map-get? assertion-map assertion-id))
        ERR_ASSERTION_ALREADY_EXISTS
      )
      (asserts! (>= bond-sats MIN_BOND_SATS) ERR_ASSERTION_BOND_TOO_LOW)
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
        disputer: none,
        claim-hash: (sha256 claim),
        bond-sats: bond-sats,
        asserted-at-block: asserted-at-block,
        disputed-at-block: none,
        settled-at-block: none,
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
          asserted-at-block: asserted-at-block,
        },
      })
      (ok assertion-id)
    )
  )
)

(define-public (settle (assertion-id (buff 32)))
  (let ((assertion (unwrap! (map-get? assertion-map assertion-id) ERR_ASSERTION_NOT_FOUND)))
    (asserts! (is-eq (get status assertion) STATUS_ASSERTED) ERR_INVALID_STATUS)
    (asserts!
      (is-window-closed (+ (get asserted-at-block assertion) (get liveness assertion)))
      ERR_WINDOW_OPEN
    )

    (let (
        (bond-sats (get bond-sats assertion))
        (asserter (get asserter assertion))
        (settled-at-block stacks-block-height)
      )
      (map-set assertion-map assertion-id
        (merge assertion {
          status: STATUS_SETTLED,
          settled-at-block: (some settled-at-block),
        })
      )

      (unwrap!
        (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
          transfer bond-sats current-contract asserter none
        )
        ERR_TRANSFER_FAILED
      )

      (print {
        event: "settled",
        data: {
          assertion-id: assertion-id,
          settled-at-block: settled-at-block,
        },
      })

      (ok true)
    )
  )
)

(define-public (dispute (assertion-id (buff 32)))
  (let ((assertion (unwrap! (map-get? assertion-map assertion-id) ERR_ASSERTION_NOT_FOUND)))
    (asserts! (is-eq (get status assertion) STATUS_ASSERTED) ERR_INVALID_STATUS)
    (asserts!
      (is-window-open (+ (get asserted-at-block assertion) (get liveness assertion)))
      ERR_WINDOW_CLOSED
    )

    (let (
        (bond-sats (get bond-sats assertion))
        (disputed-at-block stacks-block-height)
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
      (map-set assertion-map assertion-id
        (merge assertion {
          disputer: (some tx-sender),
          status: STATUS_DISPUTED,
          disputed-at-block: (some disputed-at-block),
        })
      )

      (print {
        event: "disputed",
        data: {
          assertion-id: assertion-id,
          disputed-at-block: disputed-at-block,
        },
      })

      (ok true)
    )
  )
)
