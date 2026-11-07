// How the agent talks. Edit this file to change replies, classification,
// and the little bridge after someone answers.
//
// Each question has notes the agent draws from when you ask a follow-up.
// Keys on a note are matched against what the user typed.

const QUESTION_START =
  /^(why|what|how|when|where|who|which|should|can|could|would|is|are|do|does|did|will|won't|isn't|aren't|don't|explain|tell me|wait|huh|sorry)\b/i;

const CLARIFY =
  /\b(what do you mean|don't understand|dont understand|not sure (what|i understand)|can you (explain|clarify|say more)|what does .+ mean|why (do you|are you|does this|is this|does it)|how (does|do|should|is|would)|is that|does that|say more)\b/i;

const NOTES = {
  'How the founders met': {
    probe: 'Was one of you already building something when the other showed up?',
    why: 'I ask because the origin story is the first thing people rewrite later. “We were equals from day one” and “I brought them in” are two different companies, and both versions tend to show up once equity is on the table.',
    typical:
      'College, a job, a hackathon, a friend-of-a-friend — it doesn’t matter which. What matters is whether one of you was already in motion when the other arrived.',
    watch:
      'The version that causes trouble is the one where one founder later says they were the starter and the other was help. If that’s true, say it now. If it isn’t, get it on the record.',
    recommend:
      'Tell it the way you’d tell a friend, not the way you’d tell an investor. Specifics hold up; “we just clicked” doesn’t.',
    ack: reflectMeet,
  },
  'Origin of the idea': {
    probe: 'Who had the idea first — or did you arrive at it together?',
    why: 'Who brought the idea quietly becomes an equity argument. When one person conceived it and the other joined to build, they almost always remember the split of credit differently a year on.',
    typical:
      'One founder had the insight, or you arrived at it together. Both are fine — the agreement just needs to know which, because it colors IP and how you talk about contribution.',
    watch:
      '“It was both of us” is the answer people give when they haven’t actually agreed. If one of you had the idea first, that’s not a slight. It’s a fact the document can live with.',
    recommend:
      'Be literal. “I had the idea, they made it real” is a stronger foundation than a polite tie.',
    ack: reflectIdea,
  },
  'How the work is divided today': {
    probe: 'What did each of you actually do this week?',
    why: 'Roles on paper drift from roles in practice. The agreement should describe the real one, or you’ll be arguing about a job description neither of you is doing.',
    typical:
      'One of you is product or engineering, the other is customer or ops — or you’re both still doing everything. Early on, “everything” is honest; it just shouldn’t stay unnamed.',
    watch:
      'The fight is rarely about titles. It’s about who thought they owned a decision that the other person went and made.',
    recommend:
      'Describe the last two weeks of work, not the org chart you wish you had.',
    ack: reflectWork,
  },
  'Commitment level': {
    probe: 'Are you both full-time, or is there a date when that changes?',
    why: 'Uneven commitment is the single biggest source of resentment I see. One founder quits their job, the other keeps consulting “for a few more months,” and nobody renegotiates.',
    typical:
      'Both full-time is the clean version. One full-time and one part-time can work if you write down when the second person joins — and what happens to equity if they don’t.',
    watch:
      '“For now” is the phrase that turns into a year. If someone has a date, put the date in. If they don’t, the agreement should say how you’ll revisit it.',
    recommend:
      'If you aren’t both full-time, don’t paper over it. Write the plan, including what the split does if the plan slips.',
    ack: reflectCommit,
  },
  'Business of the company': {
    probe: 'In one sentence, who is this for and what does it do?',
    why: 'The business description is what IP assignment and any non-compete point back to. Too vague and it protects nothing; too narrow and it misses whatever you pivot into.',
    typical:
      'A sentence: who it’s for and what it does. “A tool that helps independent pharmacies manage inventory” is enough. “A revolutionary platform” is not.',
    watch:
      'Founders write poetry here and then can’t tell, six months later, whether a new product is even in scope.',
    recommend:
      'Write it the way you’d explain it to a stranger at dinner. You can always widen it later, together.',
    example: 'Something like: “Software that helps small clinics schedule staff.” One clause. No manifesto.',
    ack: (text) => `I’ll draft it as ${clip(text, 70)}.`,
  },
  'State of incorporation': {
    probe: 'Delaware, somewhere else, or not incorporated yet?',
    why: 'This decides whose corporate law governs everything else we’re about to write down — equity, vesting, fiduciary duties.',
    typical:
      'Delaware if you think you’ll raise. California if you’re staying small or bootstrapped and already live there. “Not yet” is fine, but equity and IP can’t really bind anyone until there’s an entity.',
    watch:
      'People incorporate wherever they happen to have an address, then pay to move it when an investor asks. That’s a bill you can avoid.',
    recommend:
      'If you have any path to venture money, start in Delaware. If you don’t, don’t spend the extra just to look like you might.',
    legal:
      'I’m not your lawyer, and this isn’t legal advice. Delaware is the default because investors and case law already know it — not because it’s morally better.',
    ack: reflectEntity,
  },
  'Basis for the split': {
    probe: 'What’s the reason for the split — not just the numbers?',
    why: 'This is the section that ends friendships. I’m not going to tell you the number. I want the reasoning written down, because “we agreed it was fair” is not something either of you can point at in two years.',
    typical:
      'Even split is common and signals trust. Contribution-based is fairer on paper and harder to reopen. Leaving it open is fine only if you also say how and by when you’ll decide.',
    watch:
      'The 60/40 that nobody explained. Or the 50/50 that one person later decides was charity. Write the why, not just the fraction.',
    recommend:
      'Pick the split you can defend to each other sober, then write that defense into the document.',
    ack: reflectSplit,
  },
  'Shares on early departure': {
    probe: 'If someone leaves in year one, what happens to their shares?',
    why: 'A one-year cliff means nothing is owed if someone walks early. For whatever has vested, most agreements also let the company buy those shares back at cost. Without that, a founder who left in month fourteen still owns a piece of everything you build afterward.',
    typical:
      'Unvested shares go back to the company. Vested shares are often subject to a repurchase at the price the founder paid — usually a fraction of a cent.',
    watch:
      'Founders skip this because it feels unkind. The unkind version is the person who left still sitting on the cap table while you raise.',
    recommend:
      'If they leave in year one, they should leave the equity too. That’s what the cliff is for.',
    example:
      '“If a founder leaves before the one-year cliff, their shares return to the company. After that, the company can buy vested shares back at cost.”',
    ack: (text) => `That’s the departure rule I’ll write down: ${clip(text, 64)}.`,
  },
  'Vesting schedule': {
    probe: 'Four years with a one-year cliff — or something else?',
    why: 'Vesting is the mechanism that makes equity track contribution over time. It protects the founder who stays at least as much as it protects the company.',
    typical:
      'Four years, one-year cliff, then monthly. That’s what investors expect and what most templates assume.',
    watch:
      'No cliff looks generous and hands a chunk of the company to someone who leaves in month two. A three-year vest is faster; just know you’re off the default.',
    recommend:
      'Unless you have a specific reason, I’d anchor on four years with a one-year cliff.',
    legal:
      'Vesting doesn’t mean the shares aren’t yours — it means they become irrevocably yours on a schedule. Until then the company can take back what isn’t earned.',
    ack: reflectVest,
  },
  'Acceleration on acquisition': {
    probe: 'If you’re acquired, does unvested equity finish automatically?',
    why: 'If you’re acquired holding unvested shares, an acquirer can let you go and keep that equity. Acceleration is the conversation about whether a sale finishes the vest.',
    typical:
      'Double-trigger is the common landing spot: vesting accelerates only if you’re acquired and then pushed out. Single-trigger vests everything the moment the deal closes, which acquirers dislike because they’re paying to keep the team.',
    watch:
      'Founders skip this and find out in diligence that leaving after a sale costs them the unvested half of their company.',
    recommend:
      'Double-trigger, unless you have a reason to want everything vested at close. Single-trigger is a harder sell to a buyer.',
    example:
      'Single-trigger: the vest finishes when the deal closes. Double-trigger: it finishes only if you’re also fired or constructively dismissed afterward.',
    ack: reflectAccel,
  },
  'Decisions requiring unanimity': {
    probe: 'Which calls should require both of you?',
    why: 'This is who can decide what alone. Require unanimity on too much and you deadlock over expense reports. On too little and one of you can make an irreversible call by yourself.',
    typical:
      'The usual both-must-agree list is raising money, selling the company, taking on debt, changing the equity split, and firing a cofounder.',
    watch:
      'Putting “hires” or “product direction” on the unanimous list sounds aligned and then freezes the company. Those can be consult-then-decide.',
    recommend:
      'Start with the irreversible ones — money in, company out, debt, equity, and removing a founder. Add more only if you both already fight about them.',
    example:
      'A tight list: issuing stock, taking a loan, selling or merging, changing founder equity, and terminating a founder.',
    ack: (text) => `Unanimous, then: ${clip(text, 72)}.`,
  },
  'Deadlock resolution': {
    probe: 'When you disagree on one of those, who breaks the tie?',
    why: 'You will disagree on one of the unanimous items. The process has to exist before you need it. Agreeing on a tiebreaker while you’re already stuck is close to impossible.',
    typical:
      'A named outside advisor is the usual first step. CEO-decides is faster and more honest about power. A coin flip is neutral and settles nothing about who was right.',
    watch:
      '“We’ll figure it out” is the most common answer, and the one I’d push back on. Mid-argument is the worst time to invent a court.',
    recommend:
      'Name a person you both already trust. You almost never call them. Their job is to make the rest of the argument behave.',
    ack: reflectDeadlock,
  },
  'IP assignment': {
    probe: 'Has everything built for the company been assigned in writing?',
    why: 'Unassigned IP is one of the most common things that stalls a fundraise or an acquisition once diligence starts. “Yes” without paperwork doesn’t survive that.',
    typical:
      'Everything built for the company gets assigned to the company, in writing, including work from before you incorporated if it was for this idea.',
    watch:
      'A founder’s old employer, or a contractor who never signed an assignment, can own a piece of what you think is yours.',
    recommend:
      'If it isn’t in writing, treat it as not done. This is the cleanup you want finished before you raise or sell.',
    legal:
      'Assignment has to be in writing. A conversation, a Slack, or “of course it’s the company’s” is not an assignment.',
    ack: reflectIP,
  },
  'Pre-existing IP': {
    probe: 'Is there anything from before the company that needs to stay yours?',
    why: 'Work from before the company isn’t automatically the company’s — not even if you built it for this idea, not even if you were the only one who touched it. It needs a formal assignment, or an explicit license if you want to keep personal ownership.',
    typical:
      'Assign what was built for this company. Keep a short excluded list for personal tools, prior projects, and anything that isn’t the business.',
    watch:
      'The vague “whatever I built before is mine” carve-out is how you accidentally keep the thing the company is. Be specific about what stays personal.',
    recommend:
      'If it exists because of this idea, assign it. If it’s a side library you want to reuse later, name it and license it in.',
    example:
      '“Code and designs made for this product are the company’s. My prior open-source library X is excluded and licensed to the company.”',
    ack: (text) => `Pre-existing IP, then: ${clip(text, 70)}.`,
  },
};

const GLOSSARY = [
  {
    keys: ['cliff'],
    text: 'A cliff is a waiting period — usually a year — before any equity vests. Leave before it and you walk with nothing. It’s how you avoid giving a chunk of the company to someone who stayed three months.',
  },
  {
    keys: ['vesting', 'vest '],
    text: 'Vesting means the shares become irrevocably yours on a schedule, typically monthly after a one-year cliff, over four years. Until then the company can take back what isn’t earned.',
  },
  {
    keys: ['double-trigger', 'double trigger'],
    text: 'Double-trigger acceleration finishes your vest only if two things happen: the company is acquired, and you’re pushed out afterward. It’s the version acquirers will usually accept.',
  },
  {
    keys: ['single-trigger', 'single trigger'],
    text: 'Single-trigger acceleration vests everything the moment a sale closes. Founders like it; buyers don’t, because they just paid for a team that can leave fully vested.',
  },
  {
    keys: ['delaware'],
    text: 'Delaware is the default for venture-backed startups — predictable corporate law, and investors will often ask you to reincorporate there before a priced round anyway.',
  },
  {
    keys: ['cap table', 'captable'],
    text: 'The cap table is the list of who owns what. A founder who left with vested shares still sits on it, which is why departure and repurchase rules matter.',
  },
  {
    keys: ['assignment', 'assign'],
    text: 'Assignment is the written transfer of IP to the company. Without it, the person who wrote the code still owns the code, even if everyone “knows” it’s the company’s.',
  },
  {
    keys: ['non-compete', 'noncompete', 'non compete'],
    text: 'A non-compete tries to stop a founder from building the same thing next door. They’re hard to enforce in some states — California especially — and they only work if the business description is clear.',
  },
  {
    keys: ['deadlock'],
    text: 'A deadlock is when you both have to agree and you don’t. Without a written way out, the company just stops on that decision.',
  },
  {
    keys: ['shotgun'],
    text: 'A shotgun clause is a buy-sell: one founder names a price, the other has to buy or sell at that price. It almost never gets used. Its job is to keep both of you reasonable.',
  },
];

function lower(text) {
  return String(text).toLowerCase();
}

function clip(text, n) {
  const t = String(text).trim().replace(/\s+/g, ' ');
  if (t.length <= n) return `“${t}”`;
  return `“${t.slice(0, n).replace(/\s+\S*$/, '')}…”`;
}

function has(text, keys) {
  const s = lower(text);
  return keys.some((key) => s.includes(key));
}

function matchOption(text, question) {
  if (!question?.options) return null;
  const s = lower(text);
  return (
    question.options.find((option) => {
      const value = lower(option.value);
      return s === value || s.includes(value);
    }) || null
  );
}

function exactOption(text, question) {
  if (!question?.options) return null;
  const s = lower(text).replace(/[.!]+$/, '').trim();
  return question.options.find((option) => lower(option.value) === s) || null;
}

function notesFor(question) {
  return (question && NOTES[question.label]) || null;
}

function looksLikeQuestion(text) {
  const t = String(text).trim();
  if (!t) return false;
  if (t.endsWith('?')) return true;
  if (QUESTION_START.test(t)) return true;
  if (CLARIFY.test(t)) return true;
  return false;
}

function isUnsureAnswer(text, question) {
  const t = lower(text).replace(/[.!]+$/, '').trim();
  if (!/^(not sure|idk|i don't know|i dont know|unsure|still deciding|tbd|n\/a)$/.test(t)) return false;
  return Boolean(question?.options?.some((option) => /not sure|still deciding|unsure/i.test(option.value)));
}

function isFollowUp(text, question, { fromChoice = false, completed = false } = {}) {
  if (completed) return true;
  if (fromChoice) return false;
  if (exactOption(text, question) || isUnsureAnswer(text, question)) return false;
  if (looksLikeQuestion(text)) return true;
  return false;
}

function topicReply(text, notes) {
  if (!notes) return null;
  const rules = [
    { keys: ['why', 'matter', 'important', 'asking', 'ask this'], field: 'why' },
    { keys: ['typical', 'usual', 'standard', 'common', 'most people', 'normal', 'default', 'everyone'], field: 'typical' },
    { keys: ['wrong', 'risk', 'problem', 'dispute', 'fight', 'resent', 'happen if', 'worry'], field: 'watch' },
    { keys: ['example', 'look like', 'for instance', 'sample'], field: 'example' },
    { keys: ['recommend', 'should we', 'what do you', 'advice', 'suggest', 'best'], field: 'recommend' },
    { keys: ['lawyer', 'legal', 'attorney', 'law', 'advice'], field: 'legal' },
  ];
  for (const rule of rules) {
    if (notes[rule.field] && has(text, rule.keys)) return notes[rule.field];
  }
  return null;
}

function glossaryReply(text) {
  const s = lower(text);
  const hit = GLOSSARY.find((entry) => entry.keys.some((key) => s.includes(key)));
  return hit ? hit.text : null;
}

function optionsReply(text, question) {
  if (!question?.options) return null;
  const mentioned = question.options.filter((option) => lower(text).includes(lower(option.value)));
  if (mentioned.length >= 2) {
    return mentioned.map((option) => `${option.value}: ${option.why}`).join(' ');
  }
  if (mentioned.length === 1) return mentioned[0].why;
  if (has(text, ['option', 'choices', 'difference', 'versus', ' vs', 'or just'])) {
    return question.options.map((option) => `${option.value} — ${option.why}`).join(' ');
  }
  return null;
}

function defaultReply(question, notes) {
  if (notes?.why) return notes.why;
  if (question?.lead) return question.lead;
  return 'Ask me why this matters, what’s typical, or what usually goes wrong — or just answer in your own words.';
}

function firstSentence(text) {
  const match = String(text).match(/^[^.!?]+[.!?]/);
  return (match ? match[0] : text).trim();
}

function uncapitalize(text) {
  return String(text).replace(/^\s*([A-Z])/, (_, ch) => ch.toLowerCase()).trim();
}

function scenarioOf(text) {
  const match = String(text).match(
    /\b(?:what if|suppose|say(?:ing)?|if)\s+(.+?)(?:\?|[.]|$)/i,
  );
  return match ? uncapitalize(match[1]) : '';
}

function onlyQuestion(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return raw;
  const parts = raw.match(/[^.!?]+[.!?]+(?:["”')\]]+)?|[^.!?]+$/g) || [raw];
  const bits = parts.map((part) => part.trim()).filter(Boolean);
  const questions = bits.filter((part) => /\?\s*$/.test(part));
  return (questions.pop() || bits.pop() || raw).trim();
}

function followUpReply({ text, question, completed = false }) {
  const notes = notesFor(question);
  const scenario = scenarioOf(text);
  if (scenario) return `If ${scenario}, does that change the answer?`;
  if (completed) return 'Anything else I should know here?';
  return notes?.probe || 'What else should I know about this?';
}

function reflectMeet(text) {
  const s = lower(text);
  if (has(s, ['hackathon'])) return 'A hackathon — so you were building before you were a company.';
  if (has(s, ['college', 'school', 'university', 'class'])) return 'Meeting in school usually means the relationship predates the idea.';
  if (has(s, ['work', 'job', 'colleague', 'coworker', 'office'])) {
    return 'Meeting at work is common — just be clean about what belongs to the old employer.';
  }
  if (has(s, ['friend'])) return 'Starting as friends is a feature until the first hard conversation. That’s why we’re writing this down.';
  if (has(s, ['online', 'twitter', 'internet', 'discord', 'slack'])) {
    return 'Meeting online is fine. The thing to pin down is who was already in motion.';
  }
  return `I’ll keep the origin as ${clip(text, 56)}.`;
}

function reflectIdea(text) {
  const s = lower(text);
  if (has(s, ['together', 'both', 'we both', 'shared'])) {
    return 'If it really was both of you, that’s the cleanest version — just be sure you both tell it that way.';
  }
  if (has(s, ['i had', 'my idea', 'i came up', 'i thought'])) {
    return 'One person bringing the idea isn’t a problem. It just shouldn’t be a surprise later.';
  }
  return `Origin of the idea: ${clip(text, 56)}.`;
}

function reflectWork(text) {
  return `That’s the working split I’ll write down: ${clip(text, 64)}.`;
}

function reflectCommit(text) {
  const s = lower(text);
  if (has(s, ['full-time', 'full time', 'both full'])) return 'Both full-time is the version that causes the fewest arguments later.';
  if (has(s, ['part-time', 'part time', 'consulting', 'nights', 'weekend'])) {
    return 'Uneven time can work — only if the plan, and the date, are in the document.';
  }
  return `Commitment, then: ${clip(text, 56)}.`;
}

function reflectEntity(text) {
  if (has(text, ['delaware'])) return 'Delaware — that’s the path of least resistance if you ever raise.';
  if (has(text, ['california'])) return 'California is workable if you’re staying put and not optimizing for a priced round.';
  if (has(text, ['not yet'])) return 'Not incorporated yet is fine. We’ll write the rest as intention until there’s an entity.';
  return `I’ll put the jurisdiction down as ${clip(text, 40)}.`;
}

function reflectSplit(text) {
  if (has(text, ['even'])) return 'An even split is simple, and it signals trust.';
  if (has(text, ['contribution'])) return 'Contribution-based is fairer on paper — and you’ll want that reasoning in writing.';
  if (has(text, ['still deciding', 'not sure'])) return 'Leaving it open only works if you also say how you’ll close it.';
  if (has(text, ['lawyer'])) return 'A lawyer’s recommendation still needs both of you to actually agree with it.';
  return `The basis I’ll record: ${clip(text, 56)}.`;
}

function reflectVest(text) {
  if (has(text, ['4 year', 'four year', '1-year', 'one-year', '1 year'])) {
    return 'Four years, one-year cliff — that’s the schedule people will expect.';
  }
  if (has(text, ['3 year', 'three year', 'no cliff'])) {
    return 'Faster vest, no cliff — just know you’re handing equity to someone who can leave immediately.';
  }
  if (has(text, ['not sure'])) return 'If you’re unsure, I’d still write the four-year, one-year-cliff default for now.';
  return `Vesting: ${clip(text, 56)}.`;
}

function reflectAccel(text) {
  if (has(text, ['double'])) return 'Double-trigger — the version that usually survives a buyer’s counsel.';
  if (has(text, ['single'])) return 'Single-trigger is founder-friendly, and a harder conversation with an acquirer.';
  if (has(text, ['no', 'none', 'not'])) return 'No acceleration. Worth being sure, because a sale can otherwise leave unvested shares on the table.';
  return `Acceleration: ${clip(text, 56)}.`;
}

function reflectDeadlock(text) {
  if (has(text, ['advisor'])) return 'An outside advisor — neutral, a little slow, and usually respected.';
  if (has(text, ['ceo'])) return 'The CEO decides. Fast, and honest about where power already sits.';
  if (has(text, ['coin'])) return 'A coin flip is perfectly neutral. I’d keep it off the irreversible calls.';
  if (has(text, ['not sure'])) return 'This is the one I’d rather you not leave open.';
  return `Deadlock: ${clip(text, 56)}.`;
}

function reflectIP(text) {
  if (has(text, ['yes'])) return 'Good — make sure that’s actually on paper, not just agreed in conversation.';
  if (has(text, ['no'])) return 'Then this goes near the top of the list, before you raise or sell.';
  if (has(text, ['not sure'])) return 'Worth checking prior employment contracts before you guess.';
  return `IP assignment: ${clip(text, 48)}.`;
}

function stripFirstSentence(lead) {
  const rest = String(lead).replace(/^[^.!?]+[.!?]\s*/, '');
  return rest || lead;
}

function bridge(text, question) {
  const notes = notesFor(question);
  if (typeof notes?.ack === 'function') return notes.ack(text, question);
  const option = exactOption(text, question);
  if (option) return `${option.value}.`;
  return null;
}

function nextLead(text, question, next) {
  return next?.lead || '';
}

function nextLeadFrom(ack, next) {
  if (!ack || !next?.lead) return next?.lead || ack || '';
  return `${ack.replace(/\s+/g, ' ').trim()} ${stripFirstSentence(next.lead)}`;
}

function clipNote(text) {
  const line = String(text).trim().replace(/\s+/g, ' ');
  if (line.length <= 110) return line;
  return `${line.slice(0, 107).replace(/\s+\S*$/, '')}…`;
}

const FILLER = new Set(
  'a an and are as at be but by for from had has have i if in is it its just like my of on or our so that the this to we was were with you your they them their really very actually basically probably maybe kinda yeah yes ok okay well um uh also then than too not about into over after before because while when where who what how why which'.split(
    ' ',
  ),
);

const VAGUE = new Set(
  'thing things stuff something anything someone somehow pretty quite kind sort feel think guess want wanted trying maybe probably basically honestly literally'.split(
    ' ',
  ),
);

const SIGNAL = new Set(
  (
    'college school university class hackathon job work coworker coworkers colleague office friends friend online ' +
    'idea together both engineering product sales ops design full-time part-time consulting nights weekends quit left ' +
    'delaware california incorporated entity startup equity split even contribution cliff vest vesting vested unvested ' +
    'shares stock four-year one-year accelerate acceleration single-trigger double-trigger acquire acquired acquisition ' +
    'unanimous deadlock advisor ceo ip assigned assignment license pre-existing contractor employer'
  ).split(' '),
);

function tokenize(text) {
  const tokens = [];
  const re = /[A-Za-z0-9$][A-Za-z0-9'’/%-]*/g;
  let match;
  while ((match = re.exec(String(text)))) {
    const word = match[0].replace(/[-/]+$/g, '');
    if (!word) continue;
    tokens.push({ word, start: match.index, end: match.index + word.length });
  }
  return tokens;
}

function phraseScore(words) {
  const lower = words.map((word) => word.toLowerCase());
  const content = lower.filter((word) => word && !FILLER.has(word));
  if (!content.length) return -1;
  if (words.length === 1 && content[0].length < 4 && !/\d/.test(content[0]) && !SIGNAL.has(content[0])) {
    return -1;
  }
  if (content.every((word) => VAGUE.has(word))) return -1;

  let score = words.length * 3;
  words.forEach((word, i) => {
    const w = lower[i];
    if (/\d/.test(w) || /%/.test(w) || /\$/.test(w)) score += 6;
    if (SIGNAL.has(w)) score += 5;
    if (/^[A-Z]/.test(word) && word.length > 1) score += 4;
    if (FILLER.has(w)) score -= 2;
    else score += 2;
    if (VAGUE.has(w)) score -= 3;
  });
  return score;
}

function criticalPhrases(text, limit = 3) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return [];
  if (looksLikeQuestion(raw) && !scenarioOf(raw) && raw.split(' ').length < 12) return [];

  const tokens = tokenize(raw);
  const candidates = [];
  for (let n = 3; n >= 1; n--) {
    for (let i = 0; i + n <= tokens.length; i++) {
      const slice = tokens.slice(i, i + n);
      const words = slice.map((token) => token.word);
      const score = phraseScore(words);
      if (score < 4) continue;
      candidates.push({
        text: raw.slice(slice[0].start, slice[n - 1].end),
        start: slice[0].start,
        end: slice[n - 1].end,
        score,
        n,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score || b.n - a.n || a.start - b.start);
  const picked = [];
  candidates.forEach((candidate) => {
    if (picked.length >= limit) return;
    if (picked.some((item) => candidate.start < item.end && candidate.end > item.start)) return;
    picked.push(candidate);
  });
  return picked.sort((a, b) => a.start - b.start).map((item) => item.text);
}

function collectFrom(text, prior = []) {
  const next = prior.slice();
  const bits = criticalPhrases(text);
  if (!bits.length) {
    const scenario = scenarioOf(text);
    const fallback = scenario ? clipNote(scenario) : looksLikeQuestion(text) ? '' : clipNote(text);
    if (fallback) bits.push(fallback);
  }
  bits.forEach((bit) => {
    const key = bit.toLowerCase();
    if (next.some((note) => note.toLowerCase() === key)) return;
    next.push(bit);
  });
  return next.slice(-6);
}

function suggestContinue(text) {
  const line =
    'I think I have enough to work from. Keep adding if you want, or continue when you’re ready.';
  const said = String(text || '').trim();
  if (/enough to (work from|go on)|continue when you|next question/i.test(said)) return said;
  return said ? `${said} ${line}` : line;
}

function draftAssist({ intent = 'rewrite', quote = '', text = '' } = {}) {
  const passage = String(quote || text || '').trim();
  if (intent === 'clarify') {
    return passage
      ? `This is saying ${clip(passage, 90)}. It should match what you both actually agreed — if it doesn’t, change it before anyone signs.`
      : 'Select a passage and I can explain what it is doing in the agreement.';
  }
  if (!passage) return 'Select a passage first, then ask for a rewrite.';
  const extra = String(text || '').trim();
  if (extra && extra !== passage && !/^(rewrite|clarify)$/i.test(extra)) {
    return `${passage.replace(/\.$/, '')} (${extra.replace(/\.$/, '')}).`;
  }
  return `${passage.replace(/\.$/, '')}, unless the Founders agree otherwise in writing.`;
}

window.Conversation = {
  isFollowUp,
  followUpReply,
  onlyQuestion,
  nextLead,
  nextLeadFrom,
  bridge,
  collectFrom,
  criticalPhrases,
  suggestContinue,
  draftAssist,
};
