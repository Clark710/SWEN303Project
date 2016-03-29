var express = require('express');
var router = express.Router();
var basex = require('basex');
var multer = require('multer');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Colenso Project' });
});

/* GET search page. */
router.get('/search', function(req, res) {
    if(req.query.searchString){
        var array = req.query.searchString.split(" ");
        var queryString = "";
        var i = 0;
        while(i < array.length){
            queryString += array[i];
            ++i;
            if(i < array.length){
                if(array[i] === "AND"){
                    queryString += "' ftand '";
                }else if(array[i] === "OR"){
                    queryString += "' ftor '";
                }else if(array[i] === "NOT"){
                    queryString += "' ftnot '";
                }
            }
            ++i;
        }
    }
    var query = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
        "for $n in (//title[. contains text ' "  + queryString + "'])\n" +
        " return concat('<a href=\"/file?filename=', db:path($n), '\" class=\"searchResult\">', $n, '</a>'," +
        "'<p class=\"searchResult\">', db:path($n), '</p>')";
    client.execute(query,
        function (error, result) {
            if(error) {
                console.error(error);
            }
            else {
                var nResults = (result.result.match(/<\/a>/g) || []).length;
                res.render('search', { title: 'Colenso Project', results: result.result, nResults: nResults});
            }
        }
    );
});

/* GET search page. */
router.get('/xquery', function(req, res) {
    var xquery = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
        "for $n in " + req.query.searchString +
        " return concat('<a href=\"/file?filename=', db:path($n), '\" class=\"searchResult\">', $n, '</a>'," +
        "'<p class=\"searchResult\">', db:path($n), '</p>')";

    client.execute(xquery,
        function (error, result) {
            if(error) {
                console.error(error);
            }
            else {
                var nResults = (result.result.match(/<\/a>/g) || []).length;
                res.render('xquery', { title: 'Colenso Project', results: result.result, nResults: nResults});
            }
        }
    );
});

/* GET full list of xml files. */
router.get("/browse",function(req,res){
    var query = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
        "for $n in (//title)\n" +
        "where db:path($n) contains text '" + req.query.type + "'" +
        "return concat('<a href=\"/file?filename=', db:path($n), '\" class=\"searchResult\">', $n, '</a>'," +
        "'<p class=\"searchResult\">', db:path($n), '</p>')";
    client.execute(query,
        function (error, result) {
            if(error){ console.error(error);}
            else {
                var splitlist = result.result.split("\n");
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
                var fileName = result.result.match(/<title>[\s\S]*?<\/title>/)[0];
                fileName = fileName.replace("<title>", "");
                fileName = fileName.replace("</title>", "");
                res.render('file', { title: 'Colenso Project', fileName: fileName, data: result.result });
            }
        }
    );
});

/* GET xml file from database. */
router.get('/rawFile', function(req, res) {
    var query = "XQUERY doc('Colenso/" + req.query.filename + "')";
    client.execute(query,
        function (error, result) {
            if(error) {
                console.error(error);
            }
            else {
                var url_list = req.url.split('/');
                var url = req.url.replace("/" + url_list[0], url_list[0]);
                res.render('rawFile', { title: 'Colenso Project', data: result.result, url: url });
            }
        }
    );
});

module.exports = router;