/* Client side music queue */

function MusicQueue(_library, _queue, _last, _next) {

    var library = _library; //Where all of the song info goes
    var queue = _queue; //Queued music selected by a user
    var lastPlayed = _last; //List of songs last played
    var nextPlayed = _next; //List of songs that will be played next (before queue)

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
        if (nextPlayed.length > 0)
            return nextPlayed[0];
        else if (queue.length > 0)
            return queue[0];
        else
            return -1;
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
        nextPlayed.unshift(libraryID);
    }

    this.getSongInfo = function(libraryID) {
    //Return the song info of the song at library[libraryID]
        return library[libraryID];
    };

    this.playNext = function() {
    //Play the next song in the queue
        if (nextPlayed.length > 0)
            lastPlayed.push(nextPlayed.shift());
        else if (queue.length > 0)
            lastPlayed.push(queue.shift());

        return this.nowPlaying();
    };
    
    this.playPrevious = function() {
    //Play the last song that was played previously (or the current song if there isn't one on the list)
        if (lastPlayed.length > 0)
            nextPlayed.unshift(lastPlayed.pop())
    
        return this.nowPlaying();
    };
}
