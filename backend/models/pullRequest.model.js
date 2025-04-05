import mongoose from "mongoose";

const pullRequestSchema = new mongoose.Schema({
  githubId: {
    type: Number,
    required: true,
    unique: true, // Unique GitHub identifier for the PR
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    enum: ["open", "closed", "merged"], // Common PR states
    default: "open",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  closedAt: {
    type: Date,
  },
  mergedAt: {
    type: Date,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repository", // Reference to the Repository model
    required: true,
  },
  summary: {
    type: String,
  },
});

const PullRequest = mongoose.model("PullRequest", pullRequestSchema);

export default PullRequest;