const http = require("http");
const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end('<h1>Hello World</h1>');
});

server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
