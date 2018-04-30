let {PrivateKey, PublicKey, Signature, Aes, key_utils, config} = require('eosjs-ecc')

console.log("Generating random keypair")
PrivateKey.randomKey()
        .then(privateKey => {
            console.log("Private Key:\t" + privateKey.toString())
            console.log("Public Key:\t" + privateKey.toPublic().toString())
        })
