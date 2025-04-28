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

const otpStore = new Map();

const addDriver = async (req, res) => {
    try {

        const { firstName, lastName, username } = req.body;
        const year = new Date().getFullYear();
        const password = `${firstName}${year}`;

        const user = new driverModel({ 
            ...req.body, 
            password
        });

        await user.save();

        res.status(200).json({ 
            message: "Driver registered successfully!", 
            driver: user 
        });

        Mails.sendDriverWelcomeEmail(username, firstName, password);

    } catch (error) {
        console.error("Error in creating driver account:", error);
        res.status(500).json({
            error: "Failed to create driver account.",
        });
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


const editDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email } = req.body;

        const updatedDriver = await Driver.findByIdAndUpdate(
            id,
            { firstName, lastName, email },
            { new: true, runValidators: true }
        );

        if (!updatedDriver) {
            return res.status(404).json({ error: "Driver not found." });
        }

        res.status(200).json({
            message: "Driver updated successfully.",
            driver: updatedDriver,
        });
    } catch (error) {
        console.error("Error in editing driver:", error);
        res.status(500).json({
            error: "Failed to edit driver.",
        });
    }
};


const deleteDriver = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedDriver = await driverModel.findByIdAndDelete(id);

        if (!deletedDriver) {
            return res.status(404).json({ error: "Driver not found." });
        }

        res.status(200).json({
            message: "Driver deleted successfully.",
            driver: deletedDriver,
        });
    } catch (error) {
        console.error("Error in deleting driver:", error);
        res.status(500).json({
            error: "Failed to delete driver.",
        });
    }
};

const addRoute = async (req, res) => {
    try {
        const routeData = req.body;
        const newRoute = new busRouteModel(routeData);
        await newRoute.save();
        res.status(201).send({newRoute});
    } catch (error) {
        console.error('Error saving route:', error);
        res.status(500).json({ message: 'Failed to save route.' });
    }
};

const updateRoute = async (req, res) => {
    const { routeId } = req.params;
    const updatedData = req.body;

    try {
        const updatedRoute = await busRouteModel.findOneAndUpdate(
            { routeId: routeId },
            updatedData,
            { new: true }
        );

        if (!updatedRoute) {
            return res.status(404).json({ message: 'Route not found.' });
        }

        res.status(200).json({ updatedRoute });
    } catch (error) {
        console.error('Error updating route:', error);
        res.status(500).json({ message: 'Failed to update route.' });
    }
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


const routeById = async (req, res) => {
    try {
        const route = await busRouteModel.findOne({ routeId: req.params.routeId });
        if (!route) {
            return res.status(404).send({ message: 'Route not found.' });
        }
        res.status(200).send({route: route});
    } catch (error) {
        console.error('Error fetching route:', error);
        res.status(500).json({ message: 'Failed to fetch route.' });
    }
};

const deleteRoute = async (req, res) => {
    try {
        const { routeId } = req.params;

        const deletedRoute = await busRouteModel.findOneAndDelete({ routeId: routeId });

        if (!deletedRoute) {
            return res.status(404).send({ message: 'Route not found.' });
        }

        res.status(200).send({ message: 'Route deleted successfully.', route: deletedRoute });
    } catch (error) {
        console.error('Error deleting route:', error);
        res.status(500).json({ message: 'Failed to delete route.' });
    }
};


const updateStudentRoute = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { routeId, stopId } = req.body;
        
        if (!routeId || !stopId) {
            return res.status(400).json({ message: 'Both routeId and stopId are required' });
        }

        const updatedStudent = await studentModel.findOneAndUpdate(
            { studentId: studentId },
            { 
                routeId: routeId,
                busStop: stopId 
            },
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ 
            message: 'Route and stop assigned successfully', 
            student: updatedStudent 
        });
    } catch (error) {
        console.error('Error assigning route and stop:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

  
const updateDriverRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        const { driverId, driverName } = req.body;

        const updatedRoute = await busRouteModel.findOneAndUpdate(
            { routeId: routeId },
            { 
                driver: {
                    driverId: driverId,
                    name: driverName
                }
            },
            { 
                new: true,
                runValidators: true
            }
        );

        if (!updatedRoute) {
            return res.status(404).json({ message: 'Route not found' });
        }

        res.status(200).json({ 
            message: 'Driver assigned to route successfully', 
            route: updatedRoute 
        });
    } catch (error) {
        console.error('Error assigning driver to route:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message
        });
    }
};

const deleteDriverRoute = async (req, res) => {
    try {
        const { routeId } = req.params;

        const updatedRoute = await busRouteModel.findOneAndUpdate(
            { routeId: routeId },
            { 
                $unset: { 
                    driver: 1 
                }
            },
            { 
                new: true,
                runValidators: true
            }
        );

        if (!updatedRoute) {
            return res.status(404).json({ message: 'Route not found' });
        }

        res.status(200).json({ 
            message: 'Driver removed from route successfully', 
            route: updatedRoute 
        });
    } catch (error) {
        console.error('Error removing driver from route:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message
        });
    }
};

const deleteRouteStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const updatedStudent = await studentModel.findOneAndUpdate(
            { studentId: studentId },
            { 
                $unset: { 
                    routeId: "", 
                    busStop: "" 
                }
            },
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ 
            message: 'Route and stop assignment removed successfully', 
            student: updatedStudent 
        });
    } catch (error) {
        console.error('Error removing route and stop assignment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = {
    addDriver,
    getDrivers,
    getStudents,
    editDriver,
    deleteDriver,
    addRoute,
    updateRoute,
    getRoutes,
    routeById,
    updateStudentRoute,
    updateDriverRoute,
    deleteDriverRoute,
    deleteRouteStudent,
    deleteRoute
}