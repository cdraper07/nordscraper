const express = require('express');
const bodyParser= require('body-parser')
const cron = require("node-cron")
const fs = require("fs")
const axios = require('axios');
const cheerio = require('cheerio');
const sgMail = require('@sendgrid/mail');
const MongoClient = require('mongodb').MongoClient
const app = express();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
var db;

MongoClient.connect('mongodb+srv://<username>:<password>@nordscraper-62kur.mongodb.net/test', (err, client) => {
  if (err) return console.log(err)
  db = client.db('NordScraper') // whatever your database name is
  app.listen(3000, () => {
    console.log('listening on 3000');
  })
})

app.use(bodyParser.urlencoded({extended: true}))

cron.schedule("0 0 6 1/1 * ? *", function() {
	db.collection('info').find().toArray(function(err, results) {
  		results.forEach(function(e){ 
  			var obj = JSON.parse(e);
  			var url = 'https://www.nordstromrack.com/clearance/Men?sort=featured';
  			sizes = obj.size;
  			sizes.forEach(function(e) {
 				e = e.replace(" ","%20");
  				addition = "&sizes%5B%5D="+e;
 				url+=addition;
			})
  			sendEmails(obj.email,url);
  		})
	})
});

app.get('/', (req, res) => {
 	res.sendFile('C:/Users/Collin/Documents/GitHub/NordScraper/index.html')
 	db.collection('info').find().toArray(function(err, results) {
  		console.log(results)
  		// send HTML file populated with quotes here
	})
})

app.post('/info', (req, res) => {
  db.collection('info').save(req.body, (err, result) => {
    if (err) return console.log(err);

    console.log('saved to database');
    res.redirect('/');
  })
})

function sendEmails(email, url){

	axios.get(url)
	.then(response => {
		
		nombre = [];
		linki = [];
		precio = [];
		const $ = cheerio.load(response.data);
		$('div.product-grid-item__title').each((i, elem) => {
			nombre.push($(elem).text());
		});
		$('a.product-grid-item.product-grid-item--nordstromrack').each((i, elem) => {
			linki.push("https://www.nordstromrack.com/"+$(elem).attr('href'));
		});
		$('div.product-grid-item__sale span').each((i, elem) => {
			precio.push($(elem).text());
		});
		console.log(nombre);
		console.log(linki);
		console.log(precio);
		
		const msg = {
  			to: email,
  			from: email,
  			subject: 'Nordstrom Rack Daily Deals',
  			html: '<a href="'+linki[0]+'">'+nombre[0]+', '+precio[0]+'</a>'+
  				'<br>'+
  				'<a href="'+linki[1]+'">'+nombre[1]+', '+precio[1]+'</a>'+
  				'<br>'+
  				'<a href="'+linki[2]+'">'+nombre[2]+', '+precio[2]+'</a>'+
  				'<br>'+
  				'<a href="'+linki[3]+'">'+nombre[3]+', '+precio[3]+'</a>'+
  				'<br>'+
  				'<a href="'+linki[4]+'">'+nombre[4]+', '+precio[4]+'</a>'+
  				'<br>'+
  				'<a href="'+linki[5]+'">'+nombre[5]+', '+precio[5]+'</a>',
		};
		sgMail.send(msg);
	})
	.catch(error => {
		console.log(error);
	});
}