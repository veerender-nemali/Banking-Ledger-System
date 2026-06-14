const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

const authRouter = require("./routes/auth.routes.js");
const accountRouter = require("./routes/account.routes.js");
const transactionRouter = require("./routes/transaction.routes.js");

// Health / Root Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "LedgerFlow API is running",
  });
});

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transaction", transactionRouter);

module.exports = app;
