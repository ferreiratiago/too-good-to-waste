var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var PORT = 9000;

server.listen(PORT);
console.log('Listen at '+PORT);

io.on('connection', function (socket) {
  console.log('YEAHHH! Another stupid connected!');

  socket.on('expiring', function (data) {
    console.log('expiring', data);


    io.sockets.emit('notification', data);
  });
});