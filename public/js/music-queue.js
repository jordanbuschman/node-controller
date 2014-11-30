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
        
    this.move = function(from, to) {
    //Move song at position from to position to
        if (to >= queue.length || from >= queue.length) //Out of bounds, return
            return;
        else { //Swap songs
            queue.splice(to, 0, queue[from]); //Move element to new position
            queue.splice(from); //Remove old element
        }
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
        if (nowPlaying) {
            lastPlayed.push(nowPlaying);
            nowPlaying = null;
        }
    };
    
    this.undoSongFinishedPlaying = function() {
    //Put the last song in the next played stack
        if (nowPlaying) {
            nextPlayed.unshift(nowPlaying);
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
