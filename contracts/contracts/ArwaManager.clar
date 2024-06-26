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
  (ok (get-user-properties-helper user u0 (var-get property-count) (list)))
)

;; Helper function to recursively gather properties owned by a user
(define-private (get-user-properties-helper (user principal) (index uint) (count uint) (accumulated (list 1024 (tuple (id uint) (name (string-ascii 100)) (docs (string-ascii 100)) (symbol (string-ascii 10)) (owner principal) (status uint) (collection-address (optional principal)) (verifier (optional principal))))))
  (if (>= index count)
    accumulated ;; If index exceeds count, return accumulated properties
    (let ((property (map-get? properties { id: index })))
      (match property
        property
        (let ((new-accumulated (if (is-eq (get owner property) user)
                                  (append accumulated (list property))
                                  accumulated)))
          (get-user-properties-helper user (+ index u1) count new-accumulated))
        (get-user-properties-helper user (+ index u1) count accumulated)
      )
    )
  )
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
  (let ((property (unwrap! (map-get? properties { id: property-id }) (err u101))))
    (let ((is-verifier (map-get? verifiers { verifier: tx-sender })))
      ;; Ensure the sender is the verifier for the property or an authorized verifier
      (asserts! (or (is-eq tx-sender (get verifier property)) 
                    (and (is-none (get verifier property)) (is-some is-verifier))) (err u102))
      ;; Update the property status and optionally set the verifier
      (map-set properties { id: property-id }
        (merge property { status: status, verifier: (if (is-none (get verifier property)) (some tx-sender) (get verifier property)) }))
      (ok true)
    )
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
  (let ((property (unwrap! (map-get? properties { id: property-id }) (err u101))))
    (let ((is-verifier (map-get? verifiers { verifier: tx-sender })))
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
)

;; Read-only function to get properties available for a verifier
(define-read-only (get-available-verifier-properties)
  (begin
    ;; Ensure the sender is an authorized verifier
    (asserts! (unwrap-panic (map-get? verifiers { verifier: tx-sender })) (err u104))
    (ok (get-available-verifier-properties-helper u0 (var-get property-count) (list)))
  )
)

;; Helper function to recursively gather properties available for a verifier
(define-private (get-available-verifier-properties-helper (index uint) (count uint) (accumulated (list 1024 (tuple (id uint) (name (string-ascii 100)) (docs (string-ascii 100)) (symbol (string-ascii 10)) (owner principal) (status uint) (collection-address (optional principal)) (verifier (optional principal))))))
  (if (>= index count)
    accumulated ;; If index exceeds count, return accumulated properties
    (let ((property (map-get? properties { id: index })))
      (match property
        property
        (let ((new-accumulated (if (or (is-eq tx-sender (get verifier property)) (is-none (get verifier property)))
                                  (append accumulated (list property))
                                  accumulated)))
          (get-available-verifier-properties-helper (+ index u1) count new-accumulated))
        (get-available-verifier-properties-helper (+ index u1) count accumulated)
      )
    )
  )
)
