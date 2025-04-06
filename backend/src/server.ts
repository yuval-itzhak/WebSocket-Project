import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';

console.log('hello');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors:{
        origin: "*",
        methods: ["GET", "POST"]

    }
});

