;; RentalContract.clar

(define-data-var owner principal tx-sender)
(define-map rental-agreements
  { property-id: uint, tenant: principal }
  { rent: uint, duration: uint, start-time: uint, end-time: uint })

;; Function to create a rental agreement
(define-public (create-rental-agreement (property-id uint) (tenant principal) (rent uint) (duration uint))
  (let ((property (unwrap! (contract-call? .RwaProperty get-property property-id) (err u101))))
    (asserts! (is-eq (get owner property) tx-sender) (err u102)) ;; Ensure only owner can create rental agreement
    (let ((start-time (block-height)))
      (map-set rental-agreements { property-id: property-id, tenant: tenant }
        { rent: rent, duration: duration, start-time: start-time, end-time: (+ start-time duration) })
      (ok true)
    )
  )
)

;; Function to pay rent
(define-public (pay-rent (property-id uint))
  (let ((agreement (unwrap! (map-get? rental-agreements { property-id: property-id, tenant: tx-sender }) (err u103))))
    (asserts! (<= (block-height) (get end-time agreement)) (err u104))
    (let ((rent (get rent agreement)))
      (begin
        ;; Transfer rent to the property owner
        (contract-call? .ft-transfer transfer tx-sender (var-get owner) rent)
        (ok true)
      )
    )
  )
)

;; Function to terminate rental agreement
(define-public (terminate-rental-agreement (property-id uint) (tenant principal))
  (let ((agreement (unwrap! (map-get? rental-agreements { property-id: property-id, tenant: tenant }) (err u103))))
    (asserts! (is-eq tx-sender (var-get owner)) (err u102))
    (map-delete rental-agreements { property-id: property-id, tenant: tenant })
    (ok true)
  )
)
