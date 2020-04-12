module.exports = class Player {
    constructor(id, user) {
       this.id = id;
       this.userid = user.id;
       this.username = user.nom + ' ' + user.prenom;
       this.grid = [];
    }
getUsername = ()=> this.username;
};