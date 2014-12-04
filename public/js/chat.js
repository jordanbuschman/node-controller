/* Client-side socket.io */

(function() {
    var volume, userCount, playerCount, musicQueue, isPaused;
    var b64 = new base64();
    var socket = io('/player');
    var musicPlayer = document.getElementById('music-player');

    function loadAndPlay() { //Get the next song on the queue, load it up, and play it
        var song = musicQueue.nowPlayingInfo();
        if (!song) return; //No next song, return

        document.getElementById('title').innerHTML = song.name;
        document.getElementById('artist').innerHTML = song.artist;
        document.getElementById('album').innerHTML = song.album;

        var songPath = song.path;
        musicPlayer.src = 'song/' + b64.encodeBase64Url(songPath);

        musicPlayer.load();
        if (!isPaused)
            musicPlayer.play();
    }

    function clearSource() { //Clear the source and reset view
        musicPlayer.src = '';

        document.getElementById('title').innerHTML = '...';
        document.getElementById('artist').innerHTML = '...';
        document.getElementById('album').innerHTML = '...';
    }

    musicPlayer.addEventListener('ended', function() {
        document.getElementById('title').innerHTML = '...';
        document.getElementById('artist').innerHTML = '...';
        document.getElementById('album').innerHTML = '...';

        socket.emit('song ended');
        musicQueue.songFinishedPlaying();
        musicQueue.loadSong();

        if (musicQueue.nowPlaying() == null)
            isPaused = true;
        else
            isPaused = false;

        loadAndPlay();

    });
    /***********************************/

    socket.on('player info', function(info) {
        console.log(info);
        musicQueue = new MusicQueue(info.library, info.queue, info.last, info.next, info.nowPlaying);
        volume = info.volume;
        userCount = info.userCount;
        playerCount = info.playerCount;
        isPaused = info.isPaused;

        loadAndPlay();
    });

    socket.on('change song', function(libraryID) {
        musicQueue.changeSong(libraryID);
        var song = musicQueue.getSongInfo(libraryID).path;

        isPaused = false;

        loadAndPlay();
    });

    socket.on('queue song', function(libraryID) {
        musicQueue.add(libraryID);
    });

    socket.on('unqueue song', function(index) {
        musicQueue.remove(index);
    });

    socket.on('pause music', function() {
        musicPlayer.pause();
    });

    socket.on('play music', function() {
        if (!musicPlayer.src)
            loadAndPlay();
        else
            musicPlayer.play();
    });

    socket.on('set volume', function(val) {
        musicPlayer.volume = val;
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
    });

    socket.on('play previous', function() {
        musicQueue.playPrevious();

        if (musicQueue.nowPlaying() == null) { //No previous song to play, delete song
            clearSource();
        }
        else {
            loadAndPlay();
        }
    });

    socket.on('play next', function() {
        musicQueue.playNext();

        if (musicQueue.nowPlaying() == null) { //No next song to play, delete song
            clearSource();
        }
        else {
            loadAndPlay();
        }
    });

    socket.on('reorder queue', function(jsonData) {
        musicQueue.move(jsonData);
    });
})();
