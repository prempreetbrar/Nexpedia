module.exports = (event, server) => {
  process.on(event, (error) => {
    console.error(error.name, error.message);
    server?.close(() => process.exit(1));
  });
};
