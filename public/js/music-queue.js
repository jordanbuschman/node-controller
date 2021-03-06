/* Client side music queue */

function MusicQueue(_library, _queue, _last, _next, _nowPlaying) {

    var library = _library; //Where all of the song info goes
    var queue = _queue; //Queued music selected by a user
    var lastPlayed = _last; //List of songs last played
    var nextPlayed = _next; //List of songs that will be played next (before queue)
    var nowPlaying = _nowPlaying; //Song listed as now playing

    this.getLibrary = function() {
        return library;
    };

    this.getQueue = function() {
        return queue;
    };

    this.getLastPlayed = function() {
        return lastPlayed;
    }

    this.getNextPlayed = function() {
        return nextPlayed;
    }

    this.add = function(libraryID) {
    //Add to the end of the playlist
        queue.push(libraryID);
    };
    
    this.remove = function(index) {
    //Remove item from playlist at position index
        if (index < queue.length) //Can only delete player queued items
            queue.splice(index, 1);
    };
    
    this.shuffle = function() {
    //Music queue was broken (possibly by playing a new song not on the queue?), remove previous and future song history
        lastPlayed = [];
        nextPlayed = [];
    };
        
    this.move = function(jsonData) {
    //Move song at position from to position to
        var from = jsonData['from'];
        var to = jsonData['to'];
        var fromObject = queue[from];

        queue.splice(from, 1); //Remove old element
        queue.splice(to, 0, fromObject); //Put old element in new position
    };
    
    this.nowPlaying = function() {
    //Return the index of the song that should be playing now
        return nowPlaying;
    };

    this.nowPlayingInfo = function() {
    //Return the song info of the song that should be playing now (or null, if no song is queued up)
        var nowPlayingSong;

        try {
            nowPlayingSong = library[this.nowPlaying()];
        } catch (e) {
            nowPlayingSong = null;
        }

        return nowPlayingSong;
    };

    this.changeSong = function(libraryID) {
        this.shuffle();
        nowPlaying = libraryID;
    }

    this.getSongInfo = function(libraryID) {
    //Return the song info of the song at library[libraryID]
        return library[libraryID];
    };

    this.songFinishedPlaying = function() {
    //Put the song that was just finished in the last played list
        if (nowPlaying != null) {
            lastPlayed.push(nowPlaying);
            nowPlaying = null;
        }
    };
    
    this.undoSongFinishedPlaying = function() {
    //Put the last song in the next played stack
        if (nowPlaying != null) {
            nextPlayed.unshift(nowPlaying);
            nowPlaying = null;
        }
    };

    this.playPrevious = function() {
    //Put the previous song into nowPlaying
        if (lastPlayed.length > 0) {
            if (nowPlaying != null)
                nextPlayed.unshift(nowPlaying);
            nowPlaying = lastPlayed.shift();
        }
        else {
            nowPlaying = null;
        }
    };

    this.playNext = function() {
    //Put the next song to play into nowPlaying
        if (nextPlayed.length > 0) {
            if (nowPlaying != null)
                lastPlayed.unshift(nowPlaying);
            nowPlaying = nextPlayed.shift();
        }
        else if (queue.length > 0) {
            if (nowPlaying != null)
                lastPlayed.unshift(nowPlaying);
            nowPlaying = queue.shift();
        }
        else {
            nowPlaying = null;
        }
    };

    this.loadSong = function() {
        if (nextPlayed.length > 0) {
            nowPlaying = nextPlayed.shift();
        }
        else if (queue.length > 0) {
            nowPlaying = queue.shift();
        }
        else {
            nowPlaying = null;
        }
    };
}
