class HttpError extends Error {
  constructor(statusCode, errorType, errorDetail) {
    statusCode = statusCode || 500;
    errorType = errorType || 'Unknown';
    errorDetail = errorDetail || {};
    super(JSON.stringify(errorDetail));
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.errorDetail = errorDetail;
  }
}

module.exports = HttpError;
