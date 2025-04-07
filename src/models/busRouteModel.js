const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
    stopId: { type: String, },
    coordinates: {
        lat: { type: Number, },
        lng: { type: Number, }
    },
    address: { type: String, },
    sequence: { type: Number, }
});

const routeSchema = new mongoose.Schema({
    routeId: { type: String, unique: true },
    origin: {
        coordinates: {
            lat: { type: Number, },
            lng: { type: Number, }
        },
        address: { type: String, }
    },
    destination: {
        coordinates: {
            lat: { type: Number, },
            lng: { type: Number, }
        },
        address: { type: String, } 
    },
    stops: [stopSchema],
    bus: {
        busId: { type: String, },
        regNumber: { type: String, } 
    },
    driver: {
        driverId: { type: String, },
        name: { type: String, } 
    },
    pickupTime: { type: String, required: false },
    dropTime: { type: String, },
    createdAt: { type: Date, default: Date.now }
});

const Route = mongoose.model('Route', routeSchema);

module.exports = Route;