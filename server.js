
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const VERSION = "1.0.0";
const ENVIRONMENT = process.env.NODE_ENV || "development";

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      status: "healthy",
      version: VERSION,
      environment: ENVIRONMENT,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  let filePath;

  if (req.url === "/" || req.url === "/index.html") {
    filePath = path.join(__dirname, "index.html");
  } else if (req.url === "/style.css") {
    filePath = path.join(__dirname, "style.css");
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 - Page not found");
    return;
  }

  const contentType = filePath.endsWith(".css")
    ? "text/css"
    : "text/html";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("500 - Internal Server Error");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`CloudOps Health Monitor running on port ${PORT}`);
  console.log(`Environment: ${ENVIRONMENT}`);
});
