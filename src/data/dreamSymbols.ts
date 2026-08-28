import type { DreamSymbolItem } from '../types/dream';
import { CULTURAL_KNOWLEDGE_CLAIMS } from './culturalSources';
import { PSYCHOLOGY_KNOWLEDGE_CLAIMS } from './psychologySources';

/**
 * DREAM SYMBOLS CATALOG (Evidence-Grounded)
 * 
 * Rules:
 * 1. Do NOT state that a symbol has an absolute universal meaning.
 * 2. Connect symbols directly to documented cultural records and cognitive psychology models.
 * 3. Clearly articulate the uncertainties, cultural contingencies, and personal contexts.
 */

export const DREAM_SYMBOLS: DreamSymbolItem[] = [
  {
    id: 'sym-water',
    symbol: 'Water & Oceans',
    category: 'nature',
    summaryDescription: 'Water appears frequently across worldwide dream reports, ranging from tranquil lakes to surging ocean tides and torrential rain. Research in sleep psychology emphasizes how emotional arousal in REM states frequently evokes fluid and shifting sensory landscapes.',
    documentedCulturalInterpretations: CULTURAL_KNOWLEDGE_CLAIMS.filter(c => c.primarySubject === 'water'),
    psychologicalPerspectives: PSYCHOLOGY_KNOWLEDGE_CLAIMS.filter(p => p.id === 'psy-overnight-therapy-walker' || p.id === 'psy-activation-synthesis-hobson'),
    uncertaintiesAndContingencies: 'No psychological research supports a single universal meaning for water. In psychological content analyses (Domhoff, 1996), whether water evokes calm, danger, or rejuvenation depends entirely on the dreamer’s waking experiences with swimming, climate, and immediate affective state.',
    relatedSymbols: ['Ocean', 'Rain', 'River', 'Deep Well', 'Swimming']
  },
  {
    id: 'sym-flying',
    symbol: 'Flying & Levitation',
    category: 'movement',
    summaryDescription: 'Experiences of floating, gliding, or soaring through the air. Neurobiologically, dream flying often correlates with vestibular system activation during REM motor inhibition (muscle atonia).',
    documentedCulturalInterpretations: CULTURAL_KNOWLEDGE_CLAIMS.filter(c => c.primarySubject === 'flying'),
    psychologicalPerspectives: PSYCHOLOGY_KNOWLEDGE_CLAIMS.filter(p => p.id === 'psy-activation-synthesis-hobson'),
    uncertaintiesAndContingencies: 'Historical manuals like Artemidorus (c. 170 CE) treated flying with control as auspicious, while uncontrolled ascent was considered distressing. Modern cognitive science views flying as an internal synthesis of vestibular signals in the absence of gravitational feedback.',
    relatedSymbols: ['Falling', 'Sky', 'Wings', 'Heights', 'Clouds']
  },
  {
    id: 'sym-falling',
    symbol: 'Falling',
    category: 'movement',
    summaryDescription: 'The sudden sensation of plunging through space, frequently accompanied by hypnic jerks during sleep onset (Stage 1 NREM) or intense motor arousal during REM sleep.',
    documentedCulturalInterpretations: [],
    psychologicalPerspectives: PSYCHOLOGY_KNOWLEDGE_CLAIMS.filter(p => p.id === 'psy-tst-revonsuo'),
    uncertaintiesAndContingencies: 'While Threat Simulation Theory notes falling as one of the most common simulated ancestral hazards, hypnologists note it is frequently triggered by physiological muscle relaxation during transitional sleep stages.',
    relatedSymbols: ['Flying', 'Cliffs', 'Abyss', 'Gravity', 'Stairs']
  },
  {
    id: 'sym-snake',
    symbol: 'Snakes & Serpents',
    category: 'creatures',
    summaryDescription: 'Encountering serpents, reptiles, or coiling creatures. Evolutionary psychologists cite ophidiophobia and ancestral predator detection circuits in the human pulvinar and amygdala.',
    documentedCulturalInterpretations: CULTURAL_KNOWLEDGE_CLAIMS.filter(c => c.primarySubject === 'snake'),
    psychologicalPerspectives: PSYCHOLOGY_KNOWLEDGE_CLAIMS.filter(p => p.id === 'psy-tst-revonsuo'),
    uncertaintiesAndContingencies: 'Cultural associations with snakes vary drastically: ancient Mesopotamian tablets recorded catching a serpent as overcoming an adversary, while ancient Greek Asclepieion healing cults associated non-venomous snakes with sacred medical incubation.',
    relatedSymbols: ['Reptiles', 'Forest', 'Bite', 'Shadows', 'Predator']
  },
  {
    id: 'sym-teeth',
    symbol: 'Teeth Falling Out',
    category: 'body',
    summaryDescription: 'Dreams of loose, crumbling, or extracted teeth. Studies by Rozen & Soffer-Dudek (2018) in Frontiers in Psychology found a significant statistical correlation between teeth-falling dreams and physical dental tension (such as nocturnal bruxism and clenching) rather than purely symbolic loss.',
    documentedCulturalInterpretations: CULTURAL_KNOWLEDGE_CLAIMS.filter(c => c.primarySubject === 'teeth'),
    psychologicalPerspectives: PSYCHOLOGY_KNOWLEDGE_CLAIMS.filter(p => p.id === 'psy-continuity-domhoff'),
    uncertaintiesAndContingencies: 'While late imperial Chinese manuals interpreted teeth allegorically through family hierarchy, modern somatosensory dream research highlights tactile physiological feedback from the trigeminal nerve during nighttime jaw clenching.',
    relatedSymbols: ['Mouth', 'Body', 'Mirror', 'Bones', 'Speaking']
  },
  {
    id: 'sym-doors',
    symbol: 'Doors, Portals & Thresholds',
    category: 'places',
    summaryDescription: 'Encountering locked, hidden, or opening doors and ancient gateways. In cognitive schema models, doorways represent spatial transitions and episodic event boundaries.',
    documentedCulturalInterpretations: CULTURAL_KNOWLEDGE_CLAIMS.filter(c => c.primarySubject === 'doors'),
    psychologicalPerspectives: PSYCHOLOGY_KNOWLEDGE_CLAIMS.filter(p => p.id === 'psy-memory-consolidation-stickgold'),
    uncertaintiesAndContingencies: 'In Homeric literature, gates functioned as an allegory for epistemic certainty (the gates of Horn and Ivory), while cognitive science studies the "doorway effect" in memory retrieval.',
    relatedSymbols: ['Houses', 'Keys', 'Corridors', 'Gates', 'Windows']
  },
  {
    id: 'sym-fire',
    symbol: 'Fire & Flame',
    category: 'nature',
    summaryDescription: 'Flames, hearths, wildfires, or burning beacons. Fire evokes both vital illumination and primal survival alerts.',
    documentedCulturalInterpretations: CULTURAL_KNOWLEDGE_CLAIMS.filter(c => c.primarySubject === 'fire'),
    psychologicalPerspectives: PSYCHOLOGY_KNOWLEDGE_CLAIMS.filter(p => p.id === 'psy-tst-revonsuo'),
    uncertaintiesAndContingencies: 'In Roman agrarian divination, bounded fire signified soil preparation whereas boundary-crossing fire indicated legal conflict. Symbol meanings depend heavily on whether the fire is contained or destructive.',
    relatedSymbols: ['Light', 'Ash', 'Sun', 'Forest', 'Warmth']
  },
  {
    id: 'sym-bridge',
    symbol: 'Bridges & Crossings',
    category: 'places',
    summaryDescription: 'Crossing bridges over rivers, mists, or chasms. Metaphorically and cognitively, bridges represent transitional life stages, navigational milestones, and psychological thresholds.',
    documentedCulturalInterpretations: CULTURAL_KNOWLEDGE_CLAIMS.filter(c => c.primarySubject === 'bridge'),
    psychologicalPerspectives: PSYCHOLOGY_KNOWLEDGE_CLAIMS.filter(p => p.id === 'psy-continuity-domhoff'),
    uncertaintiesAndContingencies: 'In classical Japanese diary literature (Sarashina Nikki), bridges represented spiritual pilgrimage passages, while cognitive models analyze bridge dreams as representations of waking decision points.',
    relatedSymbols: ['Rivers', 'Paths', 'Doors', 'Pilgrimage', 'Crossing']
  },
  {
    id: 'sym-house',
    symbol: 'Houses & Unexplored Rooms',
    category: 'places',
    summaryDescription: 'Discovering unfamiliar rooms, sprawling mansions, or childhood homes. Cognitive psychologists view the dream house as a spatial memory scaffold mapping autobiographical knowledge networks.',
    documentedCulturalInterpretations: CULTURAL_KNOWLEDGE_CLAIMS.filter(c => c.primarySubject === 'house'),
    psychologicalPerspectives: PSYCHOLOGY_KNOWLEDGE_CLAIMS.filter(p => p.id === 'psy-memory-consolidation-stickgold'),
    uncertaintiesAndContingencies: 'In classical Abbasid oneirology, a solid house symbolized inner security; in modern cognitive science, navigating complex houses reflects hippocampal spatial memory reactivation.',
    relatedSymbols: ['Doors', 'Attic', 'Basement', 'Rooms', 'Corridors']
  }
];
