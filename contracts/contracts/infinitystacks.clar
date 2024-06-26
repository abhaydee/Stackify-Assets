;; Define constants for the contract
(define-constant contract-owner tx-sender)
(define-constant satoshi-amount u100000000)
(define-constant err-get-price-feed-index (err u100))
(define-constant err-owner-only (err u101))
(define-constant err-append-supported-feed (err u102))
(define-constant err-insufficient-funds (err u3766))
(define-constant err-get-sBTC-price (err u104))

;; Define a fungible token called thetix-USD
(define-fungible-token thetix-USD)

;; Define data variables for the contract
(define-data-var min-c-ratio uint u300) ;; Minimum collateralization ratio required for trades
(define-data-var supported-assets (list 100 uint) (list )) ;; List of supported asset feed IDs

;; Define maps for storing various balances and account information
(define-map global-asset-amounts uint uint) ;; Global balances for assets
(define-map user-accounts principal { ;; Primary datastore for user accounts
    name: (string-ascii 100), ;; Readable user name
    tUSD-amount: uint ;; thetix-USD balance
})
(define-map user-asset-balances {user: principal, asset-id: uint} uint) ;; User asset balances
(define-map user-asset-balances-sbtc {user: principal, asset-id: uint} uint) ;; User sBTC asset balances
(define-map asset-ownership uint uint) ;; Total asset ownership mapping

;; Public function to mint thetix-USD for the user
(define-public (mint-thetix-USD) 
  (begin
    (ft-mint? thetix-USD u1000 tx-sender)
  )
)

;; Public function to add a supported feed
(define-public (add-supported-feed (feed-id uint)) 
  (begin
    ;; Ensure only the contract owner can add supported feeds
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    ;; Add the feed ID to the supported assets list
    (var-set supported-assets 
      (unwrap! 
        (as-max-len? (append (var-get supported-assets) feed-id) u100) 
        err-append-supported-feed)
    )
    (ok true)
  )
)

;; Public function to set multiple supported feeds at once
(define-public (set-supported-feeds (feed-ids (list 100 uint))) 
  (begin
    ;; Ensure only the contract owner can set supported feeds
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set supported-assets feed-ids)
    (ok true)
  )
)

;; Read-only function to get the list of supported feeds
(define-read-only (get-supported-feeds) 
  (begin
    (ok (map get-feed-for-id (var-get supported-assets)))
  )
)

;; Read-only function to get the IDs of supported feeds
(define-read-only (get-supported-feeds-ids) 
  (begin
    (ok (var-get supported-assets))
  )
)

;; Read-only function to get the feed details for a specific feed ID
(define-read-only (get-feed-for-id (feed-id uint)) 
  (unwrap-panic (contract-call? .mock-price-feed get-feed feed-id))
)

;; Read-only function to get the total asset value currently on the protocol
(define-read-only (get-total-asset-value) 
  (let (
        (feed-index (unwrap! (contract-call? .mock-price-feed get-feed-index ) err-get-price-feed-index))
        (assets-list (var-get supported-assets))
    )
    (begin 
      (ok (fold add-total-value-for-asset assets-list u0))
    )
  )
)

;; Read-only function to get thetix USD balance for a user account
(define-read-only (get-user-tusd-balance (account-name principal)) 
  (ok (ft-get-balance thetix-USD account-name))
)

;; Read-only function to get sBTC balance for the current user
(define-read-only (get-sbtc-balance) 
  (contract-call? .sbtc get-balance tx-sender)
)

;; Read-only function to get sBTC price
(define-read-only (get-sbtc-price) 
  (contract-call? .mock-price-feed get-btc-price)
)

;; Read-only function to get asset balance for the current user
(define-read-only (get-asset-balance (asset-id uint))
  (let (
        (balance (map-get? user-asset-balances {user: tx-sender, asset-id: asset-id}))
    ) 
    (if (is-eq balance none) (ok u0) (ok (unwrap-panic balance)))
  )
)

;; Read-only function to get global asset balance
(define-read-only (get-global-asset-balance (asset-id uint))
  (let (
        (balance (map-get? global-asset-amounts asset-id))
    ) 
    (if (is-eq balance none) (ok u0) (ok (unwrap-panic balance)))
  )
)

;; Private function to add value of total assets
(define-private (add-total-value-for-asset (asset-id uint) (current-sum uint)) 
  (let (
        (asset-amount (map-get? global-asset-amounts asset-id))
        (feed-value (get current-value (unwrap-panic (contract-call? .mock-price-feed get-feed asset-id))))
    )
    (begin
      (if (is-eq asset-amount none)
        current-sum
        (+ current-sum (* feed-value (unwrap-panic asset-amount)))
      )
    )
  )
)

;; Public function to set the required c-ratio
(define-public (set-c-ratio (value uint))
  (begin 
    ;; Ensure only the contract owner can set the c-ratio
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set min-c-ratio value)
    (ok true)
  )
)

;; Read-only function to get the c-ratio for the protocol
(define-read-only (get-c-ratio)
  (begin
    (ok (var-get min-c-ratio))
  )
)

;; Public function to test sending sBTC
(define-public (test-send) 
  (begin 
    (contract-call? .sbtc transfer u1 tx-sender (as-contract tx-sender) (some 0x68656c6c6f21))
  )
)

;; Public function to purchase an asset
(define-public (purchase-asset (asset-id uint) (amount-satoshis uint)) 
  (let (
        (feed-value (get current-value (unwrap-panic (contract-call? .mock-price-feed get-feed asset-id))))
        (assets-balance-key {user: tx-sender, asset-id: asset-id})
        (user-assets-balance (map-get? user-asset-balances assets-balance-key))
        (sbtc-balance (unwrap-panic (get-sbtc-balance)))
        (sbtc-price (unwrap-panic (get-sbtc-price)))
        (amount-of-asset-to-purchase (/ (* sbtc-price amount-satoshis) feed-value))
        (new-balance (if (is-eq user-assets-balance none)
            amount-of-asset-to-purchase
            (+ amount-of-asset-to-purchase (unwrap-panic user-assets-balance))
        ))
        (global-asset-amount (map-get? global-asset-amounts asset-id))
        (new-global-asset-amount (if (is-eq global-asset-amount none)
            amount-of-asset-to-purchase
            (+ amount-of-asset-to-purchase (unwrap-panic global-asset-amount))
        ))
    )
    (begin
      ;; Ensure the user has sufficient sBTC balance
      (asserts! (>= sbtc-balance amount-satoshis) err-insufficient-funds)
      ;; Transfer sBTC from the user to the contract
      (try! (contract-call? .sbtc transfer amount-satoshis tx-sender (as-contract tx-sender) none))
      ;; Update user and global asset balances
      (map-set user-asset-balances assets-balance-key new-balance)
      (map-set global-asset-amounts asset-id new-global-asset-amount)
      (print amount-of-asset-to-purchase)
      (ok true)
    )
  )
)

;; Public function to sell an asset
(define-public (sell-asset (asset-id uint) (amount uint)) 
  (let (
        (feed-value (get current-value (unwrap-panic (contract-call? .mock-price-feed get-feed asset-id))))
        (assets-balance-key {user: tx-sender, asset-id: asset-id})
        (user-assets-balance (map-get? user-asset-balances assets-balance-key))
        (sbtc-price (unwrap-panic (get-sbtc-price)))
        (amount-of-sbtc-to-receive (/ (* feed-value amount) sbtc-price))
        (current-balance (if (is-eq user-assets-balance none)
            u0
            (unwrap-panic user-assets-balance)
        ))
    )
    (begin
      ;; Ensure the user has sufficient asset balance to sell
      (asserts! (>= current-balance amount) err-insufficient-funds)
      ;; Transfer sBTC from the contract to the user
      (try! (contract-call? .sbtc transfer amount-of-sbtc-to-receive (as-contract tx-sender) tx-sender none))
      ;; Update user asset balance
      (map-set user-asset-balances assets-balance-key (- current-balance amount))
      (print amount-of-sbtc-to-receive)
      (ok true)
    )
  )
)
