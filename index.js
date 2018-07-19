const transactions = require("./transaction.js");
const witnesses = require("./witness.js");
const accounts = require("./account.js");
const blocks = require("./block.js");
const api = require("./api.js");
const utils = require("./utils.js");
const rpc = require("./rpc.js");

module.exports = {
    transactions,
    witnesses,
    accounts,
    blocks,
    utils,
    api,
    rpc
};

const {pubToHex} = require("./utils/crypto");

function test(){


    let test = pubToHex("TSnjgPDQfuxx72iaPy82v3T8HrsN4GVJzW");
    console.log(test);


  //module.exports.rpc.sendTrx("123", "TVMP5r12ymtNerq5KB4E8zAgLDmg2FqsEG", 5000);

}

test();