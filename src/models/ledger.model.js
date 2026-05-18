const mongoose = require('mongoose')

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Account required to create a ledger entry"],
        index: true,
        immutable: true
    },
    ammount: {
        type: Number,
        required: [true, "Amount required to create a ledger entry"],
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: [true, "Transaction is required to create a ledger entry"],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ["DEBIT", 'CREDIT'],
            message: "Type can be either DEBIT or CREDIT"
        },
        required: [true, "Ledger type is required"],
        immutable: true
    }
})

function preventLedgerModification() {
    throw new Error("Ledger entries cannot be modified or deleted")
}

LedgerSchema.pre("updateOne", preventLedgerModification)
LedgerSchema.pre("deleteOne", preventLedgerModification)
LedgerSchema.pre("findOneAndUpdate", preventLedgerModification)
LedgerSchema.pre("findOneAndDelete", preventLedgerModification)
LedgerSchema.pre("findOneAndReplace", preventLedgerModification)
LedgerSchema.pre("replaceOne", preventLedgerModification)
LedgerSchema.pre("updateMany", preventLedgerModification)
LedgerSchema.pre("deleteMany", preventLedgerModification)
LedgerSchema.pre("findOneAndRemove", preventLedgerModification)
LedgerSchema.pre("remove", preventLedgerModification)

const Ledger = mongoose.model("Ledger", ledgerSchema)

module.exports = Ledger