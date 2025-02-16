import {
  OmitPartialGroupDMChannel,
  Attachment,
  Message,
  Interaction,
  CacheType,
  InteractionType,
} from "discord.js";
import { getUrl } from "../utils/rapidPro";
import { getDiscordEnvars } from "../env";

type RapidProParams = {
  from: string;
  text: string;
  attachments?: string[];
};

export async function handleIncomingDM(
  message: OmitPartialGroupDMChannel<Message>,
) {
  const channelId = message.channelId; // This is the DM with the User
  const isDM = !message.guildId; // This is None if it's a DM
  const authorId = message.author?.id;
  const { discordAppId } = getDiscordEnvars();

  // Ignore messages from us, or if it's not a DM
  if (authorId === discordAppId || !isDM) {
    console.debug("Ignoring message from bot or not a DM");
    return;
  }

  if (!channelId) {
    // or if it's not a DM
    console.error("Got a message missing channel_id");
    return;
  }
  const messageContent = message.content;
  const attachments: Attachment[] = message.attachments
    ? Array.from(message.attachments.values())
    : [];
  const queryParams: RapidProParams = {
    from: channelId,
    text: messageContent,
  };
  if (attachments && attachments.length > 0) {
    queryParams.attachments = attachments.map((a: Attachment) => a.proxyURL);
  }

  // Sending the channel_id as `from` should ensure rapidpro gives us the channel id back in the 'to' field
  const url = getUrl("/receive", queryParams);

  try {
    const rapidProResponse = await fetch(url, { method: "POST" });
    const rapidProResponseJson = await extractJson(rapidProResponse);
    console.debug(
      `Response from ${url}: (${rapidProResponse.statusText})`,
      rapidProResponseJson,
    );
  } catch (e) {
    console.error(`Error reaching ${url}`, e);
  }
}

export async function handleQuickResponse(interaction: Interaction<CacheType>) {
  // Determine the user from the requestJson
  const channelId = interaction.channelId;
  const interactionType = interaction.type;
  if (interactionType !== InteractionType.MessageComponent) {
    console.warn(
      `Unexpectedly received non-MESSAGE_COMPONENT interactionType: ${interactionType}`,
    );
    return;
  }
  const quickReplySelected = interaction.customId;
  const url = getUrl("/receive", {
    from: channelId,
    text: quickReplySelected,
  });

  try {
    const rapidProResponse = await fetch(url, { method: "POST" });
    const rapidProResponseJson = await extractJson(rapidProResponse);
    console.debug(
      `Response from ${url}: (${rapidProResponse.statusText})`,
      rapidProResponseJson,
    );
  } catch (e) {
    console.error(`Error reaching ${url}`, e);
  }
  // TODO: We could store the interaction id here so that when rapidpro
  // sends us back a message we can have it as an interaction response
  // or interaction follow-up
  // This would let us avoid rate limit restrictions
}

async function extractJson(response: Response) {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const responseBody = await response.text();
    throw new TypeError(responseBody);
  }
  return await response.json();
}
