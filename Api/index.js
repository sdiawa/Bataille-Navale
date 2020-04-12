const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 8000;
const cors = require("cors");
const route = require("./router/ExpressRouter");
const {addPlayer,newGame,removePlayer,getPlayer,getLastGame,updateGameGrids} = require('./core/Game');
app.use(cors({origin:'*'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(route);
const http = require('http').createServer(app);
const server = require('socket.io')(http,{path:"/sockets"});
const io = server.of("/sockets");
const handleNewGame = async (socket)=>{
    if (newGame()){
        let game = await getLastGame();
        if (game && (socket.id === game.id || socket.id === game.player2.id)){
            await io.sockets[game.player1.id].join(game.id);
            await io.sockets[game.player2.id].join(game.id);
            await io.to(game.id).emit("newGame",{room:game,message:"joueur trouvé"});
        }
    }
};
io.on("connection", socket => {
    console.log("new connection");
    socket.on("newPlayer",async (data)=>{
        let currentPlayer = await addPlayer(socket.id,data.email);
        if (currentPlayer === true)
            //socket.emit("newGame",{room:getWaiting(),message:"Aucun joueur trouvé"});
            await handleNewGame(socket).catch(error => console.log(error));
        else if (currentPlayer){
           await io.sockets.connected[currentPlayer.id].disconnect();
            removePlayer(currentPlayer);
            await addPlayer(socket.id,data.email);
            await handleNewGame(socket);
            //socket.emit("newGame",{room:getWaiting(),message:"Aucun joueur trouvé"});
        }
    });
    //Joueur pret;
    // Listen from Client when all ships are added

    socket.on('allShipAdded', (data)=> {
        updateGameGrids(data.roomId,data.shipsPosition,socket.id === data.roomId);
        socket.emit('gameReady', data.gameReady);
        // Then broadcast to notify Client that we are ready
        socket.broadcast.to(data.roomId).emit('opponentReady', data.gameReady);
    });

    socket.on('playerShoot', (data)=> {
        socket.broadcast.to(data.roomId).emit('receivedShot', data.shotPosition);
        socket.broadcast.to(data.roomId).emit('turnChange', data);
    });
    socket.on('trackingGame', (data)=> {
        socket.broadcast.to(data.roomId).emit('trackingGame', data);

        if (data.hitPos) {
            if (data.hitPos.length === 15) {
                io.to(data.roomId).emit('gameOver', data);
                socket.leave(data.roomId);
            }
        }
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        if (getPlayer(socket.id))
        removePlayer(getPlayer(socket.id))
    });
});
server.listen(app.listen(port, function () {
    console.log("serveur ok on port "+port)
}));