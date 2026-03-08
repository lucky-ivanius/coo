;; title: core
;; version: 0.1.0
;; summary: Clarity Optimistic Oracle - Core Contract
;; description: Trustless Assertion Layer for the Stacks Ecosystem.

;; constants

;; Protocol parameters
(define-constant DEFAULT-LIVENESS u144)
(define-constant MIN-BOND-MULTIPLIER u2)
(define-constant PROTOCOL-FEE-BPS u0)
(define-constant CONTRACT-OWNER tx-sender)

;; sBTC token reference (for documentation / comparisons;
;; contract-call? requires literal principal)
(define-constant SBTC-TOKEN 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token)

;; error codes

(define-constant ERR-NOT-FOUND (err u100))
(define-constant ERR-ALREADY-ASSERTED (err u101))
(define-constant ERR-WINDOW-OPEN (err u102))
(define-constant ERR-WINDOW-CLOSED (err u103))
(define-constant ERR-ALREADY-DISPUTED (err u104))
(define-constant ERR-NOT-ARBITER (err u105))
(define-constant ERR-UNAUTHORIZED (err u106))
(define-constant ERR-TRANSFER-FAILED (err u107))

;; read-only functions

(define-read-only (get-sbtc-balance (who principal))
  (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
    get-balance who
  )
)

(define-read-only (get-protocol-params)
  {
    default-liveness: DEFAULT-LIVENESS,
    min-bond-multiplier: MIN-BOND-MULTIPLIER,
    protocol-fee-bps: PROTOCOL-FEE-BPS,
    contract-owner: CONTRACT-OWNER,
  }
)
