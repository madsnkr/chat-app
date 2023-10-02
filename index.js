const http = require("http");
const fs = require('fs');
const PORT = process.env.PORT || 3000;
const { join, extname } = require("path");
const { Server } = require('socket.io');
const Chat = require('./utils');

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
    const { pathName, method, params } = data;

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

const server = http.createServer(async (req, res) => {
  //Make sure the request method is GET
  if (req.method !== 'GET') return res
    .writeHead(405, { 'Content-Type': 'application/json' })
    .end(JSON.stringify({ message: `This route does not support method: ${req.method}` }));

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
  socket.on('join', ({ username, roomId }) => {
    const user = Chat.join({ id: socket.id, name: username, room: roomId });
    socket.join(user.room);

    socket.broadcast.to(user.room).emit('roomMessage', `${user.name} has joined the chat!`);
  });
  socket.on('chatMessage', (message) => {
    const user = Chat.getUser(socket.id);
    io.to(user.room).emit('chatMessage', message);
  });
  socket.on('disconnect', () => {
    const user = Chat.leave(socket.id);

    user && io.to(user.room).emit('roomMessage', `${user.name} has left the chat!`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
