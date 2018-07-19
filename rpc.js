const transactions = require("./transaction.js");
const witnesses = require("./witness.js");
const accounts = require("./account.js");
const blocks = require("./block.js");
const api = require("./api.js");
const utils = require("./utils.js");

const axios = require("axios");


const url = "https://api.tron.watch";
const url_full = "http://rpc.tron.watch:8090";
const url_solidity = "http://rpc.tron.watch:8091";

const {pubToHex, getSignature} = require("./utils/crypto");

module.exports = {

  async getLastBlock(){
    return await axios.get(url + "/grpc/getLastBlock").then(r => blocks.blockFromBase64(r.data));
  },

  async getNowBlock(){

  },

  async rpcReq(url, args= {}){
    return await axios.post(url_full + url, args, {
      headers: {
        'content-type': 'application/json',
      },
    })
  },

  async sendTrx(privateKey, recipient, amount){

    let myAddress = accounts.privateKeyToAddress(privateKey);
    let myHex = pubToHex(myAddress);
    let theirHex = pubToHex(recipient);

    let params = {
      "to_address": theirHex,
      "owner_address": myHex,
      "amount": 1000
    };

    let unsigned = (await this.rpcReq("/wallet/createtransaction", params)).data;


    let signature = getSignature(privateKey, unsigned.txID);

    console.log("signature: " + signature);
    unsigned.signature = [signature];

    let broadcast = (await this.rpcReq("/wallet/broadcasttransaction", unsigned)).data;
    console.log("final:");
    console.log(broadcast);

    //let unsigned =

    /*
    let nowBlock = await this.getLastBlock();
    let props = {
      sender : myAddress,
      recipient : recipient,
      amount : amount
    };

    //console.log(nowBlock.toObject());
    let unsigned = await transactions.createUnsignedTransferTransaction(props, nowBlock);
    console.log(unsigned.toObject());
    console.log(unsigned.getRawData().getContractList()[0].toObject());
    */


  }

};
