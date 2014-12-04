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
    var nowPlaying = null; //Song now playing

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
        var fromObject = queue[from];
        queue.splice(from, 1); //Remove old element
        queue.splice(to, 0, fromObject); //Move element to new position
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

    this.getSongInfo = function(libraryID) {
    //Return the song info of the song at library[libraryID]
        return library[libraryID];
    };

    this.changeSong = function(libraryID) {
        this.shuffle();
        nowPlaying = libraryID;
    }

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
            nextPlayed.unshift(nowPlaying)
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

module.exports = MusicQueue;
