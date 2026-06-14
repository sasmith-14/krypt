const express = require('express');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            })
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username: username,
            email: email,
            password: hashedPassword,
        });
        res.status(201).json({
            message: "User created successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong"
        })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            })
        }
        const currentUser = await User.findOne({ email });
        if (!currentUser) {
            return res.status(401).json({
                message: "User not found",
            });
        }
        const isMatch = await bcrypt.compare(password, currentUser.password);
        if (isMatch) {
            const token = jwt.sign(
                { id: currentUser._id },
                process.env.JWT_SECRET,
            )
            return res.status(200).json({ 
                token,
                userId: currentUser._id,
                username: currentUser.username
            })
        }
        else {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong",
        })
    }
})

router.get('/users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } }).select('_id username');
        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong' });
    }
});

module.exports = router;