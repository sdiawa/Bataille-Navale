const express = require('express');
const app = express.Router();
const config = require("../db/Config");
let user = config.User;
app.post('/api/register',function (req,res) {
    user.create(req.body)
        .then(() => res.status(200).send("ok"))
        .catch((error)=> res.status(400).send(error))
});
app.get('/', function (req, res) {
    res.send('<a href="/api">API</a>')
});
app.get('/api', function (req, res) {
    res.send('Api b-n!')
});
module.exports = app;