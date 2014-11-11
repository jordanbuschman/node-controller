var socket = io('http://localhost:3000/controller');

var playerQueue = [];
var defaultQueue = [];
var library = [];

$('#play-0').bind('click', function() {
    socket.emit('change song', 0);
});

$('#play-1').bind('click', function() {
    socket.emit('change song', 1);
});

$('#play-15').bind('click', function() {
    socket.emit('change song', 15);
});

$('#play').bind('click', function() {
    socket.emit('play music');
});

$('#pause').bind('click', function() {
    socket.emit('pause music');
});

$('#queue-1').bind('click', function() {
    socket.emit('queue song', 1);
});

$('#queue-2').bind('click', function() {
    socket.emit('queue song', 2);
});

$('#volume').bind('blur', function() {
    socket.emit('set volume', $('#volume').val());
});

socket.on('player info', function(data) {
    console.log(data);
//    socket.emit('change song', 0);

 /*   playerQueue = data.queue.player;
    defaultQueue = data.queue.default;
    library = data.library;

    if (playerQueue.length > 0)
        socket.emit('change song', playerQueue[0], library[playerQueue[0]].path);
    else
        socket.emit('change song', defaultQueue[0], library[defaultQueue[0]].path);


    socket.emit('play music');

    $('#pause').bind('click', function() {
        socket.emit('pause music');
    });

    $('#play').bind('click', function() {
        socket.emit('play music');
    });

    $('#rewind').bind('click', function() {
        socket.emit('fast forward music');
    });
    */
});
