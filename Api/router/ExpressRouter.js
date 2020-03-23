const {addUser,checkUser} = require("../db/Config");
const express = require('express');
const app = express.Router();
app.post('/api/register',async function (req,res) {
    if (req.body === null || JSON.stringify(req.body)==="{}")
        return res.status(400).send("Bad request");
    const user = await addUser(req.body).catch(()=>{return null});
    if (user === null)
        return res.status(304).send();
    if (user === false)
        return res.status(409).send("email");
    return res.status(201).send("Success");
});
app.get('/', function (req, res) {
    res.send('<a href="/api">API</a>')
});
app.get('/api', function (req, res) {
    res.send('Api b-n!')
});
app.get('/api/login', async function (req, res) {
    if (req.query.email && req.query.password){
        const user = await checkUser(req.query.email,req.query.password);
        if (user === null)
            return res.status(400).send();
        if (user)
            return res.status(200).send({nom:user.nom,prenom:user.prenom,email:user.email});
        return res.status(409).send();

    }else
        return res.status(400).send();
});
module.exports = app;