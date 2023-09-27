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
  '': async () => {
    return { status: 200, contentType: 'text/html', stream: fs.createReadStream(staticDir + '/index.html') };
  },
  chat: async () => {
    //TODO: Verify the params
    return { status: 200, contentType: 'text/html', stream: fs.createReadStream(staticDir + '/chat.html') };
  },
  generic: async (data) => {
    const { pathName } = data;
    const exists = await fs.promises.stat(join(staticDir, pathName)).then(() => true, () => false);

    //Get extension of file and set mimetype based on that
    const extName = extname(pathName).substring(1).toLowerCase();

    return {
      status: exists ? 200 : 404,
      contentType: mime[extName] || 'text/html',
      stream: exists ? fs.createReadStream(join(staticDir, pathName)) : fs.createReadStream(staticDir + '/404.html')
    };
  }
};

const server = http.createServer(async (req, res) => {
  //Parse url also remove leading and trailing slashes
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathName = url.pathname.replace(/^\/+|\/+$/g, '');


  //Get the correct handler from the controller and call it
  const handler = controller[pathName] === undefined ? controller['generic'] : controller[pathName];
  const { status, contentType, stream } = await handler({ pathName });

  //Send back the appropriate response
  res.writeHead(status, { 'Content-Type': contentType });
  stream.pipe(res);
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
