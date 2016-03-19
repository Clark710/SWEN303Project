var express = require('express');
var router = express.Router();
var basex = require('basex');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");


router.get("/",function(req,res){
  client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
      " (//name[. = 'James Hector']) ",
      function (error, result) {
        if(error){ console.error(error);}
        else {
          res.render('explore', { title: 'Colenso Project', place: result.result });
        }
      }
  );
});

module.exports = router;
