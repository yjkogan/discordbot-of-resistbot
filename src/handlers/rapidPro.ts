import { RapidProJson, getUrl } from "../utils/rapidPro";
import {
  createEmbed,
  createButtonComponent,
  createActionRowWithComponents,
} from "../utils/discord";
import { getDiscordEnvars } from "../env";
import { getInstance } from "../logger";
import { ComponentType } from "discord.js";
const logger = getInstance();

export async function handleRapidProResponse(requestJson: RapidProJson) {
  // https://discord.com/developers/docs/resources/channel#create-message

  const messageId = requestJson.id;
  const channelId = requestJson.to;

  if (!messageId || !channelId) {
    logger.error("missing messageId or channelId");
  }

  // TODO: Refactor this stuff into a discord module, or use discord.js
  const quickReplies = requestJson.quick_replies ?? [];
  const messageJson = {
    content: requestJson.text,
    embeds: (requestJson.attachments ?? []).map((a) => createEmbed(a)),
    components:
      quickReplies.length > 0
        ? [
            createActionRowWithComponents(
              quickReplies.map((qr) => createButtonComponent(qr)),
            ),
          ]
        : [],
  };

  try {
    const { discordBotToken } = getDiscordEnvars();
    const url = `https://discord.com/api/channels/${channelId}/messages`;
    console.log(messageJson);
    const discordResponse = await fetch(url, {
      method: "POST",
      body: JSON.stringify(messageJson),
      headers: new Headers({
        Authorization: `Bot ${discordBotToken}`,
        "Content-Type": "application/json",
      }),
    });
    fetch(getUrl("/sent"), {
      method: "POST",
      body: JSON.stringify({ id: messageId }),
    })
      .then(() =>
        logger.debug(`Successfully hit RapidPro /sent for message`, messageId),
      )
      .catch(() =>
        logger.error(`Error reaching RapidPro /sent for message`, messageId),
      );
    const discordResponseJson = await discordResponse.json();
    logger.debug(
      `Response from ${url}: (${discordResponse.statusText})`,
      discordResponseJson,
    );
    if (discordResponse.ok) {
      fetch(getUrl("/delivered"), {
        method: "POST",
        body: JSON.stringify({ id: messageId }),
      })
        .then(() =>
          logger.debug(
            `Successfully hit RapidPro /delivered for message`,
            messageId,
          ),
        )
        .catch(() =>
          logger.error(
            `Error reaching RapidPro /delivered for message`,
            messageId,
          ),
        );
    } else {
      fetch(getUrl("/failed"), {
        method: "POST",
        body: JSON.stringify({ id: messageId }),
      })
        .then(() =>
          logger.debug(
            `Successfully hit RapidPro /failed for message`,
            messageId,
          ),
        )
        .catch(() =>
          logger.error(
            `Error reaching RapidPro /failed for message`,
            messageId,
          ),
        );
    }
  } catch (e) {
    logger.error("Error creating message in Discord", e);
  }
}
