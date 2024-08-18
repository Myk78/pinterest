const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/pinterestclone");

// Define the schema for a user
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String
  },
  number: {
    type: String,
    required: true,
    trim: true
  },
  profileImage: {
    type: String, // URL or path to the profile image
    default: ''
  },
  boards: {
    type: Array, // Array of strings to represent board IDs or board names
    default: [] // Default state is an empty array
  }
});
userSchema.plugin(plm);

// Create and export the model
module.exports  = mongoose.model('User', userSchema);

