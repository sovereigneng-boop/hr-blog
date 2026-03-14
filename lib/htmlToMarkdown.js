import TurndownService from "turndown";

const turndown = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

turndown.addRule("underline", {
  filter: ["u"],
  replacement: (content) => `<u>${content}</u>`,
});

turndown.addRule("coloredText", {
  filter: (node) => node.nodeName === "SPAN" && node.style.color,
  replacement: (content, node) => {
    const color = node.style.color;
    return `<span style="color:${color}">${content}</span>`;
  },
});

turndown.addRule("fontSize", {
  filter: (node) => node.nodeName === "SPAN" && node.style.fontSize,
  replacement: (content, node) => {
    const size = node.style.fontSize;
    return `<span style="font-size:${size}">${content}</span>`;
  },
});

turndown.addRule("textAlign", {
  filter: (node) =>
    (node.nodeName === "P" || /^H[1-6]$/.test(node.nodeName)) &&
    node.style.textAlign &&
    node.style.textAlign !== "left",
  replacement: (content, node) => {
    const align = node.style.textAlign;
    const tag = node.nodeName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag[1]);
      return `\n\n${"#".repeat(level)} ${content}\n{style="text-align:${align}"}\n\n`;
    }
    return `\n\n<p style="text-align:${align}">${content}</p>\n\n`;
  },
});

turndown.addRule("resizedImage", {
  filter: (node) => node.nodeName === "IMG" && node.getAttribute("width"),
  replacement: (content, node) => {
    const src = node.getAttribute("src") || "";
    const alt = node.getAttribute("alt") || "";
    const width = node.getAttribute("width") || "";
    return `<img src="${src}" alt="${alt}" width="${width}" />`;
  },
});

export function htmlToMarkdown(html) {
  if (!html) return "";
  return turndown.turndown(html);
}
