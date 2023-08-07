module.exports = (event, server) => {
  process.on(event, (error) => {
    console.error(error.name, error.message);
    if (server) server.close(() => process.exit(1));
    else process.exit(1);
  });
};
