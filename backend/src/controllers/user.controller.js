const User = require('../models/user.model');

const createUser = async (req, res) => {
  try {
    const { email, password, role, nume, prenume, telefon, profile } = req.body;

    if (role === 'administrator') {
      return res.status(400).json({ message: 'Nu se poate crea un utilizator cu rol de administrator.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Acest email este deja înregistrat.' });
    }

    const user = await User.create({
      email,
      password,
      role,
      nume,
      prenume,
      telefon,          // 🔥 acum se salvează
      profile: {
        ...profile,
        assignedPazniciIds: profile?.assignedPazniciIds || [],
        punct_de_lucru: profile?.punct_de_lucru || []
      },
      creatDeAdminId: req.user._id,
    });

    res.status(201).json({ _id: user._id, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

// const updateUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });

//     // Actualizează doar câmpurile trimise în request body
//     const updatableFields = ['nume', 'prenume', 'telefon', 'esteActiv', 'profile', 'role', 'email'];
//     updatableFields.forEach(field => {
//       if (req.body[field] !== undefined) user[field] = req.body[field];
//     });

//     await user.save();
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(500).json({ message: `Eroare de server: ${error.message}` });
//   }
// };

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });

    // Actualizare câmpuri simple
    const simpleFields = ['nume', 'prenume', 'telefon', 'esteActiv', 'role', 'email'];
    simpleFields.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    // Actualizare profile
    if (req.body.profile) {
      if (req.body.profile.nume_companie !== undefined) {
        user.profile.nume_companie = req.body.profile.nume_companie;
      }

      // Dacă trimitem un array complet de puncte de lucru
      if (Array.isArray(req.body.profile.punct_de_lucru)) {
        user.profile.punct_de_lucru = req.body.profile.punct_de_lucru.filter(Boolean);
      }

      // Dacă trimitem un punct de lucru nou ca string
      else if (typeof req.body.profile.punct_de_lucru === 'string' && req.body.profile.punct_de_lucru.trim() !== '') {
        user.profile.punct_de_lucru.push(req.body.profile.punct_de_lucru.trim());
      }
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });
    }

    await user.deleteOne();
    res.status(200).json({ message: "Utilizator șters cu succes!" });
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

const getUsersByRole = async (req, res) => {
  try {
    const role = req.params.role;
    const users = await User.find({ role: role }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

const getBeneficiari = async (req, res) => {
  try {
    const beneficiari = await User.find({ role: 'beneficiar' })
      .select('nume prenume profile.nume_companie');
    res.status(200).json(beneficiari);
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
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


module.exports = { getUserProfile, createUser, getUsersByRole, createAdminAccount, updateUser, changePassword, deleteUser, getBeneficiari };

