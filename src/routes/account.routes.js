const express = require('express');
const { authMiddleware } = require("../middleware/auth.middleware")
const { createAccountController, getAllUserAccounts } = require("../controllers/account.controller")

const router = express.Router();

router.post("/", authMiddleware, createAccountController)
router.get("/", authMiddleware, getAllUserAccounts)

module.exports = router