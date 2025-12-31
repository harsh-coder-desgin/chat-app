const http = require("http")
const express = require("express")
const path = require('path')
const { Server } = require("socket.io");
const { log } = require("console");

const app = express();
const server = http.createServer(app)
const io = new Server(server)

//socket.io
const onlineUsers = new Set();
const users ={}

io.on("connection",(socket)=>{
    console.log(socket.id);    
    onlineUsers.add("online");
    
    socket.broadcast.emit("user-online",users[socket.id])

    socket.on("user-nickname",(nick)=>{
        socket.emit("nickname",nick)
        users[socket.id] = nick
        console.log(users);
        
    })
    
    socket.on("user-message",(message)=>{
        io.emit("message",[message, users[socket.id]])
    })

    socket.emit("online-users", Array.from(onlineUsers));

    socket.on("disconnect", () => {
        socket.broadcast.emit("user-offline", users[socket.id]);
        onlineUsers.delete("online");
    });
})

app.use(express.static(path.resolve('./public')))

app.get("/",(req,res)=>{
    return res.sendFile('/public/index.html')
});

server.listen(9000,() => console.log(`Server was runing at 9000`))