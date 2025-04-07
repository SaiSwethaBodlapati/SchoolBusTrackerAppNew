const bcrypt = require('bcrypt');
const crypto = require("crypto");

const studentModel = require('../models/studentModel.js');
const adminModel = require('../models/adminModel.js');
const driverModel = require('../models/driverModel.js');
const busRouteModel = require('../models/busRouteModel.js');

const Mails = require('../utils/email.js');
const JWT = require('../utils/tokens.js');


const roleModels = {
    Admin: adminModel,
    Student: studentModel,
    Driver: driverModel,
    Route: busRouteModel,
};


const getRoutes = async (req, res) => {
    try {
        const routes = await busRouteModel.find();
        res.status(200).send({routes: routes});
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ message: 'Failed to fetch routes.' });
    }
};


const routeByDriverId = async (req, res) => {
    try {
       // console.log(req.params.driverId)
        const route = await busRouteModel.find({ "driver.driverId": req.params.driverId });

        if (!route) {
            return res.status(404).send({ message: 'Route not found.' });
        }

        res.status(200).send({route: route});
    } catch (error) {
        console.error('Error fetching route:', error);
        res.status(500).json({ message: 'Failed to fetch route.' });
    }
};

const getDrivers = async (req, res) => { 
    try {
        const drivers = await driverModel.find();

        return res.status(200).json({
            message: "Drivers retrieved successfully.",
            drivers,
        });
    } catch (error) {
        console.error("Error in fetching drivers:", error);
        res.status(500).json({
            error: "Failed to fetch drivers.",
        });
    }
};

const getStudents = async (req, res) => { 
    try {
        const students = await studentModel.find();

        return res.status(200).json({
            message: "Students retrieved successfully.",
            students,
        });
    } catch (error) {
        console.error("Error in fetching students :", error);
        res.status(500).json({
            error: "Failed to fetch students.",
        });
    }
};

const getAdmins = async (req,res) => {
    try{
        const admins = await adminModel.find();

        return res.status(200).json({
            message: "Admins retrieved successfully.",
            admins,
        })
    } catch (error) {
        console.error("Error in fetching admins :", error);
        res.status(500).json({
            error: "Failed to fetch admins.",
        });
    }
}

module.exports = {
    getRoutes,
    routeByDriverId,
    getDrivers,
    getStudents,
    getAdmins
}