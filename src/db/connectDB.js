const mongoose = require("mongoose");
const dotenv = require('dotenv').config();

const connect = async () => {
    try{
        const connect = await mongoose.connect("mongodb://localhost:27017/schoolbus");
        console.log("Database connected : ",connect.connection.name);
    } catch (err) {
        console.log("Unable to connect database due to Error : ",err);
        throw new(err)
    }
}

module.exports = connect;


// "mongodb+srv://tracker:tracker123@cluster0.xp7ut.mongodb.net/schoolbus?retryWrites=true&w=majority&appName=Cluster0"

//  "mongodb://localhost:27017/schoolbus"