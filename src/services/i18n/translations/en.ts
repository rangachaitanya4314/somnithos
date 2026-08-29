import type { TranslationDictionary } from '../types';

export const enTranslations: TranslationDictionary = {
  common: {
    somnithosPill: 'SOMNITHOS',
    auditProvenance: 'Audit & Provenance',
    community: 'Community',
    newDream: 'New Dream',
    home: 'Home',
    describeDream: 'Describe Your Dream',
    symbolsDictionary: 'Dream Symbols Dictionary',
    faq: 'Science & FAQ',
    back: 'Back',
    next: 'Next',
    close: 'Close',
    save: 'Save Dream',
    saved: 'Saved',
    share: 'Share',
    shared: 'Shared',
    download: 'Download',
    regenerate: 'Regenerate',
    theme: 'Theme:',
    loading: 'Loading...'
  },
  steps: {
    stepPrefix: 'STEP',
    stepOf: 'OF',
    step1: '1 Your Dream',
    step2: '2 What Stood Out',
    step3: '3 One Possible Way',
    step4: '4 Dream Imagined',
    step1Short: 'Your Dream',
    step2Short: 'What Stood Out',
    step3Short: 'One Possible Way',
    step4Short: 'Dream Imagined'
  },
  home: {
    heroEyebrow: 'EVIDENCE-FIRST DREAM EXPLORATION',
    heroTitle: 'Understand your dreams with calm clarity and faithful art.',
    heroSubtitle: 'Explore meaningful moments from your sleep without exaggerated omens or false promises. Grounded in documented sleep science and historical perspectives.',
    beginButton: 'Explore Your Dream',
    exploreCommunityButton: 'Explore Community Dreams',
    badge1: 'Grounded Sleep Science',
    badge2: 'Faithful Artwork',
    badge3: 'Zero Dogma or Predictions'
  },
  submit: {
    title: 'Explore a Dream',
    subtitle: 'Share your dream as you remember it. Somnithos will notice key details and paint a faithful visualization.',
    dreamTitleLabel: 'Dream Title (Optional)',
    dreamTitlePlaceholder: 'e.g. Walking in a dark forest, Purple train under water...',
    dreamTextLabel: 'What happened in your dream?',
    dreamTextPlaceholder: 'Describe the setting, objects, colors, actions, and how you felt...',
    emotionsLabel: 'How did you feel?',
    emotionsHint: 'Select the main feelings experienced during or after the dream.',
    symbolsLabel: 'Key objects or symbols noticed (Optional)',
    symbolsPlaceholder: 'e.g. water, train, clock, forest, friend...',
    privacyLabel: 'Privacy Selection',
    privacyPrivateTitle: 'Keep Private in Personal Journal',
    privacyPrivateDesc: 'Stored only in your local browser archive. Never published.',
    privacyPublicTitle: 'Share Anonymously with Community',
    privacyPublicDesc: 'No name or personal info is ever attached.',
    submitButton: 'Explore Dream',
    submittingButton: 'Reflecting on your dream...',
    charCount: 'characters',
    requiredError: 'Please write a brief description of your dream to proceed.'
  },
  loadingOverlay: {
    step1: 'Reflecting on your dream...',
    step2: 'Noticing key details & feelings...',
    step3: 'Forming a gentle reflection...',
    step4: 'Painting your dream scene...',
    subtitle: 'Somnithos thoughtfully explores your narrative and prepares a personal visualization.'
  },
  stage1: {
    eyebrow: 'YOUR DREAM',
    defaultTitle: 'Your Dream Narrative',
    showLess: 'Show less',
    showFull: 'Show full dream',
    observedHint: 'Meaningful details and emotional shifts observed.',
    nextButton: 'What Stood Out'
  },
  stage2: {
    eyebrow: 'WHAT STOOD OUT',
    heading: 'Key Details in Your Dream',
    lead: 'Only the most important details actually present in your dream:',
    emotionalShift: 'Emotional Shift',
    nextButton: 'One Possible Way'
  },
  stage3: {
    eyebrow: 'ONE POSSIBLE WAY TO LOOK AT IT',
    heading: 'A Gentle Way to Reflect',
    lead: 'Every dream belongs to you. Here is one simple perspective for your own thought:',
    questionIntro: 'A quiet question to consider:',
    disclaimer: 'Non-diagnostic reflection. Somnithos never claims certainty or future prediction.',
    nextButton: 'Dream Imagined'
  },
  stage4: {
    eyebrow: 'YOUR DREAM — IMAGINED',
    heading: 'Your Dream, Visualized',
    lead: 'Faithfully capturing your exact dream setting, objects, mood, and colors:',
    paintingPlaceholder: 'Painting your dream...',
    disclaimer: 'Your Dream — Imagined · An artistic visualization inspired by your description. Not scientific evidence.',
    exploreAnotherButton: 'Explore Another Dream'
  },
  exploreMore: {
    title: 'Explore More If You Wish',
    subtitle: 'Choose what you are curious about. Research and traditional perspectives are completely optional.',
    researchTitle: '🔬 Sleep & Mind',
    researchDesc: 'How science explains REM sleep, emotion processing, and memory sorting.',
    beliefsTitle: '🏺 Old Dream Beliefs',
    beliefsDesc: 'Historical records from antiquity, manuscripts, and cultural traditions.',
    astrologyTitle: '✨ Astrology (Optional)',
    astrologyDesc: 'Traditional astrological element & planetary correspondences (non-scientific).',
    patternsTitle: '🧠 My Dream Patterns',
    patternsDesc: 'Check recurring emotions and motifs across all your saved dreams.'
  },
  modals: {
    researchHeader: 'Sleep & Mind Research',
    researchSimpleIntroTitle: 'In Simple Everyday English:',
    researchSimpleIntroText: 'Dreams may sometimes help the brain process strong emotions connected to waking memories. During REM sleep, the brain reorganizes recent experiences and integrates them with older memories in a safe, offline state.',
    researchStudiesTitle: 'Documented Studies:',
    noResearchFound: 'No specific scientific studies matched this particular imagery.',
    viewStudyRecord: 'View study record →',

    beliefsHeader: 'Old Dream Beliefs',
    beliefsIntroText: 'These are historical perspectives from ancient manuscripts and cultural traditions. They reflect historical beliefs, not universal predictions.',
    noBeliefsFound: 'No reliable evidence was found for this idea.',
    noBeliefsSubtext: 'Somnithos only shows audited, historical manuscripts and never invents ancient traditions.',
    viewBeliefRecord: 'View source record →',

    astrologyHeader: 'Astrology (Optional)',
    astrologyDisclaimer: 'Note: Astrology is a traditional belief system. It is not scientific evidence.',
    astrologyPrompt: 'Optionally provide birth details to explore traditional astrological correspondences for your dream. (We do not ask for your name).',
    dobLabel: 'Date of Birth',
    tobLabel: 'Time of Birth (Optional)',
    calculateButton: 'Calculate Astrological Reading',
    changeBirthInfo: 'Change birth info',

    patternsHeader: 'My Dream Patterns',
    patternsMotifsTitle: 'Motifs in This Dream:',
    patternsInsightText: 'As you record more dreams in your personal archive, Somnithos discovers recurring emotional themes and imagery transitions over time.'
  },
  journal: {
    title: 'My Dream Journal',
    subtitle: 'Your private, offline archive of recorded dreams and synthesized reflections.',
    searchPlaceholder: 'Search your dreams by title, text, or motif...',
    filterAll: 'All Dreams',
    emptyTitle: 'No Saved Dreams Yet',
    emptyDesc: 'When you save dreams, they will appear here in your private journal.',
    recordDreamButton: 'Record a New Dream',
    deleteConfirm: 'Are you sure you want to delete this dream from your private journal?'
  },
  community: {
    title: 'Community Dream Feed',
    subtitle: 'Read dreams shared anonymously by others around the world.',
    filterRecent: 'Recent Dreams',
    filterPopular: 'Popular Dreams',
    emptyTitle: 'No Public Dreams Found',
    emptyDesc: 'Be the first to anonymously share a dream with the community.',
    anonymousTag: 'Shared Anonymously'
  },
  footer: {
    tagline: 'Simple on the surface. Powerful underneath.',
    privacyNote: 'Privacy-first architecture: your private dreams remain strictly in your browser.',
    epistemicNote: 'Evidence-first exploration: distinguishing scientific research from cultural traditions.',
    copyright: '© Somnithos. All rights reserved.'
  }
};
