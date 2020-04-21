const Player = require("./Player");
const {Bd} = require("../db/Config");

//liste des joueurs en ligne
let Players = [];
//List des jeux en cours
let Games = [];
//salle d'attente Lobby
let waitingRoom = [];

/**
 * @desc Créer et Ajouter joueur à la salle d'attente
 * @param id
 * @param email
 * @return {Promise<boolean|*>}
 */
const addPlayer = async (id, email) => {
    let user = await Bd.getUserByEmail(email);
    if (!user)
        return false;
    let player = new Player(id, user);
    if (Players.some(value => value.userid === player.userid))
        return Players.find(value => value.userid === player.userid);
    Players.push(player);
    return true;
};

/**
 *
 * @desc Mettre à jours la grille d'un joueur
 * @param roomId
 * @param grid
 * @param isPlayer1
 * @return {boolean}
 */
const updateGameGrids = (roomId, grid, isPlayer1) => {
    let updatedGame = Games.find(value => value.id === roomId);
    let idx = Games.findIndex(value => value.id === roomId);
    if (updatedGame && idx !== undefined) {
        (isPlayer1) ? updatedGame.player1.grid = grid : updatedGame.player2.grid = grid;
        updatePlayer(updatedGame.player1);
        updatePlayer(updatedGame.player2);
        Games[idx] = updatedGame;
        return true;
    }
    return false;
};

/**
 *
 * @desc Mettre à jours les joueurs Gagnant Perdant
 * @param winnerId
 * @param loserId
 * @return {Promise<boolean>}
 */
const playersWinLose = async (winnerId, loserId) => {
    let winner = await Bd.getUserById(winnerId);
    let loser = await Bd.getUserById(loserId);
    if (winner && loser) {
        winner.win += 1;
        loser.lose += 1;
        await winner.save();
        await loser.save();
        Players = Players.map(value => {
            if (value.userid === winner.id)
                value.win = winner.win;
            if (value.userid === loser.id)
                value.lose = loser.lose;
            return value
        });
        return true;
    }
    return false;
};

/**
 * @desc Rétirer un joueur d'un jeu
 * @param player
 * @param socket
 * @return {boolean}
 */
const removePlayerFromGame = (player, socket) => {
    let game = getMyGame(player.id);
    if (game) {
        if (socket !== undefined) {
            socket.broadcast.to(game.id).emit('leave',{roomId:game.id});
            socket.leave(game.id);
        }
        Games = Games.filter(value => value.id !== game.id);
        return true;
    }
    return false;
};

/**
 * @desc Rétirer joueur partout  le mettre hors-ligne ou mettre à jours la socket
 * @param player
 * @param socket
 */
const removePlayer = (player, socket) => {
    if (Players.includes(player)) {
        if (socket !== undefined) {
            Players[Players.findIndex(value => value === player)].id = socket.id;
        } else {
            Players = Players.filter(value => value.id !== player.id);
        }
    }
};

/**
 * @desc Vérifie si un joueur est dans la salle d'attente
 * @param player
 * @return {boolean}
 */
const inWaitingRoom = (player) => {
    return waitingRoom.includes(player)
};

/**
 * @desc créer une session de jeu entre 2 joueurs de la salle d'attente
 * @param sockets
 * @return {boolean}
 */
const newGame = (sockets) => {
    let player1, player2;
    let status = "STARTED";
    //waitingRoom = waitingRoom.filter(async value => await sockets[value.id] !== undefined);
    if (waitingRoom.length >= 2) {
        player1 = waitingRoom[0];
        player2 = waitingRoom[1];
        player1.grid = [];
        player2.grid = [];
        clearWaitingRoom(player1);
        clearWaitingRoom(player2);
        let id = player1.id;
        Games.push({id, status, player1, player2});
        return true;
    } else {
        return false;
    }
};
/**
 *
 * @desc retourne un joueur
 * @param id
 * @return {*}
 */
const getPlayer = (id) => {
    return Players.find(value => value.id === id)
};

/**
 *
 * @desc retourne un jeu en cours en fonction de l'id du joueur
 * @param id
 * @return {*}
 */
const getMyGame = (id) => {
    return Games.find(value => (value.player1.id === id || value.player2.id === id))
};

/**
 * @desc retourne tous les joueurs
 * @return {[]}
 */
const getPlayers = () => Players;

/**
 *
 * @desc Ajout d'un joueur à la salle d'attente
 * @param player
 * @return {boolean}
 */
const joinWaitingRoom = (player) => {
    if (player && player.id !== undefined) {
        if (inWaitingRoom(player))
            return false;
        waitingRoom.push(player);
        return true;
    }
    return false;
};

/**
 *
 * @desc retirer un joueur de la salle d'attente
 * @param player
 */
const clearWaitingRoom = (player) => {
    waitingRoom = waitingRoom.filter(value => value.userid !== player.userid)
};

/**
 *
 * @desc mettre à jours un joueur
 * @param player
 * @return {boolean}
 */
const updatePlayer = (player) => {
    if (Players.some(value => value.email === player.email)) {
        Players[Players.findIndex(value => value.email === player.email)] = player;
        return true;
    }
    return false;
};
module.exports = {
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
};
