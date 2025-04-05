import express from 'express'
import { fetchRepositoryDataViaLink, getUserRepositories} from '../controllers/repo.controller.js';
import { requireAuth } from '@clerk/express';

const repoRouter = express.Router();

repoRouter.post("/repo-info", requireAuth(), fetchRepositoryDataViaLink);
repoRouter.get("/user-repo", requireAuth(),getUserRepositories);

export { repoRouter };