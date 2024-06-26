;; EscrowContract.clar

(define-data-var owner principal tx-sender)
(define-map escrows
  { transaction-id: uint }
  { buyer: principal, seller: principal, amount: uint, status: bool })

;; Function to initiate escrow
(define-public (initiate-escrow (transaction-id uint) (buyer principal) (seller principal) (amount uint))
  (asserts! (is-eq tx-sender buyer) (err u102))
  (map-set escrows { transaction-id: transaction-id }
    { buyer: buyer, seller: seller, amount: amount, status: false })
  (ok true)
)

;; Function to release funds from escrow
(define-public (release-funds (transaction-id uint))
  (let ((escrow (unwrap! (map-get? escrows { transaction-id: transaction-id }) (err u103))))
    (asserts! (is-eq tx-sender (var-get owner)) (err u102))
    (let ((seller (get seller escrow))
          (amount (get amount escrow)))
      (begin
        ;; Transfer funds to seller
        (contract-call? .ft-transfer transfer tx-sender seller amount)
        ;; Update escrow status
        (map-set escrows { transaction-id: transaction-id }
          { buyer: (get buyer escrow), seller: seller, amount: amount, status: true })
        (ok true)
      )
    )
  )
)
