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

module.exports = {

  async getLastBlock(){
    return await axios.get(url + "/grpc/getLastBlock").then(r => blocks.blockFromBase64(r.data));
  },

  async getNowBlock(){

  },

  async sendTrx(privateKey, recipient, amount){
    //let unsigned =

    /*
    let nowBlock = await this.getLastBlock();
    let myAddress = accounts.privateKeyToAddress(privateKey);
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
