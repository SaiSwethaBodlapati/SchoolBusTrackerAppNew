const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv').config();

const studentSchema = new mongoose.Schema({
    firstName: { 
        type: String,
        trim: true,
        required: true 
    },
    lastName: {
        type: String, 
        trim: true, 
        required: true 
    },
    class: { 
        type: String, 
        trim: true, 
        required: true 
    },
    busStop: { 
        type: String, 
        trim: true 
    },
    studentId: { 
        type: String, 
        unique: true, 
        trim: true, 
        required: true 
    },
    busPassId: { 
        type: String, 
        unique: true, 
        trim: true 
    },
    addressLine1: { 
        type: String, 
        trim: true 
    },
    addressLine2: { 
        type: String, 
        trim: true 
    },
    city: { 
        type: String, 
        trim: true 
    },
    zipCode: {
        type: String,
        trim: true,
        validate(value) {
        if (!validator.isPostalCode(value, "any")) {
            throw new Error("Invalid zip code");
        }
        },
    },
    fatherName: { 
        type: String, 
        trim: true 
    },
    fatherPhone: {
        type: String,
        trim: true,
        validate(value) {
        if (!validator.isMobilePhone(value)) {
            throw new Error("Invalid phone number for father");
        }
        },
    },
    motherName: { 
        type: String, 
        trim: true
    },
    motherPhone: {
        type: String,
        trim: true,
        validate(value) {
        if (!validator.isMobilePhone(value)) {
            throw new Error("Invalid phone number for mother");
        }
        },
    },
    username: { 
        type: String, 
        unique: true, 
        trim: true, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    token: {
        type: String
    },
    routeId: {
        type: String,
        required: false,
        trim: true,
    },
});

studentSchema.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
};

studentSchema.pre("save", async function (next) {
  const student = this;
  if (student.isModified("password")) {
    student.password = await bcrypt.hash(student.password, 10);
  }
  next();
});


studentSchema.methods.genAuthToken = async function () {
  const student = this;
  const token = jwt.sign({ _id: student._id.toString() }, process.env.JWT_TOKEN, {
    expiresIn: "7d",
  });
  student.token = token;
  await student.save();
  return token;
};

studentSchema.statics.findUserById = async (id) => {
    console.log("reached schema");
    const user = await studentModel.findById({_id : id});
    // console.log(user,"user")
    if(!user){
        throw new Error("unable to find");
    }
    return user
}

studentSchema.methods.comparePassword = async function (candidatePassword) {
  const student = this;
  return await bcrypt.compare(candidatePassword, student.password);
};

const studentModel = mongoose.model("Students", studentSchema);

module.exports = studentModel

