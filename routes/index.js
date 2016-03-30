var express = require('express');
var router = express.Router();
var basex = require('basex');
var multer = require('multer');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");

var fileName = "";

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

                console.log("QUERY: " + queryString);
            }
    }
    var query = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
        "for $n in (collection('Colenso')[. contains text ' "  + queryString + "'])\n" +
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
                res.render('file', { title: 'Colenso Project', fileName: name, data: result.result });
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

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, '../Colenso/');
    },
    filename: function (req, file, callback) {
        var extension = file.originalname.substring(file.originalname.lastIndexOf('.')+1);
        if(extension != "xml"){
            callback("Requires filetype to be of xml format", null);
        }
        else{
            callback(null, req.body.directory + file.originalname);
            //fs.mkdirSync('../Colenso/' + req.body.directory);
        }
    }
});

var upload = multer({storage:storage}).single('xmlFile');
router.post('/contribute', function(req,res){
    upload(req,res, function(err){
        if(err){
            res.render('contribute', { title: 'Colenso Project', message: err})
        }
        else{
            var path = "Colenso/diary/";
            client.execute('ADD TO ' + path + '"', function (error, result) {
                console.log(path);
                if(error){
                    console.error(error);
                }
            });
            res.render('contribute', { title: 'Colenso Project', message: 'Successful upload of file'})
        }
    });
});

router.get('/contribute', function(req,res){
    res.render('contribute', {title: 'Colenso Project', message:""})
});

module.exports = router;