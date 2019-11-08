require('dotenv').config();
const express = require('express');
const app = express();

// Express.js Routes
const user = require("./routes/user");
// const info = require("./routes/info");

app.use('/user', user);

//Server Init
const port = process.env.PORT || 4125;
const server = app.listen(port, () => {
    console.log(`Server started on port ${server.address().port}`);
});