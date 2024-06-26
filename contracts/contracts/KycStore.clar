;; Define a data variable to store the owner of the contract
(define-data-var owner principal tx-sender)

;; Define a map to store the KYC status of people
(define-map people
  {
    people-address: principal  ;; key: principal address of the person
  }
  {
    is-kyc-passed: bool  ;; value: KYC status (true if passed, false otherwise)
  }
)

;; Public function to set the KYC status of a person
(define-public (set-kyc-status (people-address principal) (state bool))
  (begin
    ;; Ensure that only the contract owner can set the KYC status
    (asserts! (is-eq tx-sender (var-get owner)) (err u100))
    ;; Set the KYC status in the 'people' map
    (map-set people
      { people-address: people-address }
      { is-kyc-passed: state }
    )
    ;; Return the new KYC status
    (ok state)
  )
)

;; Read-only function to get the KYC status of a person
(define-read-only (get-kyc-status (people-address principal))
  (match (map-get? people { people-address: people-address })
    entry (ok (get is-kyc-passed entry))  ;; Return KYC status if entry exists
    (ok false)  ;; Return false if entry does not exist
  )
)
