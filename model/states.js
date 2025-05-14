const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// State schema with improved validation and indexing
const stateSchema = new Schema({
  stateCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true, // Enforce uppercase for consistency
    trim: true, // Trim any leading/trailing spaces
    minlength: 2, // Ensure it's at least 2 characters (state abbreviation)
    maxlength: 2 // State codes should be exactly 2 characters
  },
  funfacts: {
    type: [String],
    validate: [arrayLimit, 'Funfacts array cannot be empty'],
    default: [] // Ensure it starts as an empty array if no fun facts are provided
  }
});

// Helper function to limit funfacts array to avoid incorrect data
function arrayLimit(val) {
  return val.length >= 1; // Make sure at least one fun fact is provided
}

// Create an index on stateCode for better performance
stateSchema.index({ stateCode: 1 });

// Export the model
module.exports = mongoose.model('State', stateSchema, 'funFacts')