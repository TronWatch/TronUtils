const utils = require('./utils');
const bip39 =  require('bip39');
const sha256 = require('sha256');

const {pkToAddress} = require("./utils/crypto");

function accountFromMnemonicString(mnemonic){
    let words = mnemonic.split(" ");
    let privateKey = bip39.mnemonicToSeedHex(mnemonic);
    let address = pkToAddress(privateKey);

    return {
        words,
        privateKey,
        address
    };
}

function accountFromPrivateKey(privateKey){
    let address = pkToAddress(privateKey);

    return {
        privateKey,
        address
    };
}

function getAccountAtIndex(privateKey, index){
    let priv = sha256(privateKey + index);
    let pub = pkToAddress(priv);

    return {
        priv : priv,
        pub : pub
    }
}

function generateRandomBip39(){
    let mnemonic = bip39.generateMnemonic(256);
    return accountFromMnemonicString(mnemonic);
}

module.exports = {
    privateKeyToAddress : pkToAddress,
    generateRandomBip39,
    accountFromMnemonicString,
    accountFromPrivateKey,
    getAccountAtIndex
};