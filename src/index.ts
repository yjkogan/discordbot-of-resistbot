import express from "express";
import logger from "morgan";

import { startWsClient } from "./wsClient";
import { handleRapidProResponse } from "./handlers/rapidPro";
import { getDiscordEnvars } from "./env";

var app = express();
const port = process.env.BACKEND_PORT || 5555;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* GET home page. */
app.get("/", function (req: express.Request, res: express.Response) {
  res.send('<a href="https://resist.bot/">https://resist.bot/</a>');
});

app.get("/healthcheck", function (req: express.Request, res: express.Response) {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };
  try {
    res.send(healthcheck);
  } catch (e) {
    res.status(503).send();
  }
});

const { discordBotToken } = getDiscordEnvars();

if (!discordBotToken) {
  throw new Error("DISCORD_BOT_TOKEN envar must be set");
}

startWsClient({ botToken: discordBotToken });

app.post(
  "/rp-response",
  function (req: express.Request, res: express.Response) {
    handleRapidProResponse(req.body);
    res.send(202);
  },
);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}`);
});
