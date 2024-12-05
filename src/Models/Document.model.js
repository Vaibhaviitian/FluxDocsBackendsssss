import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    _id: String,
    title:{
      type:String,
    },
    data: {
      type: Object,
      default: { ops: [{ insert: "" }] },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        permissions: { 
          type: String, 
          enum: ['view', 'edit'], 
          default: 'view'
        }
      },
    ],
    requests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
      },
    ],
  },
  {
    _id: false,
    timestamps: true,
  }
);

export const DocumentModel = mongoose.model("Document", DocumentSchema);
