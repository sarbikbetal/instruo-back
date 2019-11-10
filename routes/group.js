const express = require('express');
const uuid = require('uuid/v4');
const router = express.Router();
const postgres = require('../db');
const token = require('../jwtController');

// Express.js Middlewares
router.use(express.json());
router.use(express.urlencoded({ extended: false }));


// PostgreSQL routes
router.post('/new', (req, res) => {
  let info = req.body;
  let creator;
  let gid = uuid();
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const bearer = authHeader.split(' ');
    const authToken = bearer[1];
    token.JWTcheck(authToken).then((cre) => {
      creator = cre;
      console.log(cre);

      return postgres.query("UPDATE users SET groups = array_cat(groups, '{" + gid + "}') WHERE email = $1", [cre])
    }).then(() => {
      return postgres.newGroup([gid, info.gname])
    }).then(() => {
      return postgres.query("UPDATE groups SET members = array_cat(members, '{" + creator + "}') where id = $1", [gid])
    }).then(() => {
      res.json({ msg: "New group created", gid: gid });
    }).catch((err) => {
      res.json({ err: "Error adding group", stack: err.stack });
    });
  } else {
    res.status(401).json({ "msg": "Please include Auth Headers" });
  }
})

router.post('/add', (req, res) => {
  let info = req.body;
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const bearer = authHeader.split(' ');
    const authToken = bearer[1];
    token.JWTcheck(authToken).then(() => {
      return postgres.query("UPDATE users SET groups = array_cat(groups, '{" + info.gid + "}') WHERE email = $1", [info.member])
    }).then(() => {
      return postgres.query("UPDATE groups SET members = array_cat(members, '{" + info.member + "}') where id = $1", [info.gid])
    }).then(() => {
      res.json({ msg: "New member added" });
    }).catch((err) => {
      res.json({ err: "Error adding group", stack: err.stack });
    });
  } else {
    res.status(401).json({ "msg": "Please include Auth Headers" });
  }
})

router.post('/members', (req, res) => {
  let info = req.body;
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const bearer = authHeader.split(' ');
    const authToken = bearer[1];
    token.JWTcheck(authToken).then(() => {
      return postgres.query("SELECT members FROM groups WHERE id = $1", [info.gid])
    }).then((result) => {
      res.json({ data: result.rows });
    }).catch((err) => {
      res.json({ err: "Error adding group", stack: err.stack });
    });
  } else {
    res.status(401).json({ "msg": "Please include Auth Headers" });
  }
})
// router.get('/search', (req, res) => {
//   let name = req.query.name;
//   if (name)
//     postgres.searchuser(name, [], (err, result) => {
//       if (err)
//         res.json({ err: "Query error", stack: err.stack });
//       else
//         res.json({ data: result.rows });
//     })
//   else res.sendStatus(400);
// });

router.get('/all', (req, res) => {
  postgres.query('SELECT * FROM groups', [], (err, result) => {
    if (err)
      res.json({ msg: "Error retrieving record", stack: err.stack });
    else
      res.json(result.rows);
  });
});

// Module Export
module.exports = router;