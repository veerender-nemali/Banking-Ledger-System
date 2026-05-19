const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

async function authMiddleware(req, res, next) {
    try {
        // const { cookies } = req.cookies
        // const { token } = cookies
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access, Please Login!"
            })
        }

        const verifyToken = await jwt.verify(token, process.env.JWT_SECRET)
        const { _id } = verifyToken

        const user = await User.findById(_id)

        if (!user) {
            return res.status(401).json({
                message: "user not found!"
            })
        }

        req.user = user
        next()

    } catch (err) {
        res.status(401).json({
            message: err.message
        })
    }
}

async function authSystemUserMiddleware(req, res, next) {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access, Please Login!"
            })
        }

        const verifyToken = await jwt.verify(token, process.env.JWT_SECRET)
        const { _id } = verifyToken

        const user = await User.findById(_id).select("+systemUser")

        if (!user.systemUser) {
            return res.status(401).json({
                message: "Unauthorized access, Only system users can access this resource!"
            })
        }

        req.user = user
        next()

    } catch (error) {
        res.status(401).json({
            Error: error.message
        })
    }
}

module.exports = { authMiddleware, authSystemUserMiddleware }