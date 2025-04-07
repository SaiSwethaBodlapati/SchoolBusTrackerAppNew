const express = require('express')
const router = express.Router();
const authControllers = require('../controllers/authControllers.js');
const adminControllers = require('../controllers/adminControllers.js');
const driverControllers = require('../controllers/driverControllers.js');



router.get('/test', (req,res) => {
    res.send("School bus tracker app project");
})
;
router.get('/getRoutes', driverControllers.getRoutes);
router.get('/getRoute/:driverId', driverControllers.routeByDriverId);
router.get('/admins', driverControllers.getAdmins);
router.get('/students', adminControllers.getStudents);


module.exports = router;