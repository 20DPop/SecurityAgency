const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
  
  console.log('--- LOGIN ATTEMPT ---');
  console.log('Am primit în body:', req.body);
  console.log('---------------------');


  try {
    const { email, password } = req.body;
     if (!email || !password) {
      return res.status(400).json({ message: 'Te rog introdu email și parolă.' });
    }
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET,            
        { expiresIn: '30d' }               
      );
      res.status(200).json({
        _id: user._id,
        email: user.email,
        nume: user.nume,
        role: user.role,
        token: token,
      });
    } else {
        res.status(401).json({ message: 'Email sau parolă invalidă.' });
    }
  } catch (error) {
     console.error(error);
    res.status(500).json({ message: 'Eroare de server.' });
  }
};

module.exports = {
  loginUser,
};
