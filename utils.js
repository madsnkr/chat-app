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
  const contentType = setContentType(extName);

  try {
    const page = await fsp.readFile(filePath, 'utf8');

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(page);
  } catch (err) {
    console.error(err);
  }
};

module.exports = { correctContentType: setContentType, render };
