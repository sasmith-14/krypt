# Krypt

> A secure real-time messaging web application built with Node.js, Express, and MongoDB.

---

## About

Krypt is a full-stack messaging app built to apply backend development and cybersecurity concepts in a real project. Rather than following a typical tutorial, I focused on implementing genuine security features from scratch — rate limiting, input sanitisation, JWT authentication, and password hashing — while learning Node.js alongside building it.

I was also going through TryHackMe's Cybersecurity 101 course during development, which gave me the context to understand *why* each security measure matters, not just how to add it.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Authentication | JWT + bcrypt |
| Security | express-rate-limit, express-mongo-sanitize, xss-clean, CORS |

---

## Features

- User registration and login with hashed passwords
- JWT based authentication with protected routes
- Real-time messaging using WebSockets via Socket.io
- Rate limiting on auth routes to prevent brute force attacks
- NoSQL injection protection on all incoming requests
- XSS sanitisation on all request body fields
- CORS configured for frontend origin

---

## Security Decisions

| Threat | Implementation |
|--------|---------------|
| Brute force on login | Rate limiting — 10 requests per 15 minutes per IP |
| Plain text password storage | bcrypt hashing with 10 salt rounds |
| NoSQL injection | express-mongo-sanitize strips `$` operators from req.body |
| XSS via chat input | xss-clean sanitises all incoming request fields |
| Unauthorised route access | JWT middleware on all message routes |

---

## Project Structure

```
krypt/
├── src/
│   ├── db/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── user.model.js
│   │   └── message.model.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── message.routes.js
│   └── app.js
├── server.js
├── .env.example
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account

### Installation

```bash
git clone https://github.com/sasmith-14/krypt
cd krypt
npm install
```

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
```

Start the development server:

```bash
npm run dev
```

Server runs on `http://localhost:3000`

The React client in `client/` is a work in progress and does not build yet.

---

## API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Messages

| Method | Endpoint | Description | Auth required |
|--------|----------|-------------|---------------|
| POST | `/api/messages/send` | Send a message | Yes |
| GET | `/api/messages/:userId` | Fetch conversation with a user | Yes |

All protected routes require the following header:

```
Authorization: Bearer <token>
```

---

## Status

- [x] Backend complete
- [ ] Frontend in progress

---

## License

[MIT](LICENSE) © 2026 Sasmith A Suvarna

---

> Built while learning — every security feature was understood before it was implemented.
