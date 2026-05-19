const mongoose = require('mongoose')

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Account required to create a ledger entry"],
        index: true,
        immutable: true
    },
    amount: {
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

ledgerSchema.pre("updateOne", preventLedgerModification)
ledgerSchema.pre("deleteOne", preventLedgerModification)
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification)
ledgerSchema.pre("findOneAndDelete", preventLedgerModification)
ledgerSchema.pre("findOneAndReplace", preventLedgerModification)
ledgerSchema.pre("replaceOne", preventLedgerModification)
ledgerSchema.pre("updateMany", preventLedgerModification)
ledgerSchema.pre("deleteMany", preventLedgerModification)
ledgerSchema.pre("findOneAndRemove", preventLedgerModification)
ledgerSchema.pre("remove", preventLedgerModification)

const Ledger = mongoose.model("Ledger", ledgerSchema)

module.exports = Ledger