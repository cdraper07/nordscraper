import express from 'express';
const app = express()
app.set('view engine', 'pug')
app.get('/', (req, res) => {
    res.render('index')
})
app.listen(5656, () => {
    console.log('http://localhost:5656')
})