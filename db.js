const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
})

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack)
  }
  client.query("CREATE TABLE IF NOT EXISTS users (email VARCHAR(30) NOT NULL PRIMARY KEY,name VARCHAR(50) NOT NULL, groups TEXT NOT NULL, password VARCHAR(70) NOT NULL)", (err, result) => {
    if (err) {
      return console.error('Error executing query', err.stack)
    }
    console.log(result.rows)
  })
  // client.query("CREATE TABLE IF NOT EXISTS pdsd (location VARCHAR(30) NOT NULL, co_ords float(4) [], date VARCHAR(10), weather TEXT, situation TEXT, worsen TEXT, D_code CHAR(2), agencyID VARCHAR(36) NOT NULL)", (err, result) => {
  //     release()
  //     if (err) {
  //         return console.error('Error executing query', err.stack)
  //     }
  //     console.log(result.rows)
  // })
})

function adduser(params, callback) {
  return pool.query("INSERT INTO users (email,name,password,groups) VALUES($1,$2,$3,$4)", params, callback);
}

function searchUser(params, callback) {
  return pool.query("SELECT * FROM users WHERE name LIKE '%$1%'", params, callback);
}

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
  addUser: adduser,
  searchuser: searchUser
}