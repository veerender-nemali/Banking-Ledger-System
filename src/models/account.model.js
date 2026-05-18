const mongoose = require("mongoose")

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
        required: [true, "User reference is required"]
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status must be either ACTIVE, FROZEN, or CLOSED"
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        required: [true, "Currency is required"],
        default: "INR"
    }
},
    {
        timestamps: true
    }
)

accountSchema.index({ user: 1, status: 1 })

const Account = mongoose.model("Account", accountSchema)

module.exports = Account
