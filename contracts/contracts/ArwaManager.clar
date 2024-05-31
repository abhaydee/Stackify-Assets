(define-data-var property-item-address principal (as-contract tx-sender))
(define-data-var kyc-manager principal (as-contract tx-sender))
(define-data-var owner principal tx-sender)
(define-data-var property-count uint u0)

(define-map verifiers
  { verifier: principal }
  { state: bool })

(define-map properties
  { id: uint }
  {
    id: uint,
    name: (string-ascii 100),
    docs: (string-ascii 100),
    symbol: (string-ascii 10),
    owner: principal,
    status: uint,
    collection-address: (optional principal),
    verifier: (optional principal)
  })

(define-constant STATUS_PENDING u0)
(define-constant STATUS_SHIPPED u1)
(define-constant STATUS_ACCEPTED u2)
(define-constant STATUS_REJECTED u3)
(define-constant STATUS_CANCELED u4)

(define-private (is-kyced (user principal))
  (let ((kyc-status (contract-call? .kycstore get-kyc-status user)))
    (is-eq kyc-status true)
  )
)

(define-public (update-verifier (verifier-address principal) (state bool))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err u100))
    (map-set verifiers { verifier: verifier-address } { state: state })
    (ok true)
  )
)

(define-read-only (get-user-properties (user principal))
  (ok (get-user-properties-helper user u0 (var-get property-count) (list)))
)

(define-private (get-user-properties-helper (user principal) (index uint) (count uint) (accumulated (list 1024 (tuple (id uint) (name (string-ascii 100)) (docs (string-ascii 100)) (symbol (string-ascii 10)) (owner principal) (status uint) (collection-address (optional principal)) (verifier (optional principal))))))
  (if (>= index count)
    accumulated
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

(define-read-only (get-property-by-id (id uint))
  (match (map-get? properties { id: id })
    prop (ok prop)
    (err u101)
  )
)

(define-public (update-property-state (property-id uint) (status uint))
  (let ((property (unwrap! (map-get? properties { id: property-id }) (err u101))))
    (let ((is-verifier (map-get? verifiers { verifier: tx-sender })))
      (asserts! (or (is-eq tx-sender (get verifier property)) 
                    (and (is-none (get verifier property)) (is-some is-verifier))) (err u102))
      (map-set properties { id: property-id }
        (merge property { status: status, verifier: (if (is-none (get verifier property)) (some tx-sender) (get verifier property)) }))
      (ok true)
    )
  )
)

(define-public (create-property-request (name (string-ascii 100)) (docs (string-ascii 100)) (symbol (string-ascii 10)))
  (begin
    (asserts! (is-kyced tx-sender) (err u103))
    (let ((property-id (var-get property-count)))
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
      (var-set property-count (+ property-id u1))
      (ok property-id)
    )
  )
)

(define-public (set-library-address (property-item-address principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err u100))
    (var-set property-item-address property-item-address)
    (ok true)
  )
)

(define-public (create-property-collection (property-id uint) (price-in-wei uint))
  (let ((property (unwrap! (map-get? properties { id: property-id }) (err u101))))
    (let ((is-verifier (map-get? verifiers { verifier: tx-sender })))
      (asserts! (or (is-eq tx-sender (get verifier property)) 
                    (and (is-none (get verifier property)) (is-some is-verifier))) (err u102))
      (let ((result (contract-call? (var-get property-item-address) create-property 
                                    property-id
                                    (get name property) 
                                    (get symbol property) 
                                    (get owner property) 
                                    (get docs property) 
                                    price-in-wei)))
        (map-set properties { id: property-id }
          (merge property { collection-address: (some (var-get property-item-address)), status: STATUS_ACCEPTED, verifier: (some tx-sender) }))
        (ok true)
      )
    )
  )
)

(define-read-only (get-available-verifier-properties)
  (begin
    (asserts! (unwrap-panic (map-get? verifiers { verifier: tx-sender })) (err u104))
    (ok (get-available-verifier-properties-helper u0 (var-get property-count) (list)))
  )
)

(define-private (get-available-verifier-properties-helper (index uint) (count uint) (accumulated (list 1024 (tuple (id uint) (name (string-ascii 100)) (docs (string-ascii 100)) (symbol (string-ascii 10)) (owner principal) (status uint) (collection-address (optional principal)) (verifier (optional principal))))))
  (if (>= index count)
    accumulated
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
