module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    }
  },

  // compilers: {
  //   solc: {
  //     version: "^0.8.19", // Use a version compatible with your contract
  //   }
  // }
}
