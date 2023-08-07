module.exports = (asyncFunc) => {
  return function wrapper(request, response, next) {
    asyncFunc(request, response, next).catch(next);
  };
};
