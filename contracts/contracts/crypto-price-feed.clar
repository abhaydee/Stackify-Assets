;; Define constants for the contract
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100)) ;; Error for owner-only actions
(define-constant err-unknown-feed (err u101)) ;; Error for unknown feed
(define-constant err-btc-price-not-set (err u102)) ;; Error for BTC price not set

;; Define data variables
(define-data-var feed-index uint u0) ;; Index for feeds
(define-data-var btc-feed-index-set bool false) ;; Boolean indicating if BTC feed index is set
(define-data-var btc-feed-index uint u0) ;; BTC feed index

;; Define a map to store price feeds
(define-map price-feeds uint {
	current-value: uint, ;; Most recent value for feed
	block: uint, ;; Block feed was updated at
	ticker: (string-ascii 15), ;; Feed ticker
	type: (string-ascii 15), ;; Asset type
	name: (string-ascii 100), ;; Feed name
	implied-volatility: uint, ;; Implied volatility of the asset
	pyth-feed-id: (string-ascii 100), ;; Pyth price feed public key
})

;; Public function to add a new feed
(define-public (add-feed (feed {
	current-value: uint, ;; Most recent value for feed
	ticker: (string-ascii 15), ;; Feed ticker
	type: (string-ascii 15), ;; Asset type
	name: (string-ascii 100), ;; Feed name
	implied-volatility: uint, ;; Implied volatility of the asset
	pyth-feed-id: (string-ascii 100), ;; Pyth price feed public key
}))
  (let ((feed-id (var-get feed-index)))
	(begin
		;; Ensure only the contract owner can add feeds
		(asserts! (is-eq tx-sender contract-owner) err-owner-only)
		;; Add the feed to the price-feeds map
		(map-set price-feeds feed-id {
			current-value: (get current-value feed),
			block: burn-block-height,
			ticker: (get ticker feed),
			name: (get name feed),
			type: (get type feed),
			implied-volatility: (get implied-volatility feed),
			pyth-feed-id: (get pyth-feed-id feed),
		})
		;; Set BTC feed index if the feed ticker is "BTC"
		(if (is-eq (get ticker feed) "BTC") 
			(begin 
				(var-set btc-feed-index-set true) 
				(var-set btc-feed-index feed-id)
			) 
			(is-eq true true)
		)
		;; Increment the feed index
		(var-set feed-index (+ u1 feed-id))
		(ok true)
	)
  )
)

;; Public function to add multiple feeds
(define-public (add-feeds (feeds (list 12 {
	current-value: uint, ;; Most recent value for feed
	ticker: (string-ascii 15), ;; Feed ticker
	type: (string-ascii 15), ;; Asset type
	name: (string-ascii 100), ;; Feed name
	implied-volatility: uint, ;; Implied volatility of the asset
	pyth-feed-id: (string-ascii 100), ;; Pyth price feed public key
})))
  (begin 
	(map add-feed feeds)
	(ok true)
  )
)

;; Public function to update value for a feed
(define-public (update-feed (feed {
	feed-id: uint, ;; Feed id
	current-value: uint, ;; Most recent value for feed
}))
  (let (
	(feed-id (get feed-id feed))
	(current-value (get current-value feed))
	(current-feed (unwrap! (map-get? price-feeds feed-id) err-unknown-feed))
	)
	(begin
		;; Ensure only the contract owner can update feeds
		(asserts! (is-eq tx-sender contract-owner) err-owner-only)
		;; Update the feed value in the price-feeds map
		(map-set price-feeds feed-id (merge current-feed {current-value: current-value, block: block-height}))
		(ok true)
	)
  )
)

;; Public function to update values for multiple feeds
(define-public (update-feeds (feeds (list 12 {
	feed-id: uint, ;; Feed id
	current-value: uint, ;; Most recent value for feed
})))
  (begin 
	(map update-feed feeds)
	(ok true)
  )
)

;; Read-only function to get feed details for a given feed id
(define-read-only (get-feed (id uint))
  (begin
	(map-get? price-feeds id)
  )
)

;; Read-only function to get the BTC price
(define-read-only (get-btc-price)
  (begin
	(if 
		(var-get btc-feed-index-set) 
		(ok (get current-value (unwrap-panic (map-get? price-feeds (var-get btc-feed-index))))) 
		(err err-btc-price-not-set)
	)
  )
)

;; Read-only function to get the current feed index
(define-read-only (get-feed-index)
  (begin
	(ok (var-get feed-index))
  )
)
