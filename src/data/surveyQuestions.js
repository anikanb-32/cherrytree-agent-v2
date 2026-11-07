// Survey questions, structure, pre-configured probes and reflections.

export const SECTIONS = [
  {
    name: 'Background',
    clause: false,
    questions: [
      {
        id: 'bg-1',
        title: 'How did you two meet?',
        label: 'How the founders met',
        placeholder: 'Start anywhere. Say as much as you want.',
        lead: 'I’m going to help you put together a cofounder agreement. Before any of the legal mechanics, though, I want to understand the two of you — most of the disputes I’ve watched play out didn’t come from bad paperwork. They came from two people who never said their assumptions out loud.',
        sampleDump:
          'we met at a park back in middle school, it was around 15 years ago? we stayed in touch pretty continuously even though we went to different universities. we both love nature and wanted to do something about climate change. honestly we talked about starting something for years. she’s more on the science side and I’m more product. we’ve never really fought about anything big',
        initialKept: [
          'middle school',
          'around 15 years ago?',
          'pretty continuously',
          'wanted to do something about climate change',
          'she’s more on the science side and I’m more product',
        ],
        probes: [
          {
            id: 1,
            target: 'talked about starting something for years',
            shortRef: 'talked about starting something for years',
            question: 'Whose idea was it to actually start the company?',
            sampleAnswer:
              'it was my idea first, but she said let’s actually do it last spring',
            expansion:
              ' — it was my idea first, but she said let’s actually do it last spring',
            additionalKept: [
              'talked about starting something for years',
              'my idea first',
              'she said let’s actually do it last spring',
            ],
            clarifications: {
              'why does that matter':
                'Who brought the idea quietly drives the equity conversation later — when one person conceived it and the other joined to build, they almost always remember the split of credit differently a year on.',
              default:
                'Understanding who initiated the venture helps establish whether the founding relationship is peer-driven or originated from one person’s thesis.',
            },
          },
          {
            id: 2,
            target: 'never really fought about anything big',
            shortRef: 'never really fought',
            question: 'When you two do disagree, how does it usually get settled?',
            sampleAnswer:
              'when we disagree we sleep on it, and usually whoever cares more wins',
            expansion:
              ' — when we disagree we sleep on it, and usually whoever cares more wins',
            additionalKept: ['sleep on it', 'whoever cares more wins'],
            clarifications: {
              'why does that matter':
                'It tells me how you two handle tension, which sets up how ties get broken in Decisions.',
              why: 'It tells me how you two handle tension, which sets up how ties get broken in Decisions.',
              default:
                'It tells me how you two handle tension, which sets up how ties get broken in Decisions.',
            },
          },
        ],
      },
      {
        id: 'bg-2',
        title: 'Where did the idea actually come from?',
        label: 'Origin of the idea',
        placeholder: 'Who had the insight first, or did you arrive at it together?',
        lead: 'The idea quietly drives the equity conversation later — when one person brought the idea and the other joined to build it, they almost always remember that differently a year on.',
        sampleDump:
          'I was working at a climate tech non-profit and kept seeing teams struggle with carbon accounting data. I brought it to her over coffee, and she showed me how satellite imagery could verify the offset claims directly.',
        initialKept: [
          'climate tech non-profit',
          'carbon accounting data',
          'satellite imagery could verify',
        ],
        probes: [
          {
            id: 1,
            target: 'brought it to her over coffee',
            shortRef: 'brought it to her over coffee',
            question: 'Did either of you have prior IP or work started before that conversation?',
            sampleAnswer:
              'I had built a rough prototype and spreadsheets, but no production code was written until we teamed up',
            expansion:
              ' — I had built a rough prototype, but no production code was written until we teamed up',
            additionalKept: ['no production code was written until we teamed up'],
            clarifications: {
              'why does that matter':
                'Pre-existing work can create IP ownership ambiguity if it isn’t formally assigned.',
              default:
                'Pre-existing work can create IP ownership ambiguity if it isn’t formally assigned.',
            },
          },
          {
            id: 2,
            target: 'satellite imagery could verify',
            shortRef: 'satellite imagery verify',
            question: 'Who owns the core technical methodology going forward?',
            sampleAnswer:
              'all methodologies and models are owned 100% by the company from day one',
            expansion:
              ' — we agreed all IP belongs 100% to the company from day one',
            additionalKept: ['all IP belongs 100% to the company from day one'],
            clarifications: {
              'why does that matter':
                'Clear ownership prevents either founder from taking models to a competitor if things don’t work out.',
              default:
                'Clear ownership prevents either founder from taking models to a competitor if things don’t work out.',
            },
          },
        ],
      },
      {
        id: 'bg-3',
        title: 'How are the two of you splitting the work right now?',
        label: 'How the work is divided today',
        placeholder: 'Describe the real day-to-day, not just the org chart you want.',
        lead: 'Roles on paper and roles in practice drift apart fast, and the agreement should describe the real one.',
        sampleDump:
          'Right now she handles all the data pipelines, model training, and technical research. I focus on customer interviews, product specs, design, and setting up our initial pilot partnerships.',
        initialKept: [
          'data pipelines, model training',
          'technical research',
          'customer interviews, product specs',
          'initial pilot partnerships',
        ],
        probes: [
          {
            id: 1,
            target: 'initial pilot partnerships',
            shortRef: 'initial pilot partnerships',
            question: 'Who manages external investor conversations and commercial contracts?',
            sampleAnswer:
              'I lead commercial negotiations and pitch deck prep, but we both attend major partner meetings together',
            expansion:
              ' — I lead commercial and investor prep, and we both attend key partner meetings',
            additionalKept: ['lead commercial and investor prep', 'attend key partner meetings'],
            clarifications: {
              'why does that matter':
                'External representation determines who speaks for the entity and binds it to agreements.',
              default:
                'External representation determines who speaks for the entity and binds it to agreements.',
            },
          },
        ],
      },
      {
        id: 'bg-4',
        title: 'Are you both full-time on this? If not, what’s the plan?',
        label: 'Commitment level',
        placeholder: 'Are you both all-in, or is someone still transitioning?',
        lead: 'Uneven commitment is the single biggest source of resentment I see — one founder quits their job, the other keeps consulting “for a few more months,” and nobody ever goes back and renegotiates.',
        sampleDump:
          'I went full-time two months ago when we got our first grant. She is finishing her last consulting contract and transitioning to 100% full-time by the end of next month.',
        initialKept: [
          'went full-time two months ago',
          'first grant',
          'transitioning to 100% full-time by the end of next month',
        ],
        probes: [
          {
            id: 1,
            target: 'transitioning to 100% full-time by the end of next month',
            shortRef: 'transitioning to 100% full-time',
            question: 'What happens to the equity split if her full-time transition gets delayed past that date?',
            sampleAnswer:
              'if delayed more than 60 days, unvested equity pauses until she joins full-time',
            expansion:
              ' — if delayed more than 60 days, unvested equity pauses until full-time start',
            additionalKept: ['unvested equity pauses until full-time start'],
            clarifications: {
              'why does that matter':
                'Having a predefined consequence for delayed transition eliminates awkward confrontations later.',
              default:
                'Having a predefined consequence for delayed transition eliminates awkward confrontations later.',
            },
          },
        ],
      },
      {
        id: 'bg-5',
        title: 'What had each of you built or worked on before this?',
        label: 'Prior backgrounds',
        placeholder: 'Past startups, relevant roles, or domain accomplishments.',
        lead: 'Understanding each founder’s track record highlights where each of you has proven judgment and where blind spots might lie.',
        sampleDump:
          'I spent 6 years leading product at a high-growth B2B logistics startup that reached Series B. She completed a PhD in geospatial modeling at Stanford and published several papers on carbon verification algorithms.',
        initialKept: [
          '6 years leading product',
          'logistics startup that reached Series B',
          'PhD in geospatial modeling at Stanford',
          'published several papers on carbon verification',
        ],
        probes: [
          {
            id: 1,
            target: 'logistics startup that reached Series B',
            shortRef: 'reached Series B',
            question: 'Are there any existing non-compete agreements or intellectual property claims from previous employers?',
            sampleAnswer:
              'both of us had our prior agreements reviewed by counsel and confirmed zero overlap or IP encumbrances',
            expansion:
              ' — prior agreements reviewed with zero overlap or encumbrances',
            additionalKept: ['zero overlap or encumbrances'],
            clarifications: {
              'why does that matter':
                'Venture investors will audit prior employment agreements in diligence before wiring money.',
              default:
                'Venture investors will audit prior employment agreements in diligence before wiring money.',
            },
          },
        ],
      },
      {
        id: 'bg-6',
        title: 'What would make either of you walk away?',
        label: 'Dealbreakers and exit triggers',
        placeholder: 'The honest early conversation that prevents a messy breakup later.',
        lead: 'It’s easier to agree on what failure looks like when you still like each other than when you’re already burned out.',
        sampleDump:
          'We agreed that if we cannot secure 3 paying pilot customers or raise our pre-seed within 12 months, we will have an honest conversation about winding down or pivoting without finger-pointing.',
        initialKept: [
          '3 paying pilot customers',
          'within 12 months',
          'honest conversation about winding down or pivoting',
        ],
        probes: [
          {
            id: 1,
            target: 'winding down or pivoting',
            shortRef: 'winding down or pivoting',
            question: 'If one founder wants to stop and the other wants to keep going, can the continuing founder buy out the IP?',
            sampleAnswer:
              'yes, the continuing founder retains the right to buy out the IP at fair nominal value',
            expansion:
              ' — continuing founder has right to acquire IP at fair nominal value',
            additionalKept: ['acquire IP at fair nominal value'],
            clarifications: {
              'why does that matter':
                'A pre-negotiated buyout mechanic prevents the company from being frozen if one founder burns out.',
              default:
                'A pre-negotiated buyout mechanic prevents the company from being frozen if one founder burns out.',
            },
          },
        ],
      },
    ],
  },
  {
    name: 'Company',
    questions: [
      {
        id: 'co-1',
        title: 'How would you describe what the company does?',
        label: 'Business of the company',
        placeholder: 'One sentence: who is this for and what does it do?',
        lead: 'This sounds obvious, but it does real work: the business description is what the IP assignment and any non-compete language point back to. Too vague and it protects nothing; too narrow and it misses whatever you pivot into.',
        clause: 'The Company is engaged in the following business: {}',
        sampleDump:
          'We build AI-powered geospatial verification software that helps carbon project developers and institutional buyers continuously audit forestry and soil carbon credits.',
        initialKept: [
          'AI-powered geospatial verification software',
          'audit forestry and soil carbon credits',
        ],
        probes: [
          {
            id: 1,
            target: 'forestry and soil carbon credits',
            shortRef: 'forestry and soil carbon',
            question: 'Does this scope also cover ocean carbon removal or general sustainability reporting?',
            sampleAnswer:
              'we want it broad enough to include ocean removal and adjacent environmental audit tooling',
            expansion:
              ' — encompassing terrestrial, oceanic, and adjacent environmental audit tooling',
            additionalKept: ['terrestrial, oceanic, and adjacent environmental audit tooling'],
            clarifications: {
              'why does that matter':
                'A slightly wider corporate purpose clause prevents having to amend bylaws if you expand adjacent product lines.',
              default:
                'A slightly wider corporate purpose clause prevents having to amend bylaws if you expand adjacent product lines.',
            },
          },
        ],
      },
      {
        id: 'co-2',
        title: 'Where is the company incorporated?',
        label: 'State of incorporation',
        placeholder: 'Delaware, California, or somewhere else?',
        lead: 'This decides whose corporate law governs everything we’re about to write down.',
        clause: 'Jurisdiction of incorporation: {}',
        sampleDump:
          'We plan to incorporate as a Delaware C-Corp before taking our pre-seed angel checks next month.',
        initialKept: ['Delaware C-Corp', 'before taking pre-seed angel checks'],
        probes: [
          {
            id: 1,
            target: 'Delaware C-Corp',
            shortRef: 'Delaware C-Corp',
            question: 'Have you reserved the entity name with the Delaware Division of Corporations?',
            sampleAnswer:
              'we checked name availability and will file through Clerky once this agreement is signed',
            expansion:
              ' — filing through Clerky immediately upon execution of this agreement',
            additionalKept: ['filing through Clerky immediately upon execution'],
            clarifications: {
              'why does that matter':
                'Delaware is the venture capital standard for predictable corporate governance and established Chancery Court precedent.',
              default:
                'Delaware is the venture capital standard for predictable corporate governance and established Chancery Court precedent.',
            },
          },
        ],
      },
    ],
  },
  {
    name: 'Equity',
    questions: [
      {
        id: 'eq-1',
        title: 'How did you land on the split you have today?',
        label: 'Basis for the split',
        placeholder: 'What’s the reason for the split — not just the numbers?',
        lead: 'This is the section that ends friendships, so I’ll be direct. I’m not going to tell you what your split should be — that’s yours. But I do want the reasoning written down, because “we agreed it was fair” is not something either of you can point at in two years.',
        clause: 'Founder Shares are allocated on the following basis: {}',
        sampleDump:
          'We agreed on an even 50/50 split because we both believe equal partnership and shared long-term risk are essential for trust. She is building the core tech and I am taking care of fundraising, operations, and GTM.',
        initialKept: [
          'even 50/50 split',
          'shared long-term risk',
          'core tech',
          'fundraising, operations, and GTM',
        ],
        probes: [
          {
            id: 1,
            target: 'even 50/50 split',
            shortRef: 'even 50/50 split',
            question: 'How do you handle potential deadlock if you disagree on a crucial strategic vote?',
            sampleAnswer:
              'we agree that deadlock resolution will be governed by an independent advisor tie-breaker',
            expansion:
              ' — with deadlocks resolved through an independent advisory tie-breaker',
            additionalKept: ['independent advisory tie-breaker'],
            clarifications: {
              'why does that matter':
                'A 50/50 split works best when paired with an explicit tie-breaking mechanism in the governance section.',
              default:
                'A 50/50 split works best when paired with an explicit tie-breaking mechanism in the governance section.',
            },
          },
        ],
      },
      {
        id: 'eq-2',
        title: 'What should happen to a founder’s shares if they leave in year one?',
        label: 'Shares on early departure',
        placeholder: 'Unvested shares return; what happens to vested shares?',
        lead: 'A one-year cliff means nothing is owed if someone walks early — but for whatever has vested, most agreements also give the company a right to buy those shares back at cost.',
        clause:
          'If a Founder ceases to provide services to the Company during the first year, the parties intend the following: {}',
        sampleDump:
          'If either founder leaves within the first 12 months, all unvested shares are forfeited back to the company pool with zero payout, and any purchased shares can be repurchased at the nominal purchase price.',
        initialKept: [
          'within the first 12 months',
          'unvested shares are forfeited',
          'repurchased at nominal purchase price',
        ],
        probes: [
          {
            id: 1,
            target: 'leaves within the first 12 months',
            shortRef: 'leaves within first 12 months',
            question: 'Does this apply regardless of whether the departure is voluntary or for cause?',
            sampleAnswer:
              'yes, applies to both voluntary resignation and termination for cause',
            expansion:
              ' — applying equally to voluntary resignation and termination for cause',
            additionalKept: ['voluntary resignation and termination for cause'],
            clarifications: {
              'why does that matter':
                'Distinguishing between good-leaver and bad-leaver protections helps prevent litigation if a founder is dismissed.',
              default:
                'Distinguishing between good-leaver and bad-leaver protections helps prevent litigation if a founder is dismissed.',
            },
          },
        ],
      },
    ],
  },
  {
    name: 'Vesting',
    questions: [
      {
        id: 'vs-1',
        title: 'What vesting schedule do you have in mind?',
        label: 'Vesting schedule',
        placeholder: 'Standard 4 years with 1-year cliff, or something custom?',
        lead: 'Vesting is just the mechanism that makes equity track contribution over time. It protects the founder who stays at least as much as it protects the company.',
        clause: 'Founder Shares shall vest according to the following schedule: {}',
        sampleDump:
          'Standard 4-year vesting with a 1-year cliff, vesting monthly thereafter over the remaining 36 months.',
        initialKept: [
          'Standard 4-year vesting',
          '1-year cliff',
          'vesting monthly thereafter over 36 months',
        ],
        probes: [
          {
            id: 1,
            target: '1-year cliff',
            shortRef: '1-year cliff',
            question: 'Do you want any retroactive vesting credit for work completed before incorporation?',
            sampleAnswer:
              'no retroactive credit; vesting clock starts on the date of incorporation',
            expansion:
              ' — with the vesting clock commencing on the official date of incorporation',
            additionalKept: ['vesting clock commences on date of incorporation'],
            clarifications: {
              'why does that matter':
                'Investors prefer a clean 4-year clock starting at company formation rather than back-dated vesting.',
              default:
                'Investors prefer a clean 4-year clock starting at company formation rather than back-dated vesting.',
            },
          },
        ],
      },
      {
        id: 'vs-2',
        title: 'Should vesting accelerate if the company is acquired?',
        label: 'Acceleration on acquisition',
        placeholder: 'Double-trigger, single-trigger, or none?',
        lead: 'If you’re acquired holding unvested shares, an acquirer can let you go and keep that equity. Single-trigger accelerates on deal close; double-trigger accelerates only if you’re also terminated afterward.',
        clause: 'Upon a Change of Control, vesting shall accelerate as follows: {}',
        sampleDump:
          'We want double-trigger acceleration: if the company is acquired and a founder is terminated without cause within 12 months, 100% of remaining unvested shares accelerate immediately.',
        initialKept: [
          'double-trigger acceleration',
          'terminated without cause within 12 months',
          '100% of remaining unvested shares accelerate',
        ],
        probes: [
          {
            id: 1,
            target: 'terminated without cause',
            shortRef: 'terminated without cause',
            question: 'Does this also include constructive termination (e.g. substantial salary reduction or demotion)?',
            sampleAnswer:
              'yes, constructive termination or good-reason resignation qualifies as a trigger',
            expansion:
              ' — including constructive termination and good-reason resignation',
            additionalKept: ['constructive termination and good-reason resignation'],
            clarifications: {
              'why does that matter':
                'Without good-reason protections, an acquirer could strip your duties to force you to quit unvested.',
              default:
                'Without good-reason protections, an acquirer could strip your duties to force you to quit unvested.',
            },
          },
        ],
      },
    ],
  },
  {
    name: 'Decisions',
    questions: [
      {
        id: 'dc-1',
        title: 'Which decisions should need both of you to agree?',
        label: 'Decisions requiring unanimity',
        placeholder: 'Fundraising, hiring, debt, selling the company?',
        lead: 'The usual “both must agree” list is raising money, selling the company, taking on debt, changing the equity split, and firing a cofounder.',
        clause:
          'The following matters require the unanimous written consent of all Founders: {}',
        sampleDump:
          'Unanimous agreement required for: issuing new equity or debt, selling or merging the company, expenditures over $25,000, hiring C-level executives, and filing for bankruptcy.',
        initialKept: [
          'issuing new equity or debt',
          'selling or merging the company',
          'expenditures over $25,000',
          'hiring C-level executives',
        ],
        probes: [
          {
            id: 1,
            target: 'expenditures over $25,000',
            shortRef: 'expenditures over $25,000',
            question: 'Who approves operational expenses below that threshold?',
            sampleAnswer:
              'either founder can authorize routine budget expenses up to $25,000 individually',
            expansion:
              ' — routine operational expenses under $25,000 may be approved individually',
            additionalKept: ['expenses under $25,000 approved individually'],
            clarifications: {
              'why does that matter':
                'Clear expenditure limits maintain operational agility while safeguarding company reserves.',
              default:
                'Clear expenditure limits maintain operational agility while safeguarding company reserves.',
            },
          },
        ],
      },
      {
        id: 'dc-2',
        title: 'How do you want to break a deadlock?',
        label: 'Deadlock resolution',
        placeholder: 'Outside advisor, CEO decides, or structured mediation?',
        lead: 'When you disagree on a unanimous item — you will — the process has to exist before you need it. Agreeing on a tiebreaker mid-argument is close to impossible.',
        clause: 'In the event of a deadlock, the matter shall be resolved as follows: {}',
        sampleDump:
          'If we are deadlocked for more than 14 business days, we will present the issue to our agreed lead investor or mutual advisory board member whose decision shall be binding.',
        initialKept: [
          'deadlocked for more than 14 business days',
          'agreed lead investor or mutual advisory board member',
          'binding decision',
        ],
        probes: [
          {
            id: 1,
            target: 'mutual advisory board member',
            shortRef: 'mutual advisor',
            question: 'Do you have a specific named advisor in mind before institutional investors join?',
            sampleAnswer:
              'we will name a mutually trusted mentor in the founding agreement annex',
            expansion:
              ' — designated in the founding agreement annex prior to institutional close',
            additionalKept: ['designated in founding agreement annex'],
            clarifications: {
              'why does that matter':
                'Naming the individual in the document eliminates disputes about who the neutral advisor should be.',
              default:
                'Naming the individual in the document eliminates disputes about who the neutral advisor should be.',
            },
          },
        ],
      },
    ],
  },
  {
    name: 'IP',
    questions: [
      {
        id: 'ip-1',
        title: 'Has everything built so far been assigned to the company?',
        label: 'IP assignment',
        placeholder: 'All code, designs, and domain names assigned in writing?',
        lead: 'Unassigned IP is among the most common things that stalls a fundraise or an acquisition once diligence starts.',
        clause:
          'All intellectual property created by the Founders to date has been assigned to the Company: {}',
        sampleDump:
          'Yes, all code repositories, domain names, patents, and trademarks developed to date will be assigned to the company under a proprietary information and inventions agreement.',
        initialKept: [
          'code repositories, domain names',
          'patents, and trademarks',
          'proprietary information and inventions agreement',
        ],
        probes: [
          {
            id: 1,
            target: 'assigned to the company',
            shortRef: 'assigned to company',
            question: 'Are there any open-source tools or personal utility scripts that you plan to exclude?',
            sampleAnswer:
              'none; all tooling created for this purpose is assigned unconditionally',
            expansion:
              ' — with no exclusions, all tools created for this venture assigned unconditionally',
            additionalKept: ['assigned unconditionally with no exclusions'],
            clarifications: {
              'why does that matter':
                'Explicitly documenting whether open source libraries or personal tools are excluded prevents future claims of IP co-ownership.',
              default:
                'Explicitly documenting whether open source libraries or personal tools are excluded prevents future claims of IP co-ownership.',
            },
          },
        ],
      },
      {
        id: 'ip-2',
        title: 'Was any of it built before the company existed?',
        label: 'Pre-existing IP',
        placeholder: 'Any pre-existing code, models, or research datasets?',
        lead: 'Work done before the company existed isn’t automatically the company’s — even if built specifically for this idea. It needs a formal assignment or license.',
        clause:
          'Intellectual property created prior to the Company’s formation is treated as follows: {}',
        sampleDump:
          'All pre-existing prototype code and research papers authored during exploratory work are formally assigned to the company in exchange for founder shares with no royalties retained.',
        initialKept: [
          'pre-existing prototype code',
          'formally assigned to the company',
          'exchange for founder shares',
          'no royalties retained',
        ],
        probes: [
          {
            id: 1,
            target: 'authored during exploratory work',
            shortRef: 'authored during exploratory work',
            question: 'Were any university resources or employer laptops used when authoring that initial work?',
            sampleAnswer:
              'no university facilities, grants, or employer equipment were used in creating any of the pre-existing assets',
            expansion:
              ' — confirmed free of university or prior employer facility encumbrances',
            additionalKept: ['free of university or prior employer encumbrances'],
            clarifications: {
              'why does that matter':
                'Universities and previous employers frequently claim ownership over code written on their hardware or campus networks.',
              default:
                'Universities and previous employers frequently claim ownership over code written on their hardware or campus networks.',
            },
          },
        ],
      },
    ],
  },
];

// Helper to flatten questions for easy indexing
export const ALL_QUESTIONS = SECTIONS.flatMap((section, sectionIndex) =>
  section.questions.map((q, questionIndex) => ({
    ...q,
    sectionName: section.name,
    sectionIndex,
    questionIndex,
    totalInSection: section.questions.length,
    clause: q.clause,
  })),
);

/**
 * Intelligent analyzer for custom text input:
 * Extracts kept phrases and generates probes dynamically if user types arbitrary input.
 */
export function analyzeCustomInput(text, question) {
  const clean = text.trim();
  if (!clean) return { text: '', kept: [], probes: [] };

  // Use pre-configured question probes if available and text is very close to sample
  if (question && question.probes && question.sampleDump) {
    const sampleWords = question.sampleDump.toLowerCase().split(/\s+/).slice(0, 10).join(' ');
    if (clean.toLowerCase().includes(sampleWords.slice(0, 20))) {
      return {
        text: clean,
        kept: [...question.initialKept],
        probes: question.probes.map((p) => ({ ...p, status: 'pending' })),
      };
    }
  }

  // General heuristic phrase extractor
  const sentences = clean.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const kept = [];
  const candidateProbes = [];

  // Look for interesting entities, dates, numbers, roles, nouns
  const patterns = [
    /\b(\d+\s*(?:years?|months?|weeks?|days?|hours?)\s*(?:ago|later|prior)?)\b/gi,
    /\b(middle school|high school|college|university|grad school|postdoc|phd)\b/gi,
    /\b(full[- ]time|part[- ]time|consulting|even split|50\/50|\d{1,2}\/\d{1,2})\b/gi,
    /\b(delaware|california|c[- ]corp|llc)\b/gi,
    /\b(product|engineering|tech|science|operations|fundraising|gtm)\b/gi,
    /\b(climate change|ai|software|b2b|logistics|data)\b/gi,
  ];

  patterns.forEach((regex) => {
    let match;
    while ((match = regex.exec(clean)) !== null) {
      if (match[0] && !kept.includes(match[0])) {
        kept.push(match[0]);
      }
    }
  });

  // Extract a few notable sentence segments for Kept
  sentences.forEach((sentence) => {
    const words = sentence.split(/\s+/);
    if (words.length >= 3 && words.length <= 8 && kept.length < 5) {
      kept.push(sentence);
    }
  });

  // If question already has domain probes, adapt them
  if (question && question.probes && question.probes.length > 0) {
    // Find candidate probe targets in the user text or adapt default probes
    question.probes.forEach((probe, idx) => {
      // Find if probe target or partial matches text
      const targetWords = probe.target.toLowerCase().split(/\s+/);
      let matchTarget = probe.target;
      const foundInText = sentences.find((s) =>
        targetWords.some((w) => w.length > 4 && s.toLowerCase().includes(w)),
      );
      if (foundInText) {
        matchTarget = foundInText;
      }

      candidateProbes.push({
        id: idx + 1,
        target: matchTarget,
        shortRef: probe.shortRef || probe.target.slice(0, 24),
        question: probe.question,
        sampleAnswer: probe.sampleAnswer,
        expansion: probe.expansion || ` — ${probe.sampleAnswer}`,
        additionalKept: probe.additionalKept || [probe.sampleAnswer.slice(0, 24)],
        clarifications: probe.clarifications || {},
        status: 'pending',
      });
    });
  } else {
    // Fallback probe
    candidateProbes.push({
      id: 1,
      target: sentences[0] || clean.slice(0, 30),
      shortRef: clean.slice(0, 20),
      question: 'Could you share a bit more detail on how that was decided?',
      sampleAnswer: 'we discussed it thoroughly and reached mutual agreement',
      expansion: ' — agreed mutually upon discussion',
      additionalKept: ['agreed mutually upon discussion'],
      clarifications: {
        default: 'Getting this detail on record helps ensure clarity in the agreement draft.',
      },
      status: 'pending',
    });
  }

  return {
    text: clean,
    kept: kept.length > 0 ? kept : [sentences[0] || clean.slice(0, 25)],
    probes: candidateProbes,
  };
}
