import { ButtonStyle, ComponentType } from "discord.js";

export function createEmbed(url: string) {
  return { url: url, title: url };
}

export function createButtonComponent(buttonText: string) {
  return {
    type: ComponentType.Button,
    style: ButtonStyle.Primary,
    label: buttonText,
    custom_id: buttonText,
  };
}
