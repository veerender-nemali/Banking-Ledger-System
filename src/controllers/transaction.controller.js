const mongoose = require('mongoose')
const Account = require('../models/account.model')
const Transaction = require("../models/tansaction.model")
const Ledger = require("../models/ledger.model")

async function createTransaction(req, res) {

}

async function createInitialFundsTransaction(req, res) {

    try {
        const { toAccount, amount, idempotencyKey } = req.body

        if (!toAccount || !amount || !idempotencyKey) {
            return res.status(401).json({
                message: "toAccount, amount and idempotencykey are required!"
            })
        }

        const toUserAccount = await Account.findOne({ _id: toAccount })

        if (!toUserAccount) {
            return res.status(404).json({
                message: "toAccount not found!"
            })
        }

        const fromUserAccount = await Account.findOne({ user: req.user._id })

        if (!fromUserAccount) {
            return res.status(404).json({
                message: "fromAccount not found!"
            })
        }

        const session = await mongoose.startSession()
        session.startTransaction()

        const transaction = new Transaction({
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        })

        const debitLedgerEntry = await Ledger.create([{
            account: fromUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        const creditLedgerEntry = await Ledger.create([{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        transaction.status = "COMPLETED"
        await transaction.save({ session })

        await session.commitTransaction()
        session.endSession()

        res.json({
            message: "Initial funds transaction completed successfully",
            transaction: transaction
        })
    } catch (error) {
        res.status(401).json({
            message: error.message
        })
    }

}

module.exports = {
    createTransaction,
    createInitialFundsTransaction
}