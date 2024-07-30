;; Define a data variable to store the owner of the contract
(define-data-var owner principal tx-sender)

;; Define a map to store the KYC status of people
(define-map kyc-status
  {
    address: principal  ;; key: principal address of the person
  }
  {
    passed: bool  ;; value: KYC status (true if passed, false otherwise)
  }
)

;; Define a map to store documents for properties
(define-map property-documents
  {
    property-id: (buff 32)  ;; key: unique identifier for the property
  }
  {
    document-uri: (string-utf8 256)  ;; value: URI of the document
  }
)

;; Define a map to store authorized users
(define-map authorized-users
  {
    address: principal  ;; key: principal address of the user
  }
  {
    authorized: bool  ;; value: authorization status (true if authorized, false otherwise)
  }
)

;; Public function to set the KYC status of a person
(define-public (set-kyc-status (address principal) (passed bool))
  (begin
    ;; Ensure that only the contract owner can set the KYC status
    (asserts! (is-eq tx-sender (var-get owner)) (err u100))
    ;; Set the KYC status in the 'kyc-status' map
    (map-set kyc-status
      { address: address }
      { passed: passed }
    )
    ;; Return the new KYC status
    (ok passed)
  )
)

;; Private function to get the KYC status of a person
(define-private (get-kyc-status (address principal))
  (match (map-get? kyc-status { address: address })
    entry (ok (get passed entry))  ;; Return KYC status if entry exists
    (ok false)  ;; Return false if entry does not exist
  )
)

;; Public function to check the KYC status, accessible only to authorized users
(define-public (check-kyc-status (address principal))
  (begin
    ;; Ensure the caller is authorized
    (asserts! (is-authorized tx-sender) (err u101))
    ;; Return the KYC status
    (get-kyc-status address)
  )
)

;; Public function to add a document for a property
(define-public (add-property-document (property-id (buff 32)) (document-uri (string-utf8 256)))
  (begin
    ;; Ensure that only the contract owner can add a property document
    (asserts! (is-eq tx-sender (var-get owner)) (err u100))
    ;; Set the document URI in the 'property-documents' map
    (map-set property-documents
      { property-id: property-id }
      { document-uri: document-uri }
    )
    ;; Return success
    (ok true)
  )
)

;; Public function to add an authorized user
(define-public (add-authorized-user (address principal))
  (begin
    ;; Ensure that only the contract owner can add an authorized user
    (asserts! (is-eq tx-sender (var-get owner)) (err u100))
    ;; Set the user as authorized in the 'authorized-users' map
    (map-set authorized-users
      { address: address }
      { authorized: true }
    )
    ;; Return success
    (ok true)
  )
)

;; Helper function to check if a user is authorized
(define-private (is-authorized (address principal))
  (match (map-get? authorized-users { address: address })
    entry (get authorized entry)  ;; Return authorization status if entry exists
    false  ;; Return false if entry does not exist
  )
)
