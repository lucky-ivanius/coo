;; title: core
;; version: 0.1.0
;; summary: Clarity Optimistic Oracle - Core Contract
;; description: Trustless Assertion Layer for the Stacks Ecosystem.

;; constants

;; Protocol parameters
(define-constant DEFAULT_LIVENESS u1440)
(define-constant MIN_LIVENESS u1)
(define-constant MIN_BOND_SATS u10000)
(define-constant CONTRACT_OWNER tx-sender)

;; Status constants
(define-constant STATUS_OPEN u0)
(define-constant STATUS_DISPUTED u1)
(define-constant STATUS_SETTLED u2)
(define-constant STATUS_REJECTED u3)
(define-constant STATUS_UNRESOLVED u4)

;; Error codes

;; 400 error codes
(define-constant ERR_WINDOW_OPEN (err u8400001))
(define-constant ERR_WINDOW_CLOSED (err u8400002))
(define-constant ERR_INVALID_STATUS (err u8400003))
(define-constant ERR_TRANSFER_FAILED (err u8400004))
(define-constant ERR_ASSERTION_BOND_TOO_LOW (err u8400100))
(define-constant ERR_ASSERTION_INVALID_LIVENESS (err u8400101))
;; 403 error codes
(define-constant ERR_NOT_CONTRACT_OWNER (err u8403000))
(define-constant ERR_NOT_ARBITER (err u8403200))
;; 404 error codes
(define-constant ERR_ASSERTION_NOT_FOUND (err u8404100))
(define-constant ERR_ARBITER_NOT_FOUND (err u8404200))
;; 409 error codes
(define-constant ERR_ASSERTION_ALREADY_EXISTS (err u8409100))
(define-constant ERR_ARBITER_ALREADY_EXISTS (err u8409200))
;; 500 error codes
(define-constant ERR_SERIALIZATION_FAILED (err u8500000))

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
    rejected-at-block: (optional uint),
    unresolved-at-block: (optional uint),
  }
)

(define-map arbiter-map
  principal
  bool
)

(map-set arbiter-map tx-sender true)

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
  (> stacks-block-height expiry-block)
)

(define-read-only (is-arbiter (address principal))
  (map-get? arbiter-map address)
)

;; public functions

(define-public (add-arbiter (address principal))
  (begin
    (asserts! (is-eq contract-caller CONTRACT_OWNER) ERR_NOT_CONTRACT_OWNER)
    (asserts! (is-none (map-get? arbiter-map address)) ERR_ARBITER_ALREADY_EXISTS)
    (ok (map-set arbiter-map address true))
  )
)

(define-public (remove-arbiter (address principal))
  (begin
    (asserts! (is-eq contract-caller CONTRACT_OWNER) ERR_NOT_CONTRACT_OWNER)
    (asserts! (is-some (map-get? arbiter-map address)) ERR_ARBITER_NOT_FOUND)
    (ok (map-delete arbiter-map address))
  )
)

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
      (asserts! (>= resolved-liveness MIN_LIVENESS)
        ERR_ASSERTION_INVALID_LIVENESS
      )
    )
    (asserts! (>= bond-sats MIN_BOND_SATS) ERR_ASSERTION_BOND_TOO_LOW)
    (let (
        (asserted-at-block stacks-block-height)
        (assertion-id (try! (derive-assertion-id identifier claim bond-sats resolved-liveness
          asserted-at-block
        )))
      )
      (asserts! (is-none (map-get? assertion-map assertion-id))
        ERR_ASSERTION_ALREADY_EXISTS
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
      (map-set assertion-map assertion-id {
        asserter: contract-caller,
        disputer: none,
        claim-hash: (sha256 claim),
        bond-sats: bond-sats,
        asserted-at-block: asserted-at-block,
        disputed-at-block: none,
        settled-at-block: none,
        rejected-at-block: none,
        unresolved-at-block: none,
        liveness: resolved-liveness,
        status: STATUS_OPEN,
      })
      (print {
        event: "asserted",
        data: {
          assertion-id: assertion-id,
          asserted-by: contract-caller,
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
    (asserts! (is-eq (get status assertion) STATUS_OPEN) ERR_INVALID_STATUS)
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
          settled-by: contract-caller,
          settled-at-block: settled-at-block,
        },
      })

      (ok true)
    )
  )
)

(define-public (dispute (assertion-id (buff 32)))
  (let ((assertion (unwrap! (map-get? assertion-map assertion-id) ERR_ASSERTION_NOT_FOUND)))
    (asserts! (is-eq (get status assertion) STATUS_OPEN) ERR_INVALID_STATUS)
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
          disputer: (some contract-caller),
          status: STATUS_DISPUTED,
          disputed-at-block: (some disputed-at-block),
        })
      )

      (print {
        event: "disputed",
        data: {
          assertion-id: assertion-id,
          disputed-by: contract-caller,
          disputed-at-block: disputed-at-block,
        },
      })

      (ok true)
    )
  )
)

(define-public (resolve
    (assertion-id (buff 32))
    (resolve-status uint)
  )
  (let ((assertion (unwrap! (map-get? assertion-map assertion-id) ERR_ASSERTION_NOT_FOUND)))
    (asserts! (is-some (is-arbiter contract-caller)) ERR_NOT_ARBITER)
    (asserts! (is-eq (get status assertion) STATUS_DISPUTED) ERR_INVALID_STATUS)
    (asserts!
      (or
        (is-eq resolve-status STATUS_SETTLED)
        (is-eq resolve-status STATUS_REJECTED)
        (is-eq resolve-status STATUS_UNRESOLVED)
      )
      ERR_INVALID_STATUS
    )

    (let (
        (bond-sats (get bond-sats assertion))
        (asserter (get asserter assertion))
        (disputer (unwrap! (get disputer assertion) ERR_INVALID_STATUS))
        (resolved-at-block stacks-block-height)
      )
      (if (is-eq resolve-status STATUS_SETTLED)
        (begin
          (map-set assertion-map assertion-id
            (merge assertion {
              status: STATUS_SETTLED,
              settled-at-block: (some resolved-at-block),
            })
          )
          (unwrap!
            (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
              transfer (* u2 bond-sats) current-contract asserter none
            )
            ERR_TRANSFER_FAILED
          )
          (print {
            event: "settled",
            data: {
              assertion-id: assertion-id,
              settled-by: contract-caller,
              settled-at-block: resolved-at-block,
            },
          })
          (ok true)
        )
        (if (is-eq resolve-status STATUS_REJECTED)
          (begin
            (map-set assertion-map assertion-id
              (merge assertion {
                status: STATUS_REJECTED,
                rejected-at-block: (some resolved-at-block),
              })
            )
            (unwrap!
              (contract-call?
                'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer
                (* u2 bond-sats) current-contract disputer none
              )
              ERR_TRANSFER_FAILED
            )
            (print {
              event: "rejected",
              data: {
                assertion-id: assertion-id,
                rejected-by: contract-caller,
                rejected-at-block: resolved-at-block,
              },
            })
            (ok true)
          )
          (begin
            (map-set assertion-map assertion-id
              (merge assertion {
                status: STATUS_UNRESOLVED,
                unresolved-at-block: (some resolved-at-block),
              })
            )
            (unwrap!
              (contract-call?
                'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer
                bond-sats current-contract asserter none
              )
              ERR_TRANSFER_FAILED
            )
            (unwrap!
              (contract-call?
                'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer
                bond-sats current-contract disputer none
              )
              ERR_TRANSFER_FAILED
            )
            (print {
              event: "unresolved",
              data: {
                assertion-id: assertion-id,
                unresolved-by: contract-caller,
                unresolved-at-block: resolved-at-block,
              },
            })
            (ok true)
          )
        )
      )
    )
  )
)
