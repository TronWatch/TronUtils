const accounts = require("./account.js");
const utils = require("./utils.js");
const rpc = require("./rpc.js");

module.exports = {
    accounts,
    utils,
    rpc
};

/*
async function test() {
    let rpc = new module.exports.rpc();

    let priv = "d5f10a95bc9205062724f8487c2857c509ac6de6ac45c86c4716d12dff1cdb5987f373741328230dcebff59199db90d633d58930832bcfe5409cac0535297dca";
    let recipient = "TFoQGhmSQzLgnZjLYGAgGkAH8GUoe8J4Qb";

    //let response = await rpc.sendTrx(priv, recipient, 5000);

    let response = await rpc.getAccount(recipient);
    console.log(response);
}

test();
*/

/*
async function test(){
    let r = new rpc();

    let zero = await r.getBlock(0);
    console.log('zero:');
    console.log(zero);

    let now = await r.getNowBlock();
    console.log('now');
    console.log(now);

    let tokens = await r.getTokens();
    console.log('tokens');
    console.log(tokens);

    let witnesses = await r.getWitnesses();
    console.log('witnesses');
    console.log(witnesses);

    let transaction = await r.getTransactionById('28d8cf1934fbbe63cd568e710560543ed1d4a5e8809dd0a44be5fabffa70764f');
    console.log('transaction');
    console.log(transaction);

}

test();
*/
