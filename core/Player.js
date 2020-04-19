module.exports = class Player {
    constructor(id, user) {
        this.id = id;
        this.userid = user.id;
        this.username = user.nom + ' ' + user.prenom;
        this.email = user.email;
        this.win = user.win || 0;
        this.lose = user.lose || 0;
        this.status = "ONLINE";
        this.grid = [];
    }

};