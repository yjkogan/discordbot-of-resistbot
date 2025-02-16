import path from "path";
import urlPackage from "url";
import { getRPEnvars } from "../env";

export type RapidProJson = {
  id: string;
  to: string;
  attachments?: string[];
  text: string;
  quick_replies?: string[];
};

export function getUrl(pathname: string, queryParams?: { [key: string]: any }) {
  const { protocol, hostname, basepath } = getRPEnvars();
  const urlObject = {
    protocol,
    hostname,
    pathname: path.join(basepath, pathname),
    query: queryParams,
  };
  return urlPackage.format(urlObject);
}
