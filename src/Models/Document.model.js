import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  _id: String,
  data: {
    type: Object,
    default: { ops: [{ insert: '' }] }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  _id: false,
  timestamps: true 
});

export const DocumentModel = mongoose.model("Document", DocumentSchema);