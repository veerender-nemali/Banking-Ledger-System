const mongoose = require('mongoose')
const Account = require('../models/account.model')
const Transaction = require("../models/tansaction.model")
const Ledger = require("../models/ledger.model")
const emailService = require("../services/email.service")

async function createTransaction(req, res) {

    try {
        const { fromAccount, toAccount, amount, idempotencyKey } = req.body

        //1. Validation
        if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "fromAccount, toAccount, amount and idempotencyKey are required!"
            })
        }

        const fromUserAccount = await Account.findOne({ _id: fromAccount })
        const toUserAccount = await Account.findOne({ _id: toAccount })

        if (!fromUserAccount || !toUserAccount) {
            return res.status(400).json({
                message: "Invalid fromAccount or toAccount!"
            })
        }

        //2. IdempotencyKey verification
        const isTransactionAlreadyExists = await Transaction.findOne({
            idempotencyKey: idempotencyKey
        })

        if (isTransactionAlreadyExists) {
            if (isTransactionAlreadyExists.status === "COMPLETED") {
                return res.status(200).json({
                    message: "Transaction already processed!",
                    transaction: isTransactionAlreadyExists
                })
            }

            if (isTransactionAlreadyExists.status === "PENDING") {
                return res.status(200).json({
                    message: "Transaction is still processing!"
                })
            }

            if (isTransactionAlreadyExists.status === "FAILED") {
                return res.status(500).json({
                    message: "Transaction failed, please try again!"
                })
            }

            if (isTransactionAlreadyExists.status === "REVERSED") {
                return res.status(500).json({
                    message: "Transaction reversed, please try again!"
                })
            }
        }

        //3. Check account status
        if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
            return res.status(400).json({
                message: "Both fromAccount, toAccount must be Active for transaction!"
            })
        }

        //4. Get Balance
        const balance = await fromUserAccount.getBalance()

        if (balance < amount) {
            return res.status(400).json({
                message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
            })
        }

        //5. Create Transaction
        const session = await mongoose.startSession()
        session.startTransaction()

        const transaction = await Transaction.create({
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        })

        //6. create debit and credit ledger entry
        const debitLedgerEntry = await Ledger.create([{
            account: fromAccount,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        const creditLedgerEntry = await Ledger.create([{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        transaction.status = "COMPLETED"
        await transaction.save({ session })

        await session.commitTransaction()
        session.endSession()

        await emailService.sendRegistrationEmail(req.user.email, req.user.name, amount, toAccount)

        res.json({
            message: "Requested Transaction completed successfully",
            transaction: transaction
        })

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
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