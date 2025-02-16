export function createEmbed(url: string) {
  return { url: url, title: url };
}

export function createButtonComponent(buttonText: string) {
  return { type: 2, style: 1, label: buttonText, custom_id: buttonText };
}
