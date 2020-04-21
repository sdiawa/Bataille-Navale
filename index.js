const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 8000;
const cors = require("cors");
const route = require("./router/ExpressRouter");
const {
    playersWinLose,
    clearWaitingRoom,
    removePlayerFromGame,
    updatePlayer,
    joinWaitingRoom,
    addPlayer,
    newGame,
    removePlayer,
    getPlayer,
    getPlayers,
    getMyGame,
    updateGameGrids
} = require('./core/Game');
app.use(cors({origin: '*'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(route);
const http = require('http').createServer(app);
const server = require('socket.io')(http, {path: "/sockets"});
const io = server.of("/sockets");

/**
 *
 * @desc gerer une connection entre 2 joueurs dans le lobby
 * @param socket
 * @return {Promise<boolean>}
 */
const handleNewGame = async (socket) => {
    if (newGame(io.sockets)) {
        let game = await getMyGame(socket.id);
        if (game) {
            await io.sockets[game.player1.id].join(game.id);
            await io.sockets[game.player2.id].join(game.id);
            await io.to(game.id).emit("newGame", {room: game, message: "joueur trouvé"});
        }
    }
    return false;
};

//Server socket io écoute une connection
io.on("connection", socket => {
    //console.log("new connection");
    //renvoi la liste des joueurs en ligne chaque 10s
    setInterval(() => socket.emit('onlineUsers', getPlayers()), 10000);
    socket.on('newConnection', () => socket.emit('onlineUsers', getPlayers()));
    //newPlayer nouvelle connection socket creer ou modifier joueur
    socket.on("newPlayer", async (data) => {
        let currentPlayer = await addPlayer(socket.id, data.email);
        if (currentPlayer === true) {
            socket.emit('onlineUsers', getPlayers());
        } else if (currentPlayer) {
            removePlayer(currentPlayer, socket);
            socket.emit('onlineUsers', getPlayers());
        }
    });
    //joinLobby user chercher adversaire
    socket.on("joinLobby", async (data) => {
        let currentPlayer = getPlayers().find(value => value.email === data.email);
        if (currentPlayer) {
            if (currentPlayer.id !== socket.id) {
                currentPlayer.id = socket.id;
                await updatePlayer(currentPlayer);
            }
            await joinWaitingRoom(currentPlayer)
        } else {
            let cur = await addPlayer(socket.id, data.email);
            if (cur === true) {
                currentPlayer = getPlayer(socket.id);
                await joinWaitingRoom(currentPlayer)
            }
        }
        if (currentPlayer)
            await handleNewGame(socket).catch(err => console.log(err));
    });

    //Joueur prêt (Tous ses bateaux placés;
    socket.on('allShipAdded', (data) => {
        updateGameGrids(data.roomId, data.shipsPosition, socket.id === data.roomId);
        socket.emit('gameReady', data.gameReady);
        // broadcast (notifier l'adversaire que je suis prêt)
        socket.broadcast.to(data.roomId).emit('opponentReady', data.gameReady);
    });

    //Joueur Tire sur la position (data.shotPosition) = grille de l'adversaire
    socket.on('playerShoot', (data) => {
        //envoie à l'adversaire
        socket.broadcast.to(data.roomId).emit('receivedShot', data.shotPosition);
        //change tours
        socket.broadcast.to(data.roomId).emit('turnChange', data);
    });

    //Bateau coulé
    socket.on("shipDown", (data) => {
        socket.broadcast.to(data.roomId).emit('shipDown', data);
    });

    // Traquer l'etat des grilles des joueurs
    socket.on('trackingGame', async (data) => {
        if (data.hitPos && data.isShipDownPos)
            data.hitPos.forEach(value => {
                if (value.mean <= 0) {
                    const player = getPlayer(socket.id);
                    if (player)
                        player.grid.forEach(value1 => value1.forEach(
                            value2 => {
                                if (value2.shipType === value.type)
                                    data.shipDownPos.push(value2);
                            }
                        ));
                }
            });
        socket.broadcast.to(data.roomId).emit('trackingGame', data);
        if (data.hitPos) {
            socket.broadcast.to(data.roomId).emit('shipDown', data.shipDown);
            if (data.hitPos.length === 15) {
                let game = getMyGame(socket.id);
                if (game) {
                    if (socket.id === game.player1.id) {
                        await playersWinLose(game.player1.userid, game.player2.userid);
                    } else {
                        await playersWinLose(game.player2.userid, game.player1.userid);
                    }
                    game.status = "ENDED"
                }
                io.to(data.roomId).emit('gameOver', data);
            }
        }
    });
    //quitter la room
    socket.on('leave',(data)=>socket.leave(data.roomId));
    //Quitter une partie
    socket.on('leaveGame', async (data) => {
        let player = getPlayers().find(value => value.email === data.email);
        if (player)
            removePlayerFromGame(player, socket);
    });

    //Quitter le lobby (salle d'attente)
    socket.on('leaveLobby', async (data) => {
        let player = getPlayers().find(value => value.email === data.email);
        if (player)
            clearWaitingRoom(player);
    });

    //Déconnection d'un joueur
    socket.on("disconnect", () => {
        //console.log("Client disconnected");
        const player = getPlayer(socket.id);
        if (player) {
            removePlayerFromGame(player, socket);
            clearWaitingRoom(player);
            removePlayer(player);
            socket.emit('onlineUsers', getPlayers());
        }
    });
});


server.listen(app.listen(port, function () {
    console.log("serveur ok sur le port " + port)
}));
