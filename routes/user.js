const express = require('express');
const uuid = require('uuid/v4');
const router = express.Router();
const postgres = require('../db');


// Express.js Middlewares
router.use(express.json());
router.use(express.urlencoded({ extended: false }));


// PostgreSQL routes
router.post('/register', (req, res) => {
  let info = req.body;
  postgres.addUser([info.email, info.name, info.password, "{}"], (err, result) => {
    if (err)
      res.json({ err: "Error adding record", stack: err.stack });
    else
      res.json({ msg: "User registered" });
  });
});

// router.get('/pg/info', (req, res) => {
//   if (req.query.key) {
//     let key = req.query.key
//     postgres.query('SELECT * FROM agencies WHERE apikey = $1', [key], (err, result) => {
//       if (err)
//         res.json({ msg: "Error retrieving record", stack: err.stack });
//       else
//         res.json(result.rows);
//     });
//   } else {
//     res.sendStatus(401);
//   }
// });

router.get('/all', (req, res) => {
  postgres.query('SELECT * FROM users', [], (err, result) => {
    if (err)
      res.json({ msg: "Error retrieving record", stack: err.stack });
    else
      res.json(result.rows);
  });
});

// Module Export
module.exports = router;