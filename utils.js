/* eslint-disable indent */
const fsp = require('fs/promises');
const path = require("path");

const setContentType = (extName) => {
  let contentType = "text/html";

  switch (extName) {
    case ".js":
      contentType = "text/javascript";
      break;
    case ".css":
      contentType = "text/css";
      break;
    case ".json":
      contentType = "application/json";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".jpg":
      contentType = "image/jpg";
      break;
  }

  return contentType;
};

const render = async (req, res, filePath) => {
  const extName = path.extname(filePath);
  const contentType = setContentType(extName);//Set the correct content-type based on file extension

  if (contentType === 'text/html' && extName === '') filePath += '.html';//Make sure that filePath is using .html extension

  try {
    const page = await fsp.readFile(filePath, 'utf8');//Try to read and render pages

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(page);
  } catch (err) {
    console.error(err);
  }
};

const getBodyData = async (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on('error', err => {
      reject(err);
    }).on('data', (chunk) => {
      body += chunk;
    }).on('end', () => {
      const params = Object.fromEntries(new URLSearchParams(body));//Create object from the parsed body
      resolve(params);
    });
  });
};

module.exports = { setContentType, render, getBodyData };
