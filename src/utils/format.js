export const escapeHtml = (text = "") =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const formatAIResponse = (text = "") => {
  let formatted = text.trim();

  // --- 1.
  formatted = formatted.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // --- 2.
  formatted = formatted.replace(
    /`([^`\n]+)`/g,
    (_, code) => `<code>${escapeHtml(code)}</code>`
  );

  // --- 3.
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

  // --- 4.
  formatted = formatted.replace(/^\s*[-*] (.+)$/gm, "• $1");

  // --- 5.
  formatted = formatted.replace(
    /(\|.+\|\n\|[-| :]+\|\n(?:\|.*\|\n?)*)/g,
    (match) => `<pre>${escapeHtml(match)}</pre>`
  );

  // --- 6.
  formatted = formatted.replace(/\n/g, "<br>");

  return formatted;
};