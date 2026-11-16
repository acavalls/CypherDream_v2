var secret = require('./secret.js');
var HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
    migrations_directory: "./migrations",
    networks: {
      development: {
        host: "localhost",
        port: 8545,
        network_id: "*", // Match any network id
        gas: 4698712,
        gasPrice: 25000000000
        }
      },
        solc: {
          optimizer: {
              enabled: true,
              runs: 200
          }
      }
      /*rinkeby: {
        provider: function() {
            return new HDWalletProvider(secret.mnemonic(), 'https://rinkeby.infura.io/v3/ddbf7467eaf6444bb5099698a4b7b101')
        },
        network_id: '3',
        gas: 4500000,
        gasPrice: 1000000000
      },
      solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
    }*/
};
