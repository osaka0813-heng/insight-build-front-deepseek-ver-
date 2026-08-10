export const revealMotion = {
  defaultDuration: 220,
  heroDuration: 280,
  titleDuration: 200,
} as const;

export const readingTempo = {
  cover: { date: 0, title: 10, observe: 100, summary: 220, swipe: 380 },
  question: { header: 0, title: 10, lead: 160, footnote: 340 },
  signals: { header: 0, title: 10, cards: [150, 270, 390], source: 520 },
  pattern: { header: 0, title: 10, before: 150, shift: 280, now: 410, conclusion: 540 },
  insight: { brand: 0, title: 10, prompt: 150, formula: 310, explanation: 480 },
  observe: { header: 0, title: 10, items: [150, 260, 370, 480], ending: 610 },
} as const;
