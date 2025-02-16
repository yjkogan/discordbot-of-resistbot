/*
 * These functions exist to delay evaluation of envars
 * so that they can be more easily stubbed by vi.stubEnv.
 * If we read from process.env when the file is first loaded,
 * it's too late for vi.stubEnv to swap out the value.
 */

export function getRPEnvars() {
  const protocol = process.env.RP_SCHEME || "https";
  const hostname = process.env.RP_NETLOC || "";
  const basepath = process.env.RP_BASEPATH || "";
  return {
    protocol,
    hostname,
    basepath,
  };
}

export function getDiscordEnvars() {
  const discordAppId = process.env.DISCORD_APP_ID || "";
  const discordBotToken = process.env.DISCORD_BOT_TOKEN || "";
  return {
    discordAppId,
    discordBotToken,
  };
}
