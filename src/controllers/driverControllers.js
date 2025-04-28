const bcrypt = require('bcrypt');
const crypto = require("crypto");

const studentModel = require('../models/studentModel.js');
const adminModel = require('../models/adminModel.js');
const driverModel = require('../models/driverModel.js');
const busRouteModel = require('../models/busRouteModel.js');
const RouteAttendance = require('../models/attendanceModel.js');

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


const addOrUpdateAttendance = async (req, res) => {
    try {
        const {
          routeId,
          busId,
          studentId,
          busStop,
          status
        } = req.body;
    
        if (!routeId || !busId || !studentId || !busStop || !status) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
    
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0].slice(0, 5);
    
        const filter = { routeId, busId, date };
    
        await RouteAttendance.updateOne(filter, {
          $pull: { records: { studentId } }
        });
    
        const pushUpdate = {
          $push: {
            records: {
              studentId,
              busStop,
              status,
              time
            }
          }
        };
    
        await RouteAttendance.updateOne(filter, pushUpdate, { upsert: true });
    
        res.status(200).json({
          message: 'Attendance recorded successfully',
          data: { routeId, busId, date, studentId, busStop, status, time }
        });
      } catch (error) {
        console.error('Error recording attendance:', error);
        res.status(500).json({ error: 'Failed to record attendance' });
      }
};

const addOrUpdateBulkAttendance = async (req, res) => {
    try {
      const records = req.body.records;
      console.log(records)
      if (!records || !Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ message: 'No attendance records provided' });
      }
  
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toTimeString().split(' ')[0].slice(0, 5);
  
      for (const record of records) {
        const { routeId, busId, studentId, busStop, status } = record;
  
        if (!routeId || !busId || !studentId || !busStop || !status) continue;
  
        const filter = { routeId, busId, date };
  
        await RouteAttendance.updateOne(filter, {
          $pull: { records: { studentId } }
        });
  
        const pushUpdate = {
          $push: {
            records: {
              studentId,
              busStop,
              status,
              time
            }
          }
        };
  
        await RouteAttendance.updateOne(filter, pushUpdate, { upsert: true });
      }
  
      res.status(200).json({ message: 'Bulk attendance recorded successfully' });
    } catch (error) {
      console.error('Error in bulk attendance:', error);
      res.status(500).json({ error: 'Failed to record bulk attendance' });
    }
};
  

const getAttendanceByRouteAndDate = async (req, res) => {
    const { routeId, date } = req.query;
  
    try {
      const attendance = await RouteAttendance.findOne({ routeId, date });
  
      if (!attendance) {
        return res.status(404).json({ message: 'No attendance found for this route and date.' });
      }
  
      res.json(attendance);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};


const getAttendanceByBusId = async (req, res) => {
    const { busId } = req.params;
  
    try {
      const attendance = await RouteAttendance.find({ busId });
  
      res.json(attendance);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const getAttendanceByStudentId = async (req, res) => {
    const { studentId } = req.params;
  
    try {
      const allRecords = await RouteAttendance.find({
        'records.studentId': studentId
      });

      const matched = allRecords.map(doc => {
        const studentRecords = doc.records.filter(r => r.studentId === studentId);
        return {
          routeId: doc.routeId,
          busId: doc.busId,
          date: doc.date,
          records: studentRecords
        };
      });
  
      res.json(matched);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};
  

const getAttendanceByDate = async (req, res) => {
    const { date } = req.query;
  
    try {
      const attendance = await RouteAttendance.find({ date });
  
      res.json(attendance);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};
  


module.exports = {
    getRoutes,
    routeByDriverId,
    getDrivers,
    getStudents,
    getAdmins,
    addOrUpdateAttendance,
    getAttendanceByRouteAndDate,
    getAttendanceByBusId,
    getAttendanceByStudentId,
    getAttendanceByDate,
    addOrUpdateBulkAttendance
}