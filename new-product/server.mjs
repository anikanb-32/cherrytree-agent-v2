// Serves new-product and /api/reply.
// Live replies need ANTHROPIC_API_KEY or OPENAI_API_KEY in .env,
// or a key pasted in the page (sent only to this server).

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3002;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

loadEnv(join(ROOT, '.env'));

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '').trim();
  }
}

function envKey() {
  return process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || '';
}

function resolveKey(header) {
  return String(header || '').trim() || envKey();
}

function providerFor(key) {
  if (key.startsWith('sk-ant')) return 'anthropic';
  if (process.env.ANTHROPIC_API_KEY && key === process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) return 'anthropic';
  return 'openai';
}

function systemPrompt(body) {
  const { kind, question, section, answers, options } = body;
  const optionLines = (options || [])
    .map((option) => `- ${option.value}: ${option.why}`)
    .join('\n');
  const answerLines = (answers || [])
    .filter((row) => row?.value)
    .map((row) => `- ${row.label}: ${row.value}`)
    .join('\n');

  return [
    'You are the interviewer helping two cofounders draft a cofounder agreement.',
    'Voice: first person, warm, direct, slightly plainspoken. No bullet lists. No preamble.',
    'You are not a lawyer and you do not give legal advice.',
    'React to the specific words they just used — names, places, numbers, hypotheticals. Do not ignore them.',
    'Do not invent facts they did not say. Do not fill in the agreement for them.',
    kind === 'bridge'
      ? 'Write ONE sentence that acknowledges their answer, then stop. The next question will be shown separately. Reply as plain text, not JSON.'
      : kind === 'draft'
        ? [
            'They are editing a cofounder agreement, not in the interview.',
            'Reply as JSON only, no markdown: {"reply":"...","action":"rewrite"|"clarify"}',
            body.intent === 'rewrite'
              ? 'action is rewrite. reply = ONLY the rewritten passage, ready to drop in. Same meaning, cleaner. No quotes around it.'
              : 'action is clarify. reply = two short sentences explaining the selected passage. Not a rewrite.',
            body.quote ? `Selected passage:\n${body.quote}` : '',
          ].join('\n')
      : [
          'The user is in a follow-up, not answering the question yet.',
          'Reply as JSON only, no markdown:',
          '{"reply":"one direct follow-up question","notes":["working note"]}',
          'reply = ONLY the next question. One sentence. Ends with a question mark.',
          'No acknowledgment, recap, praise, or explanation. No "that makes sense", "got it", or "I ask because". Do not restate what they said. Just ask.',
          'notes = the most important facts to document from their message. Each note must be a verbatim 1–3 word phrase copied from their text. Prefer names, places, numbers, roles, dates, constraints. Not filler. Not your advice. Max 6.',
          'If they added nothing new, return the existing notes unchanged.',
          body.readyToMove ? 'You have enough for this question. Do not ask a new interview question.' : '',
        ].join('\n'),
    body.notes?.length ? `Notes already collected for this question:\n${body.notes.map((n) => `- ${n}`).join('\n')}` : '',
    section ? `Current section: ${section}.` : '',
    question?.text ? `Current question: ${question.text}` : '',
    question?.lead ? `Why you asked it: ${question.lead}` : '',
    optionLines ? `Options they can pick:\n${optionLines}` : '',
    answerLines ? `What they have already told you:\n${answerLines}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function toMessages(body) {
  const history = (body.thread || []).slice(-8).map((message) => ({
    role: message.role === 'user' ? 'user' : 'assistant',
    content: [message.lead, message.text].filter(Boolean).join('\n'),
  }));
  if (!history.length || history[history.length - 1].role !== 'user') {
    history.push({ role: 'user', content: body.text });
  }
  return history;
}

async function completeAnthropic(key, system, messages, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Anthropic ${res.status}`);
  return data.content?.map((part) => part.text).join('').trim();
}

async function completeOpenAI(key, system, messages, maxTokens) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.6,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `OpenAI ${res.status}`);
  return data.choices?.[0]?.message?.content?.trim();
}

function tryJson(raw) {
  const fence = String(raw).match(/```(?:json)?\s*([\s\S]*?)```/);
  const src = fence ? fence[1] : raw;
  const start = src.indexOf('{');
  const end = src.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(src.slice(start, end + 1));
  } catch {
    return null;
  }
}

function parseModelOutput(raw, kind) {
  const parsed = tryJson(raw);
  if (kind === 'bridge') {
    return { text: parsed?.reply || parsed?.ack || raw, notes: [] };
  }
  if (parsed?.reply) {
    return {
      text: String(parsed.reply).trim(),
      notes: (parsed.notes || [])
        .map((note) => String(note).trim())
        .filter(Boolean)
        .slice(0, 6),
    };
  }
  return { text: raw, notes: [] };
}

async function handleReply(req, res) {
  let body = {};
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    res.writeHead(400, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'bad json' }));
    return;
  }

  const key = resolveKey(req.headers['x-api-key']);
  if (!key) {
    res.writeHead(503, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'no_key', live: false }));
    return;
  }

  try {
    const system = systemPrompt(body);
    const messages = toMessages(body);
    const maxTokens = body.kind === 'followup' || body.kind === 'draft' ? 360 : 220;
    const raw =
      providerFor(key) === 'anthropic'
        ? await completeAnthropic(key, system, messages, maxTokens)
        : await completeOpenAI(key, system, messages, maxTokens);
    const parsed = parseModelOutput(raw, body.kind);
    if (!parsed.text) throw new Error('empty reply');
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ text: parsed.text, notes: parsed.notes, live: true }));
  } catch (error) {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: String(error.message || error), live: false }));
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, 'http://127.0.0.1');
  let file = decodeURIComponent(url.pathname);
  if (file === '/') file = '/index.html';
  const path = join(ROOT, file);
  if (!path.startsWith(ROOT)) {
    res.writeHead(403);
    res.end();
    return;
  }
  if (!existsSync(path)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
  res.end(readFileSync(path));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (req.method === 'GET' && url.pathname === '/api/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ live: Boolean(envKey()) }));
    return;
  }
  if (req.method === 'POST' && url.pathname === '/api/reply') {
    await handleReply(req, res);
    return;
  }
  if (req.method === 'GET') {
    serveStatic(req, res);
    return;
  }
  res.writeHead(405);
  res.end();
});

server.listen(PORT, () => {
  console.log(`new-product on http://127.0.0.1:${PORT}`);
});
