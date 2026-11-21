const express = require('express');
const cors = require('cors');
const cors = require('morgan');
const path = require('path');
require('dotenv').config({path: './config.env'});
const {MongoClient} = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const API_URL = "https://m01038115-skillnest.onrender.com";

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use(function(request, response, next){
    console.log(`Incoming ${request.method} request to ${request.url}`);
    next();
})

app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(port, function() {
    console.log("app started on port " + port);
});