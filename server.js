const express = require('express');
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
const app = express();

var db;

MongoClient.connect('mongodb+srv://<username>:<password>@nordscraper-62kur.mongodb.net/test', (err, client) => {
  if (err) return console.log(err)
  db = client.db('database-name') // whatever your database name is
  app.listen(3000, () => {
    console.log('listening on 3000');
  })
})

app.use(bodyParser.urlencoded({extended: true}))

app.listen(3000, function() {
 	console.log('listening on 3000');
})

app.get('/', (req, res) => {
 	res.sendFile('C:/Users/Collin/Documents/ServerTest/index.html')
})

app.post('/quotes', (req, res) => {
  db.collection('quotes').save(req.body, (err, result) => {
    if (err) return console.log(err);

    console.log('saved to database');
    res.redirect('/');
  })
})