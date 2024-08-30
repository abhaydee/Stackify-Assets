;; Define data variables to store various addresses and counters
(define-data-var property-item-address principal (as-contract tx-sender)) ;; Address of the property item contract
(define-data-var kyc-manager principal (as-contract tx-sender)) ;; Address of the KYC manager contract
(define-data-var owner principal tx-sender) ;; Owner of this contract
(define-data-var property-count uint u0) ;; Counter for the number of properties

;; Define a map to store verifiers and their states
(define-map verifiers
  { verifier: principal } ;; key: principal address of the verifier
  { state: bool }) ;; value: boolean indicating if the verifier is active

;; Define a map to store properties and their details
(define-map properties
  { id: uint } ;; key: property ID
  {
    id: uint, ;; Property ID
    name: (string-ascii 100), ;; Property name
    docs: (string-ascii 100), ;; Property documents
    symbol: (string-ascii 10), ;; Property symbol
    owner: principal, ;; Owner of the property
    status: uint, ;; Property status
    collection-address: (optional principal), ;; Address of the property collection
    verifier: (optional principal) ;; Address of the verifier
  })

;; Define constants for property status
(define-constant STATUS_PENDING u0) ;; Status indicating property is pending
(define-constant STATUS_SHIPPED u1) ;; Status indicating property is shipped
(define-constant STATUS_ACCEPTED u2) ;; Status indicating property is accepted
(define-constant STATUS_REJECTED u3) ;; Status indicating property is rejected
(define-constant STATUS_CANCELED u4) ;; Status indicating property is canceled

;; Private function to check if a user has passed KYC
(define-private (is-kyced (user principal))
  (let ((kyc-status (contract-call? .kycstore get-kyc-status user)))
    (is-eq kyc-status true) ;; Return true if KYC status is true
  )
)

;; Public function to update the status of a verifier
(define-public (update-verifier (verifier-address principal) (state bool))
  (begin
    ;; Ensure that only the contract owner can update verifier status
    (asserts! (is-eq tx-sender (var-get owner)) (err u100))
    ;; Update the verifier status in the verifiers map
    (map-set verifiers { verifier: verifier-address } { state: state })
    (ok true)
  )
)

;; Read-only function to get properties of a specific user
(define-read-only (get-user-properties (user principal))
  (ok (filter (lambda (property) (is-eq (get owner property) user))
              (map-entries properties)))
)

;; Helper function to filter properties by owner
(define-private (filter-properties-by-owner (user principal))
  (map filter (lambda (entry) (is-eq user (get owner entry)))
       (map-values properties))
)

;; Read-only function to get property details by ID
(define-read-only (get-property-by-id (id uint))
  (match (map-get? properties { id: id })
    prop (ok prop) ;; Return the property details if found
    (err u101) ;; Return an error if not found
  )
)

;; Public function to update the state of a property
(define-public (update-property-state (property-id uint) (status uint))
  (let ((property (unwrap! (map-get? properties { id: property-id }) (err u101)))
        (is-verifier (map-get? verifiers { verifier: tx-sender })))
    ;; Ensure the sender is the verifier for the property or an authorized verifier
    (asserts! (or (is-eq tx-sender (get verifier property)) 
                  (and (is-none (get verifier property)) (is-some is-verifier))) (err u102))
    ;; Update the property status and optionally set the verifier
    (map-set properties { id: property-id }
      (merge property { status: status, verifier: (if (is-none (get verifier property)) (some tx-sender) (get verifier property)) }))
    (ok true)
  )
)

;; Public function to create a property request
(define-public (create-property-request (name (string-ascii 100)) (docs (string-ascii 100)) (symbol (string-ascii 10)))
  (begin
    ;; Ensure the sender has passed KYC
    (asserts! (is-kyced tx-sender) (err u103))
    (let ((property-id (var-get property-count)))
      ;; Add the new property to the properties map
      (map-set properties { id: property-id }
        { id: property-id,
          name: name,
          docs: docs,
          symbol: symbol,
          owner: tx-sender,
          status: STATUS_PENDING,
          collection-address: none,
          verifier: none
        })
      ;; Increment the property count
      (var-set property-count (+ property-id u1))
      (ok property-id)
    )
  )
)

;; Public function to set the address of the property library
(define-public (set-library-address (property-item-address principal))
  (begin
    ;; Ensure that only the contract owner can set the library address
    (asserts! (is-eq tx-sender (var-get owner)) (err u100))
    (var-set property-item-address property-item-address)
    (ok true)
  )
)

;; Public function to create a property collection
(define-public (create-property-collection (property-id uint) (price-in-wei uint))
  (let ((property (unwrap! (map-get? properties { id: property-id }) (err u101)))
        (is-verifier (map-get? verifiers { verifier: tx-sender })))
    ;; Ensure the sender is the verifier for the property or an authorized verifier
    (asserts! (or (is-eq tx-sender (get verifier property)) 
                  (and (is-none (get verifier property)) (is-some is-verifier))) (err u102))
    ;; Call the create-property function on the property item address contract
    (let ((result (contract-call? (var-get property-item-address) create-property 
                                  property-id
                                  (get name property) 
                                  (get symbol property) 
                                  (get owner property) 
                                  (get docs property) 
                                  price-in-wei)))
      ;; Update the property status and collection address
      (map-set properties { id: property-id }
        (merge property { collection-address: (some (var-get property-item-address)), status: STATUS_ACCEPTED, verifier: (some tx-sender) }))
      (ok true)
    )
  )
)

;; Read-only function to get properties available for a verifier
(define-read-only (get-available-verifier-properties)
  (begin
    ;; Ensure the sender is an authorized verifier
    (asserts! (unwrap-panic (map-get? verifiers { verifier: tx-sender })) (err u104))
    (ok (filter (lambda (property) (or (is-eq tx-sender (get verifier property)) 
                                       (is-none (get verifier property))))
                (map-values properties)))
  )
)

;; Feature 1: Transfer ownership of a property
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

;; Feature 2: Support for rental agreements
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

;; Feature 3: Tracking property status changes
(define-data-var property-status-history (map uint (list uint)))

(define-public (log-property-status-change (property-id uint) (status uint))
  (let ((history (unwrap-panic (map-get? property-status-history { property-id: property-id }))))
    (map-set property-status-history { property-id: property-id } (cons status history))
    (ok true)
  )
)

;; Feature 4: Fee management for verifiers
(define-data-var verification-fee uint u1000) ;; Fee to be paid for verification

(define-public (set-verification-fee (fee uint))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err u100))
    (var-set verification-fee fee)
    (ok true)
  )
)

(define-public (pay-verification-fee (property-id uint))
  (begin
    (asserts! (>= (get-balance tx-sender) (var-get verification-fee)) (err u106))
    ;; Deduct the fee from sender and assign it to the verifier
    (transfer (var-get verification-fee) tx-sender (get verifier (unwrap! (map-get? properties { id: property-id }) (err u101))))
    (ok true)
  )
)
