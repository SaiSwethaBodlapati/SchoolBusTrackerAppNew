const express = require('express')
const router = express.Router();
const authControllers = require('../controllers/authControllers.js')

router.get('/test', (req,res) => {
    res.send("School bus tracker app project");
})

router.post('/login', authControllers.login);
router.post('/register/:role', authControllers.register);
router.post('/sendOTP', authControllers.sendOTP);
router.post('/validateOTP', authControllers.validateOTP);

router.put('/resetPassword', authControllers.resetPassword);

module.exports = router;