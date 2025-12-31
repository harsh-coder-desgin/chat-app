const http = require("http")
const express = require("express")
const path = require('path')
const { Server } = require("socket.io")

const app = express();
const server = http.createServer(app)
const io = new Server(server)

//socket.io
const onlineUsers = new Set();

io.on("connection",(socket)=>{
    
    onlineUsers.add("online");
    
    socket.broadcast.emit("user-online","online")

    socket.on("user-message",(message)=>{
        io.emit("message",message)
    })

    socket.on("user-nickname",(nick)=>{
        socket.emit("nickname",nick)
    })

    socket.emit("online-users", Array.from(onlineUsers));

    socket.on("disconnect", () => {
        onlineUsers.delete("online");
        socket.broadcast.emit("user-offline", "offline");
    });
})

app.use(express.static(path.resolve('./public')))

app.get("/",(req,res)=>{
    return res.sendFile('/public/index.html')
});

server.listen(9000,() => console.log(`Server was runing at 9000`))