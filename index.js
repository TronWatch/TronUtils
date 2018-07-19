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

async function test(){
  let rpc = new module.exports.rpc();

  let priv = "d5f10a95bc9205062724f8487c2857c509ac6de6ac45c86c4716d12dff1cdb5987f373741328230dcebff59199db90d633d58930832bcfe5409cac0535297dca";
  let recipient = "TFoQGhmSQzLgnZjLYGAgGkAH8GUoe8J4Qb";

  let response = await rpc.sendTrx(priv, recipient, 5000);
  console.log(response);
}

test();