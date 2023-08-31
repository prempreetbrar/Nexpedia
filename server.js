// we need this to be at the top so we can deal with EVERY unhandledException
const handleUncaught = require("./utils/handleUncaught");
handleUncaught("unhandledException");

const dotenv = require("dotenv");
const ENV = `${__dirname}/config.env`;
dotenv.config({ path: ENV });
const mongoose = require("mongoose");

// app comes after dotenv config so that it has access to .env variables
const app = require("./app");
const PORT = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace(
  /<PASSWORD>/g,
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then((connection) => console.log("Connected to the database!"));

const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});

handleUncaught("unhandledRejection", server);

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED; shutting down gracefully.");
  server.close(() => console.log("Server shut down complete."));
});
