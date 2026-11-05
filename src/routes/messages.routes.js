const express = require("express");
const authMiddleware = require('../middleware/auth.middleware.js');
const Message = require('../models/message.model.js');

const router = express.Router();

router.post('/send', authMiddleware, async (req, res) => {

    try {
        const sender = req.user.id;
        const { receiver, message } = req.body;

        if (!receiver || !message) {
            return res.status(400).json({
                message: "All fields are required",
            })
        }

        const newMessage = await Message.create({
            sender,
            receiver,
            text: message
        })

        return res.status(201).json({
            message: "Message sent successfully",
            newMessage
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        })
    }

})

router.get('/:userId', authMiddleware, async (req, res) => {
    try {
        const myId = req.user.id;
        const otherUserId = req.params.userId;
        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: otherUserId },
                { sender: otherUserId, receiver: myId }
            ]
        })
        return res.status(200).json({ messages })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
        })
    }
})

module.exports = router;




