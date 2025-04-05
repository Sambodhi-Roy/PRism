import mongoose from "mongoose";

const userRepoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true
  },
});

// Ensure that each user-repo pair is unique


const UserRepo = mongoose.model('UserRepo', userRepoSchema);

export default UserRepo;