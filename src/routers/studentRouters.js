const express = require('express')
const router = express.Router();
const authControllers = require('../controllers/authControllers.js');
const adminControllers = require('../controllers/adminControllers.js');
const driverControllers = require('../controllers/driverControllers.js');
const studentControllers = require('../controllers/studentControllers.js');



router.get('/test', (req,res) => {
    res.send("School bus tracker app project");
})
;
router.get('/getRoutes', driverControllers.getRoutes);
router.get('/getRoute/:driverId', driverControllers.routeByDriverId);
router.get('/admins', driverControllers.getAdmins);
router.get('/students', adminControllers.getStudents);
router.get('/drivers', adminControllers.getDrivers);
router.get('/profile', studentControllers.fetchProfie);
router.get('/getStudentRoute/:username', studentControllers.studentRoute);
router.get('/assigned-driver', studentControllers.getAssignedDriverByRoute);
router.get('/route-id', studentControllers.getStudentRouteId);

router.put('/update-profile', studentControllers.updateProfile);


module.exports = router;