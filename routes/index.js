var express = require('express');
var router = express.Router();
var basex = require('basex');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Colenso Project' });
});

/* GET search page. */
router.get('/search', function(req, res) {
    var query = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
        "for $t in (//title[. contains text '" + req.query.searchString + "'])\n" +
        "return concat('<a href=\"/file?filename=', db:path($t), '\" class=\"searchResult\">', $t, '</a>'," +
        "'<p class=\"searchResult\">', db:path($t), '</p>')";

    client.execute(query,
        function (error, result) {
            if(error) {
                console.error(error);
            }
            else {
                res.render('search', { title: 'Colenso Project', results: result.result});
            }
        }
    );
});

/* GET full list of xml files. */
router.get("/browse",function(req,res){
    client.execute("XQUERY db:list('Colenso')",
        function (error, result) {
            if(error){ console.error(error);}
            else {
                var splitlist = result.result.split("\n")
                res.render('browse', { title: 'Colenso Project', place: splitlist });
            }
        }
    );
});

/* GET xml file from database. */
router.get('/file', function(req, res) {
    var query = "XQUERY doc('Colenso/" + req.query.filename + "')";
    client.execute(query,
        function (error, result) {
            if(error) {
                console.error(error);
            }
            else {
                res.render('file', { title: 'Colenso Project', data: result.result });
            }
        }
    );
});

module.exports = router;