import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  OmitPartialGroupDMChannel,
  Message,
  MessageFlags,
} from "discord.js";

import { handleIncomingDM, handleQuickResponse } from "./handlers/discord";

const client = new Client({
  intents: [GatewayIntentBits.DirectMessages],
  partials: [
    Partials.User,
    Partials.Reaction,
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
  ],
  ws: {
    version: 10,
  },
});

client.on(
  Events.MessageCreate,
  async (message: OmitPartialGroupDMChannel<Message>) => {
    handleIncomingDM(message);
  },
);

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  handleQuickResponse(interaction);
  // This will immediately respond with a message
  // while we handle the request. There are some alternatives.
  interaction.reply({ content: "Working...", flags: MessageFlags.Ephemeral });
});

client.on("ready", async () => {
  console.info("Discord Gateway Ready");
});

interface StartWSClientArgs {
  botToken: string;
}

export function startWsClient({ botToken }: StartWSClientArgs) {
  client
    .login(botToken)
    .then(() => {
      console.info("Discord Gateway Logged in");
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
