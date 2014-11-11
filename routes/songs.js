var express   = require('express');
var base64url = require('base64url');
var mime      = require('mime');
var fs        = require('fs');

var router = express.Router();


// /song/{base64url} - returns stream of song (base64url encoded)
router.get('/*', function(req, res) {
    var base64Params = req.params[0];
    var songName = base64url.decode(base64Params);

    if (songName.indexOf('..') > -1 || songName.indexOf('/') > -1 || songName.indexOf('~') > -1) { //Invalid name (trying to access another directory) return 403
        res.status(403).end('403 - Forbidden');
        return;
    }

    try {
        var mimetype = mime.lookup(__dirname + '/../music' + songName);
    } catch(err) { //File does not exist, return 404
        res.status(404).end('404 - Not Found');
        return;
    }

    res.setHeader('Content-disposition', 'attachment; filename=' + songName);
    res.setHeader('Content-type', mimetype);

    var filestream = fs.createReadStream(__dirname + '/../music/' + songName);
    filestream.on('error', function(err) {
        console.log('ERROR creating filestream');
        res.status(404).end(err);
        return;
    });

    filestream.pipe(res);
});

module.exports = router;
