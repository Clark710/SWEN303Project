var express = require('express');
var router = express.Router();
var basex = require('basex');
var multer = require('multer');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");

var fileName = "";
var fileUrl = "";

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Colenso Project' });
});

/* GET search page. */
router.get('/search', function(req, res) {
    if(req.query.searchString){
        var array = req.query.searchString.split(" ");
        var queryString = "";
            queryString += array[0];
            if(1 < array.length){
                if(array[1] === "OR"){
                    queryString += "' ftor '";
                    queryString += array[2];
                }else if(array[1] === "AND"){
                    queryString += "' ftand '";
                    queryString += array[2];
                }else if(array[1] === "NOT"){
                    queryString += "' ftand ftnot '";
                    queryString += array[2];
                }else if(array[0] === "NOT"){
                    queryString += "' ftand ftnot '";
                    queryString += array[2];
                }else{
                    queryString += " ";
                    queryString += array[1];
                }
            }
    }
    var query = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
        "for $n in (collection('Colenso')[. contains text '" + queryString + "' using wildcards])" +
        " return db:path($n)";
    client.execute(query,
        function (error, result) {
            if(error) {
                console.error(error);
            }
            else {
                var nResults = (result.result.match(/<\/a>/g) || []).length;
                var splitlist = result.result.split("\n");
                res.render('search', { title: 'Colenso Project', results: splitlist, nResults: nResults});
            }
        }
    );
});

/* GET search page. */
router.get('/xquery', function(req, res) {
    var xquery = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
        "for $n in " + req.query.searchString +
        " return db:path($n)";

    client.execute(xquery,
        function (error, result) {
            if(error) {
                console.error(error);
            }
            else {
                var nResults = (result.result.match(/<\/a>/g) || []).length;
                var splitlist = result.result.split("\n");
                res.render('xquery', { title: 'Colenso Project', results: splitlist, nResults: nResults});
            }
        }
    );
});

/* GET full list of xml files. */
router.get("/browse",function(req,res){
    var query = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
        "for $n in (//title)\n" +
        "where db:path($n) contains text '" + req.query.type + "'" +
        "return db:path($n)";
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
                var name = result.result.match(/<title>[\s\S]*?<\/title>/)[0];
                name = name.replace("<title>", "");
                name = name.replace("</title>", "");
                fileName = req.query.filename;
                fileUrl = req.url;
                res.render('file', { title: 'Colenso Project', fileName: name, data: result.result });
            }
        }
    );
});

/* GET xml file from database. */
router.get('/rawFile', function(req, res) {
    client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
        "(doc('Colenso/"+fileName+"'))[1]",
        function (error, result) {
            if(error) {
                console.error(error);
            }
            else {
                res.render('rawFile', { file: result.result });
            }
        }
    );
});

/* GET download page */
router.get('/download', function(req, res) {
    client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
        "(doc('Colenso/"+fileName+"'))[1]",
        function (error, result) {
            if(error){
                console.error(error);
            }
            else {
                res.writeHead(200, {
                    'Content-Type': 'application/force-download','Content-disposition': 'attachment; filename=' + fileName,
                });

                res.write(result.result);
                res.end();

            }
        });
});

module.exports = router;