var express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { ip: '127.0.0.1', port: process.env.PORT || 3000 });
}).post('/', function(req, res) {
    res.json({ message: 'potato' });
});

module.exports = router;
