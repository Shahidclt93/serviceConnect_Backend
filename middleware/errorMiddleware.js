// Unsuppoted 404 routes
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404).json({ message: error.message });
};

// Middleware for handle error
const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  const statusCode = error.code || 500;
  const message = error.message || "An unknown error occurred";

  res.status(statusCode).json({ message });
};

module.exports = { notFound, errorHandler };
