const Sequelize = require('sequelize');
const bCrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// connection à la BD
class Config {
    User;
    sequelize;

    constructor() {
        if (process.env.DATABASE_URL) {
            if (process.env.TOKEN_KEY) {
                let match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
                this.sequelize = new Sequelize(match[5], match[1], match[2], {
                    dialect: 'postgres',
                    protocol: 'postgres',
                    port: match[4],
                    host: match[3],
                    dialectOptions: {
                        ssl: true
                    }
                });
                this.User = this.sequelize.define('joueurs', {
                    nom: Sequelize.STRING,
                    prenom: Sequelize.STRING,
                    email: Sequelize.STRING,
                    password: Sequelize.STRING,
                    win: Sequelize.INTEGER,
                    lose: Sequelize.INTEGER,
                    isOnline: Sequelize.BOOLEAN,
                    token: Sequelize.STRING
                });
                (async () => {
                    await this.User.sync({logging: false})
                })();
            } else {
                console.error("Impossible de trouver la clé privée du token dans l'env TOKEN_KEY.");
            }
        } else {
            if (process.env.TOKEN_KEY)
                console.error("Impossible de trouver une BD Postgres dans l'env DATABASE_URL.");
            else
                console.error("Impossible de trouver la clé privée du token dans l'env TOKEN_KEY.");
        }
    }

    /**
     *
     * @desc Hash le mot de passe Bcrypt
     * @param password
     * @return {Promise<null|*>}
     */
    hashPassword = async (password) => {
        let passHash;
        try {
            passHash = await bCrypt.hashSync(password, 10)
        } catch (e) {
            return null;
        }
        return passHash;
    };

    /**
     *
     * @desc recherche un utilisateur par son email
     * @param email
     * @return {Promise<boolean|null|*>}
     */
    getUserByEmail = async (email) => {
        if (this.User === undefined)
            return null;
        let user = await this.User.findOne({where: {email: email}}).catch(() => {
            return null
        });
        if (user === null)
            return false;
        return user;
    };

    /**
     *
     * @desc recherche un utilisateur par son id
     * @return {Promise<boolean|null|*>}
     * @param id
     */
    getUserById = async (id) => {
        if (this.User === undefined)
            return null;
        let user = await this.User.findOne({where: {id: id}}).catch(() => {
            return null
        });
        if (user === null)
            return false;
        return user;
    };
    /**
     *
     * @desc verifier si le couple email/mot de passe correspond à un user
     * @param email
     * @param password
     * @return {Promise<boolean|null|*>}
     */
    checkUser = async (email, password) => {
        if (this.User === undefined)
            return null;
        let user = await this.User.findOne({where: {email: email}}).catch(() => {
            return null
        });
        if (user === null)
            return false;
        let crypt = bCrypt.compareSync(password, user.password);
        if (crypt) {
            user.isOnline = true;
            user.token = jwt.sign({email: user.email}, process.env.TOKEN_KEY, {
                expiresIn: 86400 // expire après 24 heures
            });
            await user.save();
            return user;
        }
        return false;
    };

    /**
     *
     * @desc créer nouvel utilisateur
     * @param user
     * @return {Promise<null|any|void|undefined|T|boolean>}
     */
    addUser = async (user) => {
        if (this.User === undefined)
            return null;
        let newUser = await this.User.findOne({where: {email: user.email}}).catch(() => {
            return null
        });
        if (newUser)
            return false;
        const genPass = await this.hashPassword(user.password);
        if (genPass === null)
            return null;
        user.password = genPass;
        user.isOnline = false;
        user.win = 0;
        user.lose = 0;
        user.token = jwt.sign({email: user.email}, process.env.TOKEN_KEY, {
            expiresIn: 86400 // expire après 24 heures
        });
        return this.User.create(user).catch(() => {
            return null
        });
    };
}

const Bd = new Config();
module.exports = {Bd};
