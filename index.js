const http = require("http");
const PORT = process.env.PORT || 3000;
const { Server } = require('socket.io');
const Chat = require('./utils/chat');
const controller = require('./utils/controller');

const server = http.createServer(async (req, res) => {
  //Make sure the request method is GET
  if (req.method !== 'GET') return res
    .writeHead(405, { 'Content-Type': 'application/json' })
    .end(JSON.stringify({ message: `This route does not support method: ${req.method}` }));

  //Parse url also remove leading and trailing slashes
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathName = url.pathname.replace(/^\/+|\/+$/g, '');
  const params = Object.fromEntries(url.searchParams);

  //Get the correct handler from the controller and call it
  const handler = controller[pathName] === undefined ? controller['generic'] : controller[pathName];

  const { status, headers, content } = await handler({ pathName, params });

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
    const formattedMessage = {
      user: user.name,
      body: message,
      date: new Date().toLocaleTimeString()
    };

    io.to(user.room).emit('chatMessage', formattedMessage);
  });
  socket.on('typing', (isTyping) => {
    const user = Chat.getUser(socket.id);
    socket.broadcast.to(user.room).emit('typing', isTyping ? `${user.name} is typing...` : '');

  });
  socket.on('disconnect', () => {
    const user = Chat.leave(socket.id);

    user && io.to(user.room).emit('roomMessage', `${user.name} has left the chat!`);
  });

});

server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
