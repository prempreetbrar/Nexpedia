const express = require("express");
const middleware = require("./middleware");

const app = express();
middleware.environment(app);
middleware.security(app);
middleware.presentation(app);
middleware.body(app);
middleware.routes(app);
middleware.errors(app);

module.exports = app;
