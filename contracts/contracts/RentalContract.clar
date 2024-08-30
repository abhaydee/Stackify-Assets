(define-data-var owner principal tx-sender)

(define-map rental-agreements
  { property-id: uint, tenant: principal }
  { rent: uint, duration: uint, start-time: uint, end-time: uint, security-deposit: uint, paid-on-time: bool })

(define-constant late-fee u10) ;; Example: Flat late fee for rent payment
(define-constant deposit-multiplier u2) ;; Example: Security deposit = 2x rent

;; Function to create a rental agreement with security deposit
(define-public (create-rental-agreement (property-id uint) (tenant principal) (rent uint) (duration uint))
  (let ((property (unwrap! (contract-call? .RwaProperty get-property property-id) (err u101))))
    (asserts! (is-eq (get owner property) tx-sender) (err u102)) ;; Ensure only owner can create rental agreement
    (let ((start-time (block-height))
          (security-deposit (* rent deposit-multiplier)))
      ;; Transfer security deposit from tenant to owner
      (unwrap! (stx-transfer? security-deposit tenant (var-get owner)) (err u107))
      ;; Create rental agreement
      (map-set rental-agreements { property-id: property-id, tenant: tenant }
        { rent: rent, duration: duration, start-time: start-time, end-time: (+ start-time duration), security-deposit: security-deposit, paid-on-time: true })
      ;; Emit event for agreement creation
      (emit-event-create-agreement property-id tenant rent duration security-deposit)
      (ok true)
    )
  )
)

;; Function to pay rent with automatic late fee if overdue
(define-public (pay-rent (property-id uint))
  (let ((agreement (unwrap! (map-get? rental-agreements { property-id: property-id, tenant: tx-sender }) (err u103))))
    (asserts! (<= (block-height) (get end-time agreement)) (err u104))
    (let ((rent (get rent agreement))
          (late (if (> (block-height) (get end-time agreement)) late-fee u0))) ;; Late fee logic
      (begin
        ;; Transfer rent and late fee if applicable
        (unwrap! (stx-transfer? (+ rent late) tx-sender (var-get owner)) (err u106))
        ;; Update rental agreement as paid on time if no late fee
        (map-set rental-agreements { property-id: property-id, tenant: tx-sender }
          (merge agreement { paid-on-time: (is-eq late u0) }))
        ;; Emit event for rent payment
        (emit-event-pay-rent property-id tx-sender rent late)
        (ok true)
      )
    )
  )
)

;; Function to terminate rental agreement and refund deposit
(define-public (terminate-rental-agreement (property-id uint) (tenant principal))
  (let ((agreement (unwrap! (map-get? rental-agreements { property-id: property-id, tenant: tenant }) (err u103))))
    (asserts! (is-eq tx-sender (var-get owner)) (err u102))
    (let ((security-deposit (get security-deposit agreement)))
      ;; Refund security deposit to tenant
      (unwrap! (stx-transfer? security-deposit (var-get owner) tenant) (err u108))
      ;; Delete rental agreement
      (map-delete rental-agreements { property-id: property-id, tenant: tenant })
      ;; Emit event for agreement termination
      (emit-event-terminate-agreement property-id tenant)
      (ok true)
    )
  )
)

;; Function to renew a rental agreement
(define-public (renew-rental-agreement (property-id uint) (tenant principal) (duration uint))
  (let ((agreement (unwrap! (map-get? rental-agreements { property-id: property-id, tenant: tenant }) (err u103))))
    (asserts! (<= (block-height) (get end-time agreement)) (err u104)) ;; Only renew active agreements
    (let ((new-end-time (+ (get end-time agreement) duration)))
      ;; Update the duration and end-time
      (map-set rental-agreements { property-id: property-id, tenant: tenant }
        (merge agreement { duration: duration, end-time: new-end-time }))
      ;; Emit event for agreement renewal
      (emit-event-renew-agreement property-id tenant duration)
      (ok true)
    )
  )
)

;; Event logging functions
(define-private (emit-event-create-agreement (property-id uint) (tenant principal) (rent uint) (duration uint) (security-deposit uint))
  (print { event: "agreement-created", property-id: property-id, tenant: tenant, rent: rent, duration: duration, security-deposit: security-deposit })
)

(define-private (emit-event-pay-rent (property-id uint) (tenant principal) (rent uint) (late-fee uint))
  (print { event: "rent-paid", property-id: property-id, tenant: tenant, rent: rent, late-fee: late-fee })
)

(define-private (emit-event-terminate-agreement (property-id uint) (tenant principal))
  (print { event: "agreement-terminated", property-id: property-id, tenant: tenant })
)

(define-private (emit-event-renew-agreement (property-id uint) (tenant principal) (duration uint))
  (print { event: "agreement-renewed", property-id: property-id, tenant: tenant, duration: duration })
)
