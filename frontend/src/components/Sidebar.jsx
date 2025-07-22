import React, { useEffect } from "react";
import logo from "../assets/logo.png";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { Button, Input, Modal, Spin, message } from "antd";
import { useState } from "react";
import axios from "axios";
import useStore from "../../store/auth.store.js";
import usePRStore from "../../store/prdata.store.js";
import axiosInstance from "../../utils/axios.js";

const Sidebar = () => {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repos, setRepos] = useState([]);
  const [repoLink, setRepoLink] = useState("");
  const { isGitHubAuth, isGitHubLoading, setIsGitHubAuth, setIsGitHubLoading } =
    useStore();
  const { getToken } = useAuth();
  const backendUrl=import.meta.env.VITE_BACKEND_URL;
  console.log("Backend url:",backendUrl);
  

  function isValidGitHubRepoUrl(url) {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);

      return (
        (hostname === "github.com" || hostname.endsWith(".github.com")) &&
        pathSegments.length === 2 && // should be /owner/repo
        /^[a-zA-Z0-9_.-]+$/.test(pathSegments[0]) && // owner
        /^[a-zA-Z0-9_.-]+$/.test(pathSegments[1]) // repo
      );
    } catch (err) {
      return false;
    }
  }

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOk = async () => {
    const isValidUrl = isValidGitHubRepoUrl(repoLink);
    if (!isValidUrl) {
      message.error("Please enter a valid GitHub repository URL.");
      setRepoLink("");
      return;
    }

    try {
      // const res = await axiosInstance.post(
      //   "http://localhost:3000/repo/repo-info",
      //   {
      //     repositoryLink: repoLink,
      //   },
      //   {
      //     withCredentials: true,
      //   }
      // );
      const res = await axiosInstance.post(
        "repo/repo-info",
        {
          repositoryLink: repoLink,
        }
      );
      message.success("Repository added successfully!");
      fetchRepos();
      setRepoLink("");
      setIsModalOpen(false);
    } catch (error) {
      message.error(
        error.response?.data.message || "Failed to add repository"
      );
    }
  };

  const {setPRList,setIsPRLoading} = usePRStore()

  const handleFetchPRs = async (repoName, repoOwnerName) => {
    try {
      const token = await getToken();

      const repoFullName = `${repoOwnerName}/${repoName}`;
      setIsPRLoading(true);
      // const response = await axios.post(
      //   "http://localhost:3000/pr/fetch-prs",
      //   { repoFullName },
      //   {
      //     withCredentials: true,
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );
      const response = await axiosInstance.post("/pr/fetch-prs",{repoFullName},{
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
      });

      message.success("PRs fetched successfully!");
      console.log("Fetched PRs:", response.data);
      setPRList(response.data.prs)
      setIsPRLoading(false);
      setRepoLink("");

    } catch (error) {
      message.error("Failed to fetch PRs");
      console.error("Error fetching PRs:", error);
      setIsPRLoading(false);
      if (error.response && error.response.status === 401) {
        message.error("Unauthorized access. Please log in again.");
      }
    }
  };

  const checkGitHubAuth = async () => {
    try {
      setIsGitHubLoading(true);
      // const res = await axios.get("http://localhost:3000/auth/check-token", {
      //   withCredentials: true,
      // });
      const res =await axiosInstance.get("/auth/check-token");
      setIsGitHubAuth(true);
    } catch (err) {
      setIsGitHubAuth(false);
    } finally {
      setIsGitHubLoading(false);
    }
  };

  const fetchRepos = async () => {
    try {
      // const res = await axios.get("http://localhost:3000/repo/user-repo", {
      //   withCredentials: true,
      // });
      const res=await axiosInstance.get("/repo/user-repo");
      setRepos(res.data);
    } catch (err) {
      message.error("Failed to fetch repositories");
      console.error("Error fetching repos:", err);
    }
  };

  useEffect(() => {
    checkGitHubAuth();
    fetchRepos();
  }, []);

  if (isGitHubLoading) {
    return (
      <div className="text-white h-screen w-[270px] bg-[#1d1e30] flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  const handleGithubLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${backendUrl}/auth/github/callback&scope=read:user repo`;
  };

  return (
    <div className="text-white h-screen w-[270px] bg-[#1d1e30] pt-4 px-3">
      <div className="flex gap-3 justify-start items-end text-2xl mb-5 p-2">
        <img src={logo} alt="" className="w-8" />
        <p>PRism</p>
      </div>
      {isGitHubAuth ? (
        <div className="flex flex-col gap-3">
          <button
            className="w-full bg-[#5866f2] flex justify-center py-4 rounded-xl mx-auto cursor-pointer active:bg-[#4854d9]"
            onClick={showModal}
          >
            Add Repository
          </button>
          <div className="flex flex-col gap-2 p-2">
            <div className="pt-8 text-lg poppins-thin ml-1 mb-2">
              Repositories:
            </div>
            {repos.map((repo) => (
              <div 
                key={repo.githubId} 
                className="repo-link cursor-pointer text-md font-light text-sm hover:text-blue-300"
                onClick={() => handleFetchPRs(repo.repoName, repo.ownerName)}
              >
                {repo.ownerName}/{repo.repoName}
              </div>
            ))}
          </div>
          <Modal
            title="Add Repository Link"
            open={isModalOpen}
            onOk={handleOk}
            centered
            onCancel={handleCancel}
            footer={[
              <Button key="back" onClick={handleCancel}>
                Cancel
              </Button>,
              <Button key="submit" type="primary" onClick={handleOk}>
                Submit
              </Button>,
            ]}
          >
            <Input
              placeholder="Enter GitHub repository URL"
              onChange={(e) => setRepoLink(e.target.value)}
              value={repoLink}
            />
          </Modal>
        </div>
      ) : (
        <button 
          onClick={handleGithubLogin} 
          className="w-full bg-slate-950 text-white font-semibold flex justify-center py-4 rounded-xl mx-auto cursor-pointer hover:bg-slate-800"
        >
          Login with GitHub
        </button>
      )}
    </div>
  );
};

export default Sidebar;