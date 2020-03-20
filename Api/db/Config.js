const Sequelize = require('sequelize');
const db ={database:'db_bn',user:'root',password:''};
const sequelize = new Sequelize(db.database, db.user, null, {
    host: 'localhost',
    dialect: 'mysql'
});
let User = sequelize.define('joueurs', {
    nom: Sequelize.STRING,
    prenom: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    win:Sequelize.INTEGER,
    lose:Sequelize.INTEGER
});
User.sync();

const  hashPassword = (password)=>{

};
module.exports = {User,hashPassword};
