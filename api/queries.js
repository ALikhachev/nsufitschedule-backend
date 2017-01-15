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
    const uid = parseInt(req.params.student_id);
    let evenWeek = false;
    if ('week' in req.query) {
        evenWeek = req.query.week == 'true';
    }
    db.any(`SELECT
	            *
            FROM
	            student_full_schedule
            WHERE
	            (week = ${evenWeek} OR week IS NULL) AND (student_id = ${uid}
		            OR group_id = (
				        SELECT
					        "group".id
				        FROM
					        "group"
						        JOIN student ON (student.group_id = "group".id)
				        WHERE student.id = ${uid}
			        )
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

function getStudentGroups(req, res, next) {
    db.any('SELECT student.id, student_name, group_name FROM student JOIN "group" ON (student.group_id = "group".id) ' +
        'ORDER BY group_name ASC, student_name ASC')
        .then(function (data) {
            let groups = {};
            data.forEach(function (entry) {
                console.log(entry);
                if (!groups[entry.group_name]) {
                    groups[entry.group_name] = [];
                }
                groups[entry.group_name].push({
                    id: entry.id,
                    student_name: entry.student_name
                });
            });
            res.status(200)
                .json({
                    status: 'success',
                    data: groups
                });
        })
        .catch(function (err) {
            console.log(err);
            return next(err);
        });
}


/////////////
// Exports
/////////////

module.exports = {
    getStudentSchedule: getStudentSchedule,
    getStudentGroups: getStudentGroups
};