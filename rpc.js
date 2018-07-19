const accounts = require("./account.js");

const axios = require("axios");
const {pubToHex, getSignature} = require("./utils/crypto");

class Rpc{

  constructor(config = {}){
    this.url_full = config.url_full || "http://rpc.tron.watch:8090";
    this.url_solidity = config.url_solidity || "http://rpc.tron.watch:8091";
  }

  async rpcReq(url, args= {}){
    return (await axios.post(this.url_full + url, args, {
      headers: {
        'content-type': 'application/json',
      },
    })).data;
  }

  signTransaction(privateKey, transaction){
    transaction.signature = getSignature(privateKey, transaction.txID);
    return transaction;
  }

  async broadcastTransaction(transaction){
    return (await this.rpcReq("/wallet/broadcasttransaction", transaction)).data;
  }

  async sendTrx(privateKey, recipient, amount){
    let myAddress = accounts.privateKeyToAddress(privateKey);
    let myHex = pubToHex(myAddress);
    let theirHex = pubToHex(recipient);
    let transaction = await this.getUnsignedSendTrx(myHex, theirHex, amount);
    transaction = this.signTransaction(privateKey, transaction);
    return await this.broadcastTransaction(transaction);
  }

  /******************************************************
   ********* REQUESTING UNSIGNED TRANSACTIONS ***********
   ******************************************************/

  async getUnsignedSendTrx(from, to, amount){
    return await this.rpcReq("/wallet/createtransaction", {
      "to_address": to,
      "owner_address": from,
      "amount": amount
    });
  }

}

module.exports = Rpc;
