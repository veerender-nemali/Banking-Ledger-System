const userModel = require("../models/user.model")
const emailService = require("../services/email.service")

async function userRegisterController(req, res) {
    try {
        const { email, name, password } = req.body

        const existingUser = await userModel.findOne({
            email: email
        })

        if (existingUser) {
            return res.status(422).json({
                message: "User already exists with this email",
                status: 'failed'
            })
        }

        const user = new userModel({ name, email, password })

        const savedUser = await user.save()

        const token = await savedUser.getJWT()

        res.cookie("token", token)

        res.send({
            message: "User registered successfully",
            status: 'success',
            data: {
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email
            }
        })

        await emailService.sendRegistrationEmail(user.email, user.name)

    } catch (err) {
        console.log(err)
        res.status(400).send("Error registering user : ", err)
    }

}

async function userLogincontroller(req, res) {
    const { email, password } = req.body

    try {
        const user = await userModel.findOne({ email: email }).select("+password")

        if (!user) {
            return res.status(401).send("Invalid email or password")
        }

        const isPasswordValid = await user.comparePassword(password)

        if (!isPasswordValid) {
            return res.status(401).send("Invalid email or password")
        }

        const token = await user.getJWT()

        res.cookie("token", token)

        res.send({
            message: "User logged in successfully",
            status: 'success',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        })

    } catch (err) {
        console.log(err)
        res.status(400).send("Error logging in user : ", err)
    }
}

async function userLogoutController(req, res) {
    res.clearCookie("token")
    res.send({ message: "User logged out successfully", status: 'success' })
}

module.exports = { userRegisterController, userLogincontroller, userLogoutController }