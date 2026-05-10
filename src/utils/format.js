export const escapeHtml = (text = "") =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const formatAIResponse = (text = "") => {
  log('FORMAT_AI_RESPONSE_INPUT:', text);
  let formatted = text.trim();

  // --- 1. Нормализация HTML от AI

  // <br> → перенос строки
  formatted = formatted.replace(/<br\s*\/?>/gi, "\n");

  // <ul> → убрать
  formatted = formatted.replace(/<\/?ul>/gi, "");

  // <li> → буллеты
  formatted = formatted.replace(/<li>(.*?)<\/li>/gi, "• $1\n");

  // <p> → переносы
  formatted = formatted.replace(/<\/?p>/gi, "\n");

  // --- 2. Code blocks (markdown fallback)
  formatted = formatted.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // --- 3. Inline code
  formatted = formatted.replace(
    /`([^`\n]+)`/g,
    (_, code) => `<code>${escapeHtml(code)}</code>`
  );

  // --- 4. Bold
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

  // --- 5. Lists (markdown fallback)
  formatted = formatted.replace(/^\s*[-*] (.+)$/gm, "• $1");

  // --- 6. Таблицы → в pre
  formatted = formatted.replace(
    /(\|.+\|\n\|[-| :]+\|\n(?:\|.*\|\n?)*)/g,
    (match) => `<pre>${escapeHtml(match)}</pre>`
  );

  // --- 7. Убираем лишние переносы
  formatted = formatted
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  console.log('FORMAT_AI_RESPONSE_OUTPUT:', formatted);
  return formatted;
};