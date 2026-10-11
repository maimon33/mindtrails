// Весь контент сайта Mind Trails в одном месте. Правки текста делать здесь, не в шаблонах.
// Тексты от клиента, письма 20 и 21.08.2026. Оригиналы в klient-texty-2026-08-21.md

export const brand = {
  name: 'Mind Trails',
  tagline: 'Turning knowledge into adventure',
  email: 'Avisvar86@gmail.com',
  phone: '538 203 896',
  phoneHref: '+48538203896',
  area: 'Krakow, within 20 km of the city centre',
  domain: 'mindtrails.net',
};

// Подписи к фото. Название компании ставим только там, где оно подтверждено.
// Список того, что надо уточнить у Daniel, в README клиента.
export const photos = {
  nostalgeekTeam: {
    src: '/img/nostalgeek-team.jpg',
    who: 'Nostalgeek quest',
    what: 'A team at the end of the session, holding what they found',
    alt: 'A company team holding retro props at the end of a Nostalgeek quest',
  },
  puzzleBoard: {
    src: '/img/puzzle-board.jpg',
    who: 'Mid-session',
    what: 'Two people working a cipher off the board',
    alt: 'Two participants decoding a cipher on a large arcade themed puzzle board',
  },
  nostalgeekBoard: {
    src: '/img/nostalgeek-board.jpg',
    pos: 'center 32%',
    who: 'Nostalgeek quest',
    what: 'The moment a code finally lines up',
    alt: 'A participant pointing at a life-size handheld console board during a quest',
  },
  comicsTeam: {
    src: '/img/comics-team.jpg',
    who: 'Nobody sitting out',
    what: 'Four people on one clue at the same time',
    alt: 'Four participants searching through comics and a case for a hidden clue',
  },
  puzzleAnagram: {
    src: '/img/puzzle-anagram-2.jpg',
    fit: 'contain',
    who: '',
    what: '',
    alt: 'A puzzle card asking to create one word from scrambled coloured letters',
  },
  puzzleStroop: {
    src: '/img/puzzle-stroop-2.jpg',
    who: 'From the session',
    what: 'Colour names printed in the wrong colour. The critical mind against the creative one',
    alt: 'Colour words printed in mismatched colours, a Stroop test used in the workshop',
  },
  cognizant: {
    src: '/img/cognizant-team.jpg',
    who: 'Cognizant',
    what: 'Pop-up escape room for their team, in the office',
    alt: 'A Cognizant team taking part in a pop-up escape room in their own office',
  },
  cover: {
    src: '/img/cover-office.jpg',
    who: 'Company team',
    what: 'Pop-up escape room run in their own office',
    alt: 'A company team in their office holding props at the end of a pop-up escape room',
  },
  loft: {
    src: '/img/team-loft.jpg',
    who: 'Company team',
    what: 'Mid-session, working a clue together',
    alt: 'A company team gathered around props, working out a clue together',
  },
  zebraWelcome: {
    src: '/img/zebra-welcome.jpg',
    who: 'Zebra',
    what: 'Welcome wall at their company event',
    alt: 'The welcome wall and props at a Zebra company event',
  },
  zebraRoom: {
    src: '/img/zebra-room.jpg',
    who: 'Company event',
    what: 'Tables mid-round, the whole room playing at once',
    alt: 'Company teams at tables in the middle of a round',
  },
  suitcase: {
    src: '/img/suitcase-uv.jpg',
    who: 'Quest in progress',
    what: 'A sealed case opened under UV light',
    alt: 'A team opening a sealed case with a clue revealed under UV light',
  },
  uv: {
    src: '/img/uv-clue.jpg',
    who: 'Hidden clue',
    what: 'Revealed only under UV light',
    alt: 'People gathered around a table using UV light to reveal a hidden clue',
  },
  typewriter: {
    src: '/img/props-typewriter.jpg',
    who: 'Custom props',
    what: 'Written from scratch for one client',
    alt: 'A typewriter, a map and handwritten letters built as escape room props',
  },
  table: {
    src: '/img/props-table.jpg',
    who: 'Built for one client',
    what: 'Boards, cards and locked cases laid out before a session',
    alt: 'Boards, cards and locked cases laid out on a table before a session',
  },
  pub: {
    src: '/img/pub-night.jpg',
    who: 'Pub night',
    what: 'A public quest evening for a mixed crowd',
    alt: 'People holding a treasure chest at a public quest evening in a bar',
  },
  chess: {
    src: '/img/community-chess.jpg',
    who: 'Life-size chess',
    what: 'One round inside a larger quest',
    alt: 'Participants moving life-size chess pieces during a quest',
  },
  // Фото Daniel с пилота Alice in Wonderland, письмо 05.10.2026, он просил взять только 3-5
  aliceMap: { src: '/img/alice-map.jpg', who: 'Alice in Wonderland quest', what: 'A map, a locked trunk and two people who will not let go of it', alt: 'Two participants leaning over a map board and a locked trunk during the Alice in Wonderland quest' },
  aliceHeads: { src: '/img/alice-heads.jpg', who: 'Alice in Wonderland quest', what: 'Four heads over one board', alt: 'Four participants bent closely over a colourful puzzle board' },
  aliceBook: { src: '/img/alice-book.jpg', who: 'Alice in Wonderland quest', what: 'The purple book and the map, worked at the same time', alt: 'Hands holding a purple book next to a map board and a trunk' },
  aliceBoard: { src: '/img/alice-board.jpg', who: 'Alice in Wonderland quest', what: 'Reading the board before touching anything', alt: 'Two participants studying a puzzle board on a table with a red trunk' },
  // Материалы Daniel из папки Диска "mindtrails on krakow", поставлены 05.10.2026
  pym1: { src: '/img/pym-poster-1.jpg', fit: 'contain', who: 'Past edition', what: 'Grit, Grace and Genius, the Women’s Day brain-game', alt: 'Poster of a Play Your Mind edition called Grit, Grace and Genius' },
  pym2: { src: '/img/pym-poster-2.jpg', blur: '/img/pym-poster-2-blur.jpg', fit: 'contain', who: 'Past edition', what: 'It’s about Time, from history to wild pop culture', alt: 'Poster of a Play Your Mind edition called It is about Time' },
  pym3: { src: '/img/pym-poster-3.jpg', fit: 'contain', who: 'Past edition', what: 'The Mix and Shuffle edition', alt: 'Poster of a Play Your Mind edition called Mix and Shuffle' },
  pym4: { src: '/img/pym-poster-4.jpg', fit: 'contain', who: 'Past edition', what: 'Iconic, successful, famous', alt: 'Poster of a Play Your Mind edition with pop art portraits' },
  story1: { src: '/img/storytelling-1.jpg', fit: 'contain', who: '', what: 'Richard Bach', alt: 'Quote card. A professional writer is an amateur who did not quit, Richard Bach' },
  story2: { src: '/img/storytelling-2.jpg', blur: '/img/storytelling-2-blur.jpg', fit: 'contain', who: '', what: 'Sylvia Plath', alt: 'Quote card. I write only because there is a voice within me that will not be stilled, Sylvia Plath' },
  story3: { src: '/img/storytelling-3.jpg', fit: 'contain', who: '', what: 'Maya Angelou', alt: 'Quote card. There is no greater agony than bearing an untold story inside you, Maya Angelou' },
  pizza1: { src: '/img/pizza-1.jpg', blur: '/img/pizza-1-blur.jpg', fit: 'contain', who: 'From the session', what: 'The pizza exercise', alt: 'A pizza cut into six slices labelled good sleep, spirituality, sport, culture, learn something new, social media and internet' },
  pizza2: { src: '/img/pizza-2.jpg', fit: 'contain', who: 'From the session', what: 'A second round of the pizza exercise', alt: 'A pizza cut into six slices labelled good breakfast, your pizza topping, nature, family, making money, shopping' },
  questMap: { src: '/img/quest-map.jpg', fit: 'contain', who: 'Quest props', what: 'A map, sealed envelopes and a locked trunk', alt: 'A vintage map, envelopes, a radio and a locked trunk used as escape room props' },
  questPaper: { src: '/img/quest-paper.jpg', fit: 'contain', who: 'Quest props', what: 'Torn notes and old photographs to piece together', alt: 'Torn pieces of paper, old photographs and small chests used as escape room props' },
  questLock: { src: '/img/quest-lock.jpg', who: 'Quest in progress', what: 'The last lock on the chest', alt: 'A hand opening a padlock on a wooden chest' },
  questHands: { src: '/img/quest-board-hands.jpg', who: 'Quest in progress', what: 'Three pairs of hands on one board', alt: 'Several hands working on a colourful puzzle board' },
  questUvBox: { src: '/img/quest-uv-box.jpg', who: 'Quest in progress', what: 'A UV torch over a locked cage', alt: 'Participants shining a UV torch into a small locked cage' },
  questCity: { src: '/img/quest-city-map.jpg', who: 'Quest in progress', what: 'A city map puzzle laid out on the table', alt: 'Participants around a table with a city map puzzle board' },
  questTypewriter: { src: '/img/quest-typewriter-map.jpg', who: 'Quest in progress', what: 'A typewriter, a map and a code to type', alt: 'Two participants typing on a typewriter next to a map and a small trunk' },
  teamChests: { src: '/img/team-chests.jpg', who: 'After the session', what: 'A team with the cases they opened', alt: 'Four people holding the opened cases after a session' },
  daniel: {
    src: '/img/daniel.jpg',
    who: '',
    what: '',
    alt: 'Daniel Abisrur, founder of Mind Trails',
  },
};

export const nav = [
  { label: 'What we are not', href: '#not' },
  { label: 'Activities', href: '#activities' },
  { label: 'Your own quest', href: '#kit' },
  { label: 'Who runs it', href: '#daniel' },
  { label: 'Contact', href: '#contact' },
];

// ---------- 1. первый экран ----------
export const hero = {
  slogan: 'Turning Knowledge into Adventure',
  eyebrow: 'Interactive activities brought straight to your office, event, or home.',
  h1: 'Interactive activities that spark thinking through curiosity',
  lines: [
    'We bring the entire experience to your workplace.',
    '60-90 minutes, with up to 40 participants per session.',
    'No setup required from your side.',
    'Optional tailored content inspired by your workplace.',
  ],
  note: 'We strongly recommend putting phones aside for 90 minutes. Also in real life.',
  cta: 'Book a free demo',
  ctaSub: 'Thirty minutes at your next team meeting. No charge, no setup.',
};

// ---------- 2. чего у нас нет ----------
export const notFind = {
  eyebrow: 'Before anything else',
  h2: 'What you will not find at Mind Trails',
  img: '/img/info-not-find.jpg',
  alt: 'What you will not find at Mind Trails. No same old team-building formula, no half the team watching from the side, no awkward icebreakers',
  items: [
    {
      n: '01',
      lines: [
        'No same old team-building formula.',
        'Not another recycled activity.',
      ],
      without: 'Without the "I came, I played, and forgot about it the moment I left" feeling.',
    },
    {
      n: '02',
      lines: [
        'No half the team watching from the side.',
        'Not just the loudest people taking over.',
      ],
      without: 'Without people who "went to the bathroom" and never came back.',
    },
    {
      n: '03',
      lines: [
        'No awkward icebreakers.',
        'Not another round of forced introductions.',
      ],
      without: 'Without "turn to the person next to you and share something personal."',
    },
  ],
};

// ---------- 3. инфографика something ----------
export const something = {
  h2: 'One experience. Something for every mind.',
  hub: 'something',
  img: '/img/info-something-2.jpg',
  alt: 'One experience. Something for every mind. To belong, to enjoy, to solve, to discuss, to take with you',
  branches: [
    { n: '01', label: 'to belong', text: 'Everyone has a role. No spectators.' },
    { n: '02', label: 'to enjoy', text: 'Original activities without awkward icebreakers.' },
    { n: '03', label: 'to solve', text: 'Different challenges reward different strengths.' },
    { n: '04', label: 'to discuss', text: 'Progress happens when people share ideas.' },
    { n: '05', label: 'to take with you', text: 'The game ends. The shared story stays.' },
  ],
  foot: 'Designed for different personalities. Built for one team.',
};

export const evolution = {
  eyebrow: 'Four moments. One shared experience.',
  h2: 'How Mind Trails draws people in',
  img: '/img/info-4-steps.jpg',
  alt: 'How Mind Trails draws people in. Skeptical, watching, contributing, fully in',
  stages: [
    { label: 'Skeptical', q: 'Do we really need another team-building activity?' },
    { label: 'Watching', q: 'I’m here, but I’ll just watch for now.' },
    { label: 'Contributing', q: 'Actually... I think I know what to do.' },
    { label: 'Fully in', q: 'Wait... that was an hour already?' },
  ],
};

// ---------- 4. как это работает ----------
export const steps = {
  eyebrow: 'How to book',
  h2: 'From one email to a room that will not sit down',
  items: [
    { n: '01', title: 'Pick the experience', text: 'Five formats. We help you choose by team size.' },
    { n: '02', title: 'We build it around you', text: 'Optional custom riddles on your company story.' },
    { n: '03', title: 'We arrive with everything', text: 'Props, locks, boards and clues come with us.' },
    { n: '04', title: 'Everyone plays at once', text: '60 to 90 minutes. Nobody sits on the side.' },
  ],
};

// ---------- 5. пять активностей ----------
export const experiences = [
  {
    slug: 'quest-your-mind',
    forWhom: 'For collaboration and problem-solving',
    name: 'Quest Your Mind',
    type: 'Pop-up escape room in your office',
    photoKey: 'nostalgeekTeam',
    card: 'A fully mobile escape room brought directly to your workplace. Physical puzzles, hidden clues and real decisions under time pressure.',
    punchline: 'Great teams don’t just think fast. They think together.',
    duration: '60-90 min',
    people: 'Up to 40 people',
    ctaLabel: 'See photos and how it works',
    blocks: [
      {
        h: 'What does it bring to the team?',
        list: [
          'Leadership and decision-making',
          'Collaboration through real shared challenges',
          'A very good reason to put the phones away for an hour',
        ],
      },
      {
        h: 'Want to make it yours?',
        p: 'Optional custom riddles can be created around your company story, values or a topic of your choice.',
      },
    ],
    bestFor: ['Team-building days', 'Collaboration', 'Cross-team connection', 'Problem-solving'],
    gallery: ['aliceHeads', 'nostalgeekBoard', 'aliceBook', 'table'],
  },
  {
    slug: 'play-your-mind',
    forWhom: 'For energy and team connection',
    name: 'Play Your Mind',
    type: 'This Is Not A Quiz',
    photoKey: 'pym2',
    card: 'A roller-coaster trivia ride. Questions that will make you laugh, surprise you, and make you reach for all the unique knowledge you have collected throughout your life.',
    punchline: 'The best part isn’t knowing the answer. It’s what happens before it.',
    duration: '60-90 min',
    people: 'Up to 60 people',
    ctaLabel: 'See what makes it different',
    blocks: [
      {
        h: 'So what will not be part of Play Your Mind?',
        list: [
          'A. Multiple-choice questions',
          'B. Serious IQ tests',
          'C. Random guessing games',
          'D. Of course, all of the above',
        ],
        p: 'This is trivia where knowing things helps, but thinking together matters more. Questions twist familiar formats, make people look at information differently and give the team something to discuss before anyone can shout out an answer.',
      },
      {
        h: 'What happens instead?',
        p: 'People talk. People disagree. People make strange connections. Someone is absolutely certain they are right. And somehow, the team gets there.',
      },
    ],
    bestFor: ['Large groups', 'Office socials', 'Team-building days', 'International teams'],
    gallery: ['pym1', 'pym3', 'pym4'],
  },
  {
    slug: 'into-my-mind',
    forWhom: 'For storytelling and communication',
    name: 'Into My Mind',
    type: 'A real storytelling workshop',
    photoKey: 'story2',
    card: 'Before AI, stories were already changing the world. This is a hands-on workshop about how to build, shape and tell stories that people actually remember.',
    punchline: 'People rarely remember information. They remember stories.',
    duration: '60-90 min',
    people: 'Flexible group size',
    ctaLabel: 'Explore the workshop',
    blocks: [
      {
        h: 'Before AI, stories were already changing the world',
        p: 'Storytelling is not a soft skill. It is one of the oldest tools humans have for making another person listen, care, understand and remember. This workshop turns that power into something participants can actually use.',
      },
      {
        h: 'What will we explore?',
        list: [
          'What makes a story emotionally memorable',
          'Why do people trust stories more than information',
          'What are the three core ingredients behind an engaging story',
          'How do you turn information into something another person actually wants to hear',
        ],
      },
      {
        h: 'What makes it a real workshop?',
        p: 'Participants do not just hear storytelling principles. They use them. They work with ideas, build stories, test what makes them engaging and practice turning information into something another person can follow and remember. Not a lecture about storytelling. We tell stories.',
      },
    ],
    bestFor: ['Communication', 'Leadership', 'Presentations', 'Employer branding', 'Teams working with ideas'],
    gallery: ['story1', 'story3'],
  },
  {
    slug: 'share-my-mind',
    forWhom: 'For better team understanding',
    name: 'Share My Mind',
    type: 'A workshop about people, connection, and too much pizza',
    photoKey: 'pizza1',
    card: 'Communication styles. Misunderstandings. Decisions. The strange fact that two people can experience exactly the same situation completely differently.',
    punchline: 'Communication is not what you say. It’s what the other person experiences.',
    duration: '60-90 min',
    people: 'Up to 12 people',
    ctaLabel: 'See how it works',
    blocks: [
      {
        h: 'In a room with three people, there are already four different realities',
        p: 'Share My Mind is a creative group activity about personality, decision-making and the people beside us. Instead of explaining communication through slides and models, the group gets to experience what happens when different people interpret the same situation in completely different ways.',
      },
      {
        h: 'What will we explore?',
        list: [
          'Communication styles',
          'Collaboration under uncertainty',
          'Misunderstandings',
          'Identity inside a team',
          'And possibly the most important workplace issue of all, too much pizza',
        ],
      },
      {
        h: 'What does it bring to the team?',
        p: 'A chance to notice how differently people think, communicate and react, without turning the session into therapy or another corporate communication lecture.',
      },
    ],
    bestFor: ['Small teams', 'Communication', 'New teams', 'Onboarding', 'Team reflection'],
    gallery: ['pizza2'],
  },
  {
    slug: 'out-of-my-mind',
    forWhom: 'For creativity and fresh thinking',
    name: 'Out of My Mind',
    type: 'Creative thinking, out loud',
    photoKey: 'puzzleStroop',
    card: 'Can a team stay creative when everyone is afraid of getting it wrong? Out of My Mind is an active and humorous workshop about thinking patterns, curiosity, play and the occasionally strange choices our brains make.',
    punchline: 'The team discovers the unique perspective each person brings, and how to turn those differences into an advantage that strengthens collaboration.',
    duration: '60-90 min',
    people: 'Up to 20 people',
    ctaLabel: 'Step outside the usual',
    blocks: [
      {
        h: 'What happens in the room',
        p: 'Through playful challenges, participants discover how changing perspective can unlock new ways to approach a problem.',
      },
      {
        h: 'What will we explore?',
        list: [
          'Why humans need to play',
          'The critical mind versus the creative mind',
          'How different ways of thinking improve both the way we work and the quality of our results',
          'Thinking traps, creative choices and motivation through play',
        ],
      },
    ],
    bestFor: ['Innovation days', 'Creativity', 'Team energy', 'Wellbeing', 'Teams that need a reset'],
    gallery: ['puzzleAnagram'],
  },
];

// ---------- отзывы ----------
export const testimonials = [
  {
    name: 'Eyal',
    company: 'Cognizant',
    text: 'We came in with no expectations. I really didn’t think the puzzles would be like that, or that there would be all these things hidden in the boxes. It needed all of us, and somehow I found myself leading, but also needing help from the others.',
  },
  {
    name: 'Rita',
    company: 'YouTube',
    text: 'Usually only half the people really join in. This time, almost all of us were part of it.',
  },
  {
    name: 'Dan',
    company: 'Gemini',
    text: 'I’ll be honest, I came because I wanted pizza. But pretty quickly I saw there was much more to it. I found out new things about people I see every day in the office. And when it was over, we just kept talking.',
  },
  {
    name: 'Kasia',
    company: 'Majorel',
    text: 'I thought it was going to be another trivia thing with questions about geography and history, so I planned to sit on the side with a friend. But when it started, we understood it was something different. It’s hard to explain, but even when we didn’t know the answers, we really wanted to know them.',
  },
  {
    name: 'Marius',
    company: 'Teleperformance',
    text: 'I’ve done a lot of team activities before. This one actually felt different.',
  },
  {
    name: 'Iren',
    company: 'Layla Bar',
    text: 'I liked that people kept talking about the activity even during lunch.',
  },
];

export const clients = [
  { name: 'Cognizant', file: 'cognizant-logo.png' },
  { name: 'Teleperformance', file: 'teleperformance-logo.png' },
  { name: 'Majorel', file: 'majorel-logo.png' },
  { name: 'YouTube', file: 'youtube-logo.png' },
  { name: 'Zebra', file: 'zebra-logo.png' },
  { name: 'Imperva', file: 'imperva-logo.png' },
  { name: 'Ituran', file: 'ituran-logo.png' },
  { name: 'Ynet Global', file: 'ynet-global-logo.png' },
  { name: 'JCC', file: 'jcc-logo.png' },
];

// ---------- 6. свой квест, кит остаётся у компании ----------
export const kit = {
  eyebrow: 'Built once, yours from then on',
  h2: 'Your company story becomes the quest',
  lead: 'We create a complete mobile escape-room kit built entirely around your company, from scratch. Your history, milestones, products, values and stories become physical puzzles, hidden clues and moments of discovery.',
  turn: 'And this is not a one-time event. The finished activity belongs to your company.',
  uses: [
    'Onboarding',
    'Assessment centers for senior roles',
    'Team days',
    'Internal events',
    'Company celebrations',
  ],
  usesNote: 'Again and again, even hundreds of times a year.',
  close: 'Over time, it becomes more than a game. It becomes part of how your company tells its story, and part of its DNA.',
  signature: 'Our team of experts. Your story. Yours to keep.',
};

// ---------- 7. про Daniel ----------
export const daniel = {
  name: 'Daniel Abisrur',
  role: 'Founder and creative director',
  photo: '/img/daniel.jpg',
  facts: [
    'Speaker coach for TED talks',
    'Lead writer for Questomania mobile escape rooms',
    'Degree in Literature and Education, graduated with honours',
    'Founder of A Mystery for Generations, an experiential educational project that helps Holocaust survivors share their stories with students and educational institutions in a meaningful and engaging way',
  ],
  quote: 'People rarely remember information. They remember stories.',
};

export const logistics = {
  eyebrow: 'Logistics',
  h2: 'All we need from you is a room, three tables and a date',
  you: [
    'Any room where people can stand and move. A meeting room, a canteen or an open space all work',
    'Three standard tables. That is the only equipment we ask for',
    'A date and a rough headcount, confirmed shortly before the event',
  ],
  us: [
    'Every prop, lock, board and clue, packed and transported by us',
    'The full scenario, written for your team',
    'The host who runs the session from start to finish',
    'Setup before you arrive and a clean room after we leave',
  ],
};

export const faq = [
  {
    q: 'Do we need a special room?',
    a: 'No. Any room where people can move around is enough. We have run events in canteens and open-plan offices.',
  },
  {
    q: 'How many people can take part?',
    a: 'From 4 to 40 in a single session. For larger groups we run sessions in parallel.',
  },
  {
    q: 'Can you run it in English?',
    a: 'Yes. The experiences are built for international teams and run in English.',
  },
  {
    q: 'How complicated is the setup?',
    a: 'Minimal. We arrive before your team, set up, and take everything away afterwards.',
  },
  {
    q: 'Can it be built around our company?',
    a: 'Yes, and that is the part people remember. Custom riddles are written on your story, your values or your product.',
  },
  {
    q: 'What about people who hate team-building?',
    a: 'They are exactly who this is designed for. No performing, no forced sharing, no standing in a circle.',
  },
  {
    q: 'Where do you work?',
    a: 'Krakow, within 20 km of the city centre. The whole setup is mobile, so we travel to you.',
  },
  {
    q: 'How do we start?',
    a: 'Tell us a date and a rough headcount. If you want to see it first, we will run a thirty-minute puzzle at your next team meeting at no charge.',
  },
];

export const cta = {
  h2: 'See it before you book it',
  big: 'We will run a thirty-minute puzzle at your next team meeting.',
  text: 'No charge, no setup, no commitment. Your team plays, you decide afterwards whether it fits.',
  alt: 'Already have a date in mind? Tell us and we will hold it for seven days while you check it with your team.',
};

// ---------- галерея, идея клиента ----------
export const gallery = {
  eyebrow: 'A few more from the room',
  h2: 'What it actually looks like',
  sub: 'Real sessions, real teams, real props. No stock photography anywhere on this page.',
  keys: ['questLock', 'cover', 'comicsTeam', 'questTypewriter', 'questHands', 'questCity', 'teamChests', 'puzzleBoard', 'zebraWelcome'],
};
