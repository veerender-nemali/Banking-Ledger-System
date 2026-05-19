const Account = require("../models/account.model")

async function createAccountController(req, res) {
    try {
        const user = req.user

        const newAccount = await Account.create({
            user: user._id
        })

        res.send({
            message: "Account created successfully!",
            account: newAccount
        })
    } catch (error) {
        res.status(401).send({
            message: error.message
        })
    }
}

async function getAllUserAccounts(req, res) {
    try {
        const user = req.user

        const accounts = await Account.find({ user: user._id })

        res.send({
            message: "User accounts!",
            accounts: accounts
        })
    } catch (error) {
        res.status(401).send({
            error: error.message
        })
    }
}

async function getBalance(req, res) {
    try {
        const { accountId } = req.params

        if (!accountId) {
            return res.status(400).json({
                message: "accountId required for fetching balance!"
            })
        }

        const account = await Account.findOne({
            _id: accountId,
            user: req.user._id
        })

        if (!account) {
            return res.status(400).json({
                message: "Account not found!"
            })
        }

        const balance = await account.getBalance()

        res.json({
            message: "User account balance!",
            balance: balance
        })
    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
}

module.exports = { createAccountController, getAllUserAccounts, getBalance }