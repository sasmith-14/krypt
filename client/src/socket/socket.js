import { io } from 'socket.io-client';

// Single shared socket instance for the entire app
const socket = io('http://localhost:3000', {
  autoConnect: false,  // connect manually after auth
});

export default socket;
