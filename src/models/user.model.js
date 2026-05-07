const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exists"],
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
    },
    name: {
        required: [true, "Name is required"],
        type: String,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false
    }
},

    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {

    if (!this.isModified('password')) return next()

    try {
        const hashedPassword = await bcrypt.hash(this.password, 10)
        this.password = hashedPassword
        return next()
    } catch (err) {
        return next(err)
    }
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const User = mongoose.model("User", userSchema)

module.exports = User