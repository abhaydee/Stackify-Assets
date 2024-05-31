(define-map properties
  { id: uint }
  {
    id: uint,
    name: (string-ascii 100),
    symbol: (string-ascii 10),
    owner: principal,
    docs: (string-ascii 100),
    price-in-wei: uint
  })

(define-data-var max-supply uint u0)
(define-data-var property-price uint u0)
(define-data-var property-docs (string-ascii 100) "")
(define-data-var property-owner principal tx-sender)

(define-public (create-property (id uint) (name (string-ascii 100)) (symbol (string-ascii 10)) (owner principal) (docs (string-ascii 100)) (price-in-wei uint))
  (begin
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

(define-read-only (get-property (id uint))
  (map-get? properties { id: id })
)

(define-public (mint (supply uint) (price uint) (docs (string-ascii 100)))
  (begin
    (asserts! (is-eq tx-sender (var-get property-owner)) (err u101))
    (var-set max-supply supply)
    (var-set property-price price)
    (var-set property-docs docs)
    (ok true)
  )
)

(define-public (safe-mint (to principal) (token-id uint))
  (begin
    (asserts! (< token-id (var-get max-supply)) (err u100))
    (asserts! (is-eq tx-sender (var-get property-owner)) (err u101))
    (map-set properties { id: token-id }
      {
        id: token-id,
        name: (var-get property-docs),
        symbol: "",
        owner: to,
        docs: (var-get property-docs),
        price-in-wei: (var-get property-price)
      })
    (ok true)
  )
)

(define-read-only (token-uri (token-id uint))
  (let ((property (map-get? properties { id: token-id })))
    (ok (get docs (unwrap! property (err u102))))
  )
)

(define-public (burn (token-id uint))
  (begin
    (asserts! (is-eq tx-sender (var-get property-owner)) (err u101))
    (map-delete properties { id: token-id })
    (ok true)
  )
)

(define-read-only (supports-interface (interface-id (buff 4)))
  (ok true)
)
