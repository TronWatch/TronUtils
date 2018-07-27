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

    async getTransactionsFromThis(address){
        let hex = pubToHex(address);
        return await this.solidityReq('/walletextension/gettransactionsfromthis', {
            account : {
                address : hex
            },
            offset : 0,
            limit : 50
        });
    }

    async getTransactionsToThis(address){
        let hex = pubToHex(address);
        return await this.solidityReq('/walletextension/gettransactionstothis', {
            account : {
                address : hex
            },
            offset : 0,
            limit : 50
        });
    }

    getContracts(transaction){
        let out = [];
        for(let c in transaction.raw_data.contract){
            let contract = transaction.raw_data.contract[c];
            contract.timestamp = transaction.raw_data.timestamp;
            contract.txID = transaction.txID;
            out.push(contract);
        }
        return out;
    }

    async getTransactions(address){
        let transactionsTo = await this.getTransactionsToThis(address);
        let transactionsFrom = await this.getTransactionsFromThis(address);

        let contracts = [];

        while(transactionsFrom.transaction.length > 0)
            contracts = contracts.concat(this.getContracts(transactionsFrom.transaction.pop()));
        while(transactionsTo.length > 0)
            contracts = contracts.concat(this.getContracts(transactionsTo.transaction.pop()));

        contracts = contracts.sort((a,b)=>{
            return a.timestamp - b.timestamp
        });

        return contracts;
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
