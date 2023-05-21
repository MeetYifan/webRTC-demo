const app = require("express")();
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });

const pairConnect = [];

wss.on("connection", (ws) => {
  pairConnect.push(ws);

  ws.on("message", (message) => {
    const otherWs = pairConnect.find((item) => item !== ws);
    if (!otherWs) {
      console.log("等待加入...");
    } else {
      console.log("转发消息: ", message);
      otherWs.send(message);
    }
  });

  ws.on("close", () => {
    const index = pairConnect.findIndex((item) => item === ws);
    if (index >= 0) {
      pairConnect.splice(index, 1);
    }
    console.log("close: ", pairConnect.length);
  });
});

app.get("/", (req, res) => {
  res.sendFile("./page/index.html", { root: __dirname });
});

app.listen(8080);
