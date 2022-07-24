/* eslint-disable indent */
/* eslint-disable no-console */
const io = require('socket.io')();

const socketapi = {
       io,
};

// Add your socket.io logic here!
io.on('connection', (socket) => {
       console.log(`connected ${socket.id}`);
       socket.on('reviewAdded', (message) => {
              io.emit('reviewMessage', message);
       });
});

module.exports = socketapi;
