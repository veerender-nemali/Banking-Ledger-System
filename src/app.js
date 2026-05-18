const express = require('express')
const cookieParser = require("cookie-parser")
require('dotenv').config();

const app = express()

const authRouter = require("./routes/auth.routes.js")
const accountRouter = require("./routes/account.routes.js")


app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/accounts", accountRouter)

module.exports = app