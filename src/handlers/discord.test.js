import { beforeEach, expect, describe, test, vi } from "vitest";
import { handleIncomingDM, getUrl } from "./dmHandlers";

const BASEPATH = "/c/ds/foo/";
const NETLOC = "localhost";

const TEST_APP_ID = "123";

function stubDiscordEnvars() {
  vi.stubEnv("DISCORD_APP_ID", TEST_APP_ID);
}

function stubRPEnvs() {
  vi.stubEnv("RP_SCHEME", "https");
  vi.stubEnv("RP_NETLOC", NETLOC);
  vi.stubEnv("RP_BASEPATH", BASEPATH);
}

describe("handleIncomingDM", () => {
  beforeEach(() => {
    // @ts-expect-error
    fetch.resetMocks();
  });
  test("no request is sent if it is a DM", () => {
    stubDiscordEnvars();
    // @ts-expect-error
    fetch.mockResponse(JSON.stringify({}));

    // having a guildId means it's not a DM
    handleIncomingDM({ channelId: 123, guildId: 789, author: { id: 123 } });

    expect(fetch.requests().length).toEqual(0);
  });
  test("no request is sent if it is a DM", () => {
    stubDiscordEnvars();

    fetch.mockResponse(JSON.stringify({}));

    handleIncomingDM({
      channelId: 123,
      guildId: undefined,
      author: { id: TEST_APP_ID },
    });

    expect(fetch.requests().length).toEqual(0);
  });

  test("DM from a different user results does forward to RP", () => {
    stubDiscordEnvars();

    fetch.mockResponse(JSON.stringify({}));

    handleIncomingDM({
      channelId: 123,
      guildId: undefined,
      author: { id: TEST_APP_ID + 1 },
    });

    expect(fetch.requests().length).toEqual(1);
    // TODO: Assert what's sent
  });
});

describe("getUrl", () => {
  test("getUrl returns full path, nicely joined", () => {
    stubRPEnvs();
    const result = getUrl("/sent");
    expect(result).toBe(`https://${NETLOC}${BASEPATH}sent`);
    vi.unstubAllEnvs();
  });

  test("getUrl can handle query params", () => {
    stubRPEnvs();
    const result = getUrl("/sent", { from: 123, text: "foo" });
    expect(result).toBe(`https://${NETLOC}${BASEPATH}sent?from=123&text=foo`);
    vi.unstubAllEnvs();
  });
});
