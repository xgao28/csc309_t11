const express = require("express");
const routes = require("./routes");
const cors = require("cors");
require('dotenv').config();

// Set up frontend URL from environment variable or default to localhost:5173
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();

// Configure CORS to only accept requests from the frontend
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use('', routes);

module.exports = app;