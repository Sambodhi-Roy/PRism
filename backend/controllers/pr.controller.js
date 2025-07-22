import { getAuth } from "@clerk/express";
import axios from "axios";
import User from "../models/user.model.js";
import Repository from "../models/repository.model.js";
import PullRequest from "../models/pullRequest.model.js";
import { decrypt } from "../utils/crypto.js";

const llmUrl = process.env.LLM_SERVICE_URL;

export const fetchAndProcessPullRequests = async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Clerk id not found." });

    const user = await User.findOne({ clerkId });
    if (!user || !user.githubAccessToken) {
      return res.status(400).json({ error: "GitHub access token not found for this user." });
    }

    const { repoFullName } = req.body;
    if (!repoFullName) return res.status(400).json({ error: "Repository full name is required." });

    const [owner, repoName] = repoFullName.split('/');
    const repository = await Repository.findOne({ repoName });
    if (!repository) return res.status(404).json({ error: "Repository not found." });

    const decryptedToken = decrypt(user.githubAccessToken);
    const githubApiUrl = `https://api.github.com/repos/${owner}/${repoName}/pulls?state=closed&per_page=5&sort=created&direction=desc`;

    const response = await axios.get(githubApiUrl, {
      headers: {
        Authorization: `Bearer ${decryptedToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const fetchedPrs = response.data;
    const newPrsForRag = [];

    for (const fetchedPr of fetchedPrs) {
      const existingPr = await PullRequest.findOne({ githubId: fetchedPr.id });

      // Fetch PR details (for stats)
      const prDetailsUrl = `https://api.github.com/repos/${owner}/${repoName}/pulls/${fetchedPr.number}`;
      const prDetailsResponse = await axios.get(prDetailsUrl, {
        headers: {
          Authorization: `Bearer ${decryptedToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      const prDetails = prDetailsResponse.data;

      // Fetch commits
      const commitsUrl = `https://api.github.com/repos/${owner}/${repoName}/pulls/${fetchedPr.number}/commits`;
      const commitsResponse = await axios.get(commitsUrl, {
        headers: {
          Authorization: `Bearer ${decryptedToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      const commitMessages = commitsResponse.data.map(commit => commit.commit.message);

      // Fetch raw diff
      let diffContent = '';
      try {
        const diffResponse = await axios.get(fetchedPr.diff_url, {
          headers: {
            Authorization: `Bearer ${decryptedToken}`,
            Accept: 'application/vnd.github.v3.diff',
          },
        });
        diffContent = diffResponse.data;
      } catch (diffErr) {
        console.error(`Failed to fetch diff for PR #${fetchedPr.number}:`, diffErr.message);
      }

      let diffSummary = existingPr?.diffSummary || '';
      console.log(`Processing PR #${fetchedPr.number} for repository: ${repoFullName}`);
      if (!diffSummary) {
        try {
          // const ragResponse = await axios.post(`${llmUrl}/summarize`, {
          //   diff_content: diffContent,
          // });
          const ragResponse = await axios.post("https://prism-kl06.onrender.com/summarize", {
            diff_content: diffContent,
          });
          diffSummary = ragResponse.data.summary;
          console.log(`RAG summary generated for PR #${fetchedPr.number}`);
          console.log("RAG Summary:", ragResponse.data);

        } catch (ragErr) {
          console.error(`RAG summarization failed for PR #${fetchedPr.number}:`, ragErr.message);
        }
      } else {
        console.log(`Skipping RAG summarization for PR #${fetchedPr.number} (already summarized).`);
      }

      if (!existingPr) {
        const newPullRequest = new PullRequest({
          githubId: fetchedPr.id,
          prNumber: fetchedPr.number, // ✅ this is now used correctly
          title: fetchedPr.title,
          url: fetchedPr.html_url,
          state: fetchedPr.state,
          userId: user._id,
          repositoryId: repository._id,
          summary: fetchedPr.body || '',
          commitMessages,
          diff: diffContent,
          diffSummary,
          additions: fetchedPr.additions,
          deletions: fetchedPr.deletions,
          commits: fetchedPr.commits,
          changedFiles: fetchedPr.changed_files,
          createdAt: fetchedPr.created_at,
          closedAt: fetchedPr.closed_at,
          mergedAt: fetchedPr.merged_at,
        });

        await newPullRequest.save();
        newPrsForRag.push(newPullRequest);
        console.log(`New PR saved for ${repoFullName}: ${newPullRequest.title}`);
      } else {
        existingPr.diff = diffContent;
        existingPr.commitMessages = commitMessages;
        existingPr.diffSummary = diffSummary;
        await existingPr.save();
        console.log(`Existing PR updated: ${fetchedPr.title}`);
      }
    }

    const allPrs = await PullRequest.find({ repositoryId: repository._id }).sort({ createdAt: -1 });

    const formattedPrs = await Promise.all(allPrs.map(async (prDoc) => {
      const prDetailsUrl = `https://api.github.com/repos/${owner}/${repoName}/pulls/${prDoc.prNumber}`; // ✅ fixed this line
      const prDetailsResponse = await axios.get(prDetailsUrl, {
        headers: {
          Authorization: `Bearer ${decryptedToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      const prDetails = prDetailsResponse.data;

      return {
        id: prDoc._id,
        title: prDoc.title,
        prNumber: prDetails.number,
        url: prDoc.url,
        summary: prDoc.summary,
        diffSummary: prDoc.diffSummary,
        commitMessages: prDoc.commitMessages,
        additions: prDetails.additions,
        deletions: prDetails.deletions,
        commits: prDetails.commits,
        changedFiles: prDetails.changed_files,
        createdAt: prDoc.createdAt,
        updatedAt: prDoc.updatedAt,
      };
    }));

    res.status(200).json({
      message: `Fetched, saved, and retrieved ${formattedPrs.length} PRs for repository: ${repoFullName}`,
      prs: formattedPrs,
    });

  } catch (error) {
    console.error("Error fetching and processing pull requests:", error);
    if (error.response?.status === 401) {
      return res.status(401).json({ error: "Invalid GitHub access token." });
    } else if (error.response?.status === 404) {
      return res.status(404).json({ error: "Repository not found on GitHub." });
    }
    res.status(500).json({ error: "Failed to fetch and process pull requests." });
  }
};
