const accounts = require("./account.js");

const axios = require("axios");
const { pubToHex, getSignature } = require("./utils/crypto");

class Rpc {

    constructor(config = {}) {
        this.url_full = config.url_full || "http://rpc.tron.watch:8090";
        this.url_solidity = config.url_solidity || "http://rpc.tron.watch:8091";
    }

    async rpcReq(server, url, args = {}) {
        return (await axios.post(server + url, args, {
            headers: {
                'content-type': 'application/json',
            },
        })).data;
    }


    async fullReq(url, args={}){
        return this.rpcReq(this.url_full, url, args);
    }
    async solidityReq(url, args={}){
        return this.rpcReq(this.url_solidity, url, args);
    }

    signTransaction(privateKey, transaction) {
        transaction.signature = getSignature(privateKey, transaction.txID);
        return transaction;
    }

    async broadcastTransaction(transaction) {
        return (await this.fullReq("/wallet/broadcasttransaction", transaction)).data;
    }

    async sendTrx(privateKey, recipient, amount) {
        let myAddress = accounts.privateKeyToAddress(privateKey);
        let myHex = pubToHex(myAddress);
        let theirHex = pubToHex(recipient);
        let transaction = await this.getUnsignedSendTrx(myHex, theirHex, amount);
        transaction = this.signTransaction(privateKey, transaction);
        return await this.broadcastTransaction(transaction);
    }

    async getAccount(address) {
        let addressHex = pubToHex(address);
        return await this.solidityReq('/walletsolidity/getaccount', {
            address: addressHex
        });
    }

    /******************************************************
     ********* REQUESTING UNSIGNED TRANSACTIONS ***********
     ******************************************************/

    async getUnsignedSendTrx(from, to, amount) {
        return await this.fullReq("/wallet/createtransaction", {
            "to_address": to,
            "owner_address": from,
            "amount": amount
        });
    }

}

module.exports = Rpc;
