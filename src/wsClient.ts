import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  OmitPartialGroupDMChannel,
  Message,
  MessageFlags,
} from "discord.js";

import { getInstance } from "./logger";
const logger = getInstance();
import { handleIncomingDM, handleQuickResponse } from "./handlers/discord";
import { createActionRowWithComponents } from "./utils/discord";

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

  if (interaction.message.components.length < 1) {
    interaction.update({ components: [] });
    return;
  }
  // Take advantage of the fact that we know there should only be one component
  // and it's an ActionRow of buttons for the quick replies
  const actionRow = interaction.message.components[0];
  const disabledButtons = [];
  for (let i = 0; i < actionRow.components.length; i++) {
    const component = actionRow.components[i];
    disabledButtons.push({
      ...component.data,
      disabled: true,
    });
  }
  const newComponents = [createActionRowWithComponents(disabledButtons)];
  interaction.update({ components: newComponents });
});

client.on("ready", async () => {
  logger.info("Discord Gateway Ready");
});

interface StartWSClientArgs {
  botToken: string;
}

export function startWsClient({ botToken }: StartWSClientArgs) {
  client
    .login(botToken)
    .then(() => {
      logger.info("Discord Gateway Logged in");
    })
    .catch((e) => {
      logger.error(e);
      process.exit(1);
    });
}
