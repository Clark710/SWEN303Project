var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('explore', { title: 'Colenso Project' });
});
/*router.get('/:colenso', function(req, res, next) {
 // var author = req.params.colenso;
  ar searchtype = req.query.searchtype;
  //query files

  res.render('explore', { title: 'Colenso Project' });
});*/

module.exports = router;
