import { RapidProJson, getUrl } from "../utils/rapidPro";
import { createEmbed, createButtonComponent } from "../utils/discord";
import { getDiscordEnvars } from "../env";

export async function handleRapidProResponse(requestJson: RapidProJson) {
  // https://discord.com/developers/docs/resources/channel#create-message

  const messageId = requestJson.id;
  const channelId = requestJson.to;

  if (!messageId || !channelId) {
    console.error("missing messageId or channelId");
  }

  // TODO: Refactor this stuff into a discord module, or use discord.js
  const messageJson = {
    content: requestJson.text,
    embeds: (requestJson.attachments ?? []).map((a) => createEmbed(a)),
    components: [
      {
        type: 1,
        components: (requestJson.quick_replies ?? []).map((qr) =>
          createButtonComponent(qr),
        ),
      },
    ],
  };

  try {
    const { discordBotToken } = getDiscordEnvars();
    const url = `https://discord.com/api/channels/${channelId}/messages`;
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
        console.debug(`Successfully hit RapidPro /sent for message`, messageId),
      )
      .catch(() =>
        console.error(`Error reaching RapidPro /sent for message`, messageId),
      );
    const discordResponseJson = await discordResponse.json();
    console.debug(
      `Response from ${url}: (${discordResponse.statusText})`,
      discordResponseJson,
    );
    if (discordResponse.ok) {
      fetch(getUrl("/delivered"), {
        method: "POST",
        body: JSON.stringify({ id: messageId }),
      })
        .then(() =>
          console.debug(
            `Successfully hit RapidPro /delivered for message`,
            messageId,
          ),
        )
        .catch(() =>
          console.error(
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
          console.debug(
            `Successfully hit RapidPro /failed for message`,
            messageId,
          ),
        )
        .catch(() =>
          console.error(
            `Error reaching RapidPro /failed for message`,
            messageId,
          ),
        );
    }
  } catch (e) {
    console.error("Error creating message in Discord", e);
  }
}
