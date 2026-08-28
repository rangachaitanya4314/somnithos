import React, { useState } from 'react';
import type { DreamSubmission } from '../../types/dream';
import {
  Sparkles,
  Lock,
  Globe,
  Wand2,
  ArrowRight,
  ArrowLeft,
  Info,
  Check,
  Plus,
  Feather,
  MapPin,
  Palette,
  Users
} from 'lucide-react';

interface DreamSubmitFormProps {
  onSubmit: (submission: DreamSubmission) => void;
  isAnalyzing: boolean;
}

const PRESET_DREAMS = [
  {
    label: 'Flight & Ocean Portal',
    title: 'Gliding Over Luminous Midnight Waters',
    description: 'I found myself standing on a high marble terrace looking out over a dark indigo ocean. Without warning, I lifted into the air and was flying smoothly, skimming just above the water. In the distance, an ancient carved stone door was standing in the middle of the sea, bathed in soft golden starlight. As I flew through it, I felt deep peace and wonder.',
    emotions: ['Peace', 'Wonder', 'Exhilaration', 'Awe'],
    symbolsAndObjects: ['water', 'flying', 'doors', 'ocean', 'starlight'],
    location: 'Ocean terrace and ancient gateway',
    colors: ['indigo', 'blue', 'gold', 'azure'],
    beforeDream: 'I had been reading late into the night about maritime voyages and meditation.',
    afterWaking: 'I woke up feeling remarkably calm and centered.',
    privacy: 'private' as const
  },
  {
    label: 'The Serpent & The Forest',
    title: 'The Silver Serpent in the Pine Clearing',
    description: 'I was walking through a dense, foggy forest of tall pine trees. The ground was covered in damp moss and dry branches. Suddenly, a large silver serpent emerged from the roots of an ancient oak tree. It stopped and looked directly at me. I expected to feel terrified, but instead I felt an intense curiosity. It coiled gently and pointed with its head toward a path I had not noticed before.',
    emotions: ['Curiosity', 'Wonder', 'Surprise'],
    symbolsAndObjects: ['snake', 'forest', 'trees', 'path'],
    location: 'Deep temperate forest',
    colors: ['silver', 'green', 'grey', 'emerald'],
    beforeDream: 'I had a difficult decision to make at work about choosing between two conflicting paths.',
    afterWaking: 'I kept thinking about the alternate path the serpent revealed.',
    privacy: 'anonymous_public' as const
  },
  {
    label: 'Falling & Loose Teeth',
    title: 'The Crumbling Tower and Falling Steps',
    description: 'I was climbing a spiral stone staircase inside a tall tower when the steps began to crumble beneath my feet. I felt myself falling through the air. As I tried to speak or call for help, my teeth felt loose and fragile, like dry bone. Just before hitting the ground, the scene dissolved into calm blue mist.',
    emotions: ['Fear', 'Anxiety', 'Confusion', 'Relief'],
    symbolsAndObjects: ['falling', 'teeth', 'house', 'stairs'],
    location: 'Ancient crumbling tower',
    colors: ['grey', 'blue', 'white'],
    beforeDream: 'Under heavy deadlines with physical jaw clenching throughout the work week.',
    afterWaking: 'Checked my teeth immediately upon waking; felt relieved to be safe in bed.',
    privacy: 'private' as const
  }
];

const EMOTION_CATEGORIES = [
  {
    category: 'Wonder & Awe',
    items: ['Wonder', 'Awe', 'Peace', 'Joy', 'Exhilaration', 'Curiosity']
  },
  {
    category: 'Tension & Dread',
    items: ['Anxiety', 'Fear', 'Confusion', 'Vulnerability', 'Panic', 'Dread']
  },
  {
    category: 'Melancholy & Longing',
    items: ['Nostalgia', 'Longing', 'Grief', 'Loneliness', 'Relief', 'Solemnity']
  }
];

const SYMBOL_SUGGESTIONS = [
  'Water & Ocean', 'Flying', 'Falling', 'Snakes & Serpents', 'Doors & Portals',
  'Teeth', 'Fire & Flame', 'Forest & Trees', 'House & Rooms', 'Bridges', 'Clocks & Time', 'Trains & Vehicles'
];

const COLOR_SUGGESTIONS = [
  { name: 'Midnight Indigo', code: '#1e293b', label: 'indigo' },
  { name: 'Starlight Azure', code: '#38bdf8', label: 'azure' },
  { name: 'Imperial Gold', code: '#d4af37', label: 'gold' },
  { name: 'Obsidian Black', code: '#090d16', label: 'dark' },
  { name: 'Moonlit Silver', code: '#e2e8f0', label: 'silver' },
  { name: 'Forest Emerald', code: '#059669', label: 'emerald' },
  { name: 'Crimson Rose', code: '#e11d48', label: 'crimson' },
  { name: 'Nebula Violet', code: '#8b5cf6', label: 'violet' }
];

export const DreamSubmitForm: React.FC<DreamSubmitFormProps> = ({ onSubmit, isAnalyzing }) => {
  // Step navigation (1: Story, 2: Emotions, 3: Motifs, 4: Context)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [customEmotion, setCustomEmotion] = useState('');
  const [importantPeople, setImportantPeople] = useState('');
  const [animals, setAnimals] = useState('');
  const [symbols, setSymbols] = useState<string[]>([]);
  const [customSymbol, setCustomSymbol] = useState('');
  const [location, setLocation] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [beforeDream, setBeforeDream] = useState('');
  const [afterWaking, setAfterWaking] = useState('');
  const [userInterpretation, setUserInterpretation] = useState('');
  const [culturalBackground, setCulturalBackground] = useState('');
  const [privacy, setPrivacy] = useState<'private' | 'anonymous_public'>('private');
  const [errorMsg, setErrorMsg] = useState('');

  const handleApplyPreset = (preset: typeof PRESET_DREAMS[0]) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setEmotions(preset.emotions);
    setSymbols(preset.symbolsAndObjects);
    setLocation(preset.location);
    setColors(preset.colors);
    setBeforeDream(preset.beforeDream);
    setAfterWaking(preset.afterWaking);
    setPrivacy(preset.privacy);
    setErrorMsg('');
  };

  const toggleEmotion = (emo: string) => {
    setEmotions(prev =>
      prev.includes(emo) ? prev.filter(e => e !== emo) : [...prev, emo]
    );
  };

  const addCustomEmotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEmotion.trim() && !emotions.includes(customEmotion.trim())) {
      setEmotions([...emotions, customEmotion.trim()]);
      setCustomEmotion('');
    }
  };

  const toggleSymbol = (sym: string) => {
    const cleanSym = sym.toLowerCase().split(' ')[0];
    setSymbols(prev =>
      prev.includes(cleanSym) ? prev.filter(s => s !== cleanSym) : [...prev, cleanSym]
    );
  };

  const addCustomSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSymbol.trim() && !symbols.includes(customSymbol.trim().toLowerCase())) {
      setSymbols([...symbols, customSymbol.trim().toLowerCase()]);
      setCustomSymbol('');
    }
  };

  const toggleColor = (col: string) => {
    setColors(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const validateAndNext = (nextStep: 1 | 2 | 3 | 4) => {
    if (currentStep === 1) {
      if (!description.trim()) {
        setErrorMsg('Please describe what happened in your dream to continue.');
        return;
      }
      if (description.trim().length < 15) {
        setErrorMsg('Please share a few more details (at least 15 characters).');
        return;
      }
    }
    setErrorMsg('');
    setCurrentStep(nextStep);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please enter your dream description before proceeding.');
      setCurrentStep(1);
      return;
    }
    if (description.trim().length < 15) {
      setErrorMsg('Please describe your dream with a bit more detail (at least 15 characters).');
      setCurrentStep(1);
      return;
    }

    setErrorMsg('');

    const submission: DreamSubmission = {
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      title: title.trim() || undefined,
      description: description.trim(),
      emotions,
      importantPeople: importantPeople.trim() || undefined,
      animals: animals.trim() ? animals.split(',').map(a => a.trim()) : undefined,
      symbolsAndObjects: symbols,
      location: location.trim() || undefined,
      colors,
      beforeDream: beforeDream.trim() || undefined,
      afterWaking: afterWaking.trim() || undefined,
      userInterpretation: userInterpretation.trim() || undefined,
      culturalBackground: culturalBackground.trim() || undefined,
      privacy,
      createdAt: new Date().toISOString()
    };

    onSubmit(submission);
  };

  return (
    <div className="dream-submit-container container">
      {/* Header & Epistemic Introduction */}
      <div className="submit-header">
        <div className="submit-badge">
          <Feather size={14} className="text-gold" />
          <span>NOCTURNAL EXPLORATION & SYNTHESIS</span>
        </div>
        <h1 className="submit-title">Describe Your Dream</h1>
        <p className="submit-sub">
          Share your nocturnal experience. Somnithos examines documented historical traditions, peer-reviewed sleep psychology, and crafts an original reflection with generative dream artwork.
        </p>

        {/* Guided Step Navigation Bar */}
        <div className="guided-steps-bar" role="navigation" aria-label="Submission Progress">
          <button
            type="button"
            className={`step-nav-pill ${currentStep === 1 ? 'active' : ''} ${description.length >= 15 ? 'completed' : ''}`}
            onClick={() => setCurrentStep(1)}
          >
            <span className="step-num">1</span>
            <span className="step-title">The Story</span>
          </button>

          <div className="step-connector"></div>

          <button
            type="button"
            className={`step-nav-pill ${currentStep === 2 ? 'active' : ''} ${emotions.length > 0 ? 'completed' : ''}`}
            onClick={() => validateAndNext(2)}
          >
            <span className="step-num">2</span>
            <span className="step-title">Emotions</span>
          </button>

          <div className="step-connector"></div>

          <button
            type="button"
            className={`step-nav-pill ${currentStep === 3 ? 'active' : ''} ${symbols.length > 0 || location || colors.length > 0 ? 'completed' : ''}`}
            onClick={() => validateAndNext(3)}
          >
            <span className="step-num">3</span>
            <span className="step-title">Memories & Motifs</span>
          </button>

          <div className="step-connector"></div>

          <button
            type="button"
            className={`step-nav-pill ${currentStep === 4 ? 'active' : ''} ${beforeDream || afterWaking || userInterpretation ? 'completed' : ''}`}
            onClick={() => validateAndNext(4)}
          >
            <span className="step-num">4</span>
            <span className="step-title">Context & Privacy</span>
          </button>
        </div>

        {/* Quick Sample Presets Bar */}
        <div className="presets-box">
          <span className="presets-label">
            <Wand2 size={14} className="text-gold" />
            <span>Sample Dream Transcripts:</span>
          </span>
          <div className="presets-buttons">
            {PRESET_DREAMS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-btn"
                onClick={() => handleApplyPreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form className="dream-form guided-form" onSubmit={handleSubmit}>
        {errorMsg && (
          <div className="form-error-banner" role="alert">
            <Info size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: TELL US WHAT HAPPENED */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="guided-step-pane step-pane-1">
            <div className="pane-header">
              <div className="pane-step-counter">STEP 01 OF 04</div>
              <h2 className="pane-heading">Tell us what happened.</h2>
              <p className="pane-desc">
                Write freely. Describe what occurred, where you were, who was there, and the atmosphere of the dream.
              </p>
            </div>

            {/* Title (Optional) */}
            <div className="form-group">
              <label htmlFor="dream-title" className="form-label">
                Dream Title <span className="label-opt">(optional)</span>
              </label>
              <input
                id="dream-title"
                type="text"
                className="form-input"
                placeholder="e.g., The Midnight Train Across the Sunken City"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* Narrative Description (Required) */}
            <div className="form-group">
              <label htmlFor="dream-desc" className="form-label required">
                Dream Narrative <span className="label-req">*</span>
              </label>
              <textarea
                id="dream-desc"
                className="form-textarea large-narrative-area"
                rows={8}
                placeholder="Describe what occurred in your dream. What did you see, do, and feel? What was the atmosphere, lighting, or setting? You can be as brief or detailed as you like..."
                value={description}
                onChange={e => {
                  setDescription(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
              />
              <div className="textarea-footer">
                <span className="char-hint">
                  {description.length} characters {description.length >= 15 && '· Narrative ready'}
                </span>
                <span className="privacy-pill">
                  <Lock size={12} />
                  <span>Private by default · Processed locally</span>
                </span>
              </div>
            </div>

            <div className="guided-actions-bar">
              <div></div>
              <div className="action-buttons-group">
                {description.trim().length >= 15 && (
                  <button
                    type="button"
                    className="btn btn-secondary quick-submit-btn"
                    onClick={() => handleSubmit()}
                    disabled={isAnalyzing}
                  >
                    <span>Analyze Dream Now</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary next-step-btn"
                  onClick={() => validateAndNext(2)}
                >
                  <span>Continue: How Did It Feel?</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: HOW DID IT FEEL? */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="guided-step-pane step-pane-2">
            <div className="pane-header">
              <div className="pane-step-counter">STEP 02 OF 04</div>
              <h2 className="pane-heading">How did it feel?</h2>
              <p className="pane-desc">
                Select the feelings and emotional tones that best match the dream or the moment you woke up.
              </p>
            </div>

            {/* Emotion Chips Categorized */}
            <div className="emotion-categories-wrapper">
              {EMOTION_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="emotion-cat-group">
                  <span className="emotion-cat-title">{cat.category}</span>
                  <div className="chips-grid">
                    {cat.items.map(emo => {
                      const isSelected = emotions.includes(emo);
                      return (
                        <button
                          key={emo}
                          type="button"
                          className={`chip-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleEmotion(emo)}
                        >
                          {isSelected && <Check size={13} className="chip-check" />}
                          <span>{emo}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Emotion Input */}
            <div className="custom-tag-row">
              <span className="custom-tag-label">Add a specific feeling:</span>
              <div className="custom-input-wrap">
                <input
                  type="text"
                  className="form-input custom-tag-input"
                  placeholder="e.g., Weightless calm, Deja vu..."
                  value={customEmotion}
                  onChange={e => setCustomEmotion(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomEmotion(e);
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-add-tag"
                  onClick={addCustomEmotion}
                  aria-label="Add custom emotion"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="guided-actions-bar">
              <button
                type="button"
                className="btn btn-secondary back-step-btn"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft size={16} />
                <span>Back to Story</span>
              </button>
              <div className="action-buttons-group">
                <button
                  type="button"
                  className="btn btn-primary next-step-btn"
                  onClick={() => validateAndNext(3)}
                >
                  <span>Continue: Memorable Motifs</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: WHAT DO YOU REMEMBER MOST? */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="guided-step-pane step-pane-3">
            <div className="pane-header">
              <div className="pane-step-counter">STEP 03 OF 04</div>
              <h2 className="pane-heading">What do you remember most?</h2>
              <p className="pane-desc">
                Identify key elements, characters, settings, colors, and artifacts that stood out.
              </p>
            </div>

            {/* Key Symbols & Motifs */}
            <div className="form-group">
              <label className="form-label">
                Key Motifs & Archetypes <span className="label-opt">(tap to select)</span>
              </label>
              <div className="chips-grid">
                {SYMBOL_SUGGESTIONS.map(sym => {
                  const cleanSym = sym.toLowerCase().split(' ')[0];
                  const isSelected = symbols.includes(cleanSym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      className={`chip-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleSymbol(sym)}
                    >
                      {isSelected && <Check size={13} className="chip-check" />}
                      <span>{sym}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Symbol Input */}
              <div className="custom-input-wrap symbol-custom-wrap">
                <input
                  type="text"
                  className="form-input custom-tag-input"
                  placeholder="Add custom motif (e.g., clock, mask, telescope, key)..."
                  value={customSymbol}
                  onChange={e => setCustomSymbol(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSymbol(e);
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-add-tag"
                  onClick={addCustomSymbol}
                  aria-label="Add custom symbol"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Location & Characters Grid */}
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="dream-location" className="form-label">
                  <MapPin size={14} className="text-gold" />
                  <span>Setting or Environment <span className="label-opt">(optional)</span></span>
                </label>
                <input
                  id="dream-location"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Mountain observatory, underwater temple..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dream-people" className="form-label">
                  <Users size={14} className="text-gold" />
                  <span>People or Figures <span className="label-opt">(optional)</span></span>
                </label>
                <input
                  id="dream-people"
                  type="text"
                  className="form-input"
                  placeholder="e.g., A masked traveler, childhood mentor..."
                  value={importantPeople}
                  onChange={e => setImportantPeople(e.target.value)}
                />
              </div>
            </div>

            {/* Animals & Creatures */}
            <div className="form-group">
              <label htmlFor="dream-animals" className="form-label">
                Animals or Creatures <span className="label-opt">(optional)</span>
              </label>
              <input
                id="dream-animals"
                type="text"
                className="form-input"
                placeholder="e.g., Bioluminescent fish, soaring eagle, white wolf..."
                value={animals}
                onChange={e => setAnimals(e.target.value)}
              />
            </div>

            {/* Dominant Visual Tones & Colors */}
            <div className="form-group">
              <label className="form-label">
                <Palette size={14} className="text-gold" />
                <span>Dominant Lighting & Colors <span className="label-opt">(guides the artwork)</span></span>
              </label>
              <div className="color-palette-grid">
                {COLOR_SUGGESTIONS.map(col => {
                  const isSelected = colors.includes(col.label);
                  return (
                    <button
                      key={col.label}
                      type="button"
                      className={`color-pill-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleColor(col.label)}
                    >
                      <span
                        className="color-swatch-dot"
                        style={{ backgroundColor: col.code }}
                      ></span>
                      <span>{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="guided-actions-bar">
              <button
                type="button"
                className="btn btn-secondary back-step-btn"
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft size={16} />
                <span>Back to Emotions</span>
              </button>
              <div className="action-buttons-group">
                <button
                  type="button"
                  className="btn btn-primary next-step-btn"
                  onClick={() => validateAndNext(4)}
                >
                  <span>Continue: Context & Privacy</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: OPTIONAL DEEPER CONTEXT & PRIVACY */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="guided-step-pane step-pane-4">
            <div className="pane-header">
              <div className="pane-step-counter">STEP 04 OF 04</div>
              <h2 className="pane-heading">Optional Deeper Context & Privacy</h2>
              <p className="pane-desc">
                Providing waking life context helps Somnithos evaluate cognitive Continuity Hypotheses and memory consolidation.
              </p>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="before-dream" className="form-label">
                  What was on your mind before sleep? <span className="label-opt">(optional)</span>
                </label>
                <textarea
                  id="before-dream"
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g., Heavy project deadlines, reading ancient travelogues, difficult conversation..."
                  value={beforeDream}
                  onChange={e => setBeforeDream(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="after-waking" className="form-label">
                  How did you feel upon waking? <span className="label-opt">(optional)</span>
                </label>
                <textarea
                  id="after-waking"
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g., Surprisingly centered, lingering melancholy, sudden creative clarity..."
                  value={afterWaking}
                  onChange={e => setAfterWaking(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="user-interpretation" className="form-label">
                  Your Personal Intuition / Initial Thought <span className="label-opt">(optional)</span>
                </label>
                <input
                  id="user-interpretation"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Felt like a sign to let go of old commitments..."
                  value={userInterpretation}
                  onChange={e => setUserInterpretation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cultural-bg" className="form-label">
                  Cultural or Traditional Heritage <span className="label-opt">(optional)</span>
                </label>
                <input
                  id="cultural-bg"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Mediterranean, East Asian, Celtic, South Asian..."
                  value={culturalBackground}
                  onChange={e => setCulturalBackground(e.target.value)}
                />
              </div>
            </div>

            {/* Privacy Selection */}
            <div className="form-group privacy-selection-group">
              <label className="form-label">Sanctuary Privacy Setting</label>
              <div className="privacy-options-grid">
                <label className={`privacy-card ${privacy === 'private' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={privacy === 'private'}
                    onChange={() => setPrivacy('private')}
                  />
                  <div className="privacy-card-inner">
                    <div className="privacy-icon-box">
                      <Lock size={18} />
                    </div>
                    <div>
                      <div className="privacy-title">Strictly Private Sanctuary</div>
                      <div className="privacy-desc">
                        Saved only to your private browser storage. Never visible on the public community wall.
                      </div>
                    </div>
                  </div>
                </label>

                <label className={`privacy-card ${privacy === 'anonymous_public' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="privacy"
                    value="anonymous_public"
                    checked={privacy === 'anonymous_public'}
                    onChange={() => setPrivacy('anonymous_public')}
                  />
                  <div className="privacy-card-inner">
                    <div className="privacy-icon-box">
                      <Globe size={18} />
                    </div>
                    <div>
                      <div className="privacy-title">Anonymous Community Wall</div>
                      <div className="privacy-desc">
                        Share your dream reflection anonymously with fellow dreamers worldwide without identifiers.
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="guided-actions-bar">
              <button
                type="button"
                className="btn btn-secondary back-step-btn"
                onClick={() => setCurrentStep(3)}
              >
                <ArrowLeft size={16} />
                <span>Back to Motifs</span>
              </button>

              <button
                type="submit"
                className="btn btn-primary submit-final-btn"
                disabled={isAnalyzing}
              >
                <Sparkles size={18} />
                <span>{isAnalyzing ? 'Synthesizing Wisdom & Artwork...' : 'Synthesize Dream Wisdom & Art'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
