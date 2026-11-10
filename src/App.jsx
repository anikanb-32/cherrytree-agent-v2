import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ALL_QUESTIONS, SECTIONS, analyzeCustomInput } from './data/surveyQuestions';

function probeAnswerText(probe) {
  const raw = probe.sampleAnswer || probe.expansion || '';
  return raw.replace(/^\s*[—–-]\s*/, '').trim();
}

function withAnswerParagraphs(base, probes) {
  return probes.reduce((text, probe) => {
    const answer = (probe.answer || probeAnswerText(probe)).trim();
    if (!answer) return text;
    const question = probe.question ? `${probe.question}\n` : '';
    return `${text.trimEnd()}\n\n${question}${answer}`;
  }, base.trim());
}

function ProbeTag({ id, kept = false }) {
  return (
    <span className={`probe-tag${kept ? ' probe-tag--kept' : ''}`} aria-hidden="true">
      {id}
    </span>
  );
}

export default function App() {
  // Question tracking
  const [questionIndex, setQuestionIndex] = useState(0);
  const currentQuestion = ALL_QUESTIONS[questionIndex];

  // Flow step: 'ask' | 'dump' | 'readback' | 'followup' | 'done'
  const [flowStep, setFlowStep] = useState('ask');

  // Input for Flow 1 & Flow 2
  const [dumpText, setDumpText] = useState('');

  // Transcript state for Flow 3, 4, 5
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [keptPhrases, setKeptPhrases] = useState([]);
  const [probes, setProbes] = useState([]);

  // Dock input and clarification QA
  const [dockInput, setDockInput] = useState('');
  const [dockClarification, setDockClarification] = useState(null);
  const [selectionAsk, setSelectionAsk] = useState(null);
  const [selectInput, setSelectInput] = useState('');
  const [askedPhrases, setAskedPhrases] = useState([]);

  // Completed answers map: questionId -> final text
  const [answers, setAnswers] = useState({});

  // UI state
  const [navOpen, setNavOpen] = useState(false);
  const [dockStyle, setDockStyle] = useState('panel');
  const [highlightAsk, setHighlightAsk] = useState('original');
  const [discover, setDiscover] = useState('none');
  const [hoverCueSpent, setHoverCueSpent] = useState(false);
  const [toastOn, setToastOn] = useState(false);
  const [demoOn, setDemoOn] = useState(false);
  const [onceTaught, setOnceTaught] = useState(false);
  const [nudgeSpent, setNudgeSpent] = useState(false);
  const [doorOnceSpent, setDoorOnceSpent] = useState(false);
  const [dockFieldFocused, setDockFieldFocused] = useState(false);
  const [keepAsking, setKeepAsking] = useState(false);
  const [flowMenuOpen, setFlowMenuOpen] = useState(false);
  const [embedding, setEmbedding] = useState(false);
  const [ghostsOn, setGhostsOn] = useState(false);
  const [fromDump, setFromDump] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);

  const textareaRef = useRef(null);
  const dockInputRef = useRef(null);
  const logRef = useRef(null);
  const transcriptRef = useRef(null);
  const readbackRef = useRef(null);
  const selectInputRef = useRef(null);
  const selectLogRef = useRef(null);
  const selectPanelRef = useRef(null);
  const embedOriginRef = useRef(null);
  const questionGhostRef = useRef(null);
  const textGhostRef = useRef(null);
  const cueRef = useRef(null);
  const lineMarkRef = useRef(null);
  const hoverChipRef = useRef(null);
  const hoverTimerRef = useRef(null);

  // Auto-resize textarea in Flow 1 & 2
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(38, textareaRef.current.scrollHeight)}px`;
    }
  }, [dumpText, flowStep]);

  useEffect(() => {
    if (discover !== 'toast') {
      setToastOn(false);
      return undefined;
    }
    setToastOn(true);
    const timer = setTimeout(() => setToastOn(false), 3000);
    return () => clearTimeout(timer);
  }, [discover]);

  useEffect(() => {
    setDemoOn(discover === 'demo');
  }, [discover]);

  useEffect(() => {
    if (selectionAsk) selectInputRef.current?.focus();
  }, [selectionAsk]);

  useEffect(() => {
    const log = selectLogRef.current;
    if (!log) return;
    log.scrollTop = log.scrollHeight;
  }, [selectionAsk?.turns?.length]);

  useLayoutEffect(() => {
    const panel = selectPanelRef.current;
    const host = readbackRef.current;
    if (!panel || !host || !selectionAsk) return;
    const dock = document.querySelector('.bottom-dock');
    const dockLimit = (dock?.getBoundingClientRect().top ?? window.innerHeight) - 12;
    const hostTop = host.getBoundingClientRect().top;
    const minViewportTop = Math.max(8, hostTop);
    panel.style.maxHeight = 'none';
    const naturalHeight = panel.offsetHeight;
    let viewportTop = hostTop + selectionAsk.top;
    if (viewportTop + naturalHeight > dockLimit) {
      viewportTop = Math.max(minViewportTop, dockLimit - naturalHeight);
    }
    const maxHeight = Math.max(220, dockLimit - viewportTop);
    const nextTop = Math.max(0, viewportTop - hostTop);
    panel.style.maxHeight = `${maxHeight}px`;
    if (
      Math.abs(nextTop - selectionAsk.top) > 1 ||
      Math.abs((selectionAsk.maxHeight ?? 0) - maxHeight) > 1
    ) {
      setSelectionAsk((prev) => (prev ? { ...prev, top: nextTop, maxHeight } : prev));
    }
  }, [selectionAsk, highlightAsk]);

  useEffect(() => {
    if (!selectionAsk) return undefined;
    function onPointerDown(event) {
      if (event.target.closest('.select-ask, .select-chip, .line-mark, .flow-menu, .flow-toggle')) return;
      dismissSelection();
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [selectionAsk]);

  useLayoutEffect(() => {
    if (discover !== 'once' || onceTaught || selectionAsk || embedding) return;
    if (flowStep !== 'readback' && flowStep !== 'followup' && flowStep !== 'done') return;
    const el =
      transcriptRef.current?.querySelector('.highlight-needs') ||
      transcriptRef.current?.querySelector('.highlight-kept');
    if (!el) return;
    openCardForElement(el);
  }, [discover, onceTaught, selectionAsk, embedding, flowStep, currentTranscript]);

  // Slide the question and the reply up into the read-back, shrinking the question.
  useLayoutEffect(() => {
    if (!embedding || flowStep !== 'readback') return undefined;
    const origin = embedOriginRef.current;
    const question = questionGhostRef.current;
    const text = textGhostRef.current;
    const title = document.querySelector('.transcript-subhead__title');
    const body = transcriptRef.current;
    if (!origin || !question || !text || !title || !body) return undefined;

    const place = (el, rect, css) => {
      el.style.top = `${rect.top}px`;
      el.style.left = `${rect.left}px`;
      el.style.width = `${rect.width}px`;
      el.style.fontSize = css.fontSize;
      el.style.lineHeight = css.lineHeight;
      el.style.letterSpacing = css.letterSpacing;
      el.style.color = css.color;
      el.style.fontWeight = css.fontWeight;
      el.style.fontFamily = css.fontFamily;
      el.style.visibility = 'visible';
    };
    place(question, origin.heading, origin.headingCss);
    place(text, origin.text, origin.textCss);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEmbedding(false);
      return undefined;
    }

    const titleTo = title.getBoundingClientRect();
    const bodyTo = body.getBoundingClientRect();
    const titleCss = getComputedStyle(title);
    const bodyCss = getComputedStyle(body);
    const ease = '680ms cubic-bezier(0.16, 1, 0.3, 1)';
    let cancel = false;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancel) return;
        question.style.transition = `top ${ease}, font-size ${ease}, line-height ${ease}, letter-spacing ${ease}, color ${ease}`;
        text.style.transition = `top ${ease}, left ${ease}, width ${ease}, font-size ${ease}, line-height ${ease}, letter-spacing ${ease}, border-color ${ease}`;
        question.style.top = `${titleTo.top}px`;
        question.style.fontSize = titleCss.fontSize;
        question.style.lineHeight = titleCss.lineHeight;
        question.style.letterSpacing = titleCss.letterSpacing;
        question.style.color = titleCss.color;
        text.style.top = `${bodyTo.top}px`;
        text.style.left = `${bodyTo.left}px`;
        text.style.width = `${bodyTo.width}px`;
        text.style.fontSize = bodyCss.fontSize;
        text.style.lineHeight = bodyCss.lineHeight;
        text.style.letterSpacing = bodyCss.letterSpacing;
        text.style.borderBottomColor = 'transparent';
      });
    });
    const timer = setTimeout(() => {
      if (cancel) return;
      const questionEl = questionGhostRef.current;
      const textEl = textGhostRef.current;
      if (questionEl) {
        questionEl.style.transition = 'opacity 200ms ease';
        questionEl.style.opacity = '0';
      }
      if (textEl) {
        textEl.style.transition = 'opacity 200ms ease';
        textEl.style.opacity = '0';
      }
      setEmbedding(false);
      window.setTimeout(() => setGhostsOn(false), 220);
    }, 680);
    return () => {
      cancel = true;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [embedding, flowStep]);

  // Keep the latest exchange in view under the answer.
  useEffect(() => {
    if (!dockClarification?.length || !logRef.current) return;
    logRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [dockClarification]);

  // Jump to specific flow state (for testing & matching screenshots directly)
  function setFlowDirectly(step) {
    setEmbedding(false);
    setGhostsOn(false);
    setFromDump(false);
    setSelectionAsk(null);
    setSelectInput('');
    setKeepAsking(false);
    if (step === 'ask') {
      setFlowStep('ask');
      setDumpText('');
    } else if (step === 'dump') {
      setFlowStep('dump');
      setDumpText(currentQuestion.sampleDump);
    } else if (step === 'readback') {
      setFlowStep('readback');
      setDumpText(currentQuestion.sampleDump);
      setCurrentTranscript(currentQuestion.sampleDump);
      setKeptPhrases([...currentQuestion.initialKept]);
      setProbes(currentQuestion.probes.map((p) => ({ ...p, status: 'pending' })));
      setDockClarification(null);
    } else if (step === 'done') {
      setFlowStep('done');
      const answeredProbes = currentQuestion.probes.map((p) => ({
        ...p,
        status: 'resolved',
        answer: probeAnswerText(p),
      }));
      const full = withAnswerParagraphs(currentQuestion.sampleDump, answeredProbes);
      const allAdditional = [];
      currentQuestion.probes.forEach((p) => {
        if (p.additionalKept) allAdditional.push(...p.additionalKept);
      });
      setCurrentTranscript(currentQuestion.sampleDump);
      setKeptPhrases([
        ...currentQuestion.initialKept,
        ...currentQuestion.probes.map((p) => p.target),
        ...allAdditional,
      ]);
      setProbes(answeredProbes);
      setDockClarification(null);
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: full }));
    }
  }

  // Handle input change in Ask / Dump
  function handleDumpChange(e) {
    const val = e.target.value;
    setDumpText(val);
    if (val.trim() && flowStep === 'ask') {
      setFlowStep('dump');
    } else if (!val.trim() && flowStep === 'dump') {
      setFlowStep('ask');
    }
  }

  // Submit dump (Flow 2 -> Flow 3)
  function submitDump() {
    const text = dumpText.trim();
    if (!text) return;

    const heading = document.querySelector('.ask-heading');
    const area = textareaRef.current;
    if (heading && area) {
      const headingCss = getComputedStyle(heading);
      const textCss = getComputedStyle(area);
      embedOriginRef.current = {
        textValue: text,
        heading: heading.getBoundingClientRect(),
        text: area.getBoundingClientRect(),
        headingCss: {
          fontSize: headingCss.fontSize,
          lineHeight: headingCss.lineHeight,
          letterSpacing: headingCss.letterSpacing,
          color: headingCss.color,
          fontWeight: headingCss.fontWeight,
          fontFamily: headingCss.fontFamily,
        },
        textCss: {
          fontSize: textCss.fontSize,
          lineHeight: textCss.lineHeight,
          letterSpacing: textCss.letterSpacing,
          color: textCss.color,
          fontWeight: textCss.fontWeight,
          fontFamily: textCss.fontFamily,
        },
      };
      setFromDump(true);
      setGhostsOn(true);
      setEmbedding(true);
    }

    const analysis = analyzeCustomInput(text, currentQuestion);
    setCurrentTranscript(text);
    setKeptPhrases(analysis.kept);
    setProbes(analysis.probes);
    setFlowStep('readback');
    setDockClarification(null);
    setSelectionAsk(null);
    setSelectInput('');
  }

  function handleTranscriptMouseUp() {
    const selection = window.getSelection();
    const text = (selection?.toString() ?? '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^\d+\s*/, '');
    const body = transcriptRef.current;
    const host = readbackRef.current;
    if (!text || !selection?.rangeCount || !body || !host) return;
    if (!body.contains(selection.anchorNode) || !body.contains(selection.focusNode)) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const endRect = range.getClientRects()[range.getClientRects().length - 1] || rect;
    const bounds = host.getBoundingClientRect();
    const width = Math.min(340, Math.max(0, bounds.width - 16));
    const left = Math.max(0, Math.min(rect.left - bounds.left, bounds.width - width));
    const span = selectionSpan(selection);
    if (discover === 'nudge') setNudgeSpent(true);
    const chip = discover === 'chip';
    const chipWidth = 118;
    let chipLeft = endRect.right - bounds.left + 8;
    let chipTop = endRect.top - bounds.top + Math.max(0, (endRect.height - 24) / 2);
    if (chipLeft + chipWidth > bounds.width) {
      chipLeft = Math.max(0, endRect.right - bounds.left - chipWidth);
      chipTop = endRect.bottom - bounds.top + 6;
    }
    setSelectInput('');
    setSelectionAsk({
      text: span?.text || text,
      start: span?.start,
      end: span?.end,
      stage: chip ? 'chip' : 'card',
      chipTop,
      chipLeft,
      top: rect.bottom - bounds.top + 10,
      left,
      width,
    });
  }

  function selectionSpan(selection) {
    const start = transcriptPoint(selection.anchorNode, selection.anchorOffset);
    const end = transcriptPoint(selection.focusNode, selection.focusOffset);
    if (start == null || end == null || start === end) return null;
    const from = Math.min(start, end);
    const to = Math.max(start, end);
    const text = currentTranscript.slice(from, to).replace(/\s+/g, ' ').trim();
    if (!text) return null;
    return { start: from, end: to, text };
  }

  function transcriptPoint(node, offset) {
    if (!node || !transcriptRef.current?.contains(node)) return null;
    const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    if (!el || el.closest('.probe-tag')) {
      const host = el?.closest('[data-start]');
      return host ? Number(host.dataset.start) : null;
    }
    const host = el.closest('[data-start]');
    if (!host) return null;
    const base = Number(host.dataset.start);
    if (node.nodeType === Node.TEXT_NODE) return base + offset;
    return base;
  }

  function submitSelectionQuestion(event) {
    event.preventDefault();
    const question = selectInput.trim();
    if (!question || !selectionAsk) return;
    const phrase = selectionAsk.text;
    const matched = probes.find((probe) => {
      const target = probe.target.toLowerCase();
      const picked = phrase.toLowerCase();
      return picked.includes(target) || target.includes(picked);
    });
    const answer = matched
      ? replyToQuestion(question, matched)
      : `About “${phrase}”: this is part of what the agreement has to say out loud.`;
    setAskedPhrases((prev) => (prev.includes(phrase) ? prev : [...prev, phrase]));
    if (discover === 'hover' || discover === 'hoverInk') setHoverCueSpent(true);
    setSelectionAsk((prev) =>
      prev ? { ...prev, turns: [...(prev.turns || []), { question, answer }] } : prev,
    );
    setSelectInput('');
    window.getSelection()?.removeAllRanges();
  }

  // Pending probes
  const pendingProbes = probes.filter((p) => p.status === 'pending');
  const activeProbe = pendingProbes[0];
  const nextProbe = pendingProbes[1];

  function replyToQuestion(input, probe) {
    const lower = input.toLowerCase();
    const clar = probe?.clarifications || {};
    let reply = clar[lower] || clar.default;
    if (!reply) {
      if (lower.includes('why')) {
        reply =
          clar['why does that matter'] ||
          clar.why ||
          'It tells me how you two handle tension, which sets up how ties get broken in Decisions.';
      } else {
        reply = clar.default || 'This helps ensure the agreement reflects your actual intentions.';
      }
    }
    return reply;
  }

  // Leave the clarification and come back to the agent's follow-up.
  function resumeFollowUp() {
    setDockClarification(null);
    setDockInput('');
  }

  function chooseDockStyle(style) {
    setDockStyle(style);
    if (style !== 'ask') setKeepAsking(false);
  }

  function chooseDiscover(mode) {
    const next = discover === mode ? 'none' : mode;
    setDiscover(next);
    setHoverCueSpent(false);
    setOnceTaught(false);
    setNudgeSpent(false);
    setDoorOnceSpent(false);
    setDockFieldFocused(false);
    dockInputRef.current?.blur();
    clearTimeout(hoverTimerRef.current);
    cueRef.current?.classList.remove('is-on');
    lineMarkRef.current?.classList.remove('is-on');
    hoverChipRef.current?.classList.remove('is-on');
    setSelectInput('');
    setSelectionAsk(null);
    if (next !== 'none' && flowStep !== 'readback' && flowStep !== 'followup' && flowStep !== 'done') {
      setFlowDirectly('readback');
    }
  }

  function dismissSelection() {
    if (discover === 'once') setOnceTaught(true);
    setSelectionAsk(null);
    setSelectInput('');
  }

  function openCardForElement(el) {
    const host = readbackRef.current;
    if (!el || !host) return;
    const start = Number(el.dataset.start);
    const end = Number(el.dataset.end);
    if (!Number.isInteger(start) || !Number.isInteger(end) || end <= start) return;
    const text = currentTranscript.slice(start, end).replace(/\s+/g, ' ').trim();
    if (!text) return;
    const rect = el.getBoundingClientRect();
    const bounds = host.getBoundingClientRect();
    const width = Math.min(340, Math.max(0, bounds.width - 16));
    const left = Math.max(0, Math.min(rect.left - bounds.left, bounds.width - width));
    setSelectInput('');
    setSelectionAsk({
      text,
      start,
      end,
      top: rect.bottom - bounds.top + 10,
      left,
      width,
    });
    window.getSelection()?.removeAllRanges();
  }

  function askPhrase(event) {
    event.preventDefault();
    event.stopPropagation();
    if (discover === 'doorOnce') setDoorOnceSpent(true);
    const mark = event.currentTarget.closest('.highlight-needs, .highlight-kept');
    if (mark) openCardForElement(mark);
  }

  function moveLineMark(event) {
    const mark = lineMarkRef.current;
    const host = readbackRef.current;
    const body = transcriptRef.current;
    if (!mark || !host || !body) return;
    const caret = document.caretRangeFromPoint?.(event.clientX, event.clientY);
    if (!caret || !body.contains(caret.startContainer)) {
      mark.classList.remove('is-on');
      return;
    }
    const rect = caret.getBoundingClientRect();
    if (!rect.height) {
      mark.classList.remove('is-on');
      return;
    }
    const bounds = host.getBoundingClientRect();
    const bodyRect = body.getBoundingClientRect();
    mark.classList.add('is-on');
    mark.style.left = `${bodyRect.left - bounds.left - 22}px`;
    mark.style.top = `${rect.top - bounds.top + rect.height / 2}px`;
    mark.dataset.x = String(event.clientX);
    mark.dataset.y = String(event.clientY);
  }

  function moveHoverChip(event) {
    const chip = hoverChipRef.current;
    const host = readbackRef.current;
    const body = transcriptRef.current;
    if (!chip || !host || !body) return;
    const caret = document.caretRangeFromPoint?.(event.clientX, event.clientY);
    if (!caret || !body.contains(caret.startContainer)) {
      chip.classList.remove('is-on');
      return;
    }
    const rect = caret.getBoundingClientRect();
    if (!rect.height) {
      chip.classList.remove('is-on');
      return;
    }
    const bounds = host.getBoundingClientRect();
    const chipWidth = 118;
    let left = rect.right - bounds.left + 8;
    let top = rect.top - bounds.top + Math.max(0, (rect.height - 24) / 2);
    if (left + chipWidth > bounds.width) {
      left = Math.max(0, rect.right - bounds.left - chipWidth);
      top = rect.bottom - bounds.top + 6;
    }
    chip.classList.add('is-on');
    chip.style.left = `${left}px`;
    chip.style.top = `${top}px`;
    chip.dataset.x = String(event.clientX);
    chip.dataset.y = String(event.clientY);
  }

  function openLineFromMark(mark = lineMarkRef.current) {
    const body = transcriptRef.current;
    const host = readbackRef.current;
    if (!mark || !body || !host) return;
    const x = Number(mark.dataset.x);
    const y = Number(mark.dataset.y);
    const caret = document.caretRangeFromPoint?.(x, y);
    if (!caret || !body.contains(caret.startContainer)) return;
    const probe = caret.getBoundingClientRect();
    const spans = [];
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (!node.parentElement?.closest('.probe-tag, .phrase-ask, .line-mark')) {
        const text = node.textContent || '';
        let runStart = null;
        for (let i = 0; i < text.length; i += 1) {
          const range = document.createRange();
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const rect = range.getBoundingClientRect();
          const mid = (rect.top + rect.bottom) / 2;
          const onLine = rect.height > 0 && mid >= probe.top - 2 && mid <= probe.bottom + 2;
          if (onLine) {
            if (runStart == null) runStart = i;
          } else if (runStart != null) {
            spans.push({ node, start: runStart, end: i });
            runStart = null;
          }
        }
        if (runStart != null) spans.push({ node, start: runStart, end: text.length });
      }
      node = walker.nextNode();
    }
    const abs = spans
      .map((span) => {
        const start = transcriptPoint(span.node, span.start);
        const end = transcriptPoint(span.node, span.end);
        return start == null || end == null ? null : { start, end };
      })
      .filter(Boolean);
    if (!abs.length) return;
    const start = Math.min(...abs.map((span) => span.start));
    const end = Math.max(...abs.map((span) => span.end));
    const text = currentTranscript.slice(start, end).replace(/\s+/g, ' ').trim();
    if (!text) return;
    const bounds = host.getBoundingClientRect();
    const width = Math.min(340, Math.max(0, bounds.width - 16));
    const left = Math.max(0, Math.min(probe.left - bounds.left, bounds.width - width));
    setSelectInput('');
    setSelectionAsk({
      text,
      start,
      end,
      top: probe.bottom - bounds.top + 10,
      left,
      width,
    });
    window.getSelection()?.removeAllRanges();
  }

  function onTranscriptMove(event) {
    if ((discover === 'hover' || discover === 'hoverInk') && !hoverCueSpent) moveHoverCue(event);
    else if (discover === 'rest') restHoverCue(event);
    if (discover === 'margin') moveLineMark(event);
    if (discover === 'blob') moveHoverChip(event);
  }

  function onTranscriptLeave(event) {
    if (discover === 'hover' || discover === 'hoverInk' || discover === 'rest') hideHoverCue();
    if (discover === 'margin' && !event.relatedTarget?.closest?.('.line-mark')) {
      lineMarkRef.current?.classList.remove('is-on');
    }
    if (discover === 'blob' && !event.relatedTarget?.closest?.('.select-chip--float')) {
      hoverChipRef.current?.classList.remove('is-on');
    }
  }

  function moveHoverCue(event) {
    const cue = cueRef.current;
    const host = readbackRef.current;
    if (!cue || !host) return;
    const bounds = host.getBoundingClientRect();
    cue.classList.add('is-on');
    cue.style.left = `${event.clientX - bounds.left + 14}px`;
    cue.style.top = `${event.clientY - bounds.top + 18}px`;
  }

  function hideHoverCue() {
    clearTimeout(hoverTimerRef.current);
    cueRef.current?.classList.remove('is-on');
  }

  function restHoverCue(event) {
    const cue = cueRef.current;
    const host = readbackRef.current;
    if (!cue || !host) return;
    cue.classList.remove('is-on');
    const x = event.clientX;
    const y = event.clientY;
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      const bounds = host.getBoundingClientRect();
      cue.classList.add('is-on');
      cue.style.left = `${x - bounds.left + 14}px`;
      cue.style.top = `${y - bounds.top + 16}px`;
    }, 600);
  }

  function openSelectionCard() {
    setSelectionAsk((prev) => (prev ? { ...prev, stage: 'card' } : prev));
  }

  function leaveAskMode() {
    setDockInput('');
    if (probes.some((probe) => probe.status === 'pending')) {
      setKeepAsking(false);
      return;
    }
    handleNextQuestion();
  }

  // Submit dock response. The panel only records an answer.
  function submitDock() {
    const input = dockInput.trim();
    if (!input || !activeProbe) return;

    const probeId = activeProbe.id;
      // Mark active probe resolved
      const updatedProbes = probes.map((p) =>
        p.id === probeId ? { ...p, status: 'resolved', answer: input } : p,
      );
      setProbes(updatedProbes);

      // Keep the original answer intact. The question stays under it, and this reply sits below the question.
      const answeredProbes = updatedProbes;

      // Add to kept phrases
      const newKept = [...keptPhrases, activeProbe.target];
      if (activeProbe.additionalKept) {
        activeProbe.additionalKept.forEach((phrase) => {
          if (!newKept.includes(phrase)) newKept.push(phrase);
        });
      }
      setKeptPhrases(newKept);
      setDockInput('');
      setDockClarification(null);

      // Check remaining pending probes
      const remaining = updatedProbes.filter((p) => p.status === 'pending');
      if (remaining.length === 0) {
        setFlowStep('done');
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: withAnswerParagraphs(currentTranscript, answeredProbes),
        }));
      } else {
        setFlowStep('followup');
      }
  }

  // Toggle words in Flow 5 (Done)
  function toggleKeptPhrase(phrase) {
    if (flowStep !== 'done') return;
    setKeptPhrases((prev) => {
      const exists = prev.some((p) => p.toLowerCase() === phrase.toLowerCase());
      if (exists) {
        return prev.filter((p) => p.toLowerCase() !== phrase.toLowerCase());
      }
      return [...prev, phrase];
    });
  }

  // Go to next question in survey
  function handleNextQuestion() {
    const nextIdx = questionIndex + 1;
    if (nextIdx < ALL_QUESTIONS.length) {
      setQuestionIndex(nextIdx);
      setFlowStep('ask');
      setDumpText('');
      setCurrentTranscript('');
      setKeptPhrases([]);
      setProbes([]);
      setDockClarification(null);
      setDockInput('');
      setAskedPhrases([]);
      setSelectionAsk(null);
    } else {
      // Completed all questions — open draft agreement
      setDraftOpen(true);
    }
  }

  // Jump to specific question
  function jumpToQuestion(index) {
    setQuestionIndex(index);
    setNavOpen(false);
    setFlowStep('ask');
    setDumpText('');
    setCurrentTranscript('');
    setKeptPhrases([]);
    setProbes([]);
    setDockClarification(null);
    setDockInput('');
    setAskedPhrases([]);
    setSelectionAsk(null);
  }

  // Render transcript with Kept (green) and Needs more (peach) highlights
  function renderTranscript() {
    if (!currentTranscript) return null;

    // Find pending probes and kept phrases
    const ranges = [];

    // Pending probes (Needs more - Peach)
    probes
      .filter((p) => p.status === 'pending')
      .forEach((probe) => {
        const needle = probe.target.toLowerCase();
        let startIdx = 0;
        let pos;
        while ((pos = currentTranscript.toLowerCase().indexOf(needle, startIdx)) !== -1) {
          ranges.push({
            start: pos,
            end: pos + probe.target.length,
            type: 'needs',
            probeId: probe.id,
            text: currentTranscript.slice(pos, pos + probe.target.length),
          });
          startIdx = pos + probe.target.length;
        }
      });

    askedPhrases.forEach((phrase) => {
      if (!phrase || phrase.length < 2) return;
      const needle = phrase.toLowerCase();
      let startIdx = 0;
      let pos;
      while ((pos = currentTranscript.toLowerCase().indexOf(needle, startIdx)) !== -1) {
        const end = pos + phrase.length;
        const overlapsNeeds = ranges.some(
          (range) => range.type === 'needs' && Math.max(pos, range.start) < Math.min(end, range.end),
        );
        if (!overlapsNeeds) {
          ranges.push({
            start: pos,
            end,
            type: 'asked',
            text: currentTranscript.slice(pos, end),
          });
        }
        startIdx = end;
      }
    });

    // Kept phrases (Green)
    keptPhrases.forEach((phrase) => {
      if (!phrase || phrase.length < 2) return;
      const needle = phrase.toLowerCase();
      let startIdx = 0;
      let pos;
      while ((pos = currentTranscript.toLowerCase().indexOf(needle, startIdx)) !== -1) {
        const end = pos + phrase.length;
        // Don't overlap with a pending probe
        const overlapsMarked = ranges.some(
          (r) =>
            (r.type === 'needs' || r.type === 'asked') &&
            Math.max(pos, r.start) < Math.min(end, r.end),
        );
        if (!overlapsMarked) {
          ranges.push({
            start: pos,
            end,
            type: 'kept',
            phrase,
            text: currentTranscript.slice(pos, end),
          });
        }
        startIdx = end;
      }
    });

    // Sort ranges by start position
    ranges.sort((a, b) => a.start - b.start);

    // Remove overlapping kept ranges
    const cleanRanges = [];
    ranges.forEach((r) => {
      const prev = cleanRanges[cleanRanges.length - 1];
      if (!prev || r.start >= prev.end) {
        cleanRanges.push(r);
      }
    });

    // Each follow-up answer is its own paragraph under the original.
    const paragraphs = currentTranscript.split(/\n\n+/);
    let searchFrom = 0;
    let doorPlaced = false;

    return paragraphs.map((paragraph, pIndex) => {
      const paraStart = currentTranscript.indexOf(paragraph, searchFrom);
      searchFrom = paraStart + paragraph.length;
      const localRanges = cleanRanges
        .filter((range) => range.end > paraStart && range.start < paraStart + paragraph.length)
        .map((range) => {
          const start = Math.max(0, range.start - paraStart);
          const end = Math.min(paragraph.length, range.end - paraStart);
          return { ...range, start, end, text: paragraph.slice(start, end) };
        });

      const nodes = [];
      let cursor = 0;

      localRanges.forEach((range, idx) => {
        if (range.start > cursor) {
          nodes.push(
            renderUnmarkedText(
              paragraph.slice(cursor, range.start),
              `unmarked-${pIndex}-${idx}`,
              paraStart + cursor,
            ),
          );
        }

        const spanKey = `hl-${pIndex}-${range.start}-${range.text.slice(0, 12)}`;
        const absStart = paraStart + range.start;
        const absEnd = paraStart + range.end;

        if (range.type === 'needs') {
          const showDoor =
            discover === 'door' || (discover === 'doorOnce' && !doorOnceSpent && !doorPlaced);
          if (showDoor && discover === 'doorOnce') doorPlaced = true;
          nodes.push(
            <span
              key={spanKey}
              className="highlight-needs"
              data-start={absStart}
              data-end={absEnd}
            >
              <ProbeTag id={range.probeId} />
              {renderPhrase(range.text, absStart)}
              {showDoor && (
                <button
                  type="button"
                  className="phrase-ask"
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseUp={(event) => event.stopPropagation()}
                  onClick={askPhrase}
                >
                  Ask
                </button>
              )}
            </span>,
          );
        } else if (range.type === 'selecting' || range.type === 'asked') {
          nodes.push(
            <span
              key={spanKey}
              className={range.type === 'selecting' ? 'highlight-selecting' : 'highlight-asked'}
              data-start={absStart}
              data-end={absEnd}
            >
              {renderPhrase(range.text, absStart)}
            </span>,
          );
        } else {
          nodes.push(
            <span
              key={spanKey}
              className={`highlight-kept ${flowStep === 'done' ? 'word-interactive' : ''}`}
              data-start={absStart}
              data-end={absEnd}
              onClick={() => flowStep === 'done' && toggleKeptPhrase(range.text)}
              title={flowStep === 'done' ? 'Click to drop' : undefined}
            >
              {renderPhrase(range.text, absStart)}
              {discover === 'door' && (
                <button
                  type="button"
                  className="phrase-ask"
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseUp={(event) => event.stopPropagation()}
                  onClick={askPhrase}
                >
                  Ask
                </button>
              )}
            </span>,
          );
        }
        cursor = range.end;
      });

      if (cursor < paragraph.length) {
        nodes.push(
          renderUnmarkedText(paragraph.slice(cursor), `unmarked-tail-${pIndex}`, paraStart + cursor),
        );
      }

      return (
        <p key={`para-${paraStart}`} className="transcript-para">
          {nodes}
        </p>
      );
    });
  }

  // Render text between highlights
  function renderPhrase(text, absStart) {
    const selStart = selectionAsk?.start;
    const selEnd = selectionAsk?.end;
    if (!Number.isInteger(selStart) || selEnd <= selStart) return text;
    const absEnd = absStart + text.length;
    if (selEnd <= absStart || selStart >= absEnd) return text;
    const localStart = Math.max(0, selStart - absStart);
    const localEnd = Math.min(text.length, selEnd - absStart);
    return (
      <>
        {text.slice(0, localStart)}
        <span
          className="highlight-selecting"
          data-start={absStart + localStart}
          data-end={absStart + localEnd}
        >
          {text.slice(localStart, localEnd)}
        </span>
        {text.slice(localEnd)}
      </>
    );
  }

  function renderUnmarkedText(text, key, absStart = 0) {
    if (flowStep !== 'done') {
      return (
        <span key={key} data-start={absStart} data-end={absStart + text.length}>
          {renderPhrase(text, absStart)}
        </span>
      );
    }

    // In Flow 5 (Done), individual words can be clicked to toggle kept
    const words = text.split(/(\s+|[.,;—\-]+)/);
    let local = 0;
    return (
      <span key={key}>
        {words.map((word, wIdx) => {
          const start = absStart + local;
          local += word.length;
          const isWord = /[a-zA-Z0-9]/.test(word);
          if (!isWord) {
            return (
              <span key={wIdx} data-start={start} data-end={start + word.length}>
                {word}
              </span>
            );
          }
          return (
            <span
              key={wIdx}
              data-start={start}
              data-end={start + word.length}
              className="word-interactive"
              onClick={() => toggleKeptPhrase(word)}
              title="Click to keep"
            >
              {word}
            </span>
          );
        })}
      </span>
    );
  }

  let sectionCursor = 0;
  const sectionNav = SECTIONS.map((section) => {
    const start = sectionCursor;
    sectionCursor += section.questions.length;
    const done = section.questions.every((question) => answers[question.id]);
    return {
      name: section.name,
      start,
      done,
      active: currentQuestion.sectionName === section.name,
    };
  });
  const answeredCount = ALL_QUESTIONS.filter((question) => answers[question.id]).length;
  const percentComplete = Math.round((answeredCount / ALL_QUESTIONS.length) * 100);
  const sectionsRemaining = sectionNav.filter((section) => !section.done).length;
  const placeOpen = navOpen;

  return (
    <div className={`app${placeOpen ? ' is-nav-open' : ''}`}>
      <button
        type="button"
        className="flow-toggle"
        aria-expanded={flowMenuOpen}
        aria-label="Toggle flows"
        onClick={() => setFlowMenuOpen((open) => !open)}
      />
      {flowMenuOpen && (
      <div className="flow-menu">
      <div className="flow-bar">
        <button
          type="button"
          className={`flow-step-btn ${flowStep === 'ask' ? 'is-active' : ''}`}
          onClick={() => setFlowDirectly('ask')}
        >
          Flow 1 · Ask
        </button>
        <button
          type="button"
          className={`flow-step-btn ${flowStep === 'dump' ? 'is-active' : ''}`}
          onClick={() => setFlowDirectly('dump')}
        >
          Flow 2 · Dump
        </button>
        <button
          type="button"
          className={`flow-step-btn ${flowStep === 'readback' ? 'is-active' : ''}`}
          onClick={() => setFlowDirectly('readback')}
        >
          Flow 3 · Read back
        </button>
        <button
          type="button"
          className={`flow-step-btn ${flowStep === 'done' ? 'is-active' : ''}`}
          onClick={() => setFlowDirectly('done')}
        >
          Flow 4 · Done
        </button>
      </div>
      <div className="version-bar version-bar--dock">
        <button
          type="button"
          className={`version-btn ${dockStyle === 'panel' ? 'is-active' : ''}`}
          onClick={() => chooseDockStyle('panel')}
        >
          Panel
        </button>
        <button
          type="button"
          className={`version-btn ${dockStyle === 'none' ? 'is-active' : ''}`}
          onClick={() => chooseDockStyle('none')}
        >
          none
        </button>
        <button
          type="button"
          className={`version-btn ${dockStyle === 'hover' ? 'is-active' : ''}`}
          onClick={() => chooseDockStyle('hover')}
        >
          hover
        </button>
        <button
          type="button"
          className={`version-btn ${dockStyle === 'ask' ? 'is-active' : ''}`}
          onClick={() => chooseDockStyle('ask')}
        >
          ask
        </button>
      </div>
      <div className="version-bar version-bar--dock">
        <button
          type="button"
          className={`version-btn ${highlightAsk === 'original' ? 'is-active' : ''}`}
          onClick={() => setHighlightAsk('original')}
        >
          original
        </button>
        <button
          type="button"
          className={`version-btn ${highlightAsk === 'chatbot' ? 'is-active' : ''}`}
          onClick={() => setHighlightAsk('chatbot')}
        >
          chatbot
        </button>
      </div>
      <div className="version-bar version-bar--dock version-bar--discover">
        <button
          type="button"
          className={`version-btn ${discover === 'hover' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('hover')}
        >
          select to ask
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'hoverInk' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('hoverInk')}
        >
          select to ask black
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'toast' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('toast')}
        >
          toast
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'demo' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('demo')}
        >
          play card
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'door' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('door')}
        >
          ask on phrase
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'once' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('once')}
        >
          show once
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'input' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('input')}
        >
          input hint
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'chip' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('chip')}
        >
          selection cue
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'blob' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('blob')}
        >
          ask on hover
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'nudge' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('nudge')}
        >
          first nudge
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'rest' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('rest')}
        >
          hover rest
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'legend' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('legend')}
        >
          legend
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'margin' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('margin')}
        >
          margin
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'cursor' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('cursor')}
        >
          cursor
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'doorOnce' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('doorOnce')}
        >
          one door
        </button>
        <button
          type="button"
          className={`version-btn ${discover === 'placeholder' ? 'is-active' : ''}`}
          onClick={() => chooseDiscover('placeholder')}
        >
          field hint
        </button>
      </div>
      </div>
      )}

      {/* Main Header */}
      <header className="main-header">
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}cherries.png`} alt="Cherrytree" className="brand__logo-img" />
          <span className="brand__name">Cherrytree</span>
        </div>

        <div className="header__nav-wrap">
          <div className="section-menu">
          <button
            type="button"
            className="section-indicator"
            onClick={() => setNavOpen((open) => !open)}
            aria-expanded={placeOpen}
          >
            <span className="place-dot place-dot--active" />
            {currentQuestion.sectionName}
          </button>

          {placeOpen && (
            <div className="place">
              <p className="place__percent">{percentComplete}% complete</p>
              <div className="place__track">
                <div className="place__fill" style={{ width: `${percentComplete}%` }} />
              </div>
              <p className="place__remaining">
                {sectionsRemaining} {sectionsRemaining === 1 ? 'section' : 'sections'} remaining
              </p>
              <p className="place__label">Sections</p>
              <div className="place__list">
                {sectionNav.map((section) => (
                  <button
                    key={section.name}
                    type="button"
                    className={`place__item ${section.active ? 'is-active' : ''}`}
                    onClick={() => jumpToQuestion(section.start)}
                  >
                    <span
                      className={`place-dot ${
                        section.active ? 'place-dot--active' : section.done ? 'place-dot--done' : ''
                      }`}
                    />
                    {section.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="main-content">
        {/* Flow 1 & Flow 2: Ask & Dump */}
        {(flowStep === 'ask' || flowStep === 'dump') && (
          <div className="ask-view">
            <h1 className="ask-heading">{currentQuestion.title}</h1>

            <div className="ask-input-wrap">
              <textarea
                ref={textareaRef}
                className="ask-textarea"
                rows={1}
                value={dumpText}
                onChange={handleDumpChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (dumpText.trim()) submitDump();
                  }
                }}
                placeholder={currentQuestion.placeholder}
                autoFocus
              />
            </div>

            <div className="ask-footer-row">
              <div className="key-badge">
                <kbd className="key-badge__kbd">Enter</kbd>
                <span>to send</span>
              </div>

              <button
                type="button"
                className={`btn-send ${flowStep === 'dump' && dumpText.trim() ? '' : 'btn-send--reserve'}`}
                onClick={submitDump}
                tabIndex={flowStep === 'dump' && dumpText.trim() ? 0 : -1}
                aria-hidden={!(flowStep === 'dump' && dumpText.trim())}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Flow 3, 4, 5: Read back & Living Transcript */}
        {(flowStep === 'readback' || flowStep === 'followup' || flowStep === 'done') && (
          <div
            className={`readback-view readback-view--v3${fromDump ? ' is-from-dump' : ''}${embedding ? ' is-embedding' : ''}`}
            ref={readbackRef}
          >
            <div className="transcript-subhead">
              <span className="transcript-subhead__title">{currentQuestion.title}</span>
              {discover === 'none' && (
                <span className="transcript-hint">Drag to ask a question</span>
              )}
            </div>

            <div
              className={`transcript-body${discover === 'cursor' ? ' is-ask-cursor' : ''}`}
              ref={transcriptRef}
              onMouseUp={handleTranscriptMouseUp}
              onMouseDown={
                discover === 'hover' || discover === 'hoverInk' || discover === 'rest'
                  ? hideHoverCue
                  : undefined
              }
              onMouseMove={onTranscriptMove}
              onMouseLeave={onTranscriptLeave}
            >
              {renderTranscript()}
            </div>

            {discover === 'toast' && toastOn && (
              <p className="ask-toast">Select to ask</p>
            )}

            {discover === 'demo' && demoOn && (
              <button type="button" className="ask-demo" onClick={() => setDemoOn(false)}>
                <span className="ask-demo__phrase">
                  we met <span className="ask-demo__words">at a park</span>
                </span>
                <span className="ask-demo__pill">Select to ask</span>
              </button>
            )}

            <div className="followup-stack">
              {probes
                .filter((probe) => probe.status === 'resolved' && probe.answer)
                .map((probe) => (
                  <div className="followup-block" key={`answered-${probe.id}`}>
                    <p className="followup-block__question">
                      <ProbeTag id={probe.id} kept />
                      {probe.question}
                    </p>
                    <p className="followup-block__answer">{probe.answer}</p>
                  </div>
                ))}
            </div>

            <button
              type="button"
              className="line-mark"
              ref={lineMarkRef}
              onMouseDown={(event) => event.preventDefault()}
              onClick={openLineFromMark}
              onMouseLeave={(event) => {
                if (!event.relatedTarget?.closest?.('.transcript-body')) {
                  event.currentTarget.classList.remove('is-on');
                }
              }}
            >
              ?
            </button>

            {((discover === 'hover' || discover === 'hoverInk') && !hoverCueSpent && !selectionAsk) ||
            (discover === 'rest' && !selectionAsk) ? (
              <span
                className={`select-cue${discover === 'hoverInk' ? ' select-cue--ink' : ''}`}
                ref={cueRef}
              >
                Select to ask
              </span>
            ) : null}

            {discover === 'blob' && !selectionAsk && (
              <button
                type="button"
                className="select-chip select-chip--float"
                ref={hoverChipRef}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => openLineFromMark(hoverChipRef.current)}
                onMouseLeave={(event) => {
                  if (!event.relatedTarget?.closest?.('.transcript-body')) {
                    event.currentTarget.classList.remove('is-on');
                  }
                }}
              >
                Ask about this
              </button>
            )}

            {selectionAsk?.stage === 'chip' && (
              <button
                type="button"
                className="select-chip"
                style={{ top: selectionAsk.chipTop, left: selectionAsk.chipLeft }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={openSelectionCard}
              >
                Ask about this
              </button>
            )}

            {selectionAsk && selectionAsk.stage !== 'chip' && (
              <form
                className={`select-ask${highlightAsk === 'original' ? ' select-ask--original' : ''}`}
                ref={selectPanelRef}
                style={{
                  top: selectionAsk.top,
                  left: selectionAsk.left,
                  width: selectionAsk.width,
                  maxHeight: selectionAsk.maxHeight,
                }}
                onSubmit={submitSelectionQuestion}
                onMouseDown={(event) => {
                  if (event.target.closest('textarea, button')) return;
                  event.preventDefault();
                }}
              >
                <button
                  type="button"
                  className="select-ask__close"
                  aria-label="Close"
                  onClick={dismissSelection}
                >
                  ×
                </button>
                <p className="select-ask__quote">{`“${selectionAsk.text}”`}</p>
                {highlightAsk === 'chatbot' && selectionAsk.turns?.length > 0 && (
                  <div className="select-ask__log" ref={selectLogRef}>
                    {selectionAsk.turns.map((turn, index) => (
                      <div className="select-ask__turn" key={`${index}-${turn.question}`}>
                        <p className="select-ask__question">{turn.question}</p>
                        <p className="select-ask__answer">{turn.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
                {highlightAsk === 'original' && selectionAsk.turns?.length > 0 ? (
                  <p className="select-ask__answer">
                    {selectionAsk.turns[selectionAsk.turns.length - 1].answer}
                  </p>
                ) : (
                  <>
                    <textarea
                      ref={selectInputRef}
                      className="select-ask__field"
                      rows={3}
                      value={selectInput}
                      onChange={(event) => setSelectInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          event.currentTarget.form?.requestSubmit();
                        }
                      }}
                      placeholder="Ask a question…"
                    />
                    <div className="select-ask__row">
                      <button type="submit" className="select-ask__ask" disabled={!selectInput.trim()}>
                        Ask
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}

            {dockClarification && (
              <div className="thread">
                {dockClarification && activeProbe && !keepAsking && (
                  <p className="thread-followup">
                    <ProbeTag id={activeProbe.id} />
                    {activeProbe.question}
                  </p>
                )}
                {dockClarification?.map((turn, index) => (
                  <div
                    className="thread-turn"
                    key={`${index}-${turn.question}`}
                    ref={index === dockClarification.length - 1 ? logRef : undefined}
                  >
                    <p className="thread-turn__question">{turn.question}</p>
                    <p className="thread-turn__answer">{turn.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {ghostsOn && embedOriginRef.current && (
        <>
          <div className="embed-ghost embed-ghost--question" ref={questionGhostRef}>
            {currentQuestion.title}
          </div>
          <div className="embed-ghost embed-ghost--text" ref={textGhostRef}>
            {embedOriginRef.current.textValue}
          </div>
        </>
      )}

      {/* Pinned Bottom Dock in Flow 3, 4, 5 */}
      {(flowStep === 'readback' || flowStep === 'followup' || flowStep === 'done') && (
        <aside className={`bottom-dock bottom-dock--${dockStyle === 'ask' ? 'hover' : dockStyle}${embedding ? ' is-held' : ''}`}>
          <div className="dock-content">
            {discover === 'nudge' && !nudgeSpent && flowStep !== 'done' && !embedding && (
              <p className="ask-nudge">Select any text to ask about it.</p>
            )}
            <div className="legend">
              <span className="legend-item">
                <span className="legend-swatch legend-swatch--kept" /> Kept
              </span>
              <span className="legend-item">
                <span className="legend-swatch legend-swatch--needs" /> Needs more
              </span>
              {discover === 'legend' && (
                <span className="legend-item">
                  <span className="legend-swatch legend-swatch--ask" /> Drag to ask
                </span>
              )}
            </div>
            {flowStep === 'done' ? (
              // Flow 5: Done State
              <div className="dock-done-row" key="dock-done-state">
                <div>
                  <h2 className="dock-done__heading">That’s everything for this one.</h2>
                </div>
                <div className="dock-done__actions">
                  <button
                    type="button"
                    className="btn-next-question"
                    onClick={handleNextQuestion}
                  >
                    Next question
                  </button>
                </div>
              </div>
            ) : (
              // Answering: the agent's follow-up about the original answer.
              <div
                className="dock-probe-box"
                key={`dock-probe-${activeProbe ? activeProbe.id : 'all-resolved'}`}
              >
                <h2
                  className="dock-question"
                  aria-label={
                    activeProbe
                      ? `Follow-up ${activeProbe.id}: ${activeProbe.question}`
                      : undefined
                  }
                >
                  {activeProbe ? (
                    <>
                      <ProbeTag id={activeProbe.id} />
                      {activeProbe.question}
                    </>
                  ) : (
                    'Anything else you’d like to add?'
                  )}
                </h2>

                {discover === 'input' && (
                  <p className="dock-ask-hint">Select any text to ask about it.</p>
                )}
                <div className="dock-input-box">
                  <input
                    ref={dockInputRef}
                    type="text"
                    className="dock-input"
                    value={dockInput}
                    onChange={(e) => setDockInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        submitDock();
                      }
                    }}
                    placeholder={
                      discover === 'placeholder' && !dockFieldFocused
                        ? 'Or select text to ask about it.'
                        : 'Say as much as you want.'
                    }
                    onFocus={() => setDockFieldFocused(true)}
                    onBlur={() => setDockFieldFocused(false)}
                  />
                  <button
                    type="button"
                    className="dock-btn-send"
                    onClick={submitDock}
                    disabled={!dockInput.trim()}
                    aria-label="Send"
                  >
                    ↑
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Cofounder Agreement Slide-out Drawer */}
      <div
        className={`draft-scrim ${draftOpen ? 'is-open' : ''}`}
        onClick={() => setDraftOpen(false)}
        aria-hidden="true"
      />

      <aside className={`draft-drawer ${draftOpen ? 'is-open' : ''}`}>
        <button
          type="button"
          className="draft-tab"
          aria-expanded={draftOpen}
          aria-label={draftOpen ? 'Hide the sample agreement' : 'Show the sample agreement'}
          onClick={() => setDraftOpen((open) => !open)}
        >
          <span className="draft-tab__label">Sample agreement</span>
        </button>
        <div className="draft-drawer__header">
          <h2 className="draft-drawer__title">Cofounder Agreement</h2>
          <button
            type="button"
            className="draft-drawer__close"
            onClick={() => setDraftOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="draft-drawer__body">
          {SECTIONS.map((section) => (
            <div key={section.name} className="doc-section">
              <h3 className="doc-section__title">{section.name}</h3>
              {section.questions.map((q) => {
                const answer = answers[q.id];
                if (!q.clause) {
                  return (
                    <div key={q.id} className="doc-clause">
                      <span className="doc-clause__label">{q.label}</span>
                      {answer ? (
                        <span className="doc-slot--filled">{answer}</span>
                      ) : (
                        <span className="doc-slot--empty" />
                      )}
                    </div>
                  );
                }

                const [before, after = ''] = q.clause.split('{}');
                return (
                  <div key={q.id} className="doc-clause">
                    <span className="doc-clause__label">{q.label}</span>
                    <span>
                      {before}
                      {answer ? (
                        <span className="doc-slot--filled">{answer}</span>
                      ) : (
                        <span className="doc-slot--empty" />
                      )}
                      {after}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="doc-enter"
          onClick={() => {
            window.location.href = '/new-product/index.html?draft=1';
          }}
        >
          Open the working draft
        </button>
      </aside>
    </div>
  );
}
