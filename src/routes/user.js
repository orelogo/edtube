const express = require('express');
const db = require('../db');

let router = express.Router();

function getUsers() {
  var getUsers = `SELECT * FROM TubeUser;`;
  return db.any(getUsers);
}

function getVideos() {
  var getVideos = `
    SELECT *
    FROM   TubeUser u, Channel_Owns_BelongsTo c, Video_PostedAt_Contains v
    WHERE  u.uName = c.uName
    AND    c.cName = v.cName
    ;`;
  return db.any(getVideos);
}

function insertNewUser(uName, bio, name, email, address, postalCode) {
    var insertNewUser = `INSERT INTO TubeUser VALUES
    ('${uName}', '${bio}', '${name}', '${email}', '${address}', '${postalCode}');`;
    return db.any(insertNewUser);
}

function updateBiography(uName, bio) {
    var updateBiography = `UPDATE TubeUser SET biography = '${bio}' WHERE uName = '${uName}';`;
    return db.any(updateBiography);
}

function deleteUserVideos(uName) {
    var deleteUserVideos = `DELETE FROM Video_PostedAt_Contains 
    WHERE cName 
    IN (SELECT cName 
        FROM Channel_Owns_BelongsTo
        WHERE uName= '${uName}');`;

    return db.any(deleteUserVideos);
}

function getUserVideos(uName) {
    var sql = `
    SELECT *
    FROM   TubeUser u, Channel_Owns_BelongsTo c, Video_PostedAt_Contains v
    WHERE  u.uName = c.uName
    AND    c.cName = v.cName
    AND    u.uName = '${uName}'
    ;`;
    return db.any(sql);
}

router.get('/', (req, res, next) => {
  console.log('GET user');
  getUsers()
    .then(users => {
      res.render('user', {
        users: users,
        videos: null
    });
  });
});

router.post('/', (req, res, next) => {
  console.log('POST user');
  let html_keys = Object.keys(req.body);
  console.log(html_keys);
  let operation = html_keys[html_keys.length - 1];

  switch (operation) {
    case "insert-user" : insertNewUser(req.body["input-username"], req.body["input-biography"], req.body["input-name"],
            req.body["input-email"], req.body["input-address"], req.body["input-postalcode"])
            .then(getUsers)
            .then(users => {
                res.render('user', {
                    users: users,
                    videos: null
                })});
    break;
    case "update-bio" : updateBiography(req.body["input-username"], req.body["input-bio"])
            .then(getUsers)
            .then(users => {
                res.render('user', {
                    users: users,
                    videos: null
                })
              });
    break;
    case "delete-user-vids" : deleteUserVideos(req.body["input-username"])
        .then(getVideos)
        .then(videos => {
            res.render('user', {
                users: null,
                videos: videos
            })
          });
    break;
    case "get-videos-user" : getUserVideos(req.body["input-username"])
        .then(videos => {
          res.render('user', {
            users: null,
            videos: videos
          })
        });
    break;
  }
});

module.exports = router;
