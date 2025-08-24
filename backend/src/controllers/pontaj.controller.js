const Pontaj = require('../models/pontaj.model');
const Post = require('../models/post.model');

const checkIn = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const paznicId = req.user._id;

    const post = await Post.findOne({ qr_code_identifier: qrCode });
    if (!post) {
      return res.status(404).json({ message: 'Cod QR invalid sau post inexistent.' });
    }
    const pontajDeschis = await Pontaj.findOne({ paznicId, ora_iesire: null });
    if (pontajDeschis) {
      return res.status(400).json({ message: 'Aveți deja o tură activă.' });
    }
    
    const newPontaj = await Pontaj.create({
      paznicId,
      postId: post._id,
      ora_intrare: new Date(),
    });

    res.status(201).json({ message: 'Check-in efectuat cu succes!', pontaj: newPontaj });
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

const checkOut = async (req, res) => {
  try {
    const paznicId = req.user._id;
    const pontajActiv = await Pontaj.findOneAndUpdate(
      { paznicId: paznicId, ora_iesire: null },
      { ora_iesire: new Date() },
      { new: true } 
    );

    if (!pontajActiv) {
      return res.status(404).json({ message: 'Nu a fost găsită nicio tură activă pentru check-out.' });
    }
    res.status(200).json({ message: 'Check-out efectuat cu succes!', pontaj: pontajActiv });
  } catch (error) {
    res.status(500).json({ message: `Eroare de server: ${error.message}` });
  }
};

module.exports = { checkIn, checkOut };