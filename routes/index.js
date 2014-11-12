var express = require('express');
var os      = require('os');

var router = express.Router();

function privateIP() {
    var interfaces = os.networkInterfaces();
    for (k in interfaces) {
        for (k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal)
                return address.address;
        }
    }
}
/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { ip: privateIP(), port: process.env.PORT || 3000 });
}).post('/', function(req, res) {
    res.json({ message: 'potato' });
});

module.exports = router;
