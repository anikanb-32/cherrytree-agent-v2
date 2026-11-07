// Vanilla port of the dummy cofounder-agreement agent.
// A section with `clause: false` is context, not a numbered term.

const SECTIONS = [
  {
    name: 'Background',
    clause: false,
    questions: [
      {
        lead: 'I’m going to help you put together a cofounder agreement. First I want the two of you on the record — most disputes come from assumptions nobody said out loud.',
        text: 'So, to start: how did you two meet?',
        label: 'How the founders met',
      },
      {
        lead: 'The idea quietly drives the equity conversation later. When one person brought it and the other joined, they almost always remember that differently a year on.',
        text: 'Where did the idea actually come from?',
        label: 'Origin of the idea',
      },
      {
        lead: 'Roles on paper and roles in practice drift apart fast. The agreement should describe the real one.',
        text: 'How are the two of you splitting the work right now?',
        label: 'How the work is divided today',
      },
      {
        lead: 'Uneven commitment is the single biggest source of resentment I see. One founder quits, the other keeps consulting, and nobody renegotiates.',
        text: 'Are you both full-time on this? If not, what’s the plan?',
        label: 'Commitment level',
      },
    ],
  },
  {
    name: 'Company',
    questions: [
      {
        lead: 'The business description is what IP assignment and any non-compete point back to. Too vague and it protects nothing; too narrow and it misses the pivot.',
        text: 'How would you describe what the company does?',
        label: 'Business of the company',
        clause: 'The Company is engaged in the following business: {}',
      },
      {
        lead: 'Now the entity itself. It decides whose corporate law governs everything we’re about to write down.',
        text: 'Where is the company incorporated?',
        label: 'State of incorporation',
        clause: 'Jurisdiction of incorporation: {}',
        options: [
          {
            value: 'Delaware',
            why: 'The default for venture-backed startups — predictable corporate law, and investors will often ask you to reincorporate here before a priced round anyway.',
          },
          {
            value: 'California',
            why: 'Common if you’re staying small or bootstrapped, but it adds its own franchise tax on top of whatever state you’re also registered in.',
          },
          {
            value: 'Not yet incorporated',
            why: 'Fine for now, and worth doing the thinking early — but equity, vesting, and IP assignment can’t bind anyone until there’s an entity to assign them to.',
          },
          {
            value: 'Somewhere else',
            why: 'Less common for startups planning to raise. Tell me where and I’ll flag anything that changes.',
          },
        ],
      },
    ],
  },
  {
    name: 'Equity',
    questions: [
      {
        lead: 'I’m not going to tell you what the split should be — that’s yours. I do want the reasoning written down, because “we agreed it was fair” won’t hold in two years.',
        text: 'How did you land on the split you have today?',
        label: 'Basis for the split',
        clause: 'Founder Shares are allocated on the following basis: {}',
        options: [
          {
            value: 'Even split',
            why: 'Simple, and it signals trust. The risk is resentment later if one of you ends up carrying noticeably more.',
          },
          {
            value: 'Based on contribution',
            why: 'Fairer on paper, harder to agree on up front, and harder still to revisit later without a fight.',
          },
          {
            value: 'Still deciding',
            why: 'Fine to leave open — but then the agreement should say how and by when you’ll decide, or “later” becomes “never.”',
          },
          {
            value: 'A lawyer advised us',
            why: 'Worth documenting the reasoning anyway. A lawyer’s recommendation still needs both of you to actually agree with it.',
          },
        ],
      },
      {
        lead: 'A one-year cliff means nothing is owed if someone walks early. For whatever has vested, most agreements also let the company buy those shares back at cost.',
        text: 'What should happen to a founder’s shares if they leave in year one?',
        label: 'Shares on early departure',
        clause:
          'If a Founder ceases to provide services to the Company during the first year, the parties intend the following: {}',
      },
    ],
  },
  {
    name: 'Vesting',
    questions: [
      {
        lead: 'Vesting is how equity tracks contribution over time. It protects the founder who stays at least as much as it protects the company.',
        text: 'What vesting schedule do you have in mind?',
        label: 'Vesting schedule',
        clause: 'Founder Shares shall vest according to the following schedule: {}',
        options: [
          {
            value: '4 years, 1-year cliff',
            why: 'The startup standard — nothing vests in year one, then monthly after. Investors will expect roughly this.',
          },
          {
            value: '3 years, no cliff',
            why: 'Vests faster and rewards commitment sooner, but hands equity to someone who leaves almost immediately.',
          },
          {
            value: 'Not sure yet',
            why: 'Reasonable. I’d anchor on the four-year, one-year-cliff standard unless you have a specific reason to move off it.',
          },
        ],
      },
      {
        lead: 'If you’re acquired holding unvested shares, an acquirer can let you go and keep that equity. Double-trigger is the more common landing spot.',
        text: 'Should vesting accelerate if the company is acquired?',
        label: 'Acceleration on acquisition',
        clause: 'Upon a Change of Control, vesting shall accelerate as follows: {}',
      },
    ],
  },
  {
    name: 'Decisions',
    questions: [
      {
        lead: 'This is who gets to decide what alone. Require unanimity on too much and you deadlock; on too little and one of you can make an irreversible call.',
        text: 'Which decisions should need both of you to agree?',
        label: 'Decisions requiring unanimity',
        clause: 'The following matters require the unanimous written consent of all Founders: {}',
      },
      {
        lead: 'You will disagree on one of those. The process has to exist before you need it.',
        text: 'How do you want to break a deadlock?',
        label: 'Deadlock resolution',
        clause: 'In the event of a deadlock, the matter shall be resolved as follows: {}',
        options: [
          {
            value: 'An outside advisor',
            why: 'Neutral and usually respected, but it costs a favor or a fee and slows the decision down every time you invoke it.',
          },
          {
            value: 'The CEO decides',
            why: 'Fast, and honest about where power already sits. Worth naming explicitly rather than letting it be assumed.',
          },
          {
            value: 'Coin flip',
            why: 'Perfectly neutral and instant, but it settles nothing about who was right. Fine for small calls, risky for big ones.',
          },
          {
            value: 'Not sure yet',
            why: 'The most common answer, and the one I’d push back on — this is much easier to decide now than mid-argument.',
          },
        ],
      },
    ],
  },
  {
    name: 'IP',
    questions: [
      {
        lead: 'Unassigned IP is one of the most common things that stalls a fundraise or an acquisition. Diligence will find it.',
        text: 'Has everything built so far been assigned to the company?',
        label: 'IP assignment',
        clause:
          'All intellectual property created by the Founders to date has been assigned to the Company: {}',
        options: [
          {
            value: 'Yes',
            why: 'Good — make sure it’s documented in writing. “Yes” without paperwork doesn’t survive diligence.',
          },
          {
            value: 'No',
            why: 'Then this goes near the top of the list. It needs to be cleaned up before you raise or sell.',
          },
          {
            value: 'Not sure',
            why: 'Worth checking prior employment contracts and any IP assignment forms you signed elsewhere — the answer changes what the company actually owns.',
          },
        ],
      },
      {
        lead: 'Work from before the company isn’t automatically the company’s. It needs a formal assignment, or an explicit license if you want to keep it.',
        text: 'Was any of it built before the company existed?',
        label: 'Pre-existing IP',
        clause: 'Intellectual property created prior to the Company’s formation is treated as follows: {}',
      },
    ],
  },
];

const TOTAL_QUESTIONS = SECTIONS.reduce((sum, section) => sum + section.questions.length, 0);

const threads = SECTIONS.map((_, i) => (i === 0 ? firstMessage(0) : []));
const positions = SECTIONS.map(() => 0);
const completed = SECTIONS.map(() => false);
const answers = SECTIONS.map((section) => section.questions.map(() => null));
const notes = SECTIONS.map((section) => section.questions.map(() => []));
const READY_AFTER = 4;
const READY_LINE = 'We got some great information from this conversation.';

let currentSection = 0;
let thinking = false;
let showTyping = false;
let draftOpen = false;
let justFilled = null;
let freshTimer = null;
let notesOpen = false;
const SKIN_STORE = 'understood_skin';
const SKINS = ['pill', 'sentence', 'marks', 'bubbles', 'bubbles-side', 'bubbles-line', 'inline'];
let understoodSkin = sessionStorage.getItem(SKIN_STORE) || 'pill';
if (!SKINS.includes(understoodSkin)) understoodSkin = 'pill';

function isBubblesSkin(skin = understoodSkin) {
  return String(skin).startsWith('bubbles');
}

const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const sectionsRemaining = document.getElementById('sections-remaining');
const tabs = document.getElementById('tabs');
const transcript = document.getElementById('transcript');
const prompt = document.getElementById('prompt');
const collected = document.getElementById('collected');
const memory = document.getElementById('memory');
const skinSwitch = document.getElementById('skin-switch');
const thread = document.getElementById('thread');
const choices = document.getElementById('choices');
let lastSection = currentSection;
let lastAnchor = null;
let handingOff = false;
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const pageProgress = document.getElementById('page-progress');
const liveKeyBtn = document.getElementById('live-key');
const KEY_STORE = 'cherrytree_api_key';
const scrim = document.getElementById('scrim');
const draftPanel = document.getElementById('draft-panel');
const draftTab = document.getElementById('draft-tab');
const draftClose = document.getElementById('draft-close');
const draftBody = document.getElementById('draft-body');

function agentTurn(question) {
  return { role: 'agent', text: question.text, lead: question.lead };
}

function firstMessage(index) {
  return [agentTurn(SECTIONS[index].questions[0])];
}

function isScriptTurn(message) {
  return message.role === 'agent' && !message.followup;
}

function scriptAnchor(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (isScriptTurn(messages[i])) return i;
  }
  return -1;
}

function questionMessageIndex(messages, qi) {
  let seen = -1;
  for (let i = 0; i < messages.length; i++) {
    if (isScriptTurn(messages[i])) {
      seen += 1;
      if (seen === qi) return i;
    }
  }
  return -1;
}

function isTerm(section) {
  return section.clause !== false;
}

function answeredCount() {
  return answers.flat().filter(Boolean).length;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function resizeInput() {
  input.style.height = 'auto';
  input.style.height = `${input.scrollHeight}px`;
}

function absorbKept(message) {
  const found = Conversation.criticalPhrases(message.text, 3).filter(
    (phrase) => phrase.split(/\s+/).length <= 3,
  );
  if (!found.length) {
    message.kept = message.kept || [];
    return;
  }
  message.kept = found;
}

function keptRanges(text, phrases) {
  const taken = [];
  phrases
    .slice()
    .sort((a, b) => b.length - a.length)
    .forEach((phrase) => {
      const needle = String(phrase).trim();
      if (needle.length < 3 || needle.split(/\s+/).length > 3) return;
      const at = text.toLowerCase().indexOf(needle.toLowerCase());
      if (at === -1) return;
      const end = at + needle.length;
      if (taken.some((range) => at < range.end && end > range.start)) return;
      taken.push({ start: at, end, text: text.slice(at, end) });
    });
  return taken.sort((a, b) => a.start - b.start);
}

function fillUserText(body, text, phrases, animate) {
  const ranges = isBubblesSkin() ? keptRanges(text, phrases || []) : [];
  const already = Boolean(body.querySelector('.msg__kept'));
  const markClass = animate && !already ? 'msg__kept msg__kept--in' : 'msg__kept';
  body.replaceChildren();
  if (!ranges.length) {
    body.textContent = text;
    return;
  }
  let cursor = 0;
  ranges.forEach((range) => {
    if (range.start > cursor) body.appendChild(document.createTextNode(text.slice(cursor, range.start)));
    const mark = el('span', markClass, range.text);
    if (animate && !already) mark.style.animationDelay = `${ranges.indexOf(range) * 90}ms`;
    body.appendChild(mark);
    cursor = range.end;
  });
  if (cursor < text.length) body.appendChild(document.createTextNode(text.slice(cursor)));
}

function paintKeptInThread(force = false) {
  const messages = threads[currentSection];
  messages.forEach((message) => {
    if (message.role === 'user') absorbKept(message);
  });
  thread.querySelectorAll('.msg--user[data-msg]').forEach((node) => {
    const index = Number(String(node.dataset.msg).split('-')[1]);
    const message = messages[index];
    const body = node.querySelector('.msg__body');
    if (!message || !body) return;
    const wantMarks = isBubblesSkin();
    const hasMarks = Boolean(body.querySelector('.msg__kept'));
    if (!force && hasMarks) return;
    if (!force && !wantMarks && !hasMarks) return;
    fillUserText(body, message.text, message.kept || [], wantMarks);
  });
}

function messageEl(message) {
  const followup = message.role === 'agent' && message.followup;
  const node = el('div', `msg msg--${message.role}${followup ? ' msg--followup' : ''}`);
  if (message.lead) node.appendChild(el('p', 'msg__lead', message.lead));
  if (message.role === 'user') {
    const body = el('span', 'msg__body');
    absorbKept(message);
    fillUserText(body, message.text, message.kept || [], isBubblesSkin());
    node.appendChild(body);
  } else {
    node.appendChild(document.createTextNode(message.text));
  }
  return node;
}

function typingEl() {
  const node = el('div', 'msg msg--agent typing');
  node.setAttribute('aria-label', 'Typing');
  node.append(el('span'), el('span'), el('span'));
  return node;
}

function threadTail() {
  return thread.querySelector('.typing') || thread.querySelector('.continue');
}

function marker() {
  return thread.querySelector('.memory-marks') || threadTail();
}

function messageNode(message, index, live) {
  const node = messageEl(message);
  node.dataset.msg = `${currentSection}-${index}`;
  if (live) node.classList.add('msg--live');
  return node;
}

function snapshotHandoff() {
  const wrap = el('div', 'handoff');
  wrap.append(prompt.cloneNode(true));
  if (!memory.hidden) wrap.append(memory.cloneNode(true));
  wrap.append(thread.cloneNode(true));
  wrap.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  return { wrap, scroll: thread.scrollTop };
}

function playHandoff({ wrap, scroll }, done) {
  transcript.appendChild(wrap);
  const clonedThread = wrap.querySelector('.thread');
  if (clonedThread) clonedThread.scrollTop = scroll;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    wrap.remove();
    done();
    return;
  }
  const sideways = isBubblesSkin();
  const travel = sideways ? transcript.clientWidth : transcript.clientHeight;
  wrap
    .animate(
      sideways
        ? [{ transform: 'translateX(0)' }, { transform: `translateX(-${travel}px)` }]
        : [{ transform: 'translateY(0)' }, { transform: `translateY(-${travel}px)` }],
      {
      duration: sideways ? 980 : 620,
      easing: sideways ? 'cubic-bezier(0.22, 1, 0.36, 1)' : 'cubic-bezier(0.32, 0.72, 0, 1)',
      fill: 'forwards',
    },
    )
    .finished.then(() => {
      wrap.remove();
      done();
    })
    .catch(() => {
      wrap.remove();
      done();
    });
}

function setChoicesEnabled(wrap, enabled) {
  wrap.querySelectorAll('button').forEach((btn) => {
    btn.disabled = !enabled;
  });
}

function renderChoices() {
  const question = SECTIONS[currentSection].questions[positions[currentSection]];
  const show = !completed[currentSection] && question.options;

  if (!show) {
    choices.hidden = true;
    choices.replaceChildren();
    choices.dataset.sig = '';
    return false;
  }

  const prior = answers[currentSection][positions[currentSection]];
  const sig = `${question.options.map((option) => option.value).join('|')}::${prior || ''}`;
  if (choices.dataset.sig === sig && choices.firstChild && !choices.hidden) {
    setChoicesEnabled(choices, !thinking);
    return false;
  }

  choices.hidden = false;
  choices.dataset.sig = sig;
  choices.replaceChildren();
  question.options.forEach((option) => {
    const picked = option.value === prior;
    const btn = el('button', `choice${picked ? ' choice--picked' : ''}`, option.value);
    btn.type = 'button';
    btn.title = option.why;
    btn.setAttribute('aria-pressed', picked ? 'true' : 'false');
    btn.addEventListener('click', () => send(option.value));
    choices.appendChild(btn);
  });
  setChoicesEnabled(choices, !thinking);
  return true;
}

function applyTranscript(messages, anchor, fromBelow) {
  const prefix = String(currentSection);
  if (thread.dataset.prefix !== prefix) {
    prompt.replaceChildren();
    thread.replaceChildren();
    thread.dataset.prefix = prefix;
  }

  // Only the live question sits in `#prompt`. Leave it alone if it's
  // already the right node — remounting replays the rise animation.
  const question = anchor === -1 ? null : messages[anchor];
  const liveKey = question ? `${currentSection}-${anchor}` : '';
  const currentLive = prompt.querySelector('[data-msg]');
  if (question) {
    if (!currentLive || currentLive.dataset.msg !== liveKey) {
      const live = messageNode(question, anchor, true);
      if (fromBelow) {
        live.classList.add(isBubblesSkin() ? 'msg--enter-top' : 'msg--enter');
      }
      prompt.replaceChildren(live);
    }
  } else if (currentLive) {
    prompt.replaceChildren();
  }

  const wanted = [];
  messages.forEach((message, i) => {
    if (i <= anchor) return;
    wanted.push({ message, i, key: `${currentSection}-${i}` });
  });

  const existing = [...thread.querySelectorAll('[data-msg]')];
  const existingMap = new Map(existing.map((node) => [node.dataset.msg, node]));
  const keep = new Set(wanted.map((item) => item.key));
  existing.forEach((node) => {
    if (!keep.has(node.dataset.msg)) node.remove();
  });

  wanted.forEach(({ message, i, key }) => {
    if (existingMap.has(key)) return;
    thread.insertBefore(messageNode(message, i, false), marker());
  });

  const typing = thread.querySelector('.typing');
  if (thinking && showTyping && !typing) {
    thread.insertBefore(typingEl(), thread.querySelector('.continue'));
  } else if ((!thinking || !showTyping) && typing) {
    typing.remove();
  }

  renderChoices();
  renderContinue();
  thread.scrollTop = thread.scrollHeight;
}

function renderTranscript() {
  const messages = threads[currentSection];
  const anchor = scriptAnchor(messages);
  const jumped = lastAnchor === null || lastSection !== currentSection;
  const advanced = !jumped && lastAnchor !== null && anchor > lastAnchor;

  if (jumped && handingOff) {
    transcript.querySelector('.handoff')?.remove();
    handingOff = false;
  }

  if (advanced) {
    const outgoing = snapshotHandoff();
    lastSection = currentSection;
    lastAnchor = anchor;
    handingOff = true;
    const sideways = isBubblesSkin();
    if (sideways) {
      prompt.replaceChildren();
      hideMemory();
      thread.replaceChildren();
    } else {
      applyTranscript(messages, anchor, true);
      renderCollected();
    }
    playHandoff(outgoing, () => {
      handingOff = false;
      if (sideways) {
        applyTranscript(threads[currentSection], scriptAnchor(threads[currentSection]), true);
        renderCollected();
      }
    });
    return;
  }

  lastSection = currentSection;
  lastAnchor = anchor;
  if (handingOff) return;
  applyTranscript(messages, anchor);
}

let draftMode = false;

function tabState(index) {
  if (draftMode) return index === currentSection ? 'active' : 'done';
  return index === currentSection
    ? 'active'
    : completed[index]
      ? 'done'
      : threads[index].length
        ? 'pending'
        : 'notstarted';
}

function renderTabs() {
  const buttons = [...tabs.children];
  if (buttons.length !== SECTIONS.length) {
    tabs.replaceChildren();
    SECTIONS.forEach((section, index) => {
      const state = tabState(index);
      const btn = el('button', `nav-item nav-item--${state}`);
      btn.type = 'button';
      if (index === currentSection) btn.setAttribute('aria-current', 'step');
      btn.append(el('span', `nav-dot ${state}`), el('span', 'nav-item__name', section.name));
      btn.addEventListener('click', () => openSection(index));
      tabs.appendChild(btn);
    });
    return;
  }
  buttons.forEach((btn, index) => {
    const state = tabState(index);
    btn.className = `nav-item nav-item--${state}`;
    if (index === currentSection) btn.setAttribute('aria-current', 'step');
    else btn.removeAttribute('aria-current');
    const dot = btn.querySelector('.nav-dot');
    if (dot) dot.className = `nav-dot ${state}`;
  });
}

function renderComposer() {
  const isComplete = completed[currentSection];
  const hasChoices =
    !isComplete && SECTIONS[currentSection].questions[positions[currentSection]].options;
  input.placeholder = isComplete
    ? 'Ask a follow-up…'
    : hasChoices
      ? 'Pick one, or say it in your own words…'
      : 'Answer, or ask a question…';
  sendBtn.disabled = !input.value.trim() || thinking;
}

function remainingLabel(remaining) {
  return remaining === 0
    ? 'All sections complete'
    : remaining === 1
      ? '1 section remaining'
      : `${remaining} sections remaining`;
}

function paintDraftTab() {
  draftTab.replaceChildren(
    el('span', 'draft-tab__arrow', draftOpen ? '›' : '‹'),
    el('span', 'draft-tab__label', 'Sample agreement'),
  );
}

function updateDraftChrome() {
  const progress = (answeredCount() / TOTAL_QUESTIONS) * 100;
  const remaining = completed.filter((done) => !done).length;
  progressFill.style.width = `${progress}%`;
  if (pageProgress) pageProgress.style.width = `${progress}%`;
  progressLabel.textContent = `${Math.round(progress)}% complete`;
  sectionsRemaining.textContent = remainingLabel(remaining);

  const wasOpen = draftPanel.classList.contains('draft-panel--open');
  draftPanel.classList.toggle('draft-panel--open', draftOpen);
  scrim.classList.toggle('scrim--on', draftOpen);
  draftTab.setAttribute('aria-expanded', String(draftOpen));
  draftTab.setAttribute('aria-label', draftOpen ? 'Hide the sample agreement' : 'Show the sample agreement');
  draftClose.tabIndex = draftOpen ? 0 : -1;

  const arrow = draftTab.querySelector('.draft-tab__arrow');
  const label = draftTab.querySelector('.draft-tab__label');
  if (wasOpen === draftOpen && arrow && label) {
    arrow.textContent = draftOpen ? '›' : '‹';
    return;
  }
  paintDraftTab();
}

function clauseText(template, value, fresh) {
  const [before, after = ''] = template.split('{}');
  const text = el('span', 'clause__text');
  text.appendChild(document.createTextNode(before));
  if (value) {
    text.appendChild(el('span', `slot slot--filled${fresh ? ' slot--fresh' : ''}`, value));
  } else {
    const blank = el('span', 'slot slot--blank');
    blank.setAttribute('role', 'img');
    blank.setAttribute('aria-label', 'not yet drafted');
    text.appendChild(blank);
  }
  text.appendChild(document.createTextNode(after));
  return text;
}

let lastDraftSig = '';

function renderDraft() {
  const sig = `${currentSection}|${positions.join(',')}|${completed.join(',')}|${answers.flat().join('\0')}|${justFilled}`;
  if (sig === lastDraftSig && draftBody.firstChild) return;
  lastDraftSig = sig;

  const scroll = draftBody.scrollTop;
  const termCount = SECTIONS.filter(isTerm).reduce((n, section) => n + section.questions.length, 0);
  const draftedTerms = SECTIONS.reduce(
    (n, section, index) =>
      isTerm(section) ? n + section.questions.filter((_, qi) => answers[index][qi]).length : n,
    0,
  );

  const doc = el('article', 'doc');
  const head = el('header', 'doc__head');
  const title = el('h2', 'doc__title', 'Cofounder Agreement');
  const progress = el('div', 'doc__progress');
  const bar = el('div', 'doc__bar');
  const barFill = el('div', 'doc__bar-fill');
  barFill.style.width = `${termCount ? (draftedTerms / termCount) * 100 : 0}%`;
  bar.appendChild(barFill);
  progress.append(bar, el('span', 'doc__count', `${draftedTerms} of ${termCount} terms`));
  head.append(el('p', 'doc__eyebrow', 'Draft · unexecuted'), title, progress);
  doc.appendChild(head);

  let clauseNumber = 0;
  SECTIONS.forEach((section, sectionIndex) => {
    const active = sectionIndex === currentSection;

    if (!isTerm(section)) {
      const block = el('section', `recitals${active ? ' is-active' : ''}`);
      const heading = el('h3', 'recitals__title');
      const jump = el('button', 'section-jump', section.name);
      jump.type = 'button';
      jump.dataset.openSection = String(sectionIndex);
      heading.appendChild(jump);
      block.appendChild(heading);

      section.questions.forEach((question, qi) => {
        const value = answers[sectionIndex][qi];
        const key = `${sectionIndex}-${qi}`;
        const open = canOpen(sectionIndex, qi);
        const row = el('div', 'recital');
        const valueClass = `recital__value${value ? '' : ' recital__value--empty'}${
          justFilled === key ? ' slot--fresh' : ''
        }`;
        const valueNode = open ? el('button', valueClass) : el('span', valueClass);
        if (open) {
          valueNode.type = 'button';
          valueNode.dataset.jumpSection = String(sectionIndex);
          valueNode.dataset.jumpQuestion = String(qi);
        }
        valueNode.textContent = value || '—';
        row.append(el('span', 'recital__label', question.label), valueNode);
        block.appendChild(row);
      });

      doc.appendChild(block);
      return;
    }

    clauseNumber += 1;
    const block = el('section', `article${active ? ' is-active' : ''}`);
    const heading = el('h3', 'article__title');
    const jump = el('button', 'section-jump');
    jump.type = 'button';
    jump.dataset.openSection = String(sectionIndex);
    jump.append(el('span', 'article__num', String(clauseNumber)), document.createTextNode(section.name));
    heading.appendChild(jump);
    block.appendChild(heading);

    section.questions.forEach((question, qi) => {
      const value = answers[sectionIndex][qi];
      const key = `${sectionIndex}-${qi}`;
      const open = canOpen(sectionIndex, qi);
      const current = active && qi === positions[currentSection];
      const clause = open ? el('button', 'clause clause--open') : el('div', 'clause');
      if (open) {
        clause.type = 'button';
        clause.dataset.jumpSection = String(sectionIndex);
        clause.dataset.jumpQuestion = String(qi);
      }
      if (current) clause.classList.add('clause--current');

      const label = el('span', 'clause__heading');
      label.append(
        el('span', 'clause__num', `${clauseNumber}.${qi + 1}`),
        document.createTextNode(question.label),
      );
      clause.append(
        label,
        clauseText(question.clause, value, justFilled === key),
      );
      if (open) clause.appendChild(el('span', 'clause__revisit', value ? 'Revisit' : 'Answer'));
      block.appendChild(clause);
    });

    doc.appendChild(block);
  });

  doc.appendChild(
    el(
      'footer',
      'doc__foot',
      'Placeholder language. Nothing here has been reviewed by a lawyer, and nothing is saved.',
    ),
  );

  const enter = el('button', 'doc__enter', 'Open the working draft');
  enter.type = 'button';
  enter.dataset.enterDraft = '1';
  doc.appendChild(enter);

  draftBody.replaceChildren(doc);
  draftBody.scrollTop = scroll;
}

function currentNotes() {
  return notes[currentSection][positions[currentSection]] || [];
}

function writeNotes(next) {
  notes[currentSection][positions[currentSection]] = next;
  collected.dataset.sig = '';
  memory.dataset.sig = '';
  renderCollected();
}

function startNoteEdit(row, index) {
  const current = currentNotes()[index];
  if (current == null) return;
  const inline = Boolean(row.closest('.memory, .memory-marks'));
  const field = el('input', inline ? 'memory__edit' : 'collected__edit');
  field.type = 'text';
  field.value = current;
  if (inline) field.size = Math.max(current.length, 8);
  const remove = row.querySelector('.collected__remove');
  row.replaceChildren(field, remove);
  field.focus();
  field.select();

  let done = false;
  const commit = () => {
    if (done) return;
    done = true;
    const trimmed = field.value.trim();
    const next = currentNotes().slice();
    if (!trimmed) next.splice(index, 1);
    else next[index] = trimmed;
    writeNotes(next);
  };
  field.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      field.blur();
    }
    if (event.key === 'Escape') {
      done = true;
      collected.dataset.sig = '';
      memory.dataset.sig = '';
      renderCollected();
    }
  });
  field.addEventListener('blur', commit);
}

function setNotesOpen(open) {
  notesOpen = open;
  collected.classList.toggle('collected--open', open);
  const toggle = collected.querySelector('.collected__toggle');
  const chevron = collected.querySelector('.collected__chevron');
  if (toggle) toggle.setAttribute('aria-expanded', String(open));
  if (chevron) chevron.textContent = open ? '▾' : '▸';
}

function hideMemory() {
  memory.hidden = true;
  memory.replaceChildren();
  memory.dataset.sig = '';
  thread.querySelector('.memory-marks')?.remove();
}

function noteRemoveBtn(index) {
  const remove = el('button', 'collected__remove', '×');
  remove.type = 'button';
  remove.setAttribute('aria-label', 'Remove');
  remove.addEventListener('click', (event) => {
    event.stopPropagation();
    writeNotes(currentNotes().filter((_, i) => i !== index));
  });
  return remove;
}

function renderListMemory(items, sig) {
  hideMemory();
  if (collected.dataset.sig === sig && collected.firstChild && !collected.hidden) {
    setNotesOpen(notesOpen);
    return;
  }
  collected.hidden = false;
  collected.dataset.sig = sig;

  const inner = el('div', 'collected__inner');
  const toggle = el('button', 'collected__toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', String(notesOpen));
  toggle.append(
    el('span', 'collected__title', 'What I understood'),
    el('span', 'collected__chevron', notesOpen ? '▾' : '▸'),
  );
  toggle.addEventListener('click', () => setNotesOpen(!notesOpen));

  const list = el('div', 'collected__group');
  const panel = el('div', 'collected__panel');
  items.forEach((value, index) => {
    const row = el('div', 'collected__item');
    const text = el('button', 'collected__value', value);
    text.type = 'button';
    text.title = 'Edit';
    text.addEventListener('click', () => startNoteEdit(row, index));
    row.append(text, noteRemoveBtn(index));
    panel.appendChild(row);
  });
  list.appendChild(panel);
  inner.append(toggle, list);
  collected.replaceChildren(inner);
  setNotesOpen(notesOpen);
}

function renderSentenceMemory(items, sig) {
  collected.hidden = true;
  collected.replaceChildren();
  collected.dataset.sig = '';
  thread.querySelector('.memory-marks')?.remove();
  if (memory.dataset.sig === sig && memory.firstChild && !memory.hidden) return;
  memory.hidden = false;
  memory.dataset.sig = sig;
  memory.className = 'memory memory--sentence';

  const line = el('p', 'memory__sentence');
  line.appendChild(el('span', 'memory__lead', 'I understood that '));
  items.forEach((value, index) => {
    if (index > 0) {
      line.appendChild(document.createTextNode(index === items.length - 1 ? ', and that ' : ', that '));
    }
    const clause = el('span', 'memory__clause');
    const text = el('button', 'memory__text', value);
    text.type = 'button';
    text.title = 'Edit';
    text.addEventListener('click', () => startNoteEdit(clause, index));
    clause.append(text, noteRemoveBtn(index));
    line.appendChild(clause);
  });
  line.appendChild(document.createTextNode('.'));
  memory.replaceChildren(line);
}

function renderMarksMemory(items, sig) {
  collected.hidden = true;
  collected.replaceChildren();
  collected.dataset.sig = '';
  memory.hidden = true;
  memory.replaceChildren();
  memory.dataset.sig = '';

  const existing = thread.querySelector('.memory-marks');
  if (existing?.dataset.sig === sig) return;
  existing?.remove();

  const row = el('div', 'memory-marks');
  row.dataset.sig = sig;
  items.forEach((value, index) => {
    const chip = el('span', 'memory__chip');
    const text = el('button', 'memory__text', value);
    text.type = 'button';
    text.title = 'Edit';
    text.addEventListener('click', () => startNoteEdit(chip, index));
    chip.append(text, noteRemoveBtn(index));
    row.appendChild(chip);
  });
  const at = threadTail();
  if (at) thread.insertBefore(row, at);
  else thread.appendChild(row);
}

function renderCollected() {
  const items = currentNotes();
  const sig = `${understoodSkin}:${currentSection}-${positions[currentSection]}:${items.join('|')}`;

  if (!items.length) {
    notesOpen = false;
    collected.hidden = true;
    collected.classList.remove('collected--open');
    collected.replaceChildren();
    collected.dataset.sig = sig;
    hideMemory();
    paintKeptInThread();
    return;
  }

  if (isBubblesSkin() || understoodSkin === 'inline') {
    collected.hidden = true;
    collected.replaceChildren();
    collected.dataset.sig = sig;
    hideMemory();
    paintKeptInThread();
    return;
  }

  if (understoodSkin === 'sentence') {
    renderSentenceMemory(items, sig);
    paintKeptInThread();
    return;
  }
  if (understoodSkin === 'marks') {
    renderMarksMemory(items, sig);
    paintKeptInThread();
    return;
  }
  renderListMemory(items, sig);
  paintKeptInThread();
}

function applyUnderstoodSkin(skin) {
  understoodSkin = SKINS.includes(skin) ? skin : 'pill';
  document.body.dataset.understood = understoodSkin;
  sessionStorage.setItem(SKIN_STORE, understoodSkin);
  collected.dataset.sig = '';
  memory.dataset.sig = '';
  skinSwitch?.querySelectorAll('[data-skin]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.skin === understoodSkin));
  });
  renderCollected();
  paintKeptInThread(true);
  clearContinue();
  renderContinue();
}

function render() {
  renderTabs();
  renderTranscript();
  renderCollected();
  renderComposer();
  updateDraftChrome();
  renderDraft();
}

function canOpen(section, question) {
  if (thinking) return false;
  return threads[section].length === 0 ? question === 0 : question <= positions[section];
}

function exchangeCount(messages, anchor) {
  let users = 0;
  for (let i = Math.max(0, anchor + 1); i < messages.length; i++) {
    if (messages[i].role === 'user') users += 1;
  }
  return users;
}

function shouldOfferContinue() {
  if (completed[currentSection]) return false;
  const messages = threads[currentSection];
  const anchor = scriptAnchor(messages);
  if (anchor === -1) return false;
  return exchangeCount(messages, anchor) >= READY_AFTER;
}

function continueButtonLabel() {
  const section = currentSection;
  const at = positions[section];
  if (at + 1 < SECTIONS[section].questions.length) return 'Next question';
  if (SECTIONS[section + 1]) return SECTIONS[section + 1].name;
  return 'Continue';
}

function continueMode() {
  if (understoodSkin === 'bubbles-side') return 'side';
  if (understoodSkin === 'bubbles-line') return 'line';
  return 'thread';
}

function clearContinue() {
  thread.querySelector('.continue')?.remove();
  document.querySelector('.composer-row > .continue')?.remove();
}

function mountContinue(mode, label) {
  const wrap = el('div', mode === 'thread' ? 'continue' : `continue continue--${mode}`);
  const btn = el('button', 'continue__btn', mode === 'line' ? `${label} →` : label);
  btn.type = 'button';
  btn.disabled = thinking;
  btn.addEventListener('click', continueToNext);
  wrap.append(btn);
  if (mode === 'side') {
    document.querySelector('.composer-row')?.appendChild(wrap);
    return;
  }
  thread.appendChild(wrap);
}

function renderContinue() {
  const offer = shouldOfferContinue();
  const mode = continueMode();
  const existing = thread.querySelector('.continue') || document.querySelector('.composer-row > .continue');
  if (!offer) {
    existing?.remove();
    return;
  }
  const label = continueButtonLabel();
  const current = existing?.classList.contains('continue--side')
    ? 'side'
    : existing?.classList.contains('continue--line')
      ? 'line'
      : existing
        ? 'thread'
        : '';
  if (existing && current === mode) {
    const btn = existing.querySelector('button');
    if (btn) {
      btn.disabled = thinking;
      const next = mode === 'line' ? `${label} →` : label;
      if (btn.textContent !== next) btn.textContent = next;
    }
    return;
  }
  existing?.remove();
  mountContinue(mode, label);
}

function markFilled(section, at) {
  justFilled = `${section}-${at}`;
  clearTimeout(freshTimer);
  freshTimer = setTimeout(() => {
    justFilled = null;
    document.querySelectorAll('.slot--fresh, .collected__item--fresh').forEach((node) => {
      node.classList.remove('slot--fresh', 'collected__item--fresh');
    });
  }, 1400);
}

function inferAnswer(section, at) {
  if (answers[section][at]) return answers[section][at];
  const question = SECTIONS[section].questions[at];
  const messages = threads[section];
  const start = questionMessageIndex(messages, at);
  let last = '';
  for (let i = start + 1; i < messages.length; i++) {
    const message = messages[i];
    if (message.role !== 'user') continue;
    if (!Conversation.isFollowUp(message.text, question, { completed: false })) {
      last = message.text;
    } else if (!last) {
      last = message.text;
    }
  }
  if (last) return last;
  return (notes[section][at] || []).join('; ');
}

function sectionClosing(section) {
  const nextSection = SECTIONS[section + 1];
  return nextSection
    ? `That’s ${SECTIONS[section].name} covered. ${nextSection.name} is what I’d look at next — but ask me anything about this first.`
    : 'That’s the last section. The draft has everything you’ve told me — ask me anything about it.';
}

function continueToNext() {
  if (thinking || completed[currentSection]) return;
  const section = currentSection;
  const questions = SECTIONS[section].questions;
  const at = positions[section];
  const question = questions[at];
  const hasMore = at + 1 < questions.length;
  const value = inferAnswer(section, at);
  if (value) {
    answers[section][at] = value;
    markFilled(section, at);
  }

  if (hasMore) {
    const next = questions[at + 1];
    threads[section] = [
      ...threads[section],
      {
        role: 'agent',
        text: next.text,
        lead: Conversation.nextLead(value || '', question, next),
      },
    ];
    positions[section] = at + 1;
  } else {
    const ack = value ? Conversation.bridge(value, question) : '';
    const closing = sectionClosing(section);
    threads[section] = [...threads[section], { role: 'agent', text: ack ? `${ack} ${closing}` : closing }];
    completed[section] = true;
  }
  render();
  input.focus();
}

function send(choice) {
  const fromChoice = typeof choice === 'string';
  const text = (fromChoice ? choice : input.value).trim();
  if (!text || thinking) return;

  const section = currentSection;
  const at = positions[section];
  const wasComplete = completed[section];
  const question = SECTIONS[section].questions[at];
  const isFollowUp = Conversation.isFollowUp(text, question, {
    fromChoice,
    completed: wasComplete,
  });
  const isAnswer = !wasComplete && !isFollowUp;

  threads[section] = [...threads[section], { role: 'user', text }];
  input.value = '';
  resizeInput();

  if (isAnswer) {
    answers[section][at] = text;
    markFilled(section, at);
  }
  notes[section][at] = Conversation.collectFrom(text, notes[section][at] || []);

  const exchanges = exchangeCount(threads[section], scriptAnchor(threads[section]));
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const highlightMs = isBubblesSkin() ? 820 : 0;
  const dotsMs = 480;

  thinking = true;
  showTyping = !isBubblesSkin();
  render();

  if (!wasComplete && exchanges === READY_AFTER) {
    wait(highlightMs).then(() => {
      threads[section] = [...threads[section], { role: 'agent', followup: true, text: READY_LINE }];
      thinking = false;
      showTyping = false;
      render();
      input.focus();
    });
    return;
  }

  const payload = {
    text,
    kind: 'followup',
    section: SECTIONS[section].name,
    question: { text: question.text, lead: question.lead, label: question.label },
    options: question.options || [],
    answers: draftAnswers(),
    notes: notes[section][at] || [],
    thread: threads[section],
  };

  const livePromise = askModel(payload);
  const dotsReady = wait(highlightMs).then(() => {
    if (currentSection !== section) return;
    showTyping = true;
    render();
  });

  Promise.all([livePromise, dotsReady, wait(highlightMs + dotsMs)]).then(([live]) => {
    const liveText = live?.text || '';
    if (live?.notes?.length) notes[section][at] = live.notes;

    const replyText = Conversation.onlyQuestion(
      liveText ||
        Conversation.followUpReply({
          text,
          question,
          completed: wasComplete,
        }),
    );
    threads[section] = [...threads[section], { role: 'agent', followup: true, text: replyText }];
    thinking = false;
    showTyping = false;
    render();
    input.focus();
  });
}

function revisit(section, target) {
  if (thinking) return;
  const cut = questionMessageIndex(threads[section], target + 1);
  if (cut !== -1) threads[section] = threads[section].slice(0, cut);
  if (completed[section]) completed[section] = false;
  notes[section][target] = [];
  for (let i = target + 1; i < notes[section].length; i++) notes[section][i] = [];
  positions[section] = target;
  currentSection = section;
  render();
  input.focus();
}

function goBack() {
  if (thinking) return;
  const target = completed[currentSection]
    ? SECTIONS[currentSection].questions.length - 1
    : positions[currentSection] - 1;
  if (target < 0) return;
  revisit(currentSection, target);
}

function jumpTo(section, question) {
  if (!canOpen(section, question)) return;
  if (threads[section].length === 0) {
    threads[section] = firstMessage(section);
    currentSection = section;
    render();
    input.focus();
    return;
  }
  revisit(section, question);
}

function openSection(index) {
  if (draftMode) {
    currentSection = index;
    renderTabs();
    scrollStudioTo(index);
    return;
  }
  if (thinking || index === currentSection) return;
  if (threads[index].length === 0) threads[index] = firstMessage(index);
  currentSection = index;
  render();
  input.focus();
}

function setDraftOpen(open) {
  draftOpen = open;
  updateDraftChrome();
}

function storedKey() {
  return localStorage.getItem(KEY_STORE) || '';
}

function setLiveHint(on) {
  if (liveKeyBtn) liveKeyBtn.hidden = on;
}

function draftAnswers() {
  const rows = [];
  SECTIONS.forEach((section, sectionIndex) => {
    section.questions.forEach((question, qi) => {
      if (answers[sectionIndex][qi]) {
        rows.push({ label: question.label, value: answers[sectionIndex][qi] });
      }
    });
  });
  return rows;
}

async function askModel(payload) {
  try {
    const headers = { 'content-type': 'application/json' };
    const key = storedKey();
    if (key) headers['x-api-key'] = key;
    const res = await fetch('/api/reply', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { text: '', notes: [] };
    const data = await res.json();
    if (data.live) setLiveHint(true);
    return {
      text: data.text || '',
      notes: Array.isArray(data.notes) ? data.notes : [],
    };
  } catch {
    return { text: '', notes: [] };
  }
}

async function checkLive() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    setLiveHint(Boolean(data.live || storedKey()));
  } catch {
    setLiveHint(Boolean(storedKey()));
  }
}

input.addEventListener('input', () => {
  resizeInput();
  sendBtn.disabled = !input.value.trim() || thinking;
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    send();
  }
});

sendBtn.addEventListener('click', () => send());
liveKeyBtn?.addEventListener('click', () => {
  const next = window.prompt(
    'Paste an Anthropic (sk-ant-…) or OpenAI (sk-…) API key. It stays in this browser and is only sent to localhost.',
    storedKey(),
  );
  if (next == null) return;
  const trimmed = next.trim();
  if (trimmed) localStorage.setItem(KEY_STORE, trimmed);
  else localStorage.removeItem(KEY_STORE);
  setLiveHint(Boolean(trimmed));
});
draftTab.addEventListener('click', () => setDraftOpen(!draftOpen));
draftClose.addEventListener('click', () => setDraftOpen(false));
scrim.addEventListener('click', () => setDraftOpen(false));

draftBody.addEventListener('click', (event) => {
  if (event.target.closest('[data-enter-draft]')) {
    enterDraftMode();
    return;
  }
  const sectionBtn = event.target.closest('[data-open-section]');
  if (sectionBtn) {
    setDraftOpen(false);
    openSection(Number(sectionBtn.dataset.openSection));
    return;
  }
  const jump = event.target.closest('[data-jump-section]');
  if (!jump) return;
  setDraftOpen(false);
  jumpTo(Number(jump.dataset.jumpSection), Number(jump.dataset.jumpQuestion));
});

skinSwitch?.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-skin]');
  if (!btn) return;
  applyUnderstoodSkin(btn.dataset.skin);
});

const studio = document.getElementById('studio');
const studioDoc = document.getElementById('studio-doc');
const studioSelect = document.getElementById('studio-select');
const studioPopQuote = document.getElementById('studio-pop-quote');
const studioPopNote = document.getElementById('studio-pop-note');
const studioEditsEl = document.getElementById('studio-edits');
let studioSel = { quote: '', range: null };
let studioHistory = [];
let studioInited = false;
let studioFilter = 'edits';

function isStudioComment(item) {
  return item.kind === 'comment' || item.kind === 'clarify';
}

function studioP(text) {
  return el('p', '', text);
}

function studioH(text, sectionIndex) {
  const node = el('h2', '', text);
  if (sectionIndex != null) node.dataset.section = String(sectionIndex);
  return node;
}

function studioList(items) {
  const list = el('ul');
  items.forEach((item) => list.appendChild(el('li', '', item)));
  return list;
}

function fillStudioDoc() {
  studioDoc.replaceChildren(
    el('p', 'studio__lede', 'This Cofounder Agreement is a working draft. Click any passage to edit it. Select text to ask for a rewrite or a clarification.'),
    studioH('The Company', 1),
    studioP(
      'The Company is engaged in software that helps independent pharmacies manage inventory. The Company is incorporated in Delaware.',
    ),
    studioH('Equity', 2),
    studioP(
      'Founder Shares are allocated on an even split. If a Founder ceases to provide services to the Company during the first year, the Company may repurchase unvested shares at cost.',
    ),
    studioH('Vesting', 3),
    studioP(
      'Founder Shares shall vest over four years with a one-year cliff, then monthly thereafter. Upon a Change of Control, vesting shall accelerate on a double-trigger basis: acceleration only if a Founder is also terminated without cause after the transaction.',
    ),
    studioH('Decisions', 4),
    studioList([
      'Raising money, selling the Company, taking on debt, changing the equity split, and firing a cofounder require the unanimous written consent of all Founders.',
      'In the event of a deadlock, the matter shall be referred to an outside advisor whose recommendation the Founders will follow.',
    ]),
    studioH('Intellectual property', 5),
    studioP(
      'All intellectual property created by the Founders to date has been assigned to the Company. Intellectual property created prior to the Company’s formation is licensed to the Company for use in the business.',
    ),
  );
}

function renderStudioEdits() {
  studioEditsEl.replaceChildren();
  const items = studioHistory
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => (studioFilter === 'comments' ? isStudioComment(item) : !isStudioComment(item)));
  if (!items.length) {
    studioEditsEl.appendChild(
      el('p', 'studio__empty', studioFilter === 'comments' ? 'No comments yet.' : 'No edits yet.'),
    );
    return;
  }
  items.forEach(({ item, index }) => {
    const card = el('article', `studio-edit${item.applied ? ' studio-edit--applied' : ''}`);
    card.appendChild(
      el(
        'p',
        'studio-edit__kind',
        item.kind === 'rewrite' ? 'Rewrite' : item.kind === 'comment' || item.kind === 'clarify' ? 'Comment' : 'Edit',
      ),
    );
    if (item.quote) card.appendChild(el('p', 'studio-edit__quote', item.quote));
    card.appendChild(el('p', 'studio-edit__body', item.pending ? 'Working…' : item.body));
    if (!item.pending && item.kind === 'rewrite' && !item.applied && item.quote) {
      const row = el('div', 'studio-edit__actions');
      const apply = el('button', '', 'Apply');
      apply.type = 'button';
      apply.addEventListener('click', () => applyStudioEdit(index));
      const dismiss = el('button', 'studio-edit__ghost', 'Dismiss');
      dismiss.type = 'button';
      dismiss.addEventListener('click', () => {
        studioHistory.splice(index, 1);
        renderStudioEdits();
      });
      row.append(apply, dismiss);
      card.appendChild(row);
    }
    studioEditsEl.appendChild(card);
  });
}

function replaceStudioQuote(quote, next) {
  if (studioSel.range && studioDoc.contains(studioSel.range.commonAncestorContainer)) {
    studioSel.range.deleteContents();
    studioSel.range.insertNode(document.createTextNode(next));
    studioSel = { quote: '', range: null };
    return true;
  }
  const walker = document.createTreeWalker(studioDoc, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const at = node.nodeValue.indexOf(quote);
    if (at === -1) continue;
    node.nodeValue = `${node.nodeValue.slice(0, at)}${next}${node.nodeValue.slice(at + quote.length)}`;
    return true;
  }
  return false;
}

function applyStudioEdit(index) {
  const item = studioHistory[index];
  if (!item?.quote || !item.body) return;
  if (replaceStudioQuote(item.quote, item.body)) {
    item.applied = true;
    studioHistory.unshift({ kind: 'note', body: 'Applied a rewrite to the draft.' });
    renderStudioEdits();
  }
}

function setStudioRailOpen(open) {
  studio?.classList.toggle('studio--rail-closed', !open);
  const btn = document.getElementById('studio-rail-toggle');
  if (!btn) return;
  btn.setAttribute('aria-expanded', String(open));
  btn.setAttribute('aria-label', open ? 'Hide updates' : 'Show updates');
}

function setStudioFilter(filter) {
  studioFilter = filter;
  document.querySelectorAll('#studio-toggle [data-filter]').forEach((node) => {
    node.setAttribute('aria-selected', String(node.dataset.filter === filter));
  });
}

function hideStudioPop() {
  studioSelect.hidden = true;
  if (studioPopNote) studioPopNote.value = '';
}

function placeStudioPop(rect) {
  const host = studioSelect.parentElement.getBoundingClientRect();
  const width = Math.min(340, host.width - 32);
  let top = rect.bottom - host.top + 10;
  let left = rect.left - host.left;
  if (left + width > host.width - 16) left = host.width - width - 16;
  if (left < 16) left = 16;
  if (top + 220 > host.height) top = Math.max(12, rect.top - host.top - 210);
  studioSelect.style.top = `${top}px`;
  studioSelect.style.left = `${left}px`;
}

function captureStudioSelection() {
  if (!studioSelect.hidden && studioSelect.contains(document.activeElement)) return;
  const sel = window.getSelection();
  const text = sel?.toString().trim() || '';
  if (!text || !sel.rangeCount || !studioDoc.contains(sel.anchorNode)) {
    return;
  }
  studioSel = { quote: text, range: sel.getRangeAt(0).cloneRange() };
  if (studioPopQuote) studioPopQuote.textContent = `“${text}”`;
  if (studioPopNote) studioPopNote.value = '';
  studioSelect.hidden = false;
  placeStudioPop(studioSel.range.getBoundingClientRect());
  setTimeout(() => studioPopNote?.focus(), 0);
}

function wrapStudioRange(range) {
  const mark = el('mark', 'studio-mark');
  try {
    range.surroundContents(mark);
  } catch {
    mark.appendChild(range.extractContents());
    range.insertNode(mark);
  }
  return mark;
}

function markStudioQuote(quote, range) {
  if (range && studioDoc.contains(range.commonAncestorContainer)) {
    if (!range.commonAncestorContainer.parentElement?.closest('.studio-mark')) {
      return wrapStudioRange(range);
    }
  }
  const walker = document.createTreeWalker(studioDoc, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest('.studio-mark')) continue;
    const at = node.nodeValue.indexOf(quote);
    if (at === -1) continue;
    const next = document.createRange();
    next.setStart(node, at);
    next.setEnd(node, at + quote.length);
    return wrapStudioRange(next);
  }
  return null;
}

function addStudioComment() {
  const note = studioPopNote?.value.trim();
  if (!studioSel.quote || !note) return;
  markStudioQuote(studioSel.quote, studioSel.range);
  studioHistory.unshift({ kind: 'comment', quote: studioSel.quote, body: note });
  setStudioFilter('comments');
  renderStudioEdits();
  hideStudioPop();
  window.getSelection()?.removeAllRanges();
}

function applyStudioComment() {
  const next = studioPopNote?.value.trim();
  if (!studioSel.quote || !next) return;
  replaceStudioQuote(studioSel.quote, next);
  studioHistory.unshift({ kind: 'rewrite', quote: studioSel.quote, body: next, applied: true });
  setStudioFilter('edits');
  renderStudioEdits();
  hideStudioPop();
}

function scrollStudioTo(index) {
  const scroller = studioDoc.closest('.studio__scroll');
  const heading = studioDoc.querySelector(`[data-section="${index}"]`);
  if (!scroller) return;
  if (!heading) {
    scroller.scrollTop = 0;
    return;
  }
  const top = heading.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
  scroller.scrollTop = Math.max(0, top - 28);
}

function enterDraftMode() {
  draftMode = true;
  document.body.classList.add('is-draft');
  studio.hidden = false;
  if (skinSwitch) skinSwitch.hidden = true;
  progressFill.style.width = '100%';
  if (pageProgress) pageProgress.style.width = '100%';
  progressLabel.textContent = '100% complete';
  sectionsRemaining.textContent = 'Working draft';
  currentSection = 1;
  renderTabs();
  if (!studioInited) {
    fillStudioDoc();
    studioHistory = [
      { kind: 'note', body: 'Opened a completed mock draft so you can try editing.' },
      {
        kind: 'rewrite',
        quote: 'four years with a one-year cliff, then monthly thereafter',
        body: 'a four-year schedule with a one-year cliff, vesting monthly after the cliff',
        applied: false,
      },
    ];
    studioInited = true;
  }
  renderStudioEdits();
}

document.getElementById('studio-rail-toggle')?.addEventListener('click', (event) => {
  event.stopPropagation();
  setStudioRailOpen(studio.classList.contains('studio--rail-closed'));
});
document.getElementById('studio-rail-tab')?.addEventListener('click', () => {
  setStudioRailOpen(true);
});

document.getElementById('studio-toggle')?.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-filter]');
  if (!btn) return;
  setStudioFilter(btn.dataset.filter);
  renderStudioEdits();
});

studioDoc?.addEventListener('mouseup', () => setTimeout(captureStudioSelection, 0));
studioDoc?.addEventListener('keyup', captureStudioSelection);
studioSelect?.addEventListener('mousedown', (event) => {
  if (event.target.closest('textarea, input')) return;
  event.preventDefault();
});
document.getElementById('studio-pop-close')?.addEventListener('click', hideStudioPop);
document.getElementById('studio-pop-comment')?.addEventListener('click', addStudioComment);
document.getElementById('studio-pop-apply')?.addEventListener('click', applyStudioComment);
studioPopNote?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') hideStudioPop();
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    applyStudioComment();
  }
});
document.getElementById('studio-reject')?.addEventListener('click', () => {
  const at = studioHistory.findIndex((item) => item.kind === 'rewrite' && !item.applied && !item.pending);
  if (at === -1) return;
  studioHistory.splice(at, 1);
  renderStudioEdits();
});

document.getElementById('studio-next')?.addEventListener('click', () => {
  const next = Math.min(currentSection + 1, SECTIONS.length - 1);
  openSection(next);
});

studioDoc?.addEventListener('input', () => {
  const last = studioHistory[0];
  if (last?.kind === 'note' && last.body === 'You edited the draft.') return;
  studioHistory.unshift({ kind: 'note', body: 'You edited the draft.' });
  renderStudioEdits();
});

applyUnderstoodSkin(understoodSkin);
render();
resizeInput();
checkLive();
if (new URLSearchParams(location.search).get('draft') === '1') enterDraftMode();
