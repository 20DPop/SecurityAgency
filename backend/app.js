const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())
const apiRoutes = require('./src/api');

app.get('/',(req,res)=>{
    res.status(200).json({message: `Salut! API-ul pentru aplciatie functioneaza`})

})

app.use('/api', apiRoutes);

module.exports = app;

