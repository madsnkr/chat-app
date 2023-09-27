const http = require("http");
const PORT = process.env.PORT || 3000;
const { join, extname } = require("path");
const { parseUrlEncoded } = require('./utils');
const { Server } = require('socket.io');
const Chat = require('./db/chat');
const chatRooms = require('./db/data.json');
const fs = require('fs');


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

const staticDir = __dirname + '/dist';

const controller = {
  '': async (data) => {

    return {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      content: await fs.promises.readFile(staticDir + '/index.html')
    };
  },
  chat: async (data) => {
    const { pathName, method, params } = data;
    let status, headers, content;

    //Make sure username and roomId has been passed
    if (!params.username || !params.roomId) {
      status = 302;
      headers = { 'Location': '/' };
    } else {
      status = 200;
      headers = { 'Content-Type': 'text/html' };
      content = await fs.promises.readFile(staticDir + '/chat.html');
    }

    //user => {id, name, room}
    //room => {id, name, users}

    //TODO: Verify the params
    return {
      status,
      headers,
      content
    };
  },
  generic: async (data) => {
    const { pathName, method, params } = data;
    const exists = await fs.promises.stat(join(staticDir, pathName)).then(() => true, () => false);

    //Get extension of file and set mimetype based on that
    const extName = extname(pathName).substring(1).toLowerCase();

    return {
      status: exists ? 200 : 404,
      headers: { 'Content-Type': mime[extName] || 'text/html' },
      content: exists ? await fs.promises.readFile(join(staticDir, pathName))
        : await fs.promises.readFile(staticDir + '/404.html')
    };
  }
};

const server = http.createServer(async (req, res) => {
  //Parse url also remove leading and trailing slashes
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathName = url.pathname.replace(/^\/+|\/+$/g, '');

  //Get the correct handler from the controller and call it
  const handler = controller[pathName] === undefined ? controller['generic'] : controller[pathName];
  const { status, headers, content } = await handler({
    pathName,
    method: req.method,
    params: Object.fromEntries(url.searchParams)
  });

  //Send back the appropriate response
  res.writeHead(status, headers).end(content);
});

const io = new Server(server);

io.on('connection', (socket) => {
  console.log(`User: ${socket.id} connected`);
  socket.on('chatMessage', (message) => {
    io.emit('chatMessage', message);
  });
  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
