import mongoose from "mongoose";

const pullRequestSchema = new mongoose.Schema({
  githubId: {
    type: Number,
    required: true,
     // Unique GitHub identifier for the PR
  },
  prNumber: {
    type: Number,
    required: true, // GitHub PR number (used in API requests)
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
  diff: {
    type: String,
  },
  diffSummary: {
    type: String,
  },
  commitMessages: {
    type: [String],
    default: [],
  },
  additions: {
    type: Number,
    default: 0,
  },
  deletions: {
    type: Number,
    default: 0,
  },
  commits: {
    type: Number,
    default: 0,
  },
  changedFiles: {
    type: Number,
    default: 0,
  },
  summary: {
    type: String,
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repository",
    required: true,
  },
});

const PullRequest = mongoose.model("PullRequest", pullRequestSchema);

export default PullRequest;
