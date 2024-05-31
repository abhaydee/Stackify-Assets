(define-data-var owner principal tx-sender)

(define-map people
  {
    people-address: principal
  }
  {
    is-kyc-passed: bool
  }
)

(define-public (set-kyc-status (people-address principal) (state bool))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err u100))
    (map-set people
      { people-address: people-address }
      { is-kyc-passed: state }
    )
    (ok state)
  )
)

(define-read-only (get-kyc-status (people-address principal))
  (match (map-get? people { people-address: people-address })
    entry (ok (get is-kyc-passed entry))
    (ok false)
  )
)
