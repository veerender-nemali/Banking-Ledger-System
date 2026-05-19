const express = require('express');
const { authMiddleware } = require("../middleware/auth.middleware")
const { createAccountController, getAllUserAccounts, getBalance } = require("../controllers/account.controller")

const router = express.Router();

router.post("/", authMiddleware, createAccountController)
router.get("/", authMiddleware, getAllUserAccounts)
router.get("/balance/:accountId", authMiddleware, getBalance)

module.exports = router