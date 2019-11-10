const express = require('express');
const router = express.Router();
const postgres = require('../db');
const bcrypt = require('bcrypt');
const token = require('../jwtController');

// Express.js Middlewares
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

// Bcrypt functions 
let hashPwd = (user) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(user.password, 5, (err, hash) => {
      if (err)
        reject(err);
      else {
        resolve(hash);
      }
    });
  });
};

let checkPwd = (password, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, res) => {
      if (res) resolve();
      else reject("Email and Password doesn't match");
    });
  });
}

// PostgreSQL routes
router.post('/register', (req, res) => {
  let info = req.body;
  if (info.email && info.name && info.password) {
    hashPwd(info)
      .then((hash) => {
        return postgres.addUser([info.email, info.name, hash])
      }).then(() => {
        return token.JWTgen(info)
      })
      .then((token) => {
        res.json({ msg: "User registered", token: token });
      }).catch((err) => {
        res.json({ err: "Error adding record", stack: err.stack });
      })
  } else res.status(400).json({ err: "Please send all the details" })
});

router.post('/login', (req, res) => {
  let info = req.body;
  if (info.email && info.password) {
    postgres.query('SELECT password FROM users WHERE email = $1', [info.email])
      .then((result) => {
        return checkPwd(info.password, result.rows[0].password)
      }).then(() => {
        return token.JWTgen(info)
      })
      .then((token) => {
        res.json({ msg: "Signed in successfully", token: token });
      }).catch((err) => {
        res.json({ err: "Sign in error" });
      })
  } else res.status(400).json({ err: "Please send all the details" })
});

router.get('/search', (req, res) => {
  let name = req.query.name;
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const bearer = authHeader.split(' ');
    const authToken = bearer[1];
    if (name)
      token.JWTcheck(authToken).then(() => {
        return postgres.searchuser(name, [], (err, result) => {
          if (err)
            res.json({ err: "Query error", stack: err.stack });
          else
            res.json({ data: result.rows });
        });
      }).catch((err) => {
        res.status(400).json({ err: err });
      })
    else res.status(400);
  } else {
    res.status(401).json({ "msg": "Please include Auth Headers" });
  }
});


// Module Export
module.exports = router;