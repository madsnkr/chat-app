const fs = require('fs');
const { join, extname } = require("path");
const staticDir = join(__dirname, '..', 'dist');

const Chat = require('./chat');

const controller = {
  '': async (data) => {
    return {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      content: await fs.promises.readFile(staticDir + '/index.html')
    };
  },
  chat: async (data) => {
    const { params } = data;

    //Make sure the params are not empty
    if (!params.username || !params.roomId) return { status: 302, headers: { 'Location': '/' } };

    //Make sure user doesn't already exist
    const userExists = Chat.usernameTaken(params.username, params.roomId);
    if (userExists) return { status: 302, headers: { 'Location': '/' } };

    //Return chat view
    return {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      content: await fs.promises.readFile(staticDir + '/chat.html')
    };
  },
  generic: async (data) => {
    const { pathName } = data;

    const exists = await fs.promises.stat(join(staticDir, pathName)).then(() => true, () => false);

    if (!exists) return {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
      content: await fs.promises.readFile(staticDir + '/404.html')
    };

    const extName = extname(pathName).substring(1).toLowerCase();

    return {
      status: 200,
      headers: { 'Content-Type': mime[extName] || 'application/octet-stream' },
      content: await fs.promises.readFile(join(staticDir, pathName))
    };
  }
};

const mime = {
  wasm: 'application/wasm',
  json: 'application/json',
  woff: 'application/font-woff',
  ttf: 'application/font-ttf',
  eot: 'application/vnd.ms-fontobject',
  otf: 'application/font-otf',
  js: "application/javascript",
  pdf: 'application/pdf',
  doc: 'application/msword',
  html: "text/html",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
  wav: 'audio/wav',
  mp4: 'video/mp4',
};

module.exports = controller;
