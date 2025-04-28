const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const port = process.env.PORT || 8080;
const DirectoryPath = path.join(__dirname, './public');
const authRouter = require('./src/routers/authRouters.js');
const adminRouter = require('./src/routers/adminRouters.js');
const driverRouter = require('./src/routers/driverRouters.js');
const studentRouter = require('./src/routers/studentRouters.js');
const Message = require("./src/models/messageModel.js"); 
const connect = require("./src/db/connectDB.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const userSocketMap = {};
const routeSubscribers = {};

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/", express.static(path.join(__dirname, "./public")));
app.use("/driver", express.static(path.join(__dirname, "./driver")));
app.use("/admin", express.static(path.join(__dirname, "./admin")));

app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/driver', driverRouter);
app.use('/student', studentRouter);


io.on("connection", (socket) => {
    const { id, role } = socket.handshake.auth;

    if (id && role) {
        if (!userSocketMap[role]) {
            userSocketMap[role] = {};
        }
        userSocketMap[role][id] = socket.id;
        console.log(`User connected with ID: ${id}, Role: ${role}, Socket ID: ${socket.id}`);
    } else {
        console.log("Connection attempt without valid ID or Role.");
        socket.disconnect();
        return;
    }

    socket.emit("welcome", { msg: `Welcome ${role} with ID: ${id}` });

    socket.on("disconnect", () => {
        if (id && role && userSocketMap[role]) {
            delete userSocketMap[role][id];
            console.log(`User disconnected with ID: ${id}, Role: ${role}`);
        }
    });

    
    socket.on("sendMessage", async ({ senderId, recipientId, recipientRole, message }) => {
        try {
            const newMessage = new Message({ senderId, recipientId, recipientRole, message,});
            await newMessage.save();
            console.log(userSocketMap)
            console.log(`Message saved: ${senderId} → ${recipientId}`);

            if (userSocketMap[recipientRole] && userSocketMap[recipientRole][recipientId]) {
                const recipientSocketId = userSocketMap[recipientRole][recipientId];
                io.to(recipientSocketId).emit("receiveMessage", { from: senderId, message });
                console.log(`Message sent to ${recipientId} (${recipientRole})`);
            } else {
                console.log(`Recipient ${recipientId} (${recipientRole}) is not connected.`);
            }
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });


    socket.on("fetchMessages", async ({ senderId, recipientId }, callback) => {
        try {
            const messages = await Message.find({
                $or: [
                    { senderId, recipientId },
                    { senderId: recipientId, recipientId: senderId },
                ],
            }).sort({ createdAt: 1 });

            callback(messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
            callback([]);
        }
    });

    socket.on("broadcastToRole", ({ targetRole, message }) => {
        if (userSocketMap[targetRole]) {
            Object.values(userSocketMap[targetRole]).forEach((socketId) => {
                io.to(socketId).emit("broadcastMessage", { from: id, message });
            });
            console.log(`Broadcast message sent to all users with Role: ${targetRole}`);
        } else {
            console.log(`No users connected with Role: ${targetRole}`);
        }
    });

    socket.on("subscribeToRoute", ({ routeId }) => {
        if (!routeSubscribers[routeId]) {
            routeSubscribers[routeId] = new Set();
        }
        routeSubscribers[routeId].add(socket.id);
        console.log(`Socket ${socket.id} subscribed to route ${routeId}`);
    });
    
    socket.on("unsubscribeFromRoute", ({ routeId }) => {
        if (routeSubscribers[routeId]) {
            routeSubscribers[routeId].delete(socket.id);
            console.log(`Socket ${socket.id} unsubscribed from route ${routeId}`);
        }
    });
    
    socket.on("busLocationUpdate", ({ routeId, lat, lng }) => {
        const update = { lat, lng, timestamp: new Date() };
       // console.log(`Bus location update for Route ${routeId}:`, update);
    
        if (routeSubscribers[routeId]) {
            for (const socketId of routeSubscribers[routeId]) {
                io.to(socketId).emit("busLocation", update);
            }
        }
    });

    socket.on("busStopUpdate", ({ routeId, lat, lng, stopId, nextStopId }) => {
        const update = { lat, lng, stopId, nextStopId, timestamp: new Date() };
        console.log(`Bus stop update for Route ${routeId}:`, update);
    
        if (routeSubscribers[routeId]) {
            for (const socketId of routeSubscribers[routeId]) {
                io.to(socketId).emit("busStopLocation", update);
            }
        }
    });

    socket.on("destinationUpdate", ({ routeId }) => {
        const update = { timestamp: new Date() };
        if (routeSubscribers[routeId]) {
            for (const socketId of routeSubscribers[routeId]) {
                io.to(socketId).emit("reachedDestination", update);
            }
        }
    })
    

});

connect().then(() => {
    try {
        server.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });
    } catch (err) {
        console.log("Unable to connect to the database due to: ", err);
    }
});
