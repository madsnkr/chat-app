const http = require("http");
const PORT = 3000;
const path = require("path");
const { render } = require('./utils');

const server = http.createServer(async (req, res) => {
  const filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  render(req, res, filePath);
  console.log(filePath);
});

server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
