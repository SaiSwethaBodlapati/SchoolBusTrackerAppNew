const bcrypt = require('bcrypt');
const crypto = require("crypto");

const studentModel = require('../models/studentModel.js');
const adminModel = require('../models/adminModel.js');
const driverModel = require('../models/driverModel.js');

const Mails = require('../utils/email.js');
const JWT = require('../utils/tokens.js');


const roleModels = {
    Admin: adminModel,
    Student: studentModel,
    Driver: driverModel
};

const otpStore = new Map();

const register = async (req, res) => {
    try {
        const { role } = req.params;
        const Model = roleModels[role];

        if (!Model) {
            return res.status(400).json({ error: "Invalid role provided." });
        }

        const user = new Model({ ...req.body });

        await user.save();
        res.status(200).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            error: "Failed to register user. Please check your input and try again.",
        });
    }
};

const login = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Username, password, and role are required.' });
    }

    const Model = roleModels[role];

    if (!Model) {
        return res.status(400).json({ error: 'Invalid role provided.' });
    }

    try {

        const user = await Model.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        await user.genAuthToken();

        res.status(200).json({
            message: 'Login successful!',
            user: user.toJSON()
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
};

const sendOTP = async (req, res) => {
    try {

        const { email, role } = req.body;
        const Model = roleModels[role];

        console.log("email ",email)

        if (!Model) {
            return res.status(400).json({ error: "Invalid role provided." });
        }

        if (email.length < 1) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await Model.findOne({ username : email });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const otp = crypto.randomInt(1000, 9999);

        const expirationTime = Date.now() + 5 * 60 * 1000; 
        otpStore.set(email, { otp, expirationTime });
        console.log(email, otp);
        await Mails.sendOtpEmail(email, otp);

        console.log("OTP sent successfully : ", email);

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error while sending OTP:", error);
        return res.status(500).json({ message: "Failed to send OTP", error: error.message });
    }
};

const validateOTP = (req, res) => {
    try {
        const { email, otp, role } = req.body;
        const Model = roleModels[role];

        if (!Model) {
            return res.status(400).json({ error: "Invalid role provided." });
        }

        if (!otpStore.has(email)) {
            return res.status(400).json({ message: "Email Id not found or no OTP generated" });
        }

        const { otp: storedOtp, expirationTime } = otpStore.get(email);

        if (Date.now() > expirationTime) {
            return res.status(400).json({ message: "OTP has expired" });
        }
        if (parseInt(otp) === storedOtp) {
            otpStore.delete(email);
            return res.status(200).json({ message: "OTP validated successfully" });
        } else {
            return res.status(400).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        console.error("Error during OTP validation:", error);
        return res.status(500).json({ message: "Failed to validate OTP", error: error.message });
    }
};

const resetPassword =  async (req, res) => {
    const { username, newPassword, role } = req.body;
    const Model = roleModels[role];

    if (!Model) {
        return res.status(400).json({ error: "Invalid role provided." });
    }

    if (!username || !newPassword) {
        return res.status(400).json({ error: 'Username and new password are required.' });
    }

    try {
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const user = await Model.findOneAndUpdate(
            { username: username },
            { password: hashedPassword },
            { new: true } 
        );

        if (user) {
            res.status(200).json({ message: 'Password updated successfully!' });
        } else {
            res.status(404).json({ error: 'User not found.' });
        }
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'An error occurred while updating the password.' });
    }
};


module.exports = {
    register,
    login,
    resetPassword,
    sendOTP,
    validateOTP
}