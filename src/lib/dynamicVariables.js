/**
 * Dynamic Variables utility for QuizMeBaby
 * Supports placeholders like {{nome}}, {{email}}, {{score}}, {{total_perguntas}}
 */

export const AVAILABLE_VARIABLES = [
  { key: 'nome', label: 'Nome', description: 'Nome do lead capturado' },
  { key: 'email', label: 'Email', description: 'Email do lead capturado' },
  { key: 'score', label: 'Score', description: 'Pontuação atual do respondente' },
  { key: 'total_perguntas', label: 'Total', description: 'Número total de perguntas' },
];

const VARIABLE_REGEX = /\{\{(\w+)\}\}/g;

/**
 * Replace {{variable}} placeholders with actual values
 */
export function replaceVariables(text, values = {}) {
  if (!text) return text;
  return text.replace(VARIABLE_REGEX, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
}

/**
 * Parse text into segments of plain text and variable references
 * Returns array of { type: 'text'|'variable', value: string, key?: string }
 */
export function parseVariableSegments(text) {
  if (!text) return [{ type: 'text', value: '' }];

  const segments = [];
  let lastIndex = 0;
  const regex = new RegExp(VARIABLE_REGEX.source, 'g');
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'variable', key: match[1], value: match[0] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: text }];
}

/**
 * Check if text contains any variable placeholders
 */
export function hasVariables(text) {
  if (!text) return false;
  return new RegExp(VARIABLE_REGEX.source).test(text);
}
