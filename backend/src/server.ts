import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import dotenv from "dotenv";
import cors from 'cors';
import codeBlockRoutes from './routes/codeBlockRoutes'; 
import CodeBlock from './models/CodeBlock'


dotenv.config(); 

const mongoURI = process.env.MONGO_URI;
if(!mongoURI){ throw new Error(' MONGO_URI is not defined in .env');};
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
io.on('connection', (socket) => {
  console.log('a user connected: ', socket.id);

  //handle user joining a room (mentor or student)
  socket.on('joinRoom', async (roomId : string) => {
    console.log(`joinRoom trigerred`);
    socket.join(roomId);

    const room = await CodeBlock.findById(roomId);

    const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 1;
    console.log(`room size :`, roomSize);
    io.to(roomId).emit('studentCount', roomSize - 1 );
    io.to(roomId).emit('solution', room?.solution );
    
    (socket as any).roomId = roomId;


    // socket.emit('codeUpdate', room?.currentCode);

    if (room?.currentCode === ""){
      socket.emit('codeUpdate', room?.initialCode);
    }
    else{
      socket.emit('codeUpdate', room?.currentCode);
    }
    if (roomSize === 1) {
      //first user to join = Mentor
      socket.emit('role', 'mentor');
      (socket as any).role = 'mentor';


    } else {
      socket.emit('role', 'student');
      (socket as any).role = 'student';
    }


  });

  //handle at code updates - broadcast code changes to students
  socket.on('codeUpdate', async (roomId, code) => {
    const result = await CodeBlock.updateOne(
      { _id: roomId },                  
      { $set: { currentCode: code } } 
    );
      socket.to(roomId).emit('codeUpdate', code);
  });

  //handle user disconnecting
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);

    const roomId = (socket as any).roomId;
    const role = (socket as any).role;

    if (role === 'mentor' && roomId) {

      //notify the students in the room that mentor left and resat code
      io.to(roomId).emit('mentorLeft');
      const resatRoom = await CodeBlock.updateOne(
        { _id: roomId },                  
        { $set: { currentCode: "" } } );

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
      const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 1;
      io.to(roomId).emit('studentCount', roomSize - 1 );
      socket.leave(roomId);

    }
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

