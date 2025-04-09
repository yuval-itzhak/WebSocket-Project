import { Server, Socket } from "socket.io";
import CodeBlock from "../models/CodeBlock";
import { evaluateCode } from "../utils/evaluateCode";

const handleSocketConnection = (io: Server, socket: Socket) => {
  console.log('a user connected:', socket.id);

  //handle user joining a room (mentor or student)
  socket.on('joinRoom', async (roomId : string) => {
    console.log(`joinRoom trigerred`);
    socket.join(roomId);

    //checking how many student there are in the room
    const room = await CodeBlock.findById(roomId);
    const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 1;

    console.log(`room size :`, roomSize);
    io.to(roomId).emit('studentCount', roomSize - 1 );
    io.to(roomId).emit('solution', room?.solution );
    
    (socket as any).roomId = roomId;

    //initialize the code for a new student that enter a room
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

    const room = await CodeBlock.findById(roomId);
    if (!room) {
        return;
    }

    //check if the student solution is correct by evaluateCode
    const { functionParameters, expectedOutput } = room;
    const result = await evaluateCode(code, functionParameters, room.functionName);
    const isCorrect = result === expectedOutput;

    io.to(roomId).emit('solutionCheckResult', isCorrect);
    await CodeBlock.updateOne(
        { _id: roomId },                  
        { $set: { currentCode: code } } );
        
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
      await CodeBlock.updateOne(
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

    //a student left but the mentor remain
    } else if(role === 'student' && roomId){
      const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 1;
      io.to(roomId).emit('studentCount', roomSize - 1 );
      socket.leave(roomId);
    }

  });

};

export default handleSocketConnection;