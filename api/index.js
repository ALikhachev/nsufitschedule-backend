var express = require('express');
var router = express.Router();


// http://localhost:3000/
router.get('/', function(req, res, next) {
    res.status(200)
        .json({
            status: 'success',
            message: 'Live long and prosper!'
        });
});


//////////////////////
// Postgres queries
//////////////////////

var db = require('./queries');

router.get('/api/schedule/:student_id', db.getStudentSchedule);

module.exports = router;