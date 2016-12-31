var promise = require('bluebird');

var options = {
    // Initialization Options
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var db_user = process.env.DB_USER;
var db_name = process.env.DB_NAME;
var db_pwd = process.env.DB_PWD;
var connectionString = `postgres://${db_user}:${db_pwd}@horton.elephantsql.com:5432/${db_name}`;
var db = pgp(connectionString);


/////////////////////
// Query Functions
/////////////////////

function getStudentSchedule(req, res, next) {
    var uid = parseInt(req.params.student_id);
    db.any(`SELECT
	            *
            FROM
	            student_full_schedule
            WHERE
	            student_id = ${uid}
		            OR group_id = (
				        SELECT
					        "group".id
				        FROM
					        "group"
						        JOIN student ON (student.group_id = "group".id)
				        WHERE student.id = ${uid}
			        )`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data
                });
        })
        .catch(function (err) {
            return next(err);
        });
}


/////////////
// Exports
/////////////

module.exports = {
    getStudentSchedule: getStudentSchedule
};