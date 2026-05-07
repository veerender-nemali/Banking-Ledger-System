require('dotenv').config()
const app = require("./src/app.js")
const connectToDB = require("./src/config/database.js")



connectToDB()
    .then(() => {
        console.log('Connected to DB successfully')

        app.listen(3000, () => {
            console.log('Server is runing on port : 3000')
        })
    }).catch((err) => {
        console.log('Error connecting to DB : ', err)
    })