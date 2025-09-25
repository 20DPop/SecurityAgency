// const express = require('express')
// const cors = require('cors')

// const app = express()
// app.use(cors())
// app.use(express.json())
// const apiRoutes = require('./src/api');

// app.get('/',(req,res)=>{
//     res.status(200).json({message: `Salut! API-ul pentru aplciatie functioneaza`})

// })

// app.use('/api', apiRoutes);

// module.exports = app;
const express = require('express')
const cors = require('cors')
const path = require('path') // adaugă path

const app = express()
app.use(cors())
app.use(express.json())

// Servește fișierele statice din uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))) 
// sau dacă folderul e în backend/uploads:
// app.use('/uploads', express.static(path.join(__dirname, 'src', '..', 'uploads')))

const apiRoutes = require('./src/api');

app.get('/', (req, res) => {
    res.status(200).json({ message: `Salut! API-ul pentru aplciatie functioneaza` })
})

app.use('/api', apiRoutes);

module.exports = app;

