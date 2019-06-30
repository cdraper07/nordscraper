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
var path = require('path');
var name;

MongoClient.connect('mongodb+srv://collindraper07:skinnyboy@nordscraper-62kur.mongodb.net/test', (err, client) => {
  if (err) return console.log(err)
  db = client.db('NordScraper')
  app.listen(3000, () => {
    console.log('listening on 3000');
  })
})

app.use(bodyParser.urlencoded({extended: true}))

cron.schedule("0 8 * * *", function() {
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
 	res.sendFile(path.join(__dirname, 'index.html'));
 	db.collection('info').find().toArray(function(err, results) {
  		console.log(results)
	})
})

app.get('/info', (req, res) => {
 	res.sendFile(path.join(__dirname, 'info.html'));
})

app.get('/name', function(req, res) {
  res.send(name);
});

app.post('/info', (req, res) => {
  name=req.body.name;
  db.collection('info').save(req.body, (err, result) => {
    if (err) return console.log(err);

    console.log('saved to database');
    res.redirect('/info');
  })
})

function sendEmails(email, url){

	axios.get(url)
	.then(response => {
		
		names = [];
		links = [];
		prices = [];
		const $ = cheerio.load(response.data);
		$('div.product-grid-item__title').each((i, elem) => {
			names.push($(elem).text());
		});
		$('a.product-grid-item.product-grid-item--nordstromrack').each((i, elem) => {
			links.push("https://www.nordstromrack.com/"+$(elem).attr('href'));
		});
		$('div.product-grid-item__sale span').each((i, elem) => {
			prices.push($(elem).text());
		});
		console.log(names);
		console.log(links);
		console.log(prices);
		
		const msg = {
  			to: email,
  			from: email,
  			subject: 'Nordstrom Rack Daily Deals',
  			html: '<a href="'+links[0]+'">'+names[0]+', '+prices[0]+'</a>'+
  				'<br>'+
  				'<a href="'+links[1]+'">'+names[1]+', '+prices[1]+'</a>'+
  				'<br>'+
  				'<a href="'+links[2]+'">'+names[2]+', '+prices[2]+'</a>'+
  				'<br>'+
  				'<a href="'+links[3]+'">'+names[3]+', '+prices[3]+'</a>'+
  				'<br>'+
  				'<a href="'+links[4]+'">'+names[4]+', '+prices[4]+'</a>'+
  				'<br>'+
  				'<a href="'+links[5]+'">'+names[5]+', '+prices[5]+'</a>',
		};
		sgMail.send(msg);
	})
	.catch(error => {
		console.log(error);
	});
}