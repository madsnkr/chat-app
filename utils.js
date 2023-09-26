const { StringDecoder } = require('string_decoder');

const parseUrlEncoded = async (req) => {
  return new Promise((resolve, reject) => {
    let buffer = '';
    let decoder = new StringDecoder('utf8');
    req.on('error', (err) => {
      reject(err);
    }).on('data', (chunk) => {
      buffer += decoder.write(chunk);
    }).on('end', () => {
      buffer += decoder.end();
      resolve(Object.fromEntries(new URLSearchParams(buffer)));
    });
  });
};

module.exports = { parseUrlEncoded };
