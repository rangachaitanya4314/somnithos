export type LanguageCode = 'en' | 'te' | 'ta' | 'hi';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
];

export interface TranslationDictionary {
  // Navigation & Common
  common: {
    somnithosPill: string;
    auditProvenance: string;
    community: string;
    newDream: string;
    home?: string;
    describeDream?: string;
    symbolsDictionary?: string;
    faq?: string;
    back: string;
    next: string;
    close: string;
    save: string;
    saved: string;
    share: string;
    shared: string;
    download: string;
    regenerate: string;
    theme: string;
    loading: string;
  };

  // Header & Stepper
  steps: {
    stepPrefix: string;
    stepOf: string; // e.g. "OF"
    step1: string; // "1 Your Dream"
    step2: string; // "2 What Stood Out"
    step3: string; // "3 One Possible Way"
    step4: string; // "4 Dream Imagined"
    step1Short: string; // "Your Dream"
    step2Short: string; // "What Stood Out"
    step3Short: string; // "One Possible Way"
    step4Short: string; // "Dream Imagined"
  };

  // Hero & Home
  home: {
    heroEyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    heroTagline?: string;
    heroCta?: string;
    heroSecondaryCta?: string;
    beginButton: string;
    exploreCommunityButton: string;
    badge1: string;
    badge2: string;
    badge3: string;
  };

  // Dream Input Form
  submit: {
    title: string;
    subtitle: string;
    dreamTitleLabel: string;
    dreamTitlePlaceholder: string;
    dreamTextLabel: string;
    dreamTextPlaceholder: string;
    emotionsLabel: string;
    emotionsHint: string;
    symbolsLabel: string;
    symbolsPlaceholder: string;
    privacyLabel: string;
    privacyPrivateTitle: string;
    privacyPrivateDesc: string;
    privacyPublicTitle: string;
    privacyPublicDesc: string;
    submitButton: string;
    submittingButton: string;
    charCount: string;
    requiredError: string;
  };

  // Loading / 2-Second Reveal
  loadingOverlay: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    subtitle: string;
  };

  // Stage 1: Your Dream
  stage1: {
    eyebrow: string;
    defaultTitle: string;
    showLess: string;
    showFull: string;
    observedHint: string;
    nextButton: string;
  };

  // Stage 2: What Stood Out
  stage2: {
    eyebrow: string;
    heading: string;
    lead: string;
    emotionalShift: string;
    nextButton: string;
  };

  // Stage 3: One Possible Way to Look at It
  stage3: {
    eyebrow: string;
    heading: string;
    lead: string;
    questionIntro: string;
    disclaimer: string;
    nextButton: string;
  };

  // Stage 4: Your Dream — Imagined
  stage4: {
    eyebrow: string;
    heading: string;
    lead: string;
    paintingPlaceholder: string;
    disclaimer: string;
    exploreAnotherButton: string;
  };

  // Explore More Hub
  exploreMore: {
    title: string;
    subtitle: string;
    researchTitle: string;
    researchDesc: string;
    beliefsTitle: string;
    beliefsDesc: string;
    astrologyTitle: string;
    astrologyDesc: string;
    patternsTitle: string;
    patternsDesc: string;
  };

  // Explore Modals
  modals: {
    researchHeading?: string;
    researchHeader: string;
    researchIntro?: string;
    researchSimpleIntroTitle: string;
    researchSummary?: string;
    researchSimpleIntroText: string;
    studiesHeading?: string;
    researchStudiesTitle: string;
    noScientificFound?: string;
    noResearchFound: string;
    viewStudyRecord: string;

    beliefsHeading?: string;
    beliefsHeader: string;
    beliefsIntro?: string;
    beliefsIntroText: string;
    noBeliefsFound: string;
    noBeliefsSub?: string;
    noBeliefsSubtext: string;
    viewSourceRecord?: string;
    viewBeliefRecord: string;

    astrologyHeading?: string;
    astrologyHeader: string;
    astrologyDisclaimer: string;
    astrologyIntro?: string;
    astrologyPrompt: string;
    birthDate?: string;
    dobLabel: string;
    birthTime?: string;
    tobLabel: string;
    calculateReading?: string;
    calculateButton: string;
    changeBirthInfo: string;

    patternsHeading?: string;
    patternsHeader: string;
    motifsInDream?: string;
    patternsMotifsTitle: string;
    patternsInsight?: string;
    patternsInsightText: string;
  };

  // Journal View
  journal: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterAll: string;
    emptyTitle: string;
    emptyDesc: string;
    recordDreamButton: string;
    deleteConfirm: string;
  };

  // Community View
  community: {
    title: string;
    subtitle: string;
    filterRecent: string;
    filterPopular: string;
    emptyTitle: string;
    emptyDesc: string;
    anonymousTag: string;
  };

  // Footer
  footer: {
    tagline: string;
    brandTagline?: string;
    privacyNote: string;
    epistemicNote: string;
    epistemicStandard?: string;
    disclaimerHeading?: string;
    disclaimer?: string;
    copyright: string;
  };
}
