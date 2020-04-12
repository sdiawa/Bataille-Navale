const Player = require("./Player");
const {getUserByEmail} = require("../db/Config");
const {initGrid} = require('./Grids');
let Players = [];
let Games = [];
let waitingRoom = [];
let getWaiting = () =>waitingRoom;
//créer et Ajouter joueur à la salle d'attente
const addPlayer = async (id,email) =>{
    let user = await getUserByEmail(email);
    if (!user)
        return false;
   let player =  new Player(id,user);
   if (Players.some(value=> value.userid === player.userid)){
       return Players.find(value => value.userid === player.userid)}
   if (joinWaitingRoom(player)){
      if (!Players.includes(player))
          Players.push(player);
      return true;
   }
   return false;

};
const updateGameGrids = (roomId,grid,isPlayer1)=>{
    let updatedGame = Games.find(value =>  value.id === roomId);
    let idx = Games.findIndex(value =>  value.id === roomId);
    if (updatedGame && idx){
        (isPlayer1)?updatedGame.player1.grid = grid:updatedGame.player2.grid=grid;
        Games[idx]= updatedGame;
        return true
    }
    return false;
};
//rétirer joueur à la salle d'attente
const removePlayer = (player,socket) =>{
    if (inWaitingRoom(player))
        clearWaitingRoom(player);
    if (Games.some(value=>value.player1===player || value.player2===player)){
        Games = Games.filter(value=>value.player1!==player || value.player2!==player);
    }
    if (Players.includes(player))
        Players = Players.filter(value => value.id !== player.id);
};
//vérifie si un joueur est dans la salle d'attente
const inWaitingRoom = (player) => {
    return waitingRoom.includes(player)
};

//créer une session de jeu entre 2 joueurs de la salle d'attente
const newGame = ()=>{
    let player1,player2,winner;
    let status = "STARTED";
    if (waitingRoom.length >= 2){
        player1 = waitingRoom[0];
        player2 = waitingRoom[1];
        player1.grid = initGrid();
        player2.grid = initGrid();
        clearWaitingRoom(player1);
        clearWaitingRoom(player2);
        let id = player1.id;
        Games.push({id,status,player1,player2,winner});
        return true;
    }else {
        return false;
    }
};
// retourne un joueur
const getPlayer = (id)=>{
    return Players.find(value => value.id === id)
};
// retourne un jeu en cours
const getGameById = (id)=>{
    return Games.find(value => value.id === id)
};
// retourne un jeu en cours
const getLastGame = ()=>{
    if (Games.length > 0)
        return Games[Games.length - 1];
    return false;
};

// retourne tous les joueurs
const getPlayers = ()=>Players;

//Ajout d'un joueur à la salle d'attente
const joinWaitingRoom = (player) => {
    if (player && player.id !== undefined){
        if (inWaitingRoom(player))
            return false;
        waitingRoom.push(player);
        return true;
    }
    return false;
};
//retirer un joueur de la salle d'attente
const clearWaitingRoom = (player)=> {
    waitingRoom = waitingRoom.filter(value => value.id !== player.id)
};
module.exports = {addPlayer,joinWaitingRoom,removePlayer,newGame,getWaiting,getPlayer,getLastGame,updateGameGrids};