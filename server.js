const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");

const ENV = `${__dirname}/config.env`;
dotenv.config({ path: ENV });
const PORT = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace(
  /<PASSWORD>/g,
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then((connection) => console.log(connection));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
