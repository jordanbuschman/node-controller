/* Server-side socket.io */

var child   = require('child_process');
var fs      = require('fs');

var mq      = require('./music-queue'); 

var musicQueue = new mq();

var chat = function(io) {
    var music; //Music queue, from music-queue.js
    var volume = 1.0; //Music player volume (default 1.0)
    var isPaused = true; //If the song is paused (default true)
    var userCount = 0; //How many users are on the server (default 0)
    var playerCount = 0; //How many music players are connected
    var nowPlayingLibraryID;

    var musicPlayerIO = io.of('/player');
    var musicControllerIO = io.of('/controller');

    musicPlayerIO.on('connection', function(socket) {
        console.log('New music player connected (' + socket.handshake.address + ').');
        playerCount++;
        musicControllerIO.emit('add user', [userCount, playerCount]);

        socket.emit('player info', {
            'volume': volume,
            'queue': musicQueue.getQueue(),
            'next': musicQueue.getNextPlayed(),
            'last': musicQueue.getLastPlayed(),
            'nowPlaying': musicQueue.nowPlaying(),
            'library': musicQueue.getLibrary(),
            'isPaused': isPaused,
        });
        
        socket.on('song ended', function() {
            musicQueue.songFinishedPlaying();
            musicQueue.loadSong();

            if (musicQueue.nowPlaying() == null) { //No songs left, pause music
                isPaused = true;
            }
            else {
                isPaused = false;
            }

            musicPlayerIO.emit('song ended');
            musicControllerIO.emit('song ended');
        });

        socket.on('disconnect', function() {
            playerCount--;
            console.log('Music player ' + socket.handshake.address + ' disconnected.');
            musicControllerIO.emit('remove user', [userCount, playerCount]);
        });
    });

    musicControllerIO.on('connection', function(socket) {
        //Execute bash script to get system volume
        console.log(socket.handshake.address + ' connected.');
        userCount++;
        musicControllerIO.emit('add user', [userCount, playerCount]);

        socket.emit('player info', {
            'volume': volume,
            'queue': musicQueue.getQueue(),
            'next': musicQueue.getNextPlayed(),
            'last': musicQueue.getLastPlayed(),
            'nowPlaying': musicQueue.nowPlaying(),
            'library': musicQueue.getLibrary(),
            'isPaused': isPaused,
            'userCount': userCount,
            'playerCount': playerCount,
        });

        socket.on('set volume', function(val) {
            //Adjust the system volume to val
            if (volume != val && val >= 0 && val <= 1) {
                volume = val;
                console.log('Set volume to ' + val);
                musicControllerIO.emit('set volume', val);
                musicPlayerIO.emit('set volume', val);
            }
        });

        socket.on('change song', function(libraryID) {
            //Change the song to song of libraryID
            //if (nowPlayingLibraryID != libraryID) {
                musicQueue.changeSong(libraryID);
                nowPlayingLibraryID = libraryID;

                isPaused = false;

                musicPlayerIO.emit('change song', libraryID);
                musicControllerIO.emit('change song', libraryID);

                var this_song = musicQueue.getSongInfo(libraryID);
                console.log('Now playing: ' + this_song.name + ' - ' + this_song.artist);
            //}
        });

        socket.on('queue song', function(libraryID) {
            //Queue up the song with id libraryID
            musicQueue.add(libraryID);

            var this_song = musicQueue.getSongInfo(libraryID);
            console.log('Song queued up: ' + this_song.name + ' - ' + this_song.artist);

            musicPlayerIO.emit('queue song', libraryID);
            musicControllerIO.emit('queue song', libraryID);
        });
        
        socket.on('unqueue song', function(index) {
            var queue = musicQueue.getQueue();
            var this_song = musicQueue.getSongInfo(queue[index]);
            musicQueue.remove(index);

            console.log('Song removed from queue: ' + this_song.name + ' - ' + this_song.artist);

            musicPlayerIO.emit('unqueue song', index);
            musicControllerIO.emit('unqueue song', index);
        });

        socket.on('pause music', function() {
            //Pause the current song
            isPaused = true;
            console.log('Music paused.');
            musicPlayerIO.emit('pause music');
            musicControllerIO.emit('pause music');
        });

        socket.on('play music', function() {
            //Play the current song
            isPaused = false;
            console.log('Music resumed.');
            musicPlayerIO.emit('play music');
            musicControllerIO.emit('play music');
        });

        socket.on('change play head', function(time) {
            console.log('Changing time to ' + time);
            musicPlayerIO.emit('change play head', time);
            musicControllerIO.emit('change play head', time);
        });

        socket.on('song ended', function() {
            musicQueue.songFinishedPlaying();
            musicQueue.loadSong();

            if (musicQueue.nowPlaying() == null) { //No songs left, pause music
                isPaused = true;
            }
            else {
                isPaused = false;
            }

            musicPlayerIO.emit('song ended');
            musicControllerIO.emit('song ended');
        });

        socket.on('play previous', function() {
            console.log('Skipping back.');
            musicQueue.playPrevious();

            musicPlayerIO.emit('play previous');
            musicControllerIO.emit('play previous');
        });

        socket.on('play next', function() {
            console.log('Skipping forward.');
            musicQueue.playNext();

            musicPlayerIO.emit('play next');
            musicControllerIO.emit('play next');
        });

        socket.on('reorder queue', function(from, to) {
            console.log('Moving ' + from + ' to ' + to + '.');
            musicQueue.move(from, to);

            musicPlayerIO.emit('reorder queue', {from: from, to: to});
            musicControllerIO.emit('reorder queue', {from: from, to: to});
        });

        socket.on('disconnect app', function() {
            socket.disconnect();
        });

        socket.on('disconnect', function() {
            userCount--;
            musicControllerIO.emit('remove user', [userCount, playerCount]);
            console.log(socket.handshake.address + ' disconnected.');
        });
    });
}

module.exports = chat;
