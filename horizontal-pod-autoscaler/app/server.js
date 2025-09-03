const http = require('http');
const os = require('os');

console.log("CPU Stress App starting...");

const handler = (req, res) => {
  // Simulate CPU load
  const end = Date.now() + 500;
  while (Date.now() < end) {}

  res.writeHead(200);
  res.end("Hello from HPA demo! Host: " + os.hostname() + "\n");
};

http.createServer(handler).listen(8080);
