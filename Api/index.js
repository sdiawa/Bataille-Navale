const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require("body-parser");
const port = 8000;
const cors = require("cors");
const route = require("./router/ExpressRouter");
app.use(cors({origin:'*'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(route);


const getOpponentAndEmit =(socket)=>{
    setTimeout(()=>socket.emit("newGame","Aucun joueur trouvé"),10000);

};
io.on("connection", socket => {
    console.log("New client connected");
    socket.on("newGame",() => {console.log("jeu lancer");getOpponentAndEmit(socket)});
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

io.listen(port, function () {
    console.log("serveur ok on port "+port)
});