/* Client-side socket.io */

(function() {
    var volume, userCount, playerCount, musicQueue, isPaused;
    var b64 = new base64();
    var socket = io('/player');
    var musicPlayer = document.getElementById('music-player');

    function loadAndPlay() { //Get the next song on the queue, load it up, and play it
        var song = musicQueue.nowPlayingInfo();
        console.log(JSON.stringify(song));
        if (!song) return; //No next song, return

        var songPath = song.path;
        musicPlayer.src = 'song/' + b64.encodeBase64Url(songPath);
        musicPlayer.load();

        if (!isPaused)//If the song should be playing, load up the song
            musicPlayer.play();
    }

    musicPlayer.addEventListener('ended', function() {
        isPaused = false;

        socket.emit('song ended', musicQueue.nowPlaying());
        musicQueue.playNext();

        loadAndPlay();
    });


    socket.on('player info', function(info) {
        console.log(info);
        musicQueue = new MusicQueue(info.library, info.queue, info.last, info.next);
        volume = info.volume;
        userCount = info.userCount;
        playerCount = info.playerCount;
        isPaused = info.isPaused;

        loadAndPlay();
    });

    socket.on('change song', function(libraryID) {
        musicQueue.changeSong(libraryID);
        var song = musicQueue.getSongInfo(libraryID).path;
        console.log('change song: ' + song);

        isPaused = false;

        loadAndPlay();
    });

    socket.on('queue song', function(libraryID) {
        musicQueue.add(libraryID);
    });

    socket.on('pause music', function() {
        musicPlayer.pause();
    });

    socket.on('play music', function() {
        musicPlayer.play();
    });

    socket.on('set volume', function(val) {
        musicPlayer.volume = val;
    });
})();
