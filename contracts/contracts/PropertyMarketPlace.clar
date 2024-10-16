(define-data-var contract-owner principal tx-sender)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-PROPERTY-NOT-FOUND (err u404))
(define-constant ERR-INVALID-PRICE (err u405))
(define-constant ERR-LISTING-NOT-FOUND (err u406))
(define-constant ERR-LISTING-EXPIRED (err u407))
(define-constant ERR-LISTING-INACTIVE (err u408))
(define-constant ERR-INSUFFICIENT-FUNDS (err u409))
(define-constant ERR-ALREADY-LISTED (err u410))

(define-map listings
  { property-id: uint }
  { 
    seller: principal, 
    price: uint, 
    status: bool, 
    expiration: uint,
    created-at: uint 
  })

;; Set the listing expiration period (in blocks)
(define-constant expiration-period u1440)

;; Function to list a property for sale
(define-public (list-property (property-id uint) (price uint))
  (let (
    (property (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.RwaProperty get-property property-id)))
    (existing-listing (map-get? listings { property-id: property-id }))
  )
    ;; Validate ownership and price
    (asserts! (is-eq (get owner property) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (> price u0) ERR-INVALID-PRICE)
    (asserts! (is-none existing-listing) ERR-ALREADY-LISTED)
    
    (map-set listings 
      { property-id: property-id } 
      { seller: tx-sender, price: price, status: true, expiration: (+ (block-height) expiration-period) })
    ;; Emit event for listing
    (emit-event-listing property-id price tx-sender)
    (ok true)
  )
)

;; Function to buy a listed property
(define-public (buy-property (property-id uint))
  (let ((listing (unwrap! (map-get? listings { property-id: property-id }) (err u103))))
    (asserts! (is-eq (get status listing) true) (err u104))
    (asserts! (<= (block-height) (get expiration listing)) (err u105)) ;; Ensure listing is not expired
    (let ((price (get price listing))
          (seller (get seller listing)))
      (begin
        ;; Transfer STX tokens from buyer to seller
        (unwrap! (stx-transfer? price tx-sender seller) (err u106))
        ;; Transfer property ownership from seller to buyer
        (contract-call? .RwaProperty transfer-property property-id tx-sender)
        ;; Update listing status
        (map-set listings { property-id: property-id } { seller: seller, price: price, status: false, expiration: u0 })
        ;; Emit event for purchase
        (emit-event-purchase property-id tx-sender price)
        (ok true)
      )
    )
  )
)

;; Function to cancel a property listing
(define-public (cancel-listing (property-id uint))
  (let ((listing (unwrap! (map-get? listings { property-id: property-id }) (err u103))))
    (asserts! (is-eq (get seller listing) tx-sender) (err u102))
    (map-delete listings { property-id: property-id })
    ;; Emit event for cancellation
    (emit-event-cancellation property-id tx-sender)
    (ok true)
  )
)

;; Function to withdraw an expired listing (only owner)
(define-public (withdraw-listing (property-id uint))
  (let ((listing (unwrap! (map-get? listings { property-id: property-id }) (err u103))))
    (asserts! (is-eq (get seller listing) tx-sender) (err u102)) ;; Only owner can withdraw
    (asserts! (> (block-height) (get expiration listing)) (err u107)) ;; Ensure listing is expired
    (map-delete listings { property-id: property-id })
    (ok true)
  )
)

;; Event logging for listing, purchase, and cancellation
(begin
  (define-private (emit-event-listing (property-id uint) (price uint) (seller principal))
    (print { event: "property-listed", property-id: property-id, price: price, seller: seller })
  )

  (define-private (emit-event-purchase (property-id uint) (buyer principal) (price uint))
    (print { event: "property-purchased", property-id: property-id, buyer: buyer, price: price })
  )

  (define-private (emit-event-cancellation (property-id uint) (seller principal))
    (print { event: "listing-cancelled", property-id: property-id, seller: seller })
  )
)

;; New function to update the price of a listed property
(define-public (update-price (property-id uint) (new-price uint))
  (let ((listing (unwrap! (map-get? listings { property-id: property-id }) (err u103))))
    (asserts! (is-eq (get seller listing) tx-sender) (err u102)) ;; Ensure only seller can update price
    (map-set listings { property-id: property-id } { seller: (get seller listing), price: new-price, status: (get status listing), expiration: (get expiration listing) })
    (ok true)
  )
)

;; New function to extend the expiration period of a listing
(define-public (extend-expiration (property-id uint) (additional-blocks uint))
  (let ((listing (unwrap! (map-get? listings { property-id: property-id }) (err u103))))
    (asserts! (is-eq (get seller listing) tx-sender) (err u102)) ;; Ensure only seller can extend expiration
    (map-set listings { property-id: property-id } { seller: (get seller listing), price: (get price listing), status: (get status listing), expiration: (+ (get expiration listing) additional-blocks) })
    (ok true)
  )
)

;; New function to get the details of a listing
(define-public (get-listing (property-id uint))
  (let ((listing (map-get? listings { property-id: property-id })))
    (match listing
      listing (ok listing)
      (err u103)
    )
  )
)

;; New function to get all active listings
(define-public (get-active-listings)
  (let ((active-listings (filter
    (lambda (listing)
      (and (is-eq (get status listing) true)
           (<= (block-height) (get expiration listing))))
    (map-to-list listings))))
    (ok active-listings)
  )
)

;; New function to get all listings by a specific seller
(define-public (get-listings-by-seller (seller principal))
  (let ((seller-listings (filter
    (lambda (listing)
      (is-eq (get seller listing) seller))
    (map-to-list listings))))
    (ok seller-listings)
  )
)

;; New function to get the total number of listings
(define-public (get-total-listings)
  (let ((total-listings (len (map-to-list listings))))
    (ok total-listings)
  )
)
