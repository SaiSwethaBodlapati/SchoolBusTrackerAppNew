const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        senderId: { type: String, required: true },
        recipientId: { type: String, required: true },
        recipientRole: { type: String, enum: ["driver", "student", "admin"], required: true },
        message: { type: String, required: true, trim: true }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
