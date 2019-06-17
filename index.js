const axios = require('axios');
const cheerio = require('cheerio');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



url = 'https://www.nordstromrack.com/clearance/Men?sort=featured';

sizes = ["9","9.5","Waist 30","Waist 29","S","M"];

sizes.forEach(function(e) {
  e = e.replace(" ","%20");
  addition = "&sizes%5B%5D="+e;
  url+=addition;
});

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
  			to: '###email###',
  			from: '###email###',
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