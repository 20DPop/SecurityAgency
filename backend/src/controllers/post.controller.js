const Post = require('../models/post.model');
const {v4: uuidv4} = require('uuid');

const createPost = async (req, res)=>{
    try{
        const { nume_post, adresa_post, beneficiaryId} = req.body;
        const newPost = await Post.create({
            nume_post,
            adresa_post,
            beneficiaryId,
            qr_code_identifier: uuidv4(),
            createdByAdminId: req.user._id,
        });
        res.status(201).json(newPost)
    }catch(error){
        res.status(500).json({ message: `Eroare de server: ${error.message}` });
    }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ createdByAdminId: req.user._id });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Eroare de server.' });
  }
};

module.exports = { createPost, getPosts };

