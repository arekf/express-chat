var sqlite3 = require('sqlite3').verbose();
var dbFileName = 'db/development.sqlite';
var db = new sqlite3.Database(dbFileName);

module.exports = {
  connection: db,
  fileName: dbFileName
};
