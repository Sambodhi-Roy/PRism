import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";
import axios from "axios";
import { encrypt } from "../utils/crypto.js"; // Assuming you have an encrypt function

const githubCallback = async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const { id, login } = userRes.data;
    const clerkId = getAuth(req).userId;

    if (!clerkId) {
      return res.status(401).json({ error: "Clerk id not found",id:id,login:login });
    }

    const encryptedToken = encrypt(accessToken);
    console.log("encrypted token", encryptedToken);

    const user = await User.findOneAndUpdate(
      { clerkId },
      {
        clerkId,
        githubId: id,
        username: login,
        githubAccessToken: encryptedToken,
      },
      { upsert: true, new: true }
    );
    console.log("Frontend url:",process.env.FRONTEND_URL);
    
    const redirectUrl = `${process.env.FRONTEND_URL}/dashboard`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "GitHub OAuth failed" });
  }
};

const loginUser = async (req, res) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_CALLBACK_URL; // e.g., http://localhost:3000/callback
    const scope = "read:user repo";

    const githubAuthUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&scope=${scope}`;

    res.redirect(githubAuthUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

const checkGithubAuth = async (req, res) => {
  try {
    const clerkId = getAuth(req).userId;
    if (!clerkId) {
      return res.status(401).json({ error: "Clerk id not found" });
    }

    const user = await User.findOne({ clerkId });

    if (user) {
      return res.status(200).json({ message: "User found." });
    } else {
      return res.status(401).json({ message: "User not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Github check failed." });
  }
};

export { githubCallback, loginUser, checkGithubAuth };
