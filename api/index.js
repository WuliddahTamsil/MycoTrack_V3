// Vercel Serverless Function wrapper for Express backend
// This allows the Express app to run on Vercel

const express = require('express');
const path = require('path');

// Import the Express app from backend
// Note: backend/server.js already exports the app
const app = require('../backend/server');

// Export as Vercel serverless function
module.exports = app;
