const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/pinterestclone");

// Define the schema for a user
const userSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  postImage: {
    type: String, // URL or path to the profile image
    default: ''
  },
});

// Create and export the model
module.exports  = mongoose.model('Post', userSchema);

