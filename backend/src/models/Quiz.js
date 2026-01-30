const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  languages: [{ type: String, default: ['english'] }],
  content: {
    type: Map,
    of: {
      title: { type: String },
      description: { type: String },
      questions: [{
        questionText: { type: String },
        options: [{
          text: { type: String },
          type: { type: String, enum: ['In-Charge', 'In-Control'], required: true }
        }]
      }]
    }
  },
  // Legacy fields for backward compatibility
  title: { type: String }, 
  description: { type: String },
  questions: [{
    questionText: { type: String },
    options: [{
      text: { type: String },
      type: { type: String, enum: ['In-Charge', 'In-Control'] }
    }]
  }],
  status: { 
    type: String, 
    enum: ['DRAFT', 'APPROVED', 'ACTIVE', 'ARCHIVED'], 
    default: 'DRAFT' 
  },
  generatedBy: { 
    type: String, 
    enum: ['MANUAL', 'AI'], 
    default: 'MANUAL' 
  },
  requiresAdminApproval: { type: Boolean, default: false },
  activeDate: { type: Date } 
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
