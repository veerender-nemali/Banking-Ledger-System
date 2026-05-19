const express = require("express")
const { authMiddleware, authSystemUserMiddleware } = require("../middleware/auth.middleware")
const { createTransaction, createInitialFundsTransaction } = require("../controllers/transaction.controller")

const router = express.Router()

router.post("/", authMiddleware, createTransaction)

router.post("/system/initial-funds", authSystemUserMiddleware, createInitialFundsTransaction)

module.exports = router