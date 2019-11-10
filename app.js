require('dotenv').config();
const express = require('express');
const app = express();

// Express.js Routes
const user = require("./routes/user");
const group = require("./routes/group");

app.use('/user', user);
app.use('/group', group);
//Server Init
const port = process.env.PORT || 4125;
const server = app.listen(port, () => {
    console.log(`Server started on port ${server.address().port}`);
});