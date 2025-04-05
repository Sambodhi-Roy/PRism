import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";
import UserRepo from "../models/userRepo.model.js";
import Repository from "../models/repository.model.js";
import axios from "axios";
import { decrypt } from "../utils/crypto.js";

const fetchRepositoryDataViaLink=async(req,res)=>{
    try {
        console.log("inside fetch repository data via link");  
        const { repositoryLink } = req.body; 
        
        const { userId: clerkId } = getAuth(req);
        if (!clerkId) {
        return res.status(401).json({ error: "Clerk id not found." });
        }
    
        const user = await User.findOne({ clerkId });
        if (!user) {
        return res.status(404).json({ error: "User not found." });
        }
        console.log("user", user);
    
        
        console.log("repository link", repositoryLink);
        
        if (!repositoryLink) {
        return res.status(400).json({ error: "Repository link is required." });
        }
    
        const repoName = repositoryLink.split("/").slice(-2).join("/");
        console.log("repo name", repoName);

        const encryptedToken = decrypt(user.githubAccessToken);
        console.log("decrypted token", encryptedToken);
    
        const response = await axios.get(`https://api.github.com/repos/${repoName}`, {
        headers: {
            Authorization: `token ${encryptedToken}`,
            Accept: "application/vnd.github.v3+json",
        },
        });
        console.log(response);
        

        //storing the repo data in the database
        const repo=await Repository.create({
          githubId: response.data.id,
          repoName: response.data.name,
          ownerName: response.data.owner.login,

        });
        const userRepo=await UserRepo.create({
          user:user._id,
          repository:repo._id,
        })
    
        console.log("response", response.data);

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching repository data:", error);
        res.status(500).json({ error: "Failed to fetch repository data." });
    }


}


const getUserRepositories = async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const userRepos = await UserRepo.find({ user: user._id }).populate("repository");

    const repos = userRepos.map((ur) => ur.repository); // Extract actual repo data

    res.status(200).json(repos);
  } catch (error) {
    console.error("Error fetching user repositories:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export {fetchRepositoryDataViaLink ,getUserRepositories};