const express = require('express');
const app = express();
const auth = require('./routes/auth');
const messages = require('./routes/messages.routes');
const limiter = require('./middleware/rateLimiter');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:5173',
}));

app.use(express.json());
app.use(mongoSanitize());
app.use(xssClean());
app.use('/api/auth', limiter);
app.use('/api/auth', auth);
app.use('/api/messages', messages);

module.exports = app;
