const express = require('express');
const db = require('../db');

let router = express.Router();

function getPlaylist() {
  var sql = `SELECT * FROM Playlist_Creates;`;
  return db.any(sql);
}

function deletePlaylist(pName, uName) {
    var playlistToDelete = `DELETE FROM Playlist_Creates WHERE pName = '${pName}' AND uName = '${uName}';`;
    return db.any(playlistToDelete);
}

function getVideosInPlaylist(pName, uName) {
  var playlistToGet = `SELECT Video_PostedAt_Contains.vID AS vID, Video_PostedAt_Contains.description, Video_PostedAt_Contains.playtime
    FROM Video_PostedAt_Contains
    INNER JOIN PartOf ON PartOf.vID=Video_PostedAt_Contains.vID
    WHERE PartOf.uName = '${uName}' AND PartOf.pName = '${pName}'`;
  return db.any(playlistToGet);
}

function getNumVideosPerChannel(pName, uName) {
  var playlistToGetChannelsFor = `SELECT Count(*), Video_PostedAt_Contains.cName
    FROM PartOf
    INNER JOIN Video_PostedAt_Contains ON PartOf.vID=Video_PostedAt_Contains.vID
    WHERE PartOf.pName = '${pName}' AND PartOf.uName = '${uName}'
    GROUP BY Video_PostedAt_Contains.cName;`;
  return db.any(playlistToGetChannelsFor);
}

function getDataAndRender(res) {
  Promise.all([getPlaylist()])
    .then(([playlists]) => {
      res.render('playlist', {
        playlists: playlists,
      });
  });
}

router.get('/', (req, res, next) => {
  console.log('GET playlist');
  getPlaylist()
    .then(([allPlaylists]) => {
      res.render('playlist', {
        numPerChan: null,
        vidsInPlaylist: null,
        allPlaylists: allPlaylists
      })})
});

router.post('/', (req, res, next) => {
  console.log('POST example');

  let html_keys = Object.keys(req.body);
  console.log(html_keys);
  let operation = html_keys[html_keys.length - 1];

  switch (operation) {
    case "get-num-vids-per-channel-in-playlist" :
      getNumVideosPerChannel(req.body["input-pname"], req.body["input-uname"])
            .then(numPerChan => {
              res.render('playlist', {
                numPerChan: numPerChan,
                vidsInPlaylist: null,
                allPlaylists: null
              })})
            .catch((err) => console.log(err));
    break;
    case "get-vids-from-playlist" :
      getVideosInPlaylist(req.body["input-pname"], req.body["input-uname"])
            .then(vidsInPlaylist => {
              res.render('playlist', {
                numPerChan: null,
                vidsInPlaylist: vidsInPlaylist,
                allPlaylists: null
              })})
            .catch((err) => console.log(err));
    break;
    case "delete-playlist" :
      deletePlaylist(req.body["input-pname"], req.body["input-uname"])
            .then(allPlaylists => {
              res.render('playlist', {
                numPerChan: null,
                vidsInPlaylist: null,
                allPlaylists: allPlaylists
              })})
            .catch((err) => console.log(err));
    break;
  }

});

module.exports = router;
