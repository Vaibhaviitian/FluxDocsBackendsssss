import mongoose, { mongo } from "mongoose";

const Requesterschema = new mongoose.Schema(
  {
    document: {
      type: String, 
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    permission: {
      type: String,
      enum: ["view", "edit"],
      default: "view", 
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const requestmodel=mongoose.model("Request",Requesterschema);