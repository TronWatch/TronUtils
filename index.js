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


    let priv = "";
    let recipient = "TFoQGhmSQzLgnZjLYGAgGkAH8GUoe8J4Qb";

    module.exports.rpc.sendTrx(priv, recipient, 5000);
}

test();