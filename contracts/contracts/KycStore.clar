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

;; Read-only function to get the KYC status of a person
(define-read-only (get-kyc-status (address principal))
  (match (map-get? kyc-status { address: address })
    entry (ok (get passed entry))  ;; Return KYC status if entry exists
    (ok false)  ;; Return false if entry does not exist
  )
)
