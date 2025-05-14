const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// State schema 
const stateSchema = new Schema({
  stateCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true, 
    trim: true, // Trim leading/trailing spaces
    minlength: 2, // Ensure at least 2 characters 
    maxlength: 2 // State codes should be 2 characters
  },
  funfacts: {
    type: [String],
    validate: [arrayLimit, 'Funfacts array cannot be empty'],
    default: [] 
  }
});

// Function to limit funfacts array
function arrayLimit(val) {
  return val.length >= 1; // check for >= 1 fact 
}

// Create an index on stateCode
stateSchema.index({ stateCode: 1 });

// Export model
module.exports = mongoose.model('State', stateSchema, 'funFacts')