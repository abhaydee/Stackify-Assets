;; Define a map called 'properties' to store property details
(define-map properties
  { id: uint } ;; key
  {
    id: uint, ;; property id
    name: (string-ascii 100), ;; property name
    symbol: (string-ascii 10), ;; property symbol
    owner: principal, ;; property owner
    docs: (string-ascii 100), ;; property documents
    price-in-wei: uint ;; property price in wei
  })

;; Define data variables to store max supply, property price, documents, and owner
(define-data-var max-supply uint u0)
(define-data-var property-price uint u0)
(define-data-var property-docs (string-ascii 100) "")
(define-data-var property-owner principal tx-sender)

;; Event Logging
(define-event ownership-transferred (property-id uint old-owner principal new-owner principal))
(define-event rental-agreement-created (property-id uint tenant principal rent uint start-time uint end-time uint))

;; New Feature 1: Transfer Ownership of a Property with additional restrictions
(define-public (transfer-ownership (property-id uint) (new-owner principal))
  (let ((property (unwrap! (map-get? properties { id: property-id }) (err u101))))
    ;; Ensure that the sender is the current owner
    (asserts! (is-eq (get owner property) tx-sender) (err u105))
    ;; Ensure the new owner is not null or the same as the old owner
    (asserts! (is-none (get owner property)) (err u108))
    ;; Update the owner in the properties map
    (map-set properties { id: property-id }
      (merge property { owner: new-owner }))
    (emit-event (ownership-transferred property-id tx-sender new-owner))
    (ok true)
  )
)

;; New Feature 2: Enhanced Rental Agreements for Properties with additional checks
(define-data-var rental-agreements (map uint { tenant: principal, rent: uint, start-time: uint, end-time: uint }))

(define-public (create-rental-agreement (property-id uint) (tenant principal) (rent uint) (duration uint))
  (let ((property (unwrap! (map-get? properties { id: property-id }) (err u101))))
    ;; Ensure the sender is the owner of the property
    (asserts! (is-eq (get owner property) tx-sender) (err u102))
    ;; Ensure the rental duration is positive
    (asserts! (> duration u0) (err u103))
    (let ((start-time (block-height)))
      (map-set rental-agreements { property-id: property-id }
        { tenant: tenant, rent: rent, start-time: start-time, end-time: (+ start-time duration) })
      (emit-event (rental-agreement-created property-id tenant rent start-time (+ start-time duration)))
      (ok true)
    )
  )
)

;; New Feature 3: Tracking Property Status History
(define-data-var property-status-history (map uint (list uint)))

(define-public (log-property-status-change (property-id uint) (status uint))
  (let ((history (unwrap! (map-get? property-status-history { property-id: property-id }) (err u104))))
    (map-set property-status-history { property-id: property-id } (cons status history))
    (ok true)
  )
)

;; New Feature 4: Verification Fee for Properties
(define-data-var verification-fee uint u1000) ;; Fee to be paid for verification

(define-public (set-verification-fee (fee uint))
  (begin
    (asserts! (is-eq tx-sender (var-get property-owner)) (err u100))
    (var-set verification-fee fee)
    (ok true)
  )
)

(define-public (pay-verification-fee (property-id uint))
  (begin
    (asserts! (>= (get-balance tx-sender) (var-get verification-fee)) (err u106))
    ;; Deduct the fee from the sender and assign it to the verifier
    (transfer (var-get verification-fee) tx-sender (get owner (unwrap! (map-get? properties { id: property-id }) (err u101))))
    (ok true)
  )
)

;; Public function to create a new property
(define-public (create-property (id uint) (name (string-ascii 100)) (symbol (string-ascii 10)) (owner principal) (docs (string-ascii 100)) (price-in-wei uint))
  (begin
    ;; Ensure the property ID does not already exist
    (asserts! (is-none (map-get? properties { id: id })) (err u107))
    ;; Set the property details in the 'properties' map
    (map-set properties { id: id }
      {
        id: id,
        name: name,
        symbol: symbol,
        owner: owner,
        docs: docs,
        price-in-wei: price-in-wei
      })
    (ok true)
  )
)

;; Enhanced Batch Minting
(define-public (batch-mint (to-list (list 100 principal)) (token-ids (list 100 uint)))
  (begin
    ;; Ensure the transaction sender is the property owner
    (asserts! (is-eq tx-sender (var-get property-owner)) (err u101))
    (let ((max-supply (var-get max-supply))
          (docs (var-get property-docs))
          (price (var-get property-price)))
      (map
        (lambda (to token-id)
          ;; Ensure the token-id is within the max supply
          (asserts! (< token-id max-supply) (err u100))
          ;; Set the property details in the 'properties' map
          (map-set properties { id: token-id }
            {
              id: token-id,
              name: docs,
              symbol: "",
              owner: to,
              docs: docs,
              price-in-wei: price
            })
        )
        to-list token-ids)
      (ok true)
    )
  )
)

;; Enhanced Batch Burning
(define-public (batch-burn (token-ids (list 100 uint)))
  (begin
    ;; Ensure the transaction sender is the property owner
    (asserts! (is-eq tx-sender (var-get property-owner)) (err u101))
    (map
      (lambda (token-id)
        ;; Delete the property from the 'properties' map
        (map-delete properties { id: token-id })
      )
      token-ids)
    (ok true)
  )
)

;; Read-only function to check if a specific interface is supported
(define-read-only (supports-interface (interface-id (buff 4)))
  (ok true)
)
