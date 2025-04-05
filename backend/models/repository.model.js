import mongoose from "mongoose";

const repositorySchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
  
  },
  repoName: {
    type: String,
    required: true,
  },
  ownerName:{
    type:String,
    required:true,
  }
});

const Repository = mongoose.model("Repository", repositorySchema);

export default Repository;
