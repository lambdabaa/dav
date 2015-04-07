require('babel/polyfill');

import * as ns from './namespace';
import * as request from './request';
import * as transport from './transport';
import debug from 'debug';

export { createAccount } from './accounts';
export { Client } from './client';
export * from './calendars';
export * from './contacts';
export { jsonify } from './jsonify';
export * from './model';
export { Request } from './request';
export { Sandbox, createSandbox } from './sandbox';

export {
  debug,
  ns,
  request,
  transport
}
