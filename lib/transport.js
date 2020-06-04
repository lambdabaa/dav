import co from 'co';
import querystring from 'querystring';
import { AuthCalc } from 'httpauth';

import XMLHttpRequest from './xmlhttprequest';

export class Transport {
  /**
   * @param {dav.Credentials} credentials user authorization.
   */
  constructor(credentials) {
    this.credentials = credentials || null;
  }

  /**
   * @param {dav.Request} request object with request info.
   * @return {Promise} a promise that will be resolved with an xhr request after
   *     its readyState is 4 or the result of applying an optional request
   *     `transformResponse` function to the xhr object after its readyState is 4.
   *
   * Options:
   *
   *   (Object) sandbox - optional request sandbox.
   */
  send() {}
}

/*
Standard HTTP authentication
- supports both Basic and Digest authentication
- chooses the method automatically
- works better with CORS (passes Authorization directly)
*/
export class Basic extends Transport {
  /**
   * @param {dav.Credentials} credentials user authorization.
   */
  constructor(credentials) {
    super(credentials);
    this.auth = new AuthCalc(this.credentials.username, this.credentials.password);
  }

  send(request, url, options) {
    return co(function *() {
      let sandbox = options && options.sandbox;
      let transformRequest = request.transformRequest;
      let transformResponse = request.transformResponse;
      let onerror = request.onerror;

      let result;
      let retryCnt = 1;
      while (retryCnt >= 0) {
        retryCnt--;
        let xhr = new XMLHttpRequest();
        if (sandbox) sandbox.add(xhr);
          xhr.open(
            request.method,
            url,
            true /* async */
            //WITHOUT login and password
            //NO  "withCredentials"
          );

        this.auth.sign(xhr.request, {url: url, type: request.method, data: request.requestData});

        if (transformRequest) transformRequest(xhr);

        try {
          yield xhr.send(request.requestData);
          result = transformResponse ? transformResponse(xhr) : xhr;
          break; //of repeat loop
        } catch (error) {
          console.debug("dav.Transport.Basic::OnError: "+xhr.request.status);
          //Authentication required? Reinitialize the auth context
          if (xhr.request.status === 401 || xhr.request.status === 407) {
            console.debug("Reinitializing the auth context...");
            this.auth.updateServerResponse(xhr.request);
            continue; //try again
          }
          if (onerror) onerror(error);
          throw error;
        }
      }

      return result;
    }.bind(this));
  }
}

/**
 * @param {dav.Credentials} credentials user authorization.
 */
export class OAuth2 extends Transport {
  constructor(credentials) {
    super(credentials);
  }

  send(request, url, options={}) {
    return co(function *() {
      let sandbox = options.sandbox;
      let transformRequest = request.transformRequest;
      let transformResponse = request.transformResponse;
      let onerror = request.onerror;

      if (!('retry' in options)) options.retry = true;

      let result, xhr;
      try {
        let token = yield access(this.credentials, options);
        xhr = new XMLHttpRequest();
        if (sandbox) sandbox.add(xhr);
        xhr.open(request.method, url, true /* async */);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        if (transformRequest) transformRequest(xhr);
        yield xhr.send(request.requestData);
        result = transformResponse ? transformResponse(xhr) : xhr;
      } catch (error) {
        if (options.retry && xhr.status === 401) {
          // Force expiration.
          this.credentials.expiration = 0;
          // Retry once at most.
          options.retry = false;
          return this.send(request, url, options);
        }

        if (onerror) onerror(error);
        throw error;
      }

      return result;
    }.bind(this));
  }
}

/**
 * @return {Promise} promise that will resolve with access token.
 */
function access(credentials, options) {
  if (!credentials.accessToken) {
    return getAccessToken(credentials, options);
  }

  if (credentials.refreshToken && isExpired(credentials)) {
    return refreshAccessToken(credentials, options);
  }

  return Promise.resolve(credentials.accessToken);
}

function isExpired(credentials) {
  return typeof credentials.expiration === 'number' &&
         Date.now() > credentials.expiration;
}

let getAccessToken = co.wrap(function *(credentials, options) {
  let sandbox = options.sandbox;
  let xhr = new XMLHttpRequest();
  if (sandbox) sandbox.add(xhr);
  xhr.open('POST', credentials.tokenUrl, true /* async */);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  let data = querystring.stringify({
    code: credentials.authorizationCode,
    redirect_uri: credentials.redirectUrl,
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    grant_type: 'authorization_code'
  });

  let now = Date.now();
  yield xhr.send(data);
  let response = JSON.parse(xhr.responseText);
  credentials.accessToken = response.access_token;
  credentials.refreshToken = 'refresh_token' in response ?
    response.refresh_token :
    null;
  credentials.expiration = 'expires_in' in response ?
    now + response.expires_in :
    null;

  return response.access_token;
});

let refreshAccessToken = co.wrap(function *(credentials, options) {
  let sandbox = options.sandbox;
  let xhr = new XMLHttpRequest();
  if (sandbox) sandbox.add(xhr);
  xhr.open('POST', credentials.tokenUrl, true /* async */);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  let data = querystring.stringify({
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    refresh_token: credentials.refreshToken,
    grant_type: 'refresh_token'
  });

  let now = Date.now();
  yield xhr.send(data);
  let response = JSON.parse(xhr.responseText);
  credentials.accessToken = response.access_token;
  credentials.expiration = 'expires_in' in response ?
    now + response.expires_in :
    null;

  return response.access_token;
});
