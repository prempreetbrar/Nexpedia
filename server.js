const handleUncaught = require("./utils/handleUncaught");
handleUncaught("unhandledException");

const dotenv = require("dotenv");
const ENV = `${__dirname}/config.env`;
dotenv.config({ path: ENV });
const mongoose = require("mongoose");
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
