const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  busStop: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['boarded', 'missed'],
    required: true
  },
  time: {
    type: String
  }
}, { _id: false });

const attendanceByRouteSchema = new mongoose.Schema({
  routeId: {
    type: String,
    required: true
  },
  busId: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  records: [attendanceRecordSchema]
}, {
  collection: 'route_attendance',
  timestamps: true
});

module.exports = mongoose.model('RouteAttendance', attendanceByRouteSchema);
