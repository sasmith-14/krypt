require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const { createServer } = require("http");
const { Server } = require("socket.io");

connectDB();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

io.on("connection", (socket) => {
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`user joined room ${roomId}`);
    });

    socket.on('sendMessage', (data) => {
        io.to(data.roomId).emit('receiveMessage', data);
    });
});

httpServer.listen(3000, () => {
    console.log("server is running on port number 3000");
});