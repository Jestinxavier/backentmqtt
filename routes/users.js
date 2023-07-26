var express = require('express');
var router = express.Router();
var io = require('../services/socketio')

/* POST users listing. */
router.post('/', function(req, res) {
  try {
    io.emit("userIdDetails", { data: req.body });
    res.status(200).json({error:false,status:"Submitted Succesfully  :)"}); // Set the status to 200 (OK) to indicate a successful response
  } catch (error) {
    console.error(error);
    res.status(500).json({error:true,status:"bye bye see u take care"}); // Set the status to 500 (Internal Server Error) to indicate an error occurred
  }
});

module.exports = router;
