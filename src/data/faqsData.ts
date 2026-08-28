import type { FAQItem } from '../types/dream';

export const FAQ_ITEMS: FAQItem[] = [
  // Category: sleep_science
  {
    id: 'faq-why-dream',
    category: 'sleep_science',
    question: 'Why do we dream from a neuroscientific perspective?',
    answerMarkdown: `Modern neuroscience indicates that dreaming is not a single isolated event, but a multifaceted biological process occurring primarily during **Rapid Eye Movement (REM)** sleep and transitional **NREM** stages.

Key neurobiological functions identified in peer-reviewed research include:
1. **Memory Reorganization & Consolidation**: Reactivating recent hippocampal traces to integrate them into long-term neocortical networks (*Stickgold et al., 2001, Science*).
2. **Affective Depressurization**: Processing neurochemically charged emotional memories while stress neurochemicals (such as noradrenaline) are temporarily suppressed (*Walker & van der Helm, 2009, Psychological Bulletin*).
3. **Internal Neural Synthesis**: The forebrain weaving narratives to contextualize intrinsic brainstem activations (*Hobson & McCarley, 1977*).

Dreaming is an emergent feature of how the resting human brain organizes information and regulates emotional equilibrium.`,
    evidenceStatus: 'HIGH'
  },
  {
    id: 'faq-forget-dreams',
    category: 'sleep_science',
    question: 'Why do we forget most of our dreams immediately upon waking?',
    answerMarkdown: `Dream amnesia is primarily driven by neurochemistry. During REM sleep:
* **Neurotransmitter shifts**: Levels of **acetylcholine** are elevated while **norepinephrine** and **serotonin** drop drastically in the prefrontal cortex, impairing the encoding machinery needed to transfer working memory to long-term storage (*Hobson, 2002*).
* **Delayed hippocampal waking**: Brain imaging shows that the hippocampus does not instantaneously synchronize into waking encoding mode upon arousal. Unless awakened directly from a vivid REM cycle or deliberately rehearsed immediately upon opening the eyes, the transient neural traces dissipate rapidly.`,
    evidenceStatus: 'HIGH'
  },
  {
    id: 'faq-nightmares',
    category: 'sleep_science',
    question: 'Why do nightmares and intense stress dreams happen?',
    answerMarkdown: `Nightmares and anxiety dreams frequently emerge from a convergence of physiological arousal and cognitive stress processing:
* **Threat Simulation**: Cognitive scientist Antti Revonsuo (*2000, Behavioral and Brain Sciences*) proposed that nightmares are ancient evolutionary simulations designed to rehearse threat perception and motor avoidance.
* **Daytime Emotional Load**: Heightened waking cortisol and sympathetic arousal lower the threshold for high-intensity amygdala activation during REM sleep, populating dreams with survival themes like falling, being pursued, or physical vulnerability.`,
    evidenceStatus: 'MODERATE'
  },

  // Category: psychology
  {
    id: 'faq-stress-affect-dreams',
    category: 'psychology',
    question: 'Can daytime stress and emotions alter dream content?',
    answerMarkdown: `Yes. Empirical content analyses using the standardized **Hall-Van de Castle coding system** demonstrate the **Continuity Hypothesis** (*Domhoff, 1996*): dream scenarios strongly reflect the waking concerns, emotional struggles, and interpersonal relationships of the dreamer.

When waking stress escalates, dreams frequently reflect this not in a 1-to-1 documentary fashion, but through metaphoric emotional hyperbole—such as navigating collapsing structures, arriving unprepared for examinations, or confronting natural tempests.`,
    evidenceStatus: 'HIGH'
  },
  {
    id: 'faq-people-long-ago',
    category: 'psychology',
    question: 'Why do people from years ago suddenly appear in dreams?',
    answerMarkdown: `Cognitive memory consolidation does not store memories in rigid chronological folders. Instead, memories are organized in **associative semantic networks**.

When your brain processes a current emotional state (e.g., nostalgia, hesitation, feelings of competition, or unresolved conflict), it activates connected emotional nodes across your entire autobiographical memory network (*Stickgold, 2001*). An old acquaintance or childhood friend associated with that specific feeling may be woven into the dream narrative as a psychological stand-in.`,
    evidenceStatus: 'MODERATE'
  },

  // Category: culture_history
  {
    id: 'faq-ancient-dream-methods',
    category: 'culture_history',
    question: 'How did ancient civilizations record and interpret dreams?',
    answerMarkdown: `Ancient dream interpretation varied significantly across specific civilizations and eras:
* **Ramesside Egypt (c. 1275 BCE)**: Scribes compiled hieratic catalogs such as *Papyrus Chester Beatty III (BM EA 10683)*, listing dualistic "good" and "bad" omens based on phonetic puns and symbolic associations.
* **Classical Greece & Rome (c. 2nd Century CE)**: Artemidorus of Daldis compiled the *Oneirocritica*, rejecting rigid universal keys and insisting that dream meaning depended strictly on the dreamer's social status, occupation, physical health, and local customs.
* **Ancient Mesopotamia (c. 7th Century BCE)**: Assyro-Babylonian scribes documented dream omens in the *Iškar Zaqīqu* series, treating dreams as divine communications that occasionally required ritual mitigation (*Namburbi*).`,
    evidenceStatus: 'HISTORICAL'
  },
  {
    id: 'faq-religious-dream-distinctions',
    category: 'culture_history',
    question: 'How should religious dream traditions be studied without generalizations?',
    answerMarkdown: `Academic methodology requires distinguishing between:
1. **Primary Religious Texts** (e.g., biblical prophetic dreams or Vedic Upanishadic dialogues on consciousness).
2. **Scholarly Commentaries** (e.g., the Talmudic Tractate *Berakhot 55a–57b*, which formulated that *"a dream follows the mouth of the interpreter"*).
3. **Vernacular Folk Beliefs** (e.g., late imperial Chinese popular almanacs like *Zhougong Jiemeng*).
4. **Modern Reinterpretations**.

Treating an entire religion or continent as having a single uniform dream belief is historically inaccurate and culturally reductive.`,
    evidenceStatus: 'HISTORICAL'
  },

  // Category: mythology_folklore
  {
    id: 'faq-snake-folklore',
    category: 'mythology_folklore',
    question: 'Why do snake interpretations differ so widely across cultures?',
    answerMarkdown: `Snakes invoke intense human evolutionary salience (*Isbell, 2006, Snake Detection Theory*), but their cultural meanings are deeply contingent on local ecology and spiritual systems:
* In **Mesopotamian divinatory tablets (*Iškar Zaqīqu*)**, seizing a snake indicated protective power over an adversary.
* In **Ancient Greek Asclepieion sanctuaries**, the non-venomous Aesculapian snake was venerated as a sacred agent of physical healing during temple sleep incubation (*enkoimesis*).
* In **Mesoamerican traditions**, the feathered serpent represented cosmic renewal and fertility.

There is no single "universal" mystical meaning for snakes in dreams.`,
    evidenceStatus: 'HISTORICAL'
  },

  // Category: evidence_methodology
  {
    id: 'faq-evidence-methodology',
    category: 'evidence_methodology',
    question: 'How does Somnithos decide whether a claim is reliable evidence?',
    answerMarkdown: `Somnithos operates on a strict **Evidence vs. Imagination separation**:
* **Evidence Layer**: Every factual, historical, or scientific claim must be tied to a documented primary source, peer-reviewed journal, museum accession number, or critical academic translation.
* **No Speculative Hallucinations**: If a dream motif lacks verified academic or historical documentation, Somnithos explicitly states *"No reliable source found."* rather than generating fictional folklore.
* **Clear Creative Labeling**: Personal interpretations, original reflections, and artistic visualizations are always explicitly labeled as creative AI outputs and never presented as historical or scientific fact.`,
    evidenceStatus: 'HIGH'
  },
  {
    id: 'faq-evidence-levels',
    category: 'evidence_methodology',
    question: 'What do the Evidence Status badges (HIGH, MODERATE, HISTORICAL, TRADITIONAL) mean?',
    answerMarkdown: `To ensure transparent epistemology, every factual card displays a standardized badge:
* **HIGH**: Strongly established through peer-reviewed empirical scientific studies, replication, or undisputed primary manuscript provenance.
* **MODERATE**: Peer-reviewed theoretical models or empirical findings with documented boundaries and debated scopes.
* **HISTORICAL**: Documented beliefs, rituals, or texts from a specific historical period (e.g., 2nd-century Roman oneiromancy). This verifies that the historical claim was genuinely written, but does *not* mean the ancient omen is a scientific fact.
* **TRADITIONAL**: Cultural, folkloric, or religious traditions documented in vernacular texts.
* **UNCERTAIN**: Insufficient archival documentation or contested scholarly attribution.`,
    evidenceStatus: 'HIGH'
  }
];
