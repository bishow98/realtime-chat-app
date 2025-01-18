import {Server } from "socket.io"
import http from "http";
import express from "express";


const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin: ["http://localhost:5173"]
    }
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

//used to store online users in server [ko ko online xa teslai rakhxa yesle chai ]
const userSocketMap = {}; //{userId : socketId} yo format ma store garinxa 


io.on("connection",(socket)=>{
    console.log("A user connected",socket.id);
    const userId = socket.handshake.query.userId;

    if(userId) userSocketMap[userId] = socket.id;

    //io.emit() is used to send events to all the connected clients. broadcast garxa ko ko user online xa vanera sabai jana aru online user lai 
    io.emit("getOnlineUsers",Object.keys(userSocketMap)) ;// io.emit("getOnlineUsers",) chai j ho tei nai huparxa frontend ma pani 

    socket.on("disconnect",()=>{
        console.log("A user disconnected",socket.id);
        delete userSocketMap[userId];

        io.emit("getOnlineUsers",Object.keys(userSocketMap));

    })
})



export {io, app, server};