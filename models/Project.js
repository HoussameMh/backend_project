const mongoose=require('mongoose')

const RewardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  minAmount: { type: Number, required: true }, 
  stock: { type: Number, default: null }, 
  claimers: { type: Number, default: 0 } 
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Technologie', 'Art', 'Solidarité', 'Jeux', 'Santé','Education' ,'Autre'] 
  },
  
  goalAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  
  deadline: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },

  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }, 
  
  rewards: [RewardSchema] ,
  
  backers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  backersCount: {
    type: Number,
    default: 0
  },

  updates: [{
  title: String,
  content: String,
  date: { type: Date, default: Date.now }
}]
});

module.exports = mongoose.model('Project', ProjectSchema);