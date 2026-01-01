const http = require("http")
const express = require("express")
const path = require('path')
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app)
const io = new Server(server)

//socket.io
const onlineUsers = new Set();
const users = {}

io.on("connection", (socket) => {

    onlineUsers.add("online");

    function findOnline(users, currentSocketId) {
        const online = [];
        for (let id in users) {
            online.push({
                socketId: id,
                username: users[id],
                isMe: id === currentSocketId
            });
        }        
        return online;
    }

    socket.on("user-nickname", (nick) => {
        const namenick = nick.replace(/\s+/g, " ");
        let samename = false
        for (const property in users) {
            if (users[property] === namenick.trim()) {
                samename = true
            }
        }
        if (samename) {
            socket.emit("error","username already exits")
        } else {
            users[socket.id] = namenick
            socket.emit("nickname",namenick)
        }
        io.emit("online-users", findOnline(users, socket.id));
    })


    socket.broadcast.emit("user-online", users[socket.id])

    socket.on("typing", (ans) => {
        socket.broadcast.emit("user-typing", users[socket.id], ans);
    })

    socket.on("user-message", (message) => {
        io.emit("message", [message, users[socket.id]])
    })


    socket.on("disconnect", () => {
        socket.broadcast.emit("user-offline", users[socket.id]);
        onlineUsers.delete("online");
        delete users[socket.id]
    });
})

app.use(express.static(path.resolve('./public')))

app.get("/", (req, res) => {
    return res.sendFile('/public/index.html')
});

server.listen(9000, () => console.log(`Server was runing at 9000`))