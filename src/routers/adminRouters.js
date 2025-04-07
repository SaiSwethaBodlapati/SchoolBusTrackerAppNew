const express = require('express')
const router = express.Router();
const authControllers = require('../controllers/authControllers.js');
const adminControllers = require('../controllers/adminControllers.js')



router.get('/test', (req,res) => {
    res.send("School bus tracker app project");
})
router.get('/drivers', adminControllers.getDrivers);
router.get('/students', adminControllers.getStudents);
router.get('/getRoutes', adminControllers.getRoutes);
router.get('/getRoute/:id', adminControllers.routeById);

router.post('/login', authControllers.login);
router.post('/drivers', adminControllers.addDriver);
router.post('/addRoute', adminControllers.addRoute);


router.put('/drivers/:id', adminControllers.editDriver);
router.put('/assignStudentRoute/:studentId', adminControllers.updateStudentRoute);
router.put('/assignDriverRoute/:routeId', adminControllers.updateDriverRoute);

router.delete('/drivers/:id', adminControllers.deleteDriver);

module.exports = router;