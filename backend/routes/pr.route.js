import express from 'express'
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { fetchAndProcessPullRequests } from '../controllers/pr.controller.js';

const prRouter = express.Router();

prRouter.post("/fetch-prs", clerkMiddleware(), fetchAndProcessPullRequests);

export { prRouter };