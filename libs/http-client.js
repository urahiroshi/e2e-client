const request = require('request');
const HttpError = require('./http-error');

class Connector {
  _log() {
    console.log.apply(
      global,
      ['[http]'].concat(Array.prototype.slice.call(arguments))
    );
  }

  _retryRequest(options, resolve, reject, retryCount) {
    const RETRY_MAX = 10;
    const RETRY_INTERVAL_MS = 3000;
    if (retryCount < RETRY_MAX) {
      setTimeout(
        () => {
          try {
            this._request(options, resolve, reject, retryCount + 1);
          } catch (err) {
            reject(err);
          }
        },
        RETRY_INTERVAL_MS
      );
    } else {
      this._log('error(retry over)');
      reject(new Error('Retry Over'));
    }
  }

  _request(options, resolve, reject, _retryCount) {
    _retryCount = _retryCount || 0;
    request(options, (error, response, body) => {
      try {
        if (error) {
          this._log('error: ', error);
          this._retryRequest(options, resolve, reject, _retryCount);
          return;
        }
        const statusCode = response.statusCode;
        if (statusCode >= 200 && statusCode < 300) {
          if (
            response.headers['content-type'] &&
            response.headers['content-type'].indexOf('application/json') >= 0
          ) {
            resolve(JSON.parse(body));
          } else {
            resolve(body);
          }
        } else if (statusCode >= 500 && statusCode < 600) {
          this._log('server error: ', statusCode)
          this._retryRequest(options, resolve, reject, _retryCount);
        } else {
          this._log('client error: ', statusCode, body);
          try {
            const errorInfo = JSON.parse(body);
            reject(new HttpError(
              statusCode, errorInfo.errorType, errorInfo.errorDetail
            ));
          } catch (e) {
            this._log('parse error: ', e)
            reject(new HttpError(statusCode));
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  request(options, _retryCount) {
    return new Promise((resolve, reject) => {
      options = options || {};
      _retryCount = _retryCount || 0;
      const defaultOptions = {
        method: 'GET',
        encoding: 'utf-8',
        headers: {},
        strictSSL: false,
        rejectUnauthorized: false,
      }
      const requestOptions = Object.assign(defaultOptions, options);
      requestOptions.headers['Content-Type'] = requestOptions.headers['Content-Type'] || 'application/json';
      if (requestOptions.body) {
        requestOptions.body = JSON.stringify(requestOptions.body);
        requestOptions.headers['Content-Length'] = Buffer.from(requestOptions.body).length;
      }
      this._request(requestOptions, resolve, reject);
    });
  }
}

module.exports = Connector;