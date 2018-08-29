const accounts = require("./account.js");
const assert = require('assert');

const axios = require("axios");
const {pubToHex, getSignature} = require("./utils/crypto");

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


    async fullReq(url, args = {}) {
        return this.rpcReq(this.url_full, url, args);
    }

    async solidityReq(url, args = {}) {
        return this.rpcReq(this.url_solidity, url, args);
    }

    signTransaction(privateKey, transaction) {
        transaction.signature = getSignature(privateKey, transaction.txID);
        return transaction;
    }

    async broadcastTransaction(transaction) {
        return (await this.fullReq("/wallet/broadcasttransaction", transaction));
    }

    async getTransactionsFromThis(address, offset = 0, limit = 50) {
        let hex = pubToHex(address);
        return await this.solidityReq('/walletextension/gettransactionsfromthis', {
            account: {
                address: hex
            },
            offset,
            limit
        });
    }

    async getTransactionsToThis(address, offset = 0, limit = 50) {
        let hex = pubToHex(address);
        return await this.solidityReq('/walletextension/gettransactionstothis', {
            account: {
                address: hex
            },
            offset,
            limit
        });
    }

    getContracts(transaction) {
        let out = [];
        for (let c in transaction.raw_data.contract) {
            let contract = transaction.raw_data.contract[c];
            contract.timestamp = transaction.raw_data.timestamp;
            contract.txID = transaction.txID;
            if (transaction.contract_address)
                contract.contract_address = transaction.contract_address;
            out.push(contract);
        }
        return out;
    }

    async getTransactions(address, offset = 0, limit = 50) {
        let transactionsTo = await this.getTransactionsToThis(address, offset, limit);
        let transactionsFrom = await this.getTransactionsFromThis(address, offset, limit);

        let contracts = [];

        while (transactionsFrom.transaction.length > 0)
            contracts = contracts.concat(this.getContracts(transactionsFrom.transaction.pop()));
        while (transactionsTo.transaction.length > 0)
            contracts = contracts.concat(this.getContracts(transactionsTo.transaction.pop()));

        contracts = contracts.sort((a, b) => {
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

    async sendAsset(privateKey, recipient, asset, amount) {
        let myAddress = accounts.privateKeyToAddress(privateKey);
        let myHex = pubToHex(myAddress);
        let theirHex = pubToHex(recipient);
        let transaction = await this.getUnsignedTransferAsset(myHex, theirHex, asset, amount);
        transaction = this.signTransaction(privateKey, transaction);
        return await this.broadcastTransaction(transaction);
    }

    async issueAsset(privateKey, options) {
        let myAddress = accounts.privateKeyToAddress(privateKey);
        options.owner_address = pubToHex(myAddress);
        let transaction = await this.getUnsignedCreateAssetIssue(options);
        transaction = this.signTransaction(privateKey, transaction);
        return await this.broadcastTransaction(transaction);
    }

    async freezeBalance(privateKey, amount, duration = 3) {
        let myAddress = accounts.privateKeyToAddress(privateKey);
        let myHex = pubToHex(myAddress);

        let transaction = await this.getUnsignedFreezeBalance(myHex, amount, duration);
        let signed = this.signTransaction(privateKey, transaction);
        return await this.broadcastTransaction(signed);
    }

    async deployContract(privateKey, abi, bytecode, name, options) {
        const {
            feeLimit,
            callValue
        } = options;

        let myAddress = accounts.privateKeyToAddress(privateKey);
        let myHex = pubToHex(myAddress);

        let transaction = await this.getUnsignedCreateContract(myHex, abi, bytecode, name, callValue, feeLimit);
        let signed = this.signTransaction(privateKey, transaction);
        let rpcResponse = await this.broadcastTransaction(signed);

        return {
            rpcResponse,
            transaction
        };
    }

    async triggerContract(privateKey, address, functionSelector, parameter, options) {
        const {
            feeLimit,
            callValue
        } = options;

        let myAddress = accounts.privateKeyToAddress(privateKey);
        let myHex = pubToHex(myAddress);

        let transaction = await this.getUnsignedTriggerContract(address, functionSelector, parameter, feeLimit, callValue, myHex);
        let signed = this.signTransaction(privateKey, transaction.transaction);
        let rpcResponse = await this.broadcastTransaction(signed);

        return {
            rpcResponse,
            transaction
        };
    }

    async callContract(callerAddress, contractAddress, functionSelector, parameter, options) {
        const {
            feeLimit,
            callValue
        } = options;

        let callerHex = pubToHex(callerAddress);
        let transaction = await this.getUnsignedTriggerContract(contractAddress, functionSelector, parameter, feeLimit, callValue, callerHex);

        return {
            transaction
        };
    }

    async getAccountByPriv(priv) {
        return this.getAccount(accounts.privateKeyToAddress(priv));
    }

    async getAccount(address) {
        let addressHex = pubToHex(address);
        return await this.fullReq('/wallet/getaccount', {
            address: addressHex
        });
    }

    async getTransactionById(id) {
        return await this.solidityReq('/walletsolidity/gettransactionbyid', {value: id});
    }

    async getTransactionInfoById(id) {
        return await this.solidityReq('/walletsolidity/gettransactioninfobyid', {value: id});
    }

    async getWitnesses() {
        return await this.solidityReq('/walletsolidity/listwitnesses');
    }

    async getNowBlock() {
        return await this.solidityReq('/walletsolidity/getnowblock');
    }

    async getBlock(id) {
        return await this.solidityReq('/walletsolidity/getblockbynum', {num: id});
    }

    async getTokens() {
        return await this.solidityReq('/walletsolidity/getassetissuelist');
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

    async getUnsignedTransferAsset(owner_address, to_address, asset_name, amount) {
        return await this.fullReq('/wallet/transferasset', {
            owner_address,
            to_address,
            asset_name,
            amount
        });
    }

    async getUnsignedCreateAssetIssue(options) {
        assert(options.owner_address !== undefined, 'owner_address must be present in getUnsignedCreateAssetIssue');
        assert(options.name !== undefined, 'name must be present in getUnsignedCreateAssetIssue');
        assert(options.abbr !== undefined, 'abbr must be present in getUnsignedCreateAssetIssue');
        assert(options.total_supply !== undefined, 'total_supply must be present in getUnsignedCreateAssetIssue');
        assert(options.trx_num !== undefined, 'trx_num must be present in getUnsignedCreateAssetIssue');
        assert(options.num !== undefined, 'num must be present in getUnsignedCreateAssetIssue');
        assert(options.start_time !== undefined, 'start_time must be present in getUnsignedCreateAssetIssue');
        assert(options.end_time !== undefined, 'end_time must be present in getUnsignedCreateAssetIssue');
        assert(options.vote_score !== undefined, 'vote_score must be present in getUnsignedCreateAssetIssue');
        assert(options.description !== undefined, 'description must be present in getUnsignedCreateAssetIssue');
        assert(options.url !== undefined, 'url must be present in getUnsignedCreateAssetIssue');
        assert(options.free_asset_net_limit !== undefined, 'free_asset_net_limit must be present in getUnsignedCreateAssetIssue');
        assert(options.public_free_asset_net_limit !== undefined, 'public_free_asset_net_limit must be present in getUnsignedCreateAssetIssue');
        assert(options.frozen_supply !== undefined, 'frozen_supply must be present in getUnsignedCreateAssetIssue');
        assert(options.frozen_supply.frozen_amount !== undefined, 'frozen_supply.frozen_amount must be present in getUnsignedCreateAssetIssue');
        assert(options.frozen_supply.frozen_days !== undefined, 'frozen_supply.frozen_days must be present in getUnsignedCreateAssetIssue');

        return await this.fullReq('/wallet/createassetissue', options);
    }

    async getUnsignedCreateContract(owner, abi, bytecode, name, callValue, feeLimit) {
        let req = {
            abi: JSON.stringify(abi),
            bytecode: bytecode,
            contract_name: name,
            owner_address: owner,
            call_value: callValue,
            fee_limit: feeLimit,
        };
        return await this.fullReq("/wallet/deploycontract", req);
    }

    async getUnsignedTriggerContract(contract_address, functionSelector, parameter, feeLimit, callValue, ownerAddress) {
        let req = {
            contract_address,
            function_selector: functionSelector,
            parameter,
            fee_limit: feeLimit,
            call_value: callValue,
            owner_address: ownerAddress
        };
        return await this.fullReq('/wallet/triggersmartcontract', req);
    }

    async getUnsignedFreezeBalance(owner_address, frozen_balance, frozen_duration) {
        let req = {
            owner_address,
            frozen_balance,
            frozen_duration
        };
        return await this.fullReq('/wallet/freezebalance', req);
    }

}

module.exports = Rpc;
