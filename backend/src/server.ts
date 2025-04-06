import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import dotenv from "dotenv";

console.log('hello');

dotenv.config(); 

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors:{
        origin: "*",
        methods: ["GET", "POST"]

    }
});

//handling a new socket connection
let mentorSocket: any = null;

io.on('connection', (socket) => {
  console.log('a user connected: ', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    if (io.sockets.adapter.rooms.get(roomId)?.size === 1) {
      //first user to join = Mentor
      mentorSocket = socket;
      socket.emit('role', 'mentor');
    } else {
      socket.emit('role', 'student');
    }
  });

  //handler at code update - broadcast code changes to students
  socket.on('codeUpdate', (roomId, code) => {
    socket.to(roomId).emit('codeUpdate', code);
  });

  //notify the students in the room when the mentor leave and clear students code
  socket.on('disconnect', (roomId) => {
    console.log('user disconnected:', socket.id);
    if (socket === mentorSocket) {
      io.to(roomId).emit('mentorLeft');
    }
  });
});

//TODO - delete
app.get('/', (req, res) => {
  res.send('server is running');
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

