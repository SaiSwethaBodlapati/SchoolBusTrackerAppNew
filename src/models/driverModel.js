const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const driverSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address");
            }
        }
    },
    phoneNumber: {
        type: String,
        required: false,
        validate(value) {
            if (!validator.isMobilePhone(value)) {
                throw new Error("Invalid phone number");
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    licenseNumber: {
        type: String,
        required: false,
        trim: true,
    },
    vehicleDetails: {
        vehicleType: { 
            type: String, 
            required: false, 
            trim: true 
        }, 
        vehicleModel: { 
            type: String, 
            required: false, 
            trim: true 
        },
        vehicleNumberPlate: { 
            type: String, 
            required: false, 
            trim: true 
        }
    },
    token: {
        type: String
    }
});


driverSchema.methods.toJSON = function () {
    const driver = this;
    const driverObj = driver.toObject();
    delete driverObj.password;
    return driverObj;
};


driverSchema.methods.genAuthToken = async function () {
    const driver = this;
    const token = jwt.sign({ _id: driver._id.toString() }, process.env.JWT_TOKEN, { expiresIn: "7 days" });
    driver.token = token;
    await driver.save();
    return token;
};


driverSchema.statics.findByCredentials = async (email, password) => {
    const driver = await driverModel.findOne({ email });
    if (!driver) {
        throw new Error("Email is incorrect");
    }
    const isMatched = await bcrypt.compare(password, driver.password);
    if (!isMatched) {
        throw new Error("Password is incorrect");
    }
    return driver;
};


driverSchema.pre("save", async function (next) {
    const driver = this;
    if (driver.isModified("password")) {
        driver.password = await bcrypt.hash(driver.password, 10);
    }
    next();
});

const driverModel = mongoose.model("Drivers", driverSchema);

module.exports = driverModel;
