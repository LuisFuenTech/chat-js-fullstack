const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

//
mongoose.connect('mongodb://localhost/chatdb', {
    useNewUrlParser: true
    })
    .then(db => {
        console.log('Database is connected');
    })
    .catch(err => confirm.log(err));

//Enviar y recibir mensajes desde client-server
const io = socketio.listen(server);

require('./sockets')(io);

app.set('port', process.env.PORT || 3000);

//Static files
app.use(express.static(path.join(__dirname, 'public')));

server.listen(app.get('port'), () => {
    console.log(`Server works on port ${app.get('port')}`);
});