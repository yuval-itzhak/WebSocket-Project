import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import cors from 'cors';

import codeBlockRoutes from './routes/codeBlockRoutes'; 
import { setupSocket } from './socket';
import { connectDB } from './config/db';


dotenv.config(); 

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
if(!MONGO_URI) throw new Error(' MONGO_URI is not defined in .env');

const app = express();
const server = http.createServer(app);

//middlewares
app.use(cors());
app.use(express.json());

//routes
app.use('/api', codeBlockRoutes);  

//connecte to the db, setup websocket and start the server 
connectDB(MONGO_URI).then(() => {
  setupSocket(server);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export { app, server };


