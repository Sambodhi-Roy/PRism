// import React, { useEffect } from "react";
// import logo from "../assets/logo.png";
// import RepoItem from "./RepoItem";
// import {} from "react-icons";
// import { useAuth, UserButton } from "@clerk/clerk-react";
// import { Button, Input, Modal, Spin } from "antd";
// import { useState } from "react";

// import axios from "axios";
// import useStore from "../../store/auth.store.js";

// const Sidebar = () => {
//   const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [repos, setRepos] = useState([]);
//   const [repoLink, setRepoLink] = useState("");
//   const { isGitHubAuth, isGitHubLoading, setIsGitHubAuth, setIsGitHubLoading } =
//     useStore();

    
//   function isValidGitHubRepoUrl(url) {
//     try {
//       const parsedUrl = new URL(url);
//       const hostname = parsedUrl.hostname.toLowerCase();
//       const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);

//       return (
//         (hostname === "github.com" || hostname.endsWith(".github.com")) &&
//         pathSegments.length === 2 && // should be /owner/repo
//         /^[a-zA-Z0-9_.-]+$/.test(pathSegments[0]) && // owner
//         /^[a-zA-Z0-9_.-]+$/.test(pathSegments[1]) // repo
//       );
//     } catch (err) {
//       return false;
//     }
//   }

//   const showModal = () => {
//     setIsModalOpen(true);
//   };
//   const handleCancel = () => {
//     setIsModalOpen(false);
//   };
//   const handleOk = async () => {
//     const isValidUrl = isValidGitHubRepoUrl(repoLink);
//     if (!isValidUrl) {
//       alert("Please enter a valid GitHub repository URL.");
//       setRepoLink("");
//       return;
//     }
//     console.log("Repository Link", repoLink);
//     setIsModalOpen(false);
//     try {
//       const res = await axios.post(
//         "http://localhost:3000/repo/repo-info",
//         {
//           repositoryLink: repoLink,
//         },
//         {
//           withCredentials: true,
//         }
//       );
//       fetchRepos();
//       console.log("Repository data", res.data);
//     } catch (error) {
//       console.log(
//         "Error adding repository",
//         error.response?.data.message || error.message
//       );
//     }
//   };

//   const handleFetchPRs = async (repoName, repoOwnerName) => {
//     const {getToken} = useAuth()
//     const token = await getToken()
//     const repoFullName = `${repoOwnerName}/${repoName}`;
//     try {
//       const response = await axios.post(
//         "http://localhost:3000/pr/fetch-prs",
//         { repoFullName },
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       console.log("Fetched PRs successfully:", response.data);
      
//     } catch (error) {
//       console.error("Error fetching PRs:", error);
//     }
//   }

//   const checkGitHubAuth = async () => {
//     try {
//       setIsGitHubLoading(true);
//       const res = await axios.get("http://localhost:3000/auth/check-token", {
//         withCredentials: true,
//       });
//       setIsGitHubAuth(true);
//       setIsGitHubLoading(false);
//     } catch (err) {
//       setIsGitHubAuth(false);
//       setIsGitHubLoading(false);
//     } finally {
//       setIsGitHubLoading(false);
//     }
//   };
//   const fetchRepos = async () => {
//     try {
//       const res = await axios.get("http://localhost:3000/repo/user-repo", {
//         withCredentials: true,
//       });
//       console.log("User Repositories:", res.data);
//       setRepos(res.data);

//       // Assuming you're storing this in state
//     } catch (err) {
//       console.log("Error fetching repos:", err.response?.data || err.message);
//     }
//   };

//   useEffect(() => {
//     checkGitHubAuth();
//     fetchRepos();
//   }, []);

//   if (isGitHubLoading) {
//     return (
//       <div className="text-white h-screen w-[270px] bg-[#1d1e30] flex justify-center items-center">
//         <Spin size="large" />
//       </div>
//     );
//   }

//   const handleGithubLogin = () => {
//     window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=http://localhost:3000/auth/github/callback&scope=read:user repo`;
//     checkGitHubAuth();
//   };
  

//   return (
//     <div className="text-white h-screen w-[270px] bg-[#1d1e30] pt-4 px-3">
//       <div className="flex gap-3 justify-start items-end text-2xl mb-5 p-2">
//         <img src={logo} alt="" className="w-8" />
//         <p>PRism</p>
//       </div>
//       {isGitHubAuth ? (
//         <div className="flex flex-col gap-3">
//           <button
//             className="w-full bg-[#5866f2] flex justify-center py-4 rounded-xl mx-auto cursor-pointer active:bg-[#4854d9]"
//             onClick={() => showModal()}
//           >
//             Add Repository
//           </button>
//           <div className="flex flex-col gap-2 p-2">
//             <div className="pt-8 text-lg poppins-thin ml-1 mb-2 ">
//               Repositories:
//             </div>
//             {repos.map((repo) => (
//               <div key={repo.githubId} className="repo-link cursor-pointer text-md font-light text-sm">
//                 <button onClick={() => handleFetchPRs(repo.repoName, repo.ownerName)}>{repo.repoName}/{repo.ownerName}</button>
//               </div>
//             ))}
//           </div>
//           <Modal
//             title="Add Repository Link"
//             open={isModalOpen}
//             onOk={handleOk}
//             centered
//             onCancel={handleCancel}
//             classNames={"!bg-[#1d1e30]"}
//           >
//             <input
//               onChange={(e) => setRepoLink(e.target.value)}
//               className="w-full border-b-[1px] h-10 px-3 outline-none  border-neutral-700"
//               value={repoLink}
//             />
//           </Modal>
//         </div>
//       ) : (
//         <button onClick={() => handleGithubLogin()} className="w-full bg-slate-950 text-white font-semibold  flex justify-center py-4 rounded-xl mx-auto cursor-pointer active:bg-[#4854d9]">LogIn with Github</button>
//       )}
//     </div>
//   );
// };

// export default Sidebar;

import React, { useEffect } from "react";
import logo from "../assets/logo.png";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { Button, Input, Modal, Spin, message } from "antd";
import { useState } from "react";
import axios from "axios";
import useStore from "../../store/auth.store.js";

const Sidebar = () => {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repos, setRepos] = useState([]);
  const [repoLink, setRepoLink] = useState("");
  const { isGitHubAuth, isGitHubLoading, setIsGitHubAuth, setIsGitHubLoading } =
    useStore();
  const { getToken } = useAuth();

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
      const res = await axios.post(
        "http://localhost:3000/repo/repo-info",
        {
          repositoryLink: repoLink,
        },
        {
          withCredentials: true,
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

  const handleFetchPRs = async (repoName, repoOwnerName) => {
    try {
      const token = await getToken();
      console.log(token);
      
      const repoFullName = `${repoOwnerName}/${repoName}`;
      
      const response = await axios.post(
        "http://localhost:3000/pr/fetch-prs",
        { repoFullName },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      message.success("PRs fetched successfully!");
      console.log("Fetched PRs:", response.data);
    } catch (error) {
      message.error("Failed to fetch PRs");
      console.error("Error fetching PRs:", error);
    }
  };

  const checkGitHubAuth = async () => {
    try {
      setIsGitHubLoading(true);
      const res = await axios.get("http://localhost:3000/auth/check-token", {
        withCredentials: true,
      });
      setIsGitHubAuth(true);
    } catch (err) {
      setIsGitHubAuth(false);
    } finally {
      setIsGitHubLoading(false);
    }
  };

  const fetchRepos = async () => {
    try {
      const res = await axios.get("http://localhost:3000/repo/user-repo", {
        withCredentials: true,
      });
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
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=http://localhost:3000/auth/github/callback&scope=read:user repo`;
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