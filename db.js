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
    client.query("CREATE TABLE IF NOT EXISTS users (email VARCHAR(30) NOT NULL PRIMARY KEY,name VARCHAR(50), groups TEXT[], password VARCHAR(70) NOT NULL)", (err, result) => {
        if (err) {
            return console.error('Error executing query', err.stack)
        }
        console.log(result.rows)
    })
    client.query("CREATE TABLE IF NOT EXISTS groups (name VARCHAR(50) NOT NULL, id VARCHAR(70) NOT NULL, members TEXT[])", (err, result) => {
        release()
        if (err) {
            return console.error('Error executing query', err.stack)
        }
        console.log(result.rows)
    })
})


// ///////////////////// User Controllers ///////////////////////////
function adduser(params, callback) {
    return pool.query("INSERT INTO users (email, name, password) VALUES($1,$2,$3)", params, callback);
}

function searchUser(name, params, callback) {
    return pool.query("SELECT * FROM users WHERE name ILIKE '%" + name + "%'", params, callback);
}

//////////////////////// Group Controllers ///////////////////////////
function newGroup(params, callback) {
    return pool.query("INSERT INTO groups (id, name) VALUES($1,$2)", params, callback);
}

///////////////// Exports //////////////////
module.exports = {
    query: (text, params, callback) => {
        return pool.query(text, params, callback)
    },
    addUser: adduser,
    searchuser: searchUser,
    newGroup: newGroup
}