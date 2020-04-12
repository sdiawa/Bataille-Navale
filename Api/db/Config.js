const Sequelize = require('sequelize');
const bCrypt = require("bcrypt");
const db ={database:'dcpnigpjs7hlgm',user:'kqmtyheeieimld',password:'e32523f7d342f1239e701a039696195fbaaa62786a47b53927dc1f272cd0a80f'};
let sequelize;
if (process.env.DATABASE_URL) {
    let match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    sequelize = new Sequelize(match[5], match[1], match[2], {
        dialect: 'postgres',
        protocol: 'postgres',
        port: match[4],
        host: match[3],
        dialectOptions:{
            ssl:true
        }
    })
}else {
    sequelize = new Sequelize(db.database, db.user, db.password, {
        host: 'ec2-46-137-84-173.eu-west-1.compute.amazonaws.com',
        dialect: 'postgres',
        dialectOptions:{
            ssl:true
        }
    });
}
//const sequelize = new Sequelize("postgres://pnlajbvuanvzma:253257240425b112556edb9c55535bfd28061be591a8ae24a5daa72b64f5c770@ec2-34-202-7-83.compute-1.amazonaws.com:5432/dfh6cgogm94jt7");
let User = sequelize.define('joueurs', {
    nom: Sequelize.STRING,
    prenom: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    win:Sequelize.INTEGER,
    lose:Sequelize.INTEGER,
    isOnline:Sequelize.BOOLEAN
});
User.sync();

const  hashPassword = async (password)=>{
    let passHash;
    try {
        passHash = await bCrypt.hashSync(password, 10)
    }
    catch (e) {
        return null;
    }
    return passHash;
};
const addUser = async (user)=>{
    let newUser = await User.findOne({ where: {email:user.email} }).catch(()=> {return null});
    if (newUser)
        return false;
    const genPass = await hashPassword(user.password);
    if (genPass === null)
        return null;
    user.password=genPass;
    user.isOnline = false;
    return User.create(user).catch(()=>{return null});
};
const checkUser = async (email, password) =>{
    //... fetch user from a db etc.
    let user = await User.findOne({ where: {email:email} }).catch(()=> {return null});
    if (user===null)
        return false;
    let crypt =  bCrypt.compareSync(password, user.password);
    if (crypt){
        user.isOnline = true;
       await user.save();
        return user;
    }
    return false;
};
const getUserById = async (id) => {
    let user = await User.findOne({ where: {id:id} }).catch(()=> {return null});
    if (user===null)
        return false;
    return user;
};
const getUserByEmail = async (email) => {
    let user = await User.findOne({ where: {email:email} }).catch(()=> {return null});
    if (user===null)
        return false;
    return user;
};
module.exports = {User,hashPassword,checkUser,addUser,getUserByEmail,getUserById};
