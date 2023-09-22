const http = require("http");
const PORT = 3000;
const path = require("path");
const { render, getBodyData } = require('./utils');

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/chat') {
    try {
      const body = await getBodyData(req);

      if (!body.username || !body.room) return res
        .writeHead(422, { 'Content-Type': 'application/json' })
        .end(JSON.stringify({ message: "Cannot join chat room without a username or room id" }));


      res.writeHead(303, { 'Location': '/chat' });
      res.end();
    } catch (err) {
      console.error(err);
    }
  }

  if (req.method === 'GET') {
    const filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);

    render(req, res, filePath);
  }

});

server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
