// Catches anything thrown synchronously in a route/middleware, or passed to
// next(err), and returns a clean JSON error instead of an HTML stack trace
// or a crashed process. Must be registered last, after all routes.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[Unhandled error]', err);

  const status = err.status || 500;
  res.status(status).json({
    error: err.publicMessage || 'Something went wrong on the server.',
  });
}

module.exports = { errorHandler };
