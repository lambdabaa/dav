import stringify from 'json-stringify-safe';

export function jsonify(obj) {
  return JSON.parse(stringify(obj));
}
