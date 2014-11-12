/* Server side music queue */

var readDir = require('readdir');
var fs      = require('fs');
var mm      = require('musicmetadata');
var path    = require('path');

function MusicQueue(callback) {
    /* Private functions */
    var parseSong = function(song, cb) {
        //Given a song path, get the song info about the song
        var stream = fs.createReadStream(song);
        var parser = mm(stream);
        var songInfo = {};
    
        parser.on('metadata', function(result) {
            songInfo.name = String(result.title).trim();
    
            if (String(result.artist).trim() == '')
                songInfo.artist = 'Unknown Artist';
            else
                songInfo.artist = String(result.artist).trim();    
    
            if (String(result.album).trim() == '')
                songInfo.album = 'Unknown Album';
            else
                songInfo.album = String(result.album).trim();    
    
            songInfo.path = path.basename(song);
    
            stream.close();
    
            if (typeof cb == "function")
                cb(songInfo)
        });
    };
    
    var getSongListInfo = function(songList, cb) {
        //Get the song info about the entire song list
        var songListInfo = new Array();
        var filesToIgnore = 0; //The .gitignore file, if there is one, and any other unnecessary files
    
        songList.forEach(function(song) {
            if (song == path.join(__dirname, '../music/.gitignore')) { //Don't include the .gitignore file
                filesToIgnore++;
                return;
            }

            parseSong(song, function(songInfo) {
                songListInfo.push({'name': songInfo.name, 'artist': songInfo.artist, 'album': songInfo.album, 'path': songInfo.path});
    
                if (songListInfo.length == songList.length - filesToIgnore && typeof cb == "function")
                    cb(songListInfo);
            });
        });
    };
    /*********************/

    var library; //Where all of the song info goes
    var queue = []; //Queued music selected by a user
    var lastPlayed = []; //List of songs last played
    var nextPlayed = []; //List of songs that will be played next (before queue)

    var songNames = readDir.read(path.join(__dirname, '../music'), null, readDir.ABSOLUTE_PATHS, function(err, data) { 
        if (err)
            throw err;

        getSongListInfo(data, function(songListInfo) {
            library = songListInfo;

            if (typeof callback == "function")
                callback(library);
        });
    });

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
        if (nextPlayed != [])
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
        } catch(e) {
            nowPlayingSong = null;
        }

        return nowPlayingSong;
    };

    this.getSongInfo = function(libraryID) {
    //Return the song info of the song at library[libraryID]
        return library[libraryID];
    };

    this.changeSong = function(libraryID) {
        this.shuffle();
        nextPlayed.unshift(libraryID);
    }

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

module.exports = MusicQueue;
