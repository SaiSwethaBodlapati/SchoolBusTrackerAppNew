const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();

if (!process.env.EMAIL_ID || !process.env.EMAIL_PASS) {
    throw new Error("Missing required environment variables: EMAIL_ID or EMAIL_PASS");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
    },
});


const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_ID,
            to,
            subject,
            html,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error(`Error while sending email to ${to}:`, error);
        throw error;
    }
};


const generatePasswordResetTemplate = (link) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Hello,</h2>
        <p>We received a request to reset the password for your account on the <strong>School Bus Tracker</strong> app. You can reset your password by clicking the button below:</p>
        <p style="text-align: center;">
            <a href="${link}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #28a745; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </p>
        <p>If you did not request this password reset, please ignore this email. The link will expire in <strong>15 minutes</strong>.</p>
        <hr style="border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #777;">If you have any questions or need further assistance, please contact our support team.</p>
        <p style="font-size: 12px; color: #777;">Thank you,<br>The School Bus Tracker Team</p>
    </div>
`;


const generateVerificationTemplate = (verificationUrl) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Welcome!</h2>
        <p>Thank you for signing up for the <strong>School Bus Tracker</strong> app. Please verify your email address by clicking the link below:</p>
        <p style="text-align: center;">
            <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify Email</a>
        </p>
        <p>If you did not sign up for this account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #777;">If you have any questions or need further assistance, please contact our support team.</p>
        <p style="font-size: 12px; color: #777;">Thank you,<br>The School Bus Tracker Team</p>
    </div>
`;


const generateOtpTemplate = (otp) => `
   <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #0056b3;">Hello,</h2>
    <p>We received a request to verify your email for the <strong>School Bus Tracker</strong> app. Please use the OTP below to complete the verification process:</p>
    <div style="text-align: center; margin: 20px 0;">
        <div style="display: inline-block; padding: 15px 25px; font-size: 32px; font-weight: bold; color: #fff; background-color: #333; border-radius: 8px; letter-spacing: 8px;">
            ${otp.toString().split('').join(' ')}
        </div>
    </div>
    <p>This OTP is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #ddd;" />
    <p style="font-size: 12px; color: #777;">If you have any questions or need further assistance, please contact our support team.</p>
    <p style="font-size: 12px; color: #777;">Thank you,<br>The School Bus Tracker Team</p>
</div>

`;

const generateDriverWelcomeTemplate = (email, firstName, password) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Welcome, ${firstName}!</h2>
        <p>Thank you for registering as a driver on the <strong>School Bus Tracker</strong> platform.</p>
        <p>Your default username is:</p>
        <p style="text-align: center; font-size: 18px; font-weight: bold; color: #333;">${email}</p>
        <p>Your default password is:</p>
        <p style="text-align: center; font-size: 18px; font-weight: bold; color: #333;">${password}</p>
        <p>We are excited to have you on board and look forward to working with you!</p>
        <hr style="border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #777;">If you have any questions or need further assistance, please contact our support team.</p>
        <p style="font-size: 12px; color: #777;">Thank you,<br>The School Bus Tracker Team</p>
    </div>
`;


const sendOtpEmail = async (email, otp) => {
    const html = generateOtpTemplate(otp);
    await sendEmail({
        to: email,
        subject: "Your OTP for School Bus Tracker",
        html,
    });
};


const sendPasswordResetLink = async (email, link) => {
    const html = generatePasswordResetTemplate(link);
    await sendEmail({
        to: email,
        subject: "Reset Your Password - School Bus Tracker",
        html,
    });
};


const sendVerificationEmail = async (email, verificationUrl) => {
    const html = generateVerificationTemplate(verificationUrl);
    await sendEmail({
        to: email,
        subject: "Verify Your Email - School Bus Tracker",
        html,
    });
};


const sendDriverWelcomeEmail = async (email, firstName, password) => {
    const html = generateDriverWelcomeTemplate(email, firstName, password);
    await sendEmail({
        to: email,
        subject: "Welcome to the School Bus Tracker Platform! Your Login Credentials Inside",
        html,
    });
};


module.exports = { sendPasswordResetLink, sendVerificationEmail, sendOtpEmail, sendDriverWelcomeEmail };
