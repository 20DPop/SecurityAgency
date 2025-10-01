const User = require('../models/user.model');

// @desc    Creează un utilizator nou (paznic, beneficiar)
// @access  Privat (admin, administrator)
const createUser = async (req, res) => {
  try {
    const { email, password, role, nume, prenume, telefon, profile } = req.body;

    // Un admin nu poate crea un 'administrator' din formularul general
    if (role === 'administrator') {
      return res.status(400).json({ message: 'Nu se poate crea un utilizator cu rol de administrator prin acest formular.' });
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
      telefon,
      profile,
      creatDeAdminId: req.user._id,
    });

    // Trimitem un răspuns curat, fără date sensibile
    res.status(201).json({ _id: user._id, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

// @desc    Creează un cont nou de tip 'admin'
// @access  Privat (doar administrator)
const createAdminAccount = async (req, res) => {
  try {
    const { email, password, nume, prenume, telefon, profile } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Acest email este deja înregistrat.' });
    }

    const adminUser = await User.create({
      email,
      password,
      role: 'admin', // <<<--- CORECTURĂ APLICATĂ AICI
      nume,
      prenume,
      telefon,
      profile,
      creatDeAdminId: req.user._id, // Se salvează cine l-a creat (administratorul curent)
    });

    res.status(201).json({ _id: adminUser._id, email: adminUser.email, role: adminUser.role });
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

// @desc    Actualizează datele unui utilizator
// @access  Privat (admin, administrator)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
    }

    // Câmpuri de bază
    const simpleFields = ['nume', 'prenume', 'telefon', 'esteActiv', 'role', 'email'];
    simpleFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Câmpuri din profil
    if (req.body.profile) {
      if (req.body.profile.nume_companie !== undefined) {
        user.profile.nume_companie = req.body.profile.nume_companie;
      }
      // Actualizează complet array-ul de puncte de lucru
      if (Array.isArray(req.body.profile.punct_de_lucru)) {
        user.profile.punct_de_lucru = req.body.profile.punct_de_lucru.filter(Boolean); // Elimină string-urile goale
      }
      // Adaugă un singur punct de lucru nou
      else if (typeof req.body.profile.punct_de_lucru === 'string' && req.body.profile.punct_de_lucru.trim() !== '') {
        if (!user.profile.punct_de_lucru.includes(req.body.profile.punct_de_lucru.trim())) {
          user.profile.punct_de_lucru.push(req.body.profile.punct_de_lucru.trim());
        }
      }
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

// @desc    Șterge un utilizator
// @access  Privat (admin, administrator)
const deleteUser = async (req, res) => {
  try {
    // Verificare 1: Un utilizator nu se poate șterge pe sine
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "Nu vă puteți șterge propriul cont." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });
    }
    
    // Verificare 2: Protecție pentru a nu șterge ultimul cont de 'administrator'
    if (user.role === 'administrator') {
        const adminCount = await User.countDocuments({ role: 'administrator' });
        if (adminCount <= 1) {
            return res.status(400).json({ message: "Acțiunea a fost blocată. Nu se poate șterge ultimul cont de administrator." });
        }
    }

    await user.deleteOne();
    res.status(200).json({ message: "Utilizator șters cu succes!" });
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

// @desc    Obține utilizatori după rol, cu logică diferențiată
// @access  Privat (admin, administrator)
const getUsersByRole = async (req, res) => {
  try {
    const role = req.params.role;
    let query = { role: role };

    // Dacă cel care face cererea este un 'admin' (de agenție),
    // îi arătăm doar utilizatorii creați de el.
    if (req.user.role === 'admin') {
      query.creatDeAdminId = req.user._id;
    }
    
    // Un 'administrator' va vedea toți utilizatorii cu rolul specificat,
    // deoarece filtrul `creatDeAdminId` nu se aplică pentru el.
    
    const users = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

// @desc    Obține lista tuturor beneficiarilor (pentru dropdown-uri, etc.)
// @access  Privat
const getBeneficiari = async (req, res) => {
  try {
    // Această funcție ar trebui să returneze toți beneficiarii, indiferent de cine îi cere
    // (atâta timp cât utilizatorul e logat și autorizat de rută).
    // Filtrul `creatDeAdminId` nu se aplică aici pentru a permite, de ex, unui paznic
    // să vadă numele firmei la care e alocat, chiar dacă nu a fost creat de același admin.
    const beneficiari = await User.find({ role: 'beneficiar' })
      .select('nume prenume profile.nume_companie');
    res.status(200).json(beneficiari);
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};

// @desc    Obține profilul utilizatorului logat
// @access  Privat
const getUserProfile = (req, res) => {
  // `req.user` este populat de middleware-ul `protect`
  res.status(200).json(req.user);
};

// @desc    Schimbă parola unui utilizator (folosită de admin/administrator)
// @access  Privat (admin, administrator)
const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Parola trebuie să aibă minim 6 caractere." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });
    }

    // Criptarea se face automat datorită hook-ului pre-save din user.model.js
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Parola a fost schimbată cu succes!" });
  } catch (error) {
    res.status(500).json({ message: `Eroare server: ${error.message}` });
  }
};


module.exports = { 
  getUserProfile, 
  createUser, 
  getUsersByRole, 
  createAdminAccount, 
  updateUser, 
  changePassword, 
  deleteUser, 
  getBeneficiari 
};