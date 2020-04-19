const {Bd} = require("../db/Config");
const {getPlayers} = require("../core/Game");
const express = require('express');
const jwt = require("jsonwebtoken");
const app = express.Router();
app.post('/api/register', async function (req, res) {
    if (req.body === null || JSON.stringify(req.body) === "{}")
        return res.status(400).send("Bad request");
    const user = await Bd.addUser(req.body).catch(() => {
        return null
    });
    if (user === null)
        return res.status(304).send();
    if (user === false)
        return res.status(409).send("email");
    return res.status(201).send("Success");
});
app.get('/', function (req, res) {
    res.send('<a href="/Api">API</a>')
});
app.get('/api', function (req, res) {
    res.send('Api b-n!')
});
app.get('/api/login', async function (req, res) {
    if (req.query.email && req.query.password) {
        const user = await Bd.checkUser(req.query.email, req.query.password);
        if (user === null)
            return res.status(400).send();
        if (user)
            return res.status(200).send(
                {
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    win: user.win,
                    lose: user.lose,
                    token: user.token
                });
        return res.status(409).send();

    } else
        return res.status(400).send();
});
app.get('/api/onlineUsers', async (req, res) => {
    let token = req.headers['x-access-token'];
    if (!token) return res.status(401).send();
    jwt.verify(token, process.env.TOKEN_KEY || "c.wmgT_SSNl>kGvQtK@0Ed]w~A$*h!Faldji",
        async (err, decoded) => {
            if (err) return res.status(500).send();
            let user = await Bd.getUserByEmail(decoded.email);
            if (user)
                return res.status(200).send(getPlayers());
            return res.status(401).send();
        });
});
app.get('/api/checkSession', async (req, res) => {
    let token = req.headers['x-access-token'];
    if (!token) return res.status(401).send();
    jwt.verify(token, process.env.TOKEN_KEY || "c.wmgT_SSNl>kGvQtK@0Ed]w~A$*h!Faldji",
        async (err, decoded) => {
            if (err) return res.status(500).send();
            let user = await Bd.getUserByEmail(decoded.email);
            if (user)
                return res.status(200).send({
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    win: user.win,
                    lose: user.lose,
                    token: user.token
                });
            return res.status(401).send();
        });
});
module.exports = app;