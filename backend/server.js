require('dotenv').config(); 
const app = require('./app');
const config = require('./src/config');
const connectDB = require('./src/config/database');

const startServer = () => {
  app.listen(config.port, () => {
    console.log(`Serverul a pornit și ascultă pe portul ${config.port}`);
  });
};

connectDB().then(() => {
  startServer();
});