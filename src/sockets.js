//Requiero la base de datos
const chat = require('./models/Chat');

module.exports = (io) => {
    let users = {};

    io.on('connection', async(socket) => {
        console.log('New user connected:');

        let messages = await chat.find({});
        socket.emit('load old msg', messages);

        socket.on('new user', (data, cb) => {

            if(data in users)
                cb(false);
            else{
                cb(true);
                socket.nickname = data;
                users[socket.nickname] = socket;
                updateNicknames();
            }
        });

        socket.on('Send message', async(data, cb) => {
            var msg = data.trim();

            if(msg.substring(0, 3) === '/s '){
                msg = msg.substring(3);
                const index = msg.indexOf(' ');

                if(index !== -1){
                    var name = msg.substring(0, index);
                    var msg = msg.substring(index+1);

                    if(name in users){
                        users[name].emit('whisper', {
                            msg,
                            nick: socket.nickname
                        });
                    }
                    else{
                        cb('Error! enter a valid username');
                    }
                }
                else{
                    cb('Error! Please enter your message')
                }
            }
            else{
                var newMsg = new chat({
                    msg,
                    nick: socket.nickname,
                });
                //Save es para guardar el documento en la database
                await newMsg.save();

                io.sockets.emit('new message', {
                    msg: data,
                    nick: socket.nickname
                });
            }            
        });

        socket.on('disconnect', (data) => {
            if(!socket.nickname) 
                return;
            delete users[socket.nickname];
            updateNicknames();
        });

        function updateNicknames() {
            io.sockets.emit('usernames', Object.keys(users));
        }
    });
}
