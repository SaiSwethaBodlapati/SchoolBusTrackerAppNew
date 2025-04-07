const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminSchema = mongoose.Schema({
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
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isMobilePhone(value)) {
                throw new Error("Invalid phone number");
            }
        }
    },
    question1: {
        type: String,
        required: true,
        trim: true
    },
    question2: {
        type: String,
        required: true,
        trim: true
    },
    answer1: {
        type: String,
        required: true,
        trim: true
    },
    answer2: {
        type: String,
        required: true,
        trim: true
    },
    schoolName: {
        type: String,
        required: true,
        trim: true
    },
    schoolAddress: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    zipcode: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isPostalCode(value, "any")) {
                throw new Error("Invalid ZIP code");
            }
        }
    },
    token: {
        type: String
    }
});


adminSchema.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.answer1;
    delete userObj.answer2;
    delete userObj.question1;
    delete userObj.question2;
    return userObj;
};


adminSchema.methods.genAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_TOKEN, { expiresIn: "7 days" });
    user.token = token;
    await user.save();
    return token;
};


adminSchema.statics.findByCredentials = async (email, password) => {
    const user = await adminModel.findOne({ email });
    if (!user) {
        throw new Error("Email is incorrect");
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
        throw new Error("Password is incorrect");
    }
    return user;
};


adminSchema.statics.findByEmail = async (email) => {
    const user = await adminModel.findOne({ email });
    if (!user) {
        throw new Error("Unable to find");
    }
    return user;
};


adminSchema.statics.findUserById = async (id) => {
    const user = await adminModel.findById({ _id: id });
    if (!user) {
        throw new Error("Unable to find");
    }
    return user;
};


adminSchema.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 10);
    }

    if (user.isModified("answer1")) {
        user.answer1 = await bcrypt.hash(user.answer1, 10);
    }

    if (user.isModified("answer2")) {
        user.answer2 = await bcrypt.hash(user.answer2, 10);
    }

    next();
});


const adminModel = mongoose.model("Admins", adminSchema);

module.exports = adminModel;
