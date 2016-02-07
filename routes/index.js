var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var moment = require('moment');
var db = require('../app/db.js');

router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/start', function (req, res) {
  var chatId = crypto.randomBytes(4).toString('hex');
  res.json({ chat_id: chatId });
});

router.get('/messages', function (req, res) {
  var chatId = req.query.chat_id;
  var messages = [];

  db.connection.serialize(function () {
    var statement = db.connection.prepare(
      'SELECT *, time(created_at) AS time FROM (' +
        'SELECT * FROM messages WHERE chat_id = ? ORDER BY id DESC LIMIT 100' +
      ') ORDER by id ASC'
    );
    statement.each(chatId, function (error, row) {
      messages.push(row);
    }, function () {
      res.json({ success: true, messages: messages });
    });
  });
});

router.post('/messages', function (req, res) {
  db.connection.serialize(function () {
    db.connection.run(
      'INSERT INTO messages VALUES (?, ?, ?, ?, ?)',
      null,
      req.body.chat_id,
      req.body.author,
      req.body.message,
      moment().format('YYYY-MM-DD HH:mm:ss')
    );
  });

  res.json({ success: true });
});

module.exports = router;
