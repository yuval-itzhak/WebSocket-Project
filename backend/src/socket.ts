import { Server } from "socket.io";
import http from "http";
import handleSocketConnection from "./sockets/socketHandlers";

export const setupSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  //handle a new socket connection
  io.on("connection", socket => handleSocketConnection(io, socket));
};


