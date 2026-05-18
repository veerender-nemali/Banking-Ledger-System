const accountModel = require("../models/account.model")

async function createAccountController(req, res) {
    try {
        const user = req.user

        const newAccount = await accountModel.create({
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

module.exports = { createAccountController }