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

module.exports = { createAccountController, getAllUserAccounts }