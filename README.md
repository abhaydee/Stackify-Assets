#Stackify-Assets

# Real-World Asset Tokenization Platform

Welcome to the Real-World Asset Tokenization Platform, a groundbreaking solution that bridges the gap between physical assets and the digital world of cryptocurrencies. Our platform enables users to commoditize their properties into tokens that can be utilized in real-world transactions and on our integrated trading platform.

## Features

- **Asset Tokenization**: Convert your physical properties into digital tokens.
- **Crypto Trading**: Trade your tokens on our powerful and user-friendly trading platform.
- **Real-World Utilization**: Use your tokens in real-world transactions, seamlessly integrating the physical and digital economies.
- **Secure and Transparent**: Built on a robust blockchain infrastructure ensuring security and transparency.

## Getting Started

Follow these steps to get started with our platform:

### Prerequisites

In order to run Stackify-Assets and our Infinity Stacks Platform, you need the following software to be installed:

clarinet
yarn
node.js
Docker

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/abhaydee/Stackify-Assets
   ```

1. **Tokenize Assets**: Use our intuitive interface to convert your physical properties into digital tokens.
1. **Trade Tokens**: Access our integrated trading platform to buy, sell, or trade your tokens with other users.
1. **Utilize Tokens**: Leverage your tokens for real-world transactions, enhancing the utility and value of your digital assets.

### `frontend`

The frontend directory houses the Next.js-based web application for interacting with our Stackify-Assets and InfinityStacks platform.

- **App**: Contains the main layout, styling, and page components. The `trade` sub-directory features components specific to trading functionalities.
- **Configuration**: Files like `next.config.js` and `tailwind.config.ts` for project setup and styling.

### `scripts`

Scripts folder containing `populate-onchain-data.js` script that populates on-chain price data and updates it every 2 minutes.

### Stacks

This directory will also hold the neccessary infrstructure code for the RWA tokenization platform

### Guidelines

Make sure you have all the infrastructure setup ready before attempting to run the code

### Clarity Smart Contracts

All the smart contracts for the RWA tokenization platform are deployed on testnet of stacks blockchain

In order to run InfinityStacks, you need the following software to be installed:

- [clarinet](https://github.com/hirosystems/clarinet)
- [yarn](https://yarnpkg.com/)
- [node.js](https://nodejs.org/en/download)
- [Docker](https://www.docker.com/)

Once these dependencies are on your computer, clone this repository. Then, navigate into the project root directory.

```bash
cd InfinityStacks
```

### Running the local devnet

If Docker is not running, boot Docker up. Then, navigate to the `contracts` directory:

```bash
cd contracts
```

Install dependencies:

```bash
yarn
```

And run the local stacks devnet:

```bash
clarinet devnet start
```

This process may take some time on the first try. Once your local devnet has started and block 5 is mined, navigate to the scripts folder in a new terminal window:

```bash
cd InfinityStacks/scripts
```

Install dependencies:

```bash
yarn
```

And run the on-chain data script:

```bash
node ./populate-onchain-data.js
```

You should see some output like this:

```
Adding mock feeds on-chain (nonce: 5).
33a6d748793c2db48b9f3eda3e7951e2ffd54fa44b47ec6c22d7e68d9deeee93 {
  txid: '33a6d748793c2db48b9f3eda3e7951e2ffd54fa44b47ec6c22d7e68d9deeee93'
}
Setting supported feeds for InfinityStacks on-chain (nonce: 6).
89071c42b00778d3434066eb1081a16c981b1288d19883c49f7c0775767a0237 {
  txid: '89071c42b00778d3434066eb1081a16c981b1288d19883c49f7c0775767a0237'
}
```

You can double check in your local devnet console that two new transactions have been added to the mempool and are being processed.

Once you have populated on-chain data in your local stacks devnet instance, navigate to the frontend directory:

```bash
cd InfinityStacks/client
```

Install dependencies:

```bash
yarn
```

And run the frontend:

```bash
yarn dev
```

You should then be able to navigate to `localhost:3000` and start using the Dapp!

## Contributing

Contributions to InfinityStacks are welcome! Please get in touch or open a pull request to contribute.
