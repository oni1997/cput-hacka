## How to Play
  **First Timer**
  1. Enter a list of comma separated strings you want to guess from
  2. Enter How many Rounds you would like to play
  3. The total amount of cUSD you want to spend in the session.
  4. You can play the number of Rounds you selected, and you may choose to start a new game. This will automatically end the previous round.
  
**Returning Player**
  1. If you have an ongoing set of rounds, you may continue or choose to start a new game.

  **Requirement**
  - Celo Extension Wallet Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from    the google chrome store.
  - Create a wallet.
  - Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
  - Switch to the alfajores testnet in the CeloExtensionWallet.
  

## Key points I learned while building this
  - Event logging
  - when your dapp mainly uses ERC20 tokens, the way you handle payments changes and using ``msg.value`` might often lead to errors. Before I noticed this, the contract     was charging both Celo and CUSD simultaneously
  

# Install
```
npm install
```
or 

```
yarn install
```

# Start
```
npm run dev

```
# Build
```
npm run build
```
# Usage
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.
