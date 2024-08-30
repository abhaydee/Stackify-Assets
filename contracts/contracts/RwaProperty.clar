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

;; New Feature 1: Transfer Ownership of a Property
(define-public (transfer-ownership (property-id uint) (new-owner principal))
  (let ((property (unwrap! (map-get? properties { id: property-id }) (err u101))))
    ;; Ensure that the sender is the current owner
    (asserts! (is-eq (get owner property) tx-sender) (err u105))
    ;; Update the owner in the properties map
    (map-set properties { id: property-id }
      (merge property { owner: new-owner }))
    (ok true)
  )
)

;; New Feature 2: Rental Agreements for Properties
(define-data-var rental-agreements (map uint { tenant: principal, rent: uint, start-time: uint, end-time: uint }))

(define-public (create-rental-agreement (property-id uint) (tenant principal) (rent uint) (duration uint))
  (let ((property (unwrap! (map-get? properties { id: property-id }) (err u101))))
    ;; Ensure the sender is the owner of the property
    (asserts! (is-eq (get owner property) tx-sender) (err u102))
    (let ((start-time (block-height)))
      (map-set rental-agreements { property-id: property-id }
        { tenant: tenant, rent: rent, start-time: start-time, end-time: (+ start-time duration) })
      (ok true)
    )
  )
)

;; New Feature 3: Tracking Property Status History
(define-data-var property-status-history (map uint (list uint)))

(define-public (log-property-status-change (property-id uint) (status uint))
  (let ((history (unwrap-panic (map-get? property-status-history { property-id: property-id }))))
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

;; Read-only function to get property details by id
(define-read-only (get-property (id uint))
  (map-get? properties { id: id })
)

;; Public function to set the maximum supply, price, and documents for properties
(define-public (mint (supply uint) (price uint) (docs (string-ascii 100)))
  (begin
    ;; Ensure the transaction sender is the property owner
    (asserts! (is-eq tx-sender (var-get property-owner)) (err u101))
    ;; Set the max supply, property price, and property documents
    (var-set max-supply supply)
    (var-set property-price price)
    (var-set property-docs docs)
    (ok true)
  )
)

;; Public function to mint multiple property tokens to specific addresses
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

;; Read-only function to get the URI of a property token
(define-read-only (token-uri (token-id uint))
  (let ((property (map-get? properties { id: token-id })))
    ;; Return the 'docs' field of the property
    (match property
      property-details (ok (get docs property-details))
      (err u102))
  )
)

;; Public function to burn multiple property tokens
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

