const mongoose = require('mongoose')

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
    } catch (err) {
        // console.log('Error connecting to DB : ', err)
        throw err
    }
}

module.exports = connectToDB