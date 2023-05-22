const app = require("express")();
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });

const userList = [];
const pairList = [];

const onUserListChange = (list) => {
  const usernames = list.map((item) => item.username);
  list.forEach((user) => {
    user.ws.send(JSON.stringify({ type: "userListChange", list: usernames }));
  });
};

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const msg = JSON.parse(message);

    switch (msg.type) {
      case "login":
        userList.push({ username: msg.username, ws });
        onUserListChange(userList);
        break;

      case "connect":
        {
          const { username, counterPartyUsername } = msg;
          const target = userList.find((item) => item.username === counterPartyUsername);

          target && target.ws.send(JSON.stringify({ type: "connect", username }));
        }
        break;

      case "confirmConnect":
        {
          const { username, counterPartyUsername } = msg;
          const pair = [];
          userList.forEach((user) => {
            if ([username, counterPartyUsername].includes(user.username)) {
              pair.push(user);

              user.username === counterPartyUsername &&
                user.ws.send(JSON.stringify({ type: "connectSuccessful", username }));
            }
          });
          pairList.push(pair);
        }
        break;

      case "refuseConnect":
        {
          const target = userList.find((item) => item.username === msg.counterPartyUsername);
          target && target.ws.send(JSON.stringify({ type: "connectFailed", msg: "对方并不想搭理你" }));
        }
        break;

      case "disconnect":
      case "offer":
      case "answer":
      case "candidate":
        {
          pairList.forEach((pair) => {
            const target = pair.find((item) => item.ws === ws);
            if (target) {
              const counterParty = pair.find((item) => item.ws !== ws);
              counterParty.ws.send(JSON.stringify(msg));
            }
          });
        }
        break;

      default:
        break;
    }
  });

  ws.on("close", () => {
    const index = userList.findIndex((user) => user.ws === ws);
    if (index >= 0) {
      userList.splice(index, 1);
    }
    console.log("close: ", userList.length);
  });
});

app.get("/", (req, res) => {
  res.sendFile("./page/videoConversations.html", { root: __dirname });
});

app.listen(8080);
