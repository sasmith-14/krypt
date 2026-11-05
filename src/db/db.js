const mongoose = require('mongoose');

async function dbConnect() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("database connected successfully");
}

module.exports = dbConnect;

