const express = require('express')
const router = express.Router();
const authControllers = require('../controllers/authControllers.js');
const adminControllers = require('../controllers/adminControllers.js');
const driverControllers = require('../controllers/driverControllers.js');



router.get('/test', (req,res) => {
    res.send("School bus tracker app project");
})

router.get('/getRoutes', driverControllers.getRoutes);
router.get('/getRoute/:driverId', driverControllers.routeByDriverId);
router.get('/admins', driverControllers.getAdmins);
router.get('/students', adminControllers.getStudents);
router.get('/route', driverControllers.getAttendanceByRouteAndDate);
router.get('/student/:studentId', driverControllers.getAttendanceByStudentId);
router.get('/attendance/date', driverControllers.getAttendanceByDate);

router.get('/bus/:busId', driverControllers.getAttendanceByBusId);  // By busId

router.get('/student/:studentId', driverControllers.getAttendanceByStudentId);  // By studentId

router.get('/date', driverControllers.getAttendanceByDate);  // All records on a specific date

router.post('/record', driverControllers.addOrUpdateAttendance);  // Add attendance
router.post('/bulk', driverControllers.addOrUpdateBulkAttendance); // bulk attendance

module.exports = router;