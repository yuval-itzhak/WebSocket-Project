import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import dotenv from "dotenv";
import cors from 'cors';
import codeBlockRoutes from './routes/codeBlockRoutes'; 

const mongoURI = "mongodb+srv://yuvalitzhak:Yuvali0031@cluster0.xmx1g.mongodb.net/webSocket?retryWrites=true&w=majority";
console.log('hello');

dotenv.config(); 

const app = express();
app.use(cors());
app.use(express.json());

//routes
app.use('/api', codeBlockRoutes);  



//mongoDB connection
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error: ', err));


const server = http.createServer(app);
const io = new Server(server, {
    cors:{
        origin: "*",
        methods: ["GET", "POST"]

    }
});


//handle a new socket connection
//let mentorSocket: any = null;

io.on('connection', (socket) => {
  console.log('a user connected: ', socket.id);

  //handle user joining a room (mentor or student)
  socket.on('joinRoom', (roomId : string) => {
    socket.join(roomId);
    (socket as any).roomId = roomId;

    const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    io.to(roomId).emit('studentCount', roomSize - 1);

    if (roomSize === 1) {
      //first user to join = Mentor
      //mentorSocket = socket; 
      socket.emit('role', 'mentor');
      (socket as any).role = 'mentor';

    } else {
      socket.emit('role', 'student');
      (socket as any).role = 'student';
    }
  });

  //handle at code updates - broadcast code changes to students
  socket.on('codeUpdate', (roomId, code) => {
    socket.to(roomId).emit('codeUpdate', code);
  });

  //handle user disconnecting
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    const roomId = (socket as any).roomId;
    const role = (socket as any).role;

    if (role === 'mentor' && roomId) {
      //notify the students in the room that mentor left
      io.to(roomId).emit('mentorLeft');

      //disconnect all students and mentor from the room
      const clients = io.sockets.adapter.rooms.get(roomId);
      if (clients) {
        clients.forEach((clientId) => {
          const clientSocket = io.sockets.sockets.get(clientId);
          clientSocket?.leave(roomId);
        });
      }

      console.log(`Mentor left. Room "${roomId}" cleared.`);
    }
    else if(role === 'student' && roomId){
      socket.leave(roomId);

    }
  });
});

//TODO - delete
app.get('/', (req, res) => {
  res.send('server is running');
});


//TODO - check whay .env file does not used
const PORT = process.env.PORT || 5003;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

