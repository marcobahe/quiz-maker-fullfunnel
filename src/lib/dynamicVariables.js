/**
 * Dynamic Variables utility for QuizMeBaby
 * Supports placeholders like {{nome}}, {{email}}, {{score}}, {{total_perguntas}}
 */

export const AVAILABLE_VARIABLES = [
  { key: 'nome', label: 'Nome', description: 'Nome do lead capturado' },
  { key: 'email', label: 'Email', description: 'Email do lead capturado' },
  { key: 'score', label: 'Score', description: 'Pontuação atual do respondente' },
  { key: 'total_perguntas', label: 'Total', description: 'Número total de perguntas' },
  // Answer variables (dynamic, generated at runtime)
  { key: 'q1', label: 'Q1', description: 'Resposta da pergunta 1' },
  { key: 'q2', label: 'Q2', description: 'Resposta da pergunta 2' },
  { key: 'q3', label: 'Q3', description: 'Resposta da pergunta 3' },
  { key: 'q4', label: 'Q4', description: 'Resposta da pergunta 4' },
  { key: 'q5', label: 'Q5', description: 'Resposta da pergunta 5' },
  { key: 'q1_score', label: 'Q1 Score', description: 'Score da pergunta 1' },
  { key: 'q2_score', label: 'Q2 Score', description: 'Score da pergunta 2' },
  { key: 'q3_score', label: 'Q3 Score', description: 'Score da pergunta 3' },
  { key: 'q4_score', label: 'Q4 Score', description: 'Score da pergunta 4' },
  { key: 'q5_score', label: 'Q5 Score', description: 'Score da pergunta 5' },
];

const VARIABLE_REGEX = /\{\{(\w+)\}\}/g;

/**
 * Replace {{variable}} placeholders with actual values
 * @param {string} text - Text containing variables
 * @param {object} values - Object with variable values
 * @param {boolean} removeUnresolved - Remove unresolved variables instead of keeping them
 */
export function replaceVariables(text, values = {}, removeUnresolved = true) {
  if (!text) return text;
  return text.replace(VARIABLE_REGEX, (match, key) => {
    if (values[key] !== undefined) {
      return String(values[key]);
    }
    // Remove unresolved variables by default (for clean output)
    return removeUnresolved ? '' : match;
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

/**
 * Generate complete list of variables including dynamic question variables
 */
export function getAvailableVariables(totalQuestions = 10) {
  const base = [
    { key: 'nome', label: 'Nome', description: 'Nome do lead capturado' },
    { key: 'email', label: 'Email', description: 'Email do lead capturado' },
    { key: 'score', label: 'Score', description: 'Pontuação atual do respondente' },
    { key: 'total_perguntas', label: 'Total', description: 'Número total de perguntas' },
  ];

  // Add question answer variables
  for (let i = 1; i <= totalQuestions; i++) {
    base.push(
      { key: `q${i}`, label: `Q${i}`, description: `Resposta da pergunta ${i}` },
      { key: `q${i}_score`, label: `Q${i} Score`, description: `Score da pergunta ${i}` }
    );
  }

  return base;
}

/**
 * Process quiz answers into answer variables map
 * Takes quiz flow answers and converts to q1, q2, etc. based on navigation order
 */
export function buildAnswersMap(answers, questionOrder = []) {
  const answersMap = {};
  
  // Create ordered list of question keys
  const orderedKeys = [];
  
  // If we have questionOrder, use it to map answers in the correct sequence
  if (questionOrder.length > 0) {
    questionOrder.forEach(nodeId => {
      const nodeAnswers = Object.keys(answers).filter(key => 
        key === nodeId || key.startsWith(`${nodeId}__`)
      );
      orderedKeys.push(...nodeAnswers);
    });
  } else {
    // Fallback: use answers keys as-is (not ideal for shuffled quizzes)
    orderedKeys.push(...Object.keys(answers));
  }

  // Map to q1, q2, q3, etc.
  orderedKeys.forEach((answerKey, index) => {
    const answer = answers[answerKey];
    const qNumber = index + 1;
    
    if (answer) {
      answersMap[`q${qNumber}`] = answer.answer || '';
      answersMap[`q${qNumber}_score`] = answer.score || 0;
    }
  });

  return answersMap;
}
