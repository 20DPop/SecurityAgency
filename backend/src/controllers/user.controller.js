const User = require('../models/user.model');

const createUser = async (req, res) => {
  try {
    const { email, password, role, nume, prenume, profile } = req.body;
    if (role === 'administrator') {
      return res.status(400).json({ message: 'Nu se poate crea un utilizator cu rol de administrator.' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Acest email este deja înregistrat.' });
    }
    const user = await User.create({
      email, password, role, nume, prenume, profile,
      creatDeAdminId: req.user._id,
    });
    res.status(201).json({ _id: user._id, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });

    // Actualizează doar câmpurile trimise în request body
    const updatableFields = ['nume', 'prenume', 'telefon', 'esteActiv', 'profile', 'role'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

const getUsersByRole = async (req, res) => {
  try {
    const role = req.params.role;
    const users = await User.find({ role: role, creatDeAdminId: req.user._id }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};



const createAdminAccount = async (req, res) => {
  try {
    
    const { email, password, nume, prenume,telefon, profile } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Acest email este deja înregistrat.' });
    }

    const adminUser = await User.create({
      email,
      password,
      role: 'admin',
      nume,
      prenume,
      telefon,
      profile,
      creatDeAdminId: req.user._id,
    });

    res.status(201).json({ _id: adminUser._id, email: adminUser.email, role: adminUser.role });
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};
const getUserProfile = (req, res) => {
  res.status(200).json(req.user);
};

const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Parola trebuie să aibă minim 6 caractere." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });

    user.password = newPassword; // va fi criptată automat de pre('save')
    await user.save();

    res.status(200).json({ message: "Parola a fost schimbată cu succes!" });
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};


module.exports = { getUserProfile, createUser, getUsersByRole, createAdminAccount, updateUser, changePassword };

