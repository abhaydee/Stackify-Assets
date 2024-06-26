;; PropertyMarketplace.clar

(define-data-var owner principal tx-sender)

(define-map listings
  { property-id: uint }
  { seller: principal, price: uint, status: bool })

;; Function to list a property for sale
(define-public (list-property (property-id uint) (price uint))
  (let ((property (unwrap! (contract-call? .RwaProperty get-property property-id) (err u101))))
    (asserts! (is-eq (get owner property) tx-sender) (err u102)) ;; Ensure only owner can list
    (map-set listings { property-id: property-id } { seller: tx-sender, price: price, status: true })
    (ok true)
  )
)

;; Function to buy a listed property
(define-public (buy-property (property-id uint))
  (let ((listing (unwrap! (map-get? listings { property-id: property-id }) (err u103))))
    (asserts! (is-eq (get status listing) true) (err u104))
    (let ((price (get price listing))
          (seller (get seller listing)))
      (begin
        ;; Transfer property ownership
        (contract-call? .RwaProperty transfer-property property-id tx-sender)
        ;; Update listing status
        (map-set listings { property-id: property-id } { seller: seller, price: price, status: false })
        (ok true)
      )
    )
  )
)

;; Function to cancel a property listing
(define-public (cancel-listing (property-id uint))
  (let ((listing (unwrap! (map-get? listings { property-id: property-id }) (err u103))))
    (asserts! (is-eq (get seller listing) tx-sender) (err u102))
    (map-delete listings { property-id: property-id })
    (ok true)
  )
)
