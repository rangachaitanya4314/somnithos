import type { DreamInput } from '../../domain/dream/DreamInput';
import { normalizeDreamInput } from '../../domain/dream/DreamInput';
import type { DreamFeatures } from '../../domain/dream/DreamFeatures';
import type { EvidenceRecordMatch } from '../../domain/evidence/EvidenceRecord';
import type { ResearchRecordMatch } from '../../domain/research/ResearchRecord';
import type { PersonalReflection } from '../../domain/analysis/PersonalReflection';
import type { CreativeReflection } from '../../domain/analysis/CreativeReflection';
import type { ArtworkPrompt } from '../../domain/analysis/ArtworkPrompt';
import type { ClosingThought } from '../../domain/analysis/ClosingThought';
import type { DreamAnalysisResult } from '../../domain/analysis/DreamAnalysisResult';
import type { DreamAnalysisProvider } from '../../domain/analysis/DreamAnalysisProvider';
import type { EvidenceRepository } from '../../domain/evidence/EvidenceRepository';
import type { ResearchRepository } from '../../domain/research/ResearchRepository';
import { MockEvidenceRepository } from './MockEvidenceRepository';
import { MockResearchRepository } from './MockResearchRepository';
import { DreamArtGenerator } from '../dreamArtGenerator';
import { SourceVerificationService } from '../sourceVerification';

/**
 * Deterministic Mock Dream Analysis Provider.
 * Implements DreamAnalysisProvider and serves as the architectural blueprint
 * for future providers (e.g. GeminiDreamAnalysisProvider).
 */

import { EvidenceRetrieverService } from '../evidence/EvidenceRetrieverService';

export class MockDreamAnalysisProvider implements DreamAnalysisProvider {
  private evidenceRepo: EvidenceRepository;
  private researchRepo: ResearchRepository;
  private evidenceRetriever: EvidenceRetrieverService;

  constructor(
    evidenceRepo: EvidenceRepository = new MockEvidenceRepository(),
    researchRepo: ResearchRepository = new MockResearchRepository(),
    evidenceRetriever: EvidenceRetrieverService = new EvidenceRetrieverService()
  ) {
    this.evidenceRepo = evidenceRepo;
    this.researchRepo = researchRepo;
    this.evidenceRetriever = evidenceRetriever;
  }

  /**
   * 1. DREAM EXTRACTION LAYER
   */
  public extractDreamFeatures(rawInput: DreamInput): DreamFeatures {
    const input = normalizeDreamInput(rawInput);
    const text = (input.narrative + ' ' + (input.title || '')).toLowerCase();

    // Dictionaries for semantic extraction
    const motifDictionary: Record<string, string[]> = {
      water: ['water', 'ocean', 'sea', 'lake', 'river', 'rain', 'swimming', 'tide', 'wave', 'drowning', 'well', 'flood', 'flooded', 'underwater', 'submerged'],
      flying: ['flying', 'fly', 'flight', 'floating', 'soaring', 'levitating', 'wings', 'gliding', 'air'],
      falling: ['falling', 'fall', 'plunging', 'cliff', 'drop', 'abyss', 'dropping', 'tripping'],
      snake: ['snake', 'serpent', 'viper', 'python', 'cobra', 'reptile', 'creeping'],
      teeth: ['teeth', 'tooth', 'loose teeth', 'crumbling teeth', 'dentist', 'mouth', 'jaw', 'chewing'],
      doors: ['door', 'doors', 'portal', 'gate', 'threshold', 'entrance', 'hallway', 'passage', 'corridor', 'key', 'lock', 'wooden door'],
      fire: ['fire', 'flame', 'burning', 'blaze', 'bonfire', 'wildfire', 'smoke', 'embers', 'candle'],
      forest: ['forest', 'woods', 'trees', 'jungle', 'grove', 'leaves', 'wilderness', 'pine', 'oak'],
      house: ['house', 'mansion', 'room', 'attic', 'basement', 'building', 'home', 'corridor'],
      animals: ['animal', 'dog', 'wolf', 'cat', 'lion', 'bird', 'birds', 'eagle', 'horse', 'bear', 'creature', 'fish', 'whale', 'shark'],
      chased: ['chased', 'running away', 'pursued', 'stalked', 'monster', 'hunter', 'trapped', 'escaping'],
      bridge: ['bridge', 'crossing', 'archway', 'viaduct'],
      time: ['clock', 'time', 'hourglass', 'pendulum', 'watch', 'numberless'],
      searching: ['searching', 'looking for', 'lost', "couldn't find", 'find', 'seeking', 'wandering'],
      family: ['family', 'mother', 'father', 'sister', 'brother', 'child', 'parents', 'relatives']
    };

    const emotionDictionary: Record<string, string[]> = {
      fear: ['afraid', 'terror', 'scared', 'dread', 'anxiety', 'panic', 'nervous', 'frightened', 'fear'],
      peace: ['calm', 'serene', 'peaceful', 'tranquil', 'quiet', 'still', 'relieved', 'peace', 'relief'],
      wonder: ['awe', 'amazed', 'mysterious', 'curious', 'surreal', 'fascinated', 'spellbound', 'lucid', 'wonder'],
      confusion: ['lost', 'confused', 'disoriented', 'bewildered', 'wandering', 'puzzled', 'uncertainty'],
      joy: ['happy', 'elated', 'laughing', 'celebrating', 'lighthearted', 'euphoric', 'joy'],
      grief: ['sad', 'crying', 'sorrow', 'mourning', 'heartbroken', 'lonely', 'longing']
    };

    const locationDictionary: Record<string, string[]> = {
      ocean: ['ocean', 'sea', 'coast', 'beach', 'shore', 'island', 'underwater', 'submerged', 'marine'],
      forest: ['forest', 'woods', 'wilderness', 'grove', 'clearing'],
      sky: ['sky', 'clouds', 'space', 'stars', 'moon', 'atmosphere'],
      city: ['city', 'street', 'alley', 'skyscrapers', 'highway', 'traffic', 'urban', 'station', 'subway', 'building'],
      ancient_ruins: ['ruins', 'temple', 'castle', 'cathedral', 'monument', 'tomb', 'sanctuary'],
      home: ['home', 'bedroom', 'kitchen', 'stairs', 'hallway']
    };

    const colorDictionary = [
      'blue', 'azure', 'red', 'crimson', 'gold', 'golden', 'black', 'dark',
      'white', 'silver', 'green', 'emerald', 'purple', 'violet', 'grey', 'yellow', 'cyan', 'rose', 'neon'
    ];

    const socialKeywords = ['family', 'mother', 'father', 'friend', 'friends', 'stranger', 'crowd', 'passengers', 'people', 'child'];
    const movementKeywords = ['flying', 'falling', 'running', 'walking', 'swimming', 'climbing', 'soaring', 'plunging', 'floating', 'riding', 'gliding'];
    const unusualEventKeywords = ['flying without wings', 'underwater train', 'floating clock', 'talking beast', 'numberless clock', 'shapeshifting', 'submarine in space'];

    const detectedSymbols = new Set<string>(input.symbolsAndObjects || []);
    const detectedEmotions = new Set<string>(input.emotions || []);
    const detectedColors = new Set<string>(input.colors || []);
    const detectedLocations = new Set<string>();
    const detectedThemes = new Set<string>();
    const socialElements = new Set<string>();
    const movementPatterns = new Set<string>(input.movement || []);
    const sensoryImagery = new Set<string>(input.sensoryDetails || []);
    const unusualEvents = new Set<string>();
    const motifsWhyNoticed: Record<string, string> = {};

    const matchKeyword = (kw: string) => {
      const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      return new RegExp(`(?:^|\\W)${escaped}(?:\\W|$)`, 'i').test(text);
    };

    // Scan for motifs
    for (const [category, keywords] of Object.entries(motifDictionary)) {
      const matched = keywords.filter(kw => matchKeyword(kw));
      if (matched.length > 0) {
        detectedSymbols.add(category);
        detectedThemes.add(category);
        motifsWhyNoticed[category] = `Observed in narrative via mention of "${matched.join('", "')}".`;
      }
    }

    // Add user provided symbols
    (input.symbolsAndObjects || []).forEach(sym => {
      detectedSymbols.add(sym);
      if (!motifsWhyNoticed[sym]) {
        motifsWhyNoticed[sym] = 'Explicitly provided in user dream motifs selection.';
      }
    });

    // Scan for emotions
    for (const [emotion, keywords] of Object.entries(emotionDictionary)) {
      if (keywords.some(kw => matchKeyword(kw))) {
        detectedEmotions.add(emotion);
      }
    }

    // Scan for colors
    for (const color of colorDictionary) {
      if (matchKeyword(color)) {
        detectedColors.add(color);
      }
    }

    // Scan for locations
    if (input.setting) {
      detectedLocations.add(input.setting);
    }
    for (const [loc, keywords] of Object.entries(locationDictionary)) {
      if (keywords.some(kw => matchKeyword(kw))) {
        detectedLocations.add(loc);
      }
    }

    // Scan for social elements
    if (input.people) {
      socialElements.add(input.people);
    }
    for (const soc of socialKeywords) {
      if (matchKeyword(soc)) {
        socialElements.add(soc);
      }
    }

    // Scan for movement
    for (const mov of movementKeywords) {
      if (matchKeyword(mov)) {
        movementPatterns.add(mov);
      }
    }

    // Scan for unusual events
    for (const un of unusualEventKeywords) {
      if (matchKeyword(un)) {
        unusualEvents.add(un);
      }
    }
    if (detectedSymbols.has('flying') && !text.includes('airplane')) {
      unusualEvents.add('Unassisted flight / levitation');
    }

    // =========================================================================
    // REDESIGNED NARRATIVE EXTRACTION: Meaningful Highlights & Emotional Journey
    // =========================================================================
    const meaningfulHighlights: { emoji: string; text: string }[] = [];
    let emotionalJourney = '';
    const lang = input.language || input.targetLanguage || 'en';

    // ----------------------------------------------------
    // MULTILINGUAL HIGHLIGHTS & EMOTIONAL JOURNEY SYNTHESIS
    // ----------------------------------------------------
    if (lang === 'te') {
      // Telugu Synthesis
      if (text.includes('forest') || text.includes('అడవి') || text.includes('చెట్లు')) {
        meaningfulHighlights.push({ emoji: '🌲', text: 'చీకటి అడవిలో నడక' });
        if (text.includes('scared') || text.includes('భయం') || text.includes('fear')) {
          meaningfulHighlights.push({ emoji: '😟', text: 'మొదట కలిగిన భయం' });
        }
        if (text.includes('light') || text.includes('కాంతి') || text.includes('వెలుగు')) {
          meaningfulHighlights.push({ emoji: '💡', text: 'దూరంలో కనిపించిన వెచ్చని కాంతి' });
        }
        if (text.includes('calm') || text.includes('peace') || text.includes('ప్రశాంత')) {
          meaningfulHighlights.push({ emoji: '😌', text: 'చివరకు కలిగిన ప్రశాంతత' });
        }
        emotionalJourney = 'భయం → వెచ్చని కాంతి → ప్రశాంతత';
      } else if (text.includes('train') || text.includes('ocean') || text.includes('రైలు') || text.includes('సముద్రం') || text.includes('చేప')) {
        meaningfulHighlights.push({ emoji: '🚂', text: 'సముద్రం అడుగున ప్రయాణించే ఊదా రంగు రైలు' });
        meaningfulHighlights.push({ emoji: '🐟', text: 'కిటికీల బయట ఈదుతున్న పెద్ద నీలిరంగు చేపలు' });
        meaningfulHighlights.push({ emoji: '🤫', text: 'చుట్టూ ఉన్న వ్యక్తుల ప్రశాంతమైన నిశ్శబ్దం' });
        emotionalJourney = 'ఆశ్చర్యం → నిశ్శబ్ద ప్రశాంతత';
      } else if (text.includes('school') || text.includes('పాఠశాల') || text.includes('స్నేహితు')) {
        meaningfulHighlights.push({ emoji: '🏫', text: 'పాత పాఠశాలలో ఉండటం' });
        meaningfulHighlights.push({ emoji: '🔍', text: 'తరగతి గది కోసం వెతకడం' });
        meaningfulHighlights.push({ emoji: '😟', text: 'కలిగిన చిన్నపాటి ఆందోళన' });
        meaningfulHighlights.push({ emoji: '🤝', text: 'బయట వేచి ఉన్న ప్రాణస్నేహితుడు' });
        emotionalJourney = 'ఆందోళన → సాంత్వన';
      } else {
        meaningfulHighlights.push({ emoji: '🌌', text: 'మీ కలలో కనిపించిన ముఖ్యమైన దృశ్యం' });
        meaningfulHighlights.push({ emoji: '💭', text: 'కలలో కలిగిన భావాల మార్పు' });
        meaningfulHighlights.push({ emoji: '🕊️', text: 'ప్రశాంతమైన ఆలోచన' });
        emotionalJourney = 'పరిశీలన → ప్రశాంతత';
      }
    } else if (lang === 'ta') {
      // Tamil Synthesis
      if (text.includes('forest') || text.includes('காடு') || text.includes('மரம்')) {
        meaningfulHighlights.push({ emoji: '🌲', text: 'இருண்ட காட்டில் நடைபயணம்' });
        if (text.includes('scared') || text.includes('பயம்') || text.includes('fear')) {
          meaningfulHighlights.push({ emoji: '😟', text: 'முதலில் தோன்றிய பயம்' });
        }
        if (text.includes('light') || text.includes('ஒளி') || text.includes('வெளிச்சம்')) {
          meaningfulHighlights.push({ emoji: '💡', text: 'தூரத்தில் தெரிந்த இதமான ஒளி' });
        }
        if (text.includes('calm') || text.includes('peace') || text.includes('அமைதி')) {
          meaningfulHighlights.push({ emoji: '😌', text: 'இறுதியில் ஏற்பட்ட அமைதி' });
        }
        emotionalJourney = 'பயம் → இதமான ஒளி → அமைதி';
      } else if (text.includes('train') || text.includes('ocean') || text.includes('ரயில்') || text.includes('கடல்') || text.includes('மீன்')) {
        meaningfulHighlights.push({ emoji: '🚂', text: 'கடலுக்கு அடியில் நகரும் ஊதா நிற ரயில்' });
        meaningfulHighlights.push({ emoji: '🐟', text: 'ஜன்னல்களுக்கு வெளியே நீந்திய பெரிய நீல மீன்கள்' });
        meaningfulHighlights.push({ emoji: '🤫', text: 'பயணிகளின் அமைதியான சூழல்' });
        emotionalJourney = 'வியப்பு → அமைதியான சூழல்';
      } else if (text.includes('school') || text.includes('பள்ளி') || text.includes('நண்பர்')) {
        meaningfulHighlights.push({ emoji: '🏫', text: 'பழைய பள்ளியில் இருப்பது' });
        meaningfulHighlights.push({ emoji: '🔍', text: 'வகுப்பறையைத் தேடியது' });
        meaningfulHighlights.push({ emoji: '😟', text: 'தோன்றிய சிறிய பதற்றம்' });
        meaningfulHighlights.push({ emoji: '🤝', text: 'வெளியே காத்திருந்த சிறந்த நண்பர்' });
        emotionalJourney = 'பதற்றம் → மன அமைதி';
      } else {
        meaningfulHighlights.push({ emoji: '🌌', text: 'கனவில் தென்பட்ட முக்கியமான சூழல்' });
        meaningfulHighlights.push({ emoji: '💭', text: 'கனவில் ஏற்பட்ட உணர்வு மாற்றம்' });
        meaningfulHighlights.push({ emoji: '🕊️', text: 'அமைதியான சிந்தனை' });
        emotionalJourney = 'கவனிப்பு → அமைதி';
      }
    } else if (lang === 'hi') {
      // Hindi Synthesis
      if (text.includes('forest') || text.includes('जंगल') || text.includes('पेड़')) {
        meaningfulHighlights.push({ emoji: '🌲', text: 'रात में अंधेरे जंगल में चलना' });
        if (text.includes('scared') || text.includes('डर') || text.includes('fear')) {
          meaningfulHighlights.push({ emoji: '😟', text: 'शुरुआत में लगा डर' });
        }
        if (text.includes('light') || text.includes('रोशनी') || text.includes('प्रकाश')) {
          meaningfulHighlights.push({ emoji: '💡', text: 'दूर से दिखी हल्की रोशनी' });
        }
        if (text.includes('calm') || text.includes('peace') || text.includes('सुकून') || text.includes('शांति')) {
          meaningfulHighlights.push({ emoji: '😌', text: 'बाद में महसूस हुआ सुकून' });
        }
        emotionalJourney = 'डर → हल्की रोशनी → सुकून';
      } else if (text.includes('train') || text.includes('ocean') || text.includes('ट्रेन') || text.includes('समुद्र') || text.includes('मछली')) {
        meaningfulHighlights.push({ emoji: '🚂', text: 'समुद्र के नीचे चलती बैंगनी ट्रेन' });
        meaningfulHighlights.push({ emoji: '🐟', text: 'खिड़कियों के बाहर तैरती बड़ी नीली मछलियां' });
        meaningfulHighlights.push({ emoji: '🤫', text: 'साथ मौजूद लोगों का शांत माहौल' });
        emotionalJourney = 'विस्मय → शांत वातावरण';
      } else if (text.includes('school') || text.includes('स्कूल') || text.includes('दोस्त')) {
        meaningfulHighlights.push({ emoji: '🏫', text: 'पुराने स्कूल में होना' });
        meaningfulHighlights.push({ emoji: '🔍', text: 'क्लासरूम की तलाश' });
        meaningfulHighlights.push({ emoji: '😟', text: 'थोड़ी घबराहट महसूस होना' });
        meaningfulHighlights.push({ emoji: '🤝', text: 'बाहर इंतज़ार करता पक्का दोस्त' });
        emotionalJourney = 'घबराहट → राहत';
      } else {
        meaningfulHighlights.push({ emoji: '🌌', text: 'सपने का खास परिवेश' });
        meaningfulHighlights.push({ emoji: '💭', text: 'भावनाओं में आया बदलाव' });
        meaningfulHighlights.push({ emoji: '🕊️', text: 'शांत अवलोकन' });
        emotionalJourney = 'अवलोकन → शांति';
      }
    } else {
      // English Synthesis
      if (text.includes('forest') || text.includes('wood') || text.includes('dark')) {
        meaningfulHighlights.push({ emoji: '🌲', text: 'Dark forest at night' });
        if (text.includes('scared') || text.includes('fear') || text.includes('afraid')) {
          meaningfulHighlights.push({ emoji: '😟', text: 'Felt scared at first' });
        }
        if (text.includes('warm light') || text.includes('light') || text.includes('lantern')) {
          meaningfulHighlights.push({ emoji: '💡', text: 'Saw a warm light in the distance' });
        }
        if (text.includes('calm') || text.includes('peace') || text.includes('relief')) {
          meaningfulHighlights.push({ emoji: '😌', text: 'Felt calm afterward' });
        }
        emotionalJourney = 'Fear → Warm Light → Calm';
      } else if (text.includes('train') || text.includes('purple train') || text.includes('ocean')) {
        meaningfulHighlights.push({ emoji: '🚂', text: 'Inside a purple train moving under the ocean' });
        if (text.includes('fish') || text.includes('blue fish')) {
          meaningfulHighlights.push({ emoji: '🐟', text: 'Huge blue fish swimming outside windows' });
        }
        if (text.includes('silent') || text.includes('quiet') || text.includes('passenger')) {
          meaningfulHighlights.push({ emoji: '🤫', text: 'Everyone around was silent and calm' });
        }
        emotionalJourney = 'Surreal wonder → Quiet stillness';
      } else if (text.includes('school') || text.includes('classroom') || text.includes('exam')) {
        meaningfulHighlights.push({ emoji: '🏫', text: 'Standing in your old school' });
        meaningfulHighlights.push({ emoji: '🔍', text: 'Could not find your classroom' });
        meaningfulHighlights.push({ emoji: '😟', text: 'Felt nervous' });
        meaningfulHighlights.push({ emoji: '🤝', text: 'Found your best friend waiting outside' });
        emotionalJourney = 'Nervousness → Relief';
      } else {
        const loc = Array.from(detectedLocations)[0] || 'distinct setting';
        meaningfulHighlights.push({ emoji: '🌌', text: `Scene set in a ${loc.replace('_', ' ')}` });
        meaningfulHighlights.push({ emoji: '🧭', text: 'Key elements interacting in your dream' });
        meaningfulHighlights.push({ emoji: '💭', text: 'A thoughtful emotional progression' });
        emotionalJourney = 'Observation → Quiet Awareness';
      }
    }

    // ----------------------------------------------------
    // MULTILINGUAL 3-4 SHORT LINE REFLECTION SYNTHESIS
    // ----------------------------------------------------
    let simpleReflection = '';
    if (lang === 'te') {
      if (text.includes('forest') || text.includes('అడవి') || text.includes('భయం') || emotionalJourney.includes('భయం')) {
        simpleReflection = 'ఒక ఆలోచన ఏమిటంటే, మీరు నిజ జీవితంలో ఏదైనా అనిశ్చిత పరిస్థితిని ఎదుర్కొంటుండవచ్చు.\nమీకు సరైన మార్గం లేదా భరోసా ఇచ్చే విషయం కోసం చూస్తుండవచ్చు.\nపరిస్థితులు మొదట్లో కష్టంగా అనిపించినా, పరిష్కారం దొరుకుతుందనే భరోసాను ఇది సూచించవచ్చు.\nమీ దైనందిన జీవితంలో మీకు అలాంటి ప్రశాంతతను ఇచ్చే విషయం ఏమిటో మీరు ఆలోచించవచ్చు.';
      } else if (text.includes('school') || text.includes('పాఠశాల') || text.includes('స్నేహితు')) {
        simpleReflection = 'ఒక ఆలోచన ఏమిటంటే, మీరు పాత బాధ్యతలు లేదా అంచనాల గురించి ఆలోచిస్తుండవచ్చు.\nరాబోయే సవాళ్లకు మీరు సిద్ధంగా ఉన్నారా అని ఆలోచిస్తుండవచ్చు.\nమీ సన్నిహిత స్నేహితులు మీకు ఎంతటి సాంత్వన మరియు స్థిరత్వాన్ని ఇస్తారో ఇది సూచించవచ్చు.\nప్రతి ఒత్తిడిని మీరే ఒక్కరే మోయాల్సిన అవసరం లేదని మీరు గుర్తుంచుకోవచ్చు.';
      } else if (text.includes('train') || text.includes('రైలు') || text.includes('సముద్రం')) {
        simpleReflection = 'ఒక ఆలోచన ఏమిటంటే, మీరు మీ జీవితంలో ఒక వ్యక్తిగత మార్పును అనుభవిస్తుండవచ్చు.\nలోతైన భావాలను తొందరపడకుండా ప్రశాంతంగా పరిశీలిస్తుండవచ్చు.\nఆలోచించుకోవడానికి ఒక ప్రశాంతమైన ఏకాంత స్థలం కావాలనే కోరికను ఇది సూచించవచ్చు.\nజీవిత ప్రయాణాన్ని ప్రశాంతంగా సాగనివ్వడానికి మీకు మీరు సమయం ఇచ్చుకోవచ్చు.';
      } else {
        simpleReflection = 'ఒక ఆలోచన ఏమిటంటే, మీ మనస్సు రోజువారీ అనుభవాలను మరియు భావాలను సర్దుబాటు చేస్తుండవచ్చు.\nకొత్త మార్పులను ఎదుర్కొంటూనే మీ మనస్సుకు సాంత్వన చేకూర్చే అంశాలను ఇది వెతుకుతుండవచ్చు.\nజీవితంలో స్థిరత్వాన్ని మరియు స్పష్టతను కనుగొనే ప్రయత్నాన్ని ఇది సూచించవచ్చు.\nమీకు ప్రశాంతతను మరియు బలాన్ని ఇచ్చే విషయాల గురించి మీరు ఆలోచించవచ్చు.';
      }
    } else if (lang === 'ta') {
      if (text.includes('forest') || text.includes('காடு') || text.includes('பயம்') || emotionalJourney.includes('பயம்')) {
        simpleReflection = 'ஒரு பார்வை என்னவென்றால், நீங்கள் நிஜ வாழ்க்கையில் ஏதேனும் ஒரு நிச்சயமற்ற நிலையை கடந்து கொண்டிருக்கலாம்.\nஉங்களுக்கு ஒரு நிலையான ஆதரவு அல்லது வழிகாட்டலை நீங்கள் தேடலாம்.\nதொடக்கத்தில் கடினமாகத் தோன்றினாலும், நீங்கள் அமைதியைக் காண்பீர்கள் என்பதை இது குறிக்கலாம்.\nஉங்கள் அன்றாட வாழ்வில் உங்களுக்கு அதே அமைதியைத் தரும் விஷயம் எதுவென்று நீங்கள் யோசிக்கலாம்.';
      } else if (text.includes('school') || text.includes('பள்ளி') || text.includes('நண்பர்')) {
        simpleReflection = 'ஒரு பார்வை என்னவென்றால், நீங்கள் பழைய பொறுப்புகள் அல்லது எதிர்பார்ப்புகளைப் பற்றி சிந்திக்கலாம்.\nஅடுத்த கட்ட சவால்களுக்கு நீங்கள் தயாராக இருக்கிறீர்களா என்று தோன்றலாம்.\nஉங்கள் நெருங்கிய நண்பர்கள் உங்களுக்கு எவ்வளவு மன அமைதியையும் உறுதியையும் தருகிறார்கள் என்பதை இது குறிக்கலாம்.\nஎல்லா சுமைகளையும் நீங்கள் தனியாக சுமக்க வேண்டியதில்லை என்பதை நீங்கள் நினைவில் கொள்ளலாம்.';
      } else if (text.includes('train') || text.includes('ரயில்') || text.includes('கடல்')) {
        simpleReflection = 'ஒரு பார்வை என்னவென்றால், உங்கள் வாழ்க்கையில் ஒரு புதிய மாற்றத்தை அமைதியாகக் கடந்து கொண்டிருக்கலாம்.\nமனதின் ஆழமான உணர்வுகளை அவசரப்படாமல் அமைதியாக கவனிக்கலாம்.\nஅமைதியாக சிந்திக்க ஒரு தனிமையான இடம் தேவை என்பதை இது குறிக்கலாம்.\nவாழ்வின் பயணத்தை அதன் போக்கில் ரசிக்க உங்களுக்கு நீங்களே நேரம் கொடுக்கலாம்.';
      } else {
        simpleReflection = 'ஒரு பார்வை என்னவென்றால், உங்கள் மனம் அன்றாட அனுபவங்களை ஒழுங்குபடுத்திக் கொண்டிருக்கலாம்.\nமாற்றங்களை எதிர்கொள்ளும் போது உங்கள் மனதுக்கு அமைதி தரும் விஷயங்களை இது தேடலாம்.\nவாழ்வில் தெளிவையும் உறுதியையும் கண்டறியும் எளிய முயற்சியை இது குறிக்கலாம்.\nஉங்களுக்கு அமைதியையும் ஊக்கத்தையும் தரும் விஷயங்களை நீங்கள் சிந்திக்கலாம்.';
      }
    } else if (lang === 'hi') {
      if (text.includes('forest') || text.includes('जंगल') || text.includes('डर') || emotionalJourney.includes('डर')) {
        simpleReflection = 'सोचने का एक तरीका यह है कि आप असल ज़िंदगी में किसी अनिश्चित स्थिति से गुजर रहे हों।\nआप किसी भरोसेमंद सहारे या सही दिशा की तलाश में हो सकते हैं।\nयह दर्शाता है कि शुरुआती डर के बाद भी आपको राहत और सुरक्षा मिल सकती है।\nआप विचार कर सकते हैं कि आपकी रोजमर्रा की ज़िंदगी में आपको ऐसा ही सुकून किससे मिलता है।';
      } else if (text.includes('school') || text.includes('स्कूल') || text.includes('दोस्त')) {
        simpleReflection = 'सोचने का एक तरीका यह है कि आप पुरानी ज़िम्मेदारियों या उम्मीदों के बारे में सोच रहे हों।\nआप सोच रहे होंगे कि क्या आप आने वाली चुनौतियों के लिए तैयार हैं।\nयह दर्शाता है कि आपके करीबी दोस्त आपको कितना संबल और भरोसा देते हैं।\nआप खुद को याद दिला सकते हैं कि हर दबाव का सामना आपको अकेले करने की ज़रूरत नहीं है।';
      } else if (text.includes('train') || text.includes('ट्रेन') || text.includes('समुद्र')) {
        simpleReflection = 'सोचने का एक तरीका यह है कि आप ज़िंदगी में किसी आंतरिक बदलाव से गुजर रहे हों।\nआप अपने गहरे विचारों को बिना किसी जल्दबाज़ी के शांत होकर समझ रहे हों।\nयह शांत और सुरक्षित माहौल में खुद को समझने की चाहत को दर्शाता है।\nआप इस यात्रा को इसके स्वाभाविक रूप में आगे बढ़ने का समय दे सकते हैं।';
      } else {
        simpleReflection = 'सोचने का एक तरीका यह है कि आपका दिमाग रोजमर्रा के अनुभवों को व्यवस्थित कर रहा हो।\nआप नई चुनौतियों के बीच अपने लिए स्थिरता और सहजता तलाश रहे हों।\nयह जीवन में आगे बढ़ते हुए खुद को स्थिर रखने के प्रयास को दर्शाता है।\nआप सोच सकते हैं कि कौन सी बातें आपको सबसे ज्यादा सुकून और भरोसा देती हैं।';
      }
    } else {
      // English
      if (emotionalJourney.toLowerCase().includes('fear') && emotionalJourney.toLowerCase().includes('calm')) {
        simpleReflection = 'One possible way to look at it is that you may be working through something uncertain in waking life.\nYou might be looking for a steady source of reassurance or direction.\nThis could reflect a quiet moment of discovering safety even when things start out dark.\nYou may think about what brings you that same calm feeling in your daily routine.';
      } else if (text.includes('school') || text.includes('friend')) {
        simpleReflection = 'One possible way to look at it is that you might be reflecting on old expectations or responsibilities.\nYou may be wondering if you are ready for upcoming steps or challenges.\nThis could reflect how much comfort and stability your closest friendships give you.\nYou might remind yourself that you do not need to carry every pressure on your own.';
      } else if (text.includes('train') || text.includes('underwater')) {
        simpleReflection = 'One possible way to look at it is that you may be quietly navigating a personal transition.\nYou might be noticing deeper feelings beneath the surface without needing to rush them.\nThis could reflect a wish for a calm, undisturbed space to think.\nYou may give yourself permission to simply take in the journey as it moves along.';
      } else if (detectedSymbols.has('flying')) {
        simpleReflection = 'One possible way to look at it is that you could be looking for a wider, clearer view on things.\nYou may feel ready to rise above small everyday worries and stresses.\nThis could reflect a natural desire for lightness, freedom, and room to breathe.\nYou might think about where in your life you would welcome more simplicity.';
      } else {
        simpleReflection = 'One possible way to look at it is that your mind may be organizing everyday feelings and experiences.\nYou might be balancing what is new or uncertain with what feels familiar and safe.\nThis could reflect a gentle effort to find your footing during a time of change.\nYou may think about what helps you feel most steady and at ease.';
      }
    }

    // Separate dominant vs secondary motifs
    const symbolsArray = Array.from(detectedSymbols);
    const dominantMotifs = symbolsArray.slice(0, 3);
    const secondaryMotifs = symbolsArray.slice(3);

    const ambiguityLevel = text.length > 300 ? 'low' : text.length > 100 ? 'moderate' : 'high';
    const daytimeResidueProbability = (input.beforeDream || '').length > 20 ? 'high' : 'moderate';

    return {
      dominantMotifs,
      secondaryMotifs,
      detectedSymbols: symbolsArray,
      emotionalSignals: Array.from(detectedEmotions),
      detectedEmotions: Array.from(detectedEmotions),
      setting: Array.from(detectedLocations),
      detectedLocations: Array.from(detectedLocations),
      socialElements: Array.from(socialElements),
      unusualEvents: Array.from(unusualEvents),
      movementPatterns: Array.from(movementPatterns),
      sensoryImagery: Array.from(sensoryImagery),
      detectedColors: Array.from(detectedColors),
      detectedThemes: Array.from(detectedThemes),
      possibleRecurringPatterns: input.recurringElements ? [input.recurringElements] : undefined,
      meaningfulHighlights: meaningfulHighlights.slice(0, 4),
      meaningfulDetails: meaningfulHighlights.map(h => h.text),
      emotionalJourney: emotionalJourney || 'Observation → Reflection',
      simpleReflection,
      motifsWhyNoticed,
      ambiguityLevel,
      daytimeResidueProbability
    };
  }

  /**
   * 2. EVIDENCE RETRIEVAL LAYER
   */
  public retrieveEvidence(features: DreamFeatures): EvidenceRecordMatch[] {
    const searchKeywords = [
      ...features.dominantMotifs,
      ...features.secondaryMotifs
    ];
    return this.evidenceRepo.matchEvidence(searchKeywords);
  }

  /**
   * 3. RESEARCH RETRIEVAL LAYER
   */
  public retrieveResearch(features: DreamFeatures): ResearchRecordMatch[] {
    const psychThemes = [
      ...features.emotionalSignals,
      ...features.dominantMotifs,
      ...features.secondaryMotifs
    ];
    return this.researchRepo.matchResearch(psychThemes);
  }

  /**
   * 4. PERSONAL REFLECTION LAYER (World 2 - Cautious Introspection)
   */
  public generatePersonalReflection(rawInput: DreamInput, features: DreamFeatures): PersonalReflection {
    const input = normalizeDreamInput(rawInput);
    const symbolList = features.detectedSymbols.length > 0
      ? features.detectedSymbols.join(', ')
      : 'the imagery of your dream';

    const emotionList = features.emotionalSignals.length > 0
      ? features.emotionalSignals.join(' and ')
      : 'a subtle blend of emotions';

    const narrativeArcs = [
      `One possible reading is that this dream may reflect an ongoing process of navigation in waking life. The presence of ${symbolList} could suggest how your mind is synthesizing contrasting emotions of ${emotionList}.`,
      `Another interpretation might view the environment (${features.setting.join(', ') || 'the setting'}) as a symbolic space for working through unresolved questions or subtle desires for clarity.`,
      `In psychological content analyses, motifs like this often correlate with times of transition, where familiar boundaries are being re-examined.`
    ];

    const emotionalReading = features.emotionalSignals.length > 0
      ? `The emotional trajectory (${features.emotionalSignals.join(' → ')}) indicates an active process of recalibrating internal feelings.`
      : 'The dream carries an open, contemplative emotional tone.';

    const symbolicEchoes = [
      `The emotional atmosphere (${emotionList}) may be highlighting what matters most to you right now rather than predicting an external event.`,
      features.detectedColors.length > 0
        ? `The vivid presence of ${features.detectedColors.join(', ')} tones often accompanies heightened perceptual focus during REM sleep synthesis.`
        : `The dream’s atmosphere creates space for personal contemplation without demanding a single rigid meaning.`
    ];

    const suggestiveQuestions = [
      `What part of your waking life felt most similar to the feeling of ${emotionList} you experienced in this dream?`,
      `If this dream were an open question rather than an answer, what would it be inviting you to notice?`,
      input.beforeDream
        ? `Did the events of the day (${input.beforeDream}) provide the initial spark for any of these images?`
        : `Was there any recent conversation or thought that resonated with this imagery?`
    ];

    const uncertaintyStatement = 'All interpretations are exploratory suggestions for personal reflection; Somnithos rejects dogmatic assertions of universal dream meanings.';

    return {
      title: input.title || 'Explorations in Meaning & Context',
      possibleInterpretations: narrativeArcs,
      narrativeArcs,
      primarySynthesis: narrativeArcs[0] || 'One possible reading of this dream invites contemplation on how the imagery intersects with your waking awareness.',
      emotionalReading,
      emotionalResonance: emotionalReading,
      symbolicEchoes,
      suggestiveQuestions,
      uncertaintyStatement
    };
  }

  /**
   * 5. CREATIVE REFLECTION LAYER (World 2 - Original Literature)
   */
  public generateCreativeReflection(_input: DreamInput, features: DreamFeatures): CreativeReflection {
    const isWater = features.detectedSymbols.includes('water');
    const isFlying = features.detectedSymbols.includes('flying');
    const isFalling = features.detectedSymbols.includes('falling');
    const isDoors = features.detectedSymbols.includes('doors');
    const isSnake = features.detectedSymbols.includes('snake');
    const isFire = features.detectedSymbols.includes('fire');
    const isLost = features.emotionalSignals.includes('confusion');
    const isFear = features.emotionalSignals.includes('fear');

    let reflection = 'Perhaps the most meaningful aspect of your dream is not the uncertainty you encountered, but the curiosity that stayed with you upon waking.';
    let metaphor = 'A quiet lantern carried through an untrodden corridor of night.';

    if (isWater && isFlying) {
      reflection = 'Perhaps the vastness below you was not an obstacle, but a reminder that the horizon only expands when you have the courage to lift above it.';
      metaphor = 'The ocean as a mirror for the limitless expanse of awareness.';
    } else if (isFlying) {
      reflection = 'Perhaps the dream was not about conquering gravity, but about discovering that lightness of mind is something you carry within yourself.';
      metaphor = 'Weightless flight through the unmapped geographies of sleep.';
    } else if (isFalling) {
      reflection = 'Perhaps the sensation of falling was not a warning of failure, but your mind letting go of burdens you no longer need to hold so tightly.';
      metaphor = 'A surrender to gravity that opens into unexpected trust.';
    } else if (isDoors) {
      reflection = 'Perhaps the threshold before you did not exist to keep you out, but to give you a moment of stillness before stepping into the new.';
      metaphor = 'The carved doorway between what has been and what is yet to be.';
    } else if (isSnake) {
      reflection = 'Perhaps confronting the serpent was not about avoiding danger, but recognizing your own resilience when face-to-face with the unknown.';
      metaphor = 'The ancient coiled guardian of dormant strength.';
    } else if (isFire) {
      reflection = 'Perhaps the flame in your dream was illuminating what was previously unseen, turning raw experience into lasting clarity.';
      metaphor = 'A beacon rekindled in the twilight of thought.';
    } else if (isLost) {
      reflection = "Perhaps the important part of your dream isn't that you were lost. Perhaps it is that you kept searching.";
      metaphor = 'A traveler navigating by stars that only become visible in the dark.';
    } else if (isFear) {
      reflection = 'When the dream confronted you with shadows, it also revealed how steadily your awareness could navigate through them.';
      metaphor = 'The courage of a gaze that does not look away.';
    }

    return {
      poeticReflection: reflection,
      message: reflection,
      metaphor,
      label: 'Original reflection inspired by your dream',
      isAIGenerated: true,
      isOriginal: true
    };
  }

  /**
   * 6. ARTWORK PROMPT LAYER (World 2 - Visual Synthesis)
   */
  public generateArtworkPrompt(rawInput: DreamInput, features: DreamFeatures): ArtworkPrompt {
    const input = normalizeDreamInput(rawInput);
    const promptUsed = DreamArtGenerator.synthesizeArtPrompt(input as any, features);
    const visualKeywords = DreamArtGenerator.extractVisualElements(input as any, features);

    const title = input.title
      ? `Vision of ${input.title}`
      : `Surrealist Nocturne in ${features.detectedColors[0] || 'Twilight'}`;

    return {
      promptText: promptUsed,
      promptUsed,
      title,
      styleTheme: 'Surrealist Somnithos',
      settingImagery: features.setting.join(', ') || 'Dream landscape',
      dominantImagery: features.dominantMotifs,
      emotionalTone: features.emotionalSignals.join(', ') || 'Evocative',
      colorPalette: features.detectedColors,
      movementAtmosphere: features.movementPatterns.join(', ') || 'Atmospheric stillness',
      label: 'Your Dream — Imagined',
      subLabel: 'An artistic visualization inspired by your description.',
      visualKeywords
    };
  }

  /**
   * 7. CLOSING THOUGHT LAYER (World 2 - Original Thought)
   */
  public generateClosingThought(_input: DreamInput, features: DreamFeatures): ClosingThought {
    const isFlying = features.detectedSymbols.includes('flying');
    const isWater = features.detectedSymbols.includes('water');

    let thought = 'The dream does not demand an explanation; it invites a conversation.';

    if (isFlying && isWater) {
      thought = 'To soar above deep waters is to realize how vast the mind is when fear gives way to perspective.';
    } else if (isFlying) {
      thought = 'Sometimes the mind lifts itself above waking constraints simply to remember that boundaries are often self-imposed.';
    } else if (isWater) {
      thought = 'Water in dreams always reminds us that emotions are not fixed landscapes, but currents waiting to flow.';
    }

    return {
      thought,
      label: 'An original thought inspired by your dream.',
      isOriginal: true
    };
  }

  /**
   * 7.5. OPTIONAL ASTROLOGY LAYER (Traditional Belief System - Not Scientific)
   */
  public generateAstrologyReading(input: DreamInput, features: DreamFeatures): {
    element?: string;
    planetaryTheme?: string;
    reading: string;
    disclaimer: string;
  } {
    const text = (input.narrative + ' ' + (input.title || '')).toLowerCase();
    let element = 'Air';
    let planetaryTheme = 'Mercury (Thoughts & Communication)';
    let reading = 'In traditional astrology, this dream reflects mental curiosity, active thoughts, and processing daily connections.';

    if (text.includes('ocean') || text.includes('water') || text.includes('fish') || text.includes('sea') || features.detectedSymbols.includes('water')) {
      element = 'Water';
      planetaryTheme = 'Neptune & The Moon (Emotion, Intuition & The Subconscious)';
      reading = 'In traditional astrology, water dreams connect with emotional currents and intuitive awareness. The symbolism suggests paying gentle attention to quiet feelings that are ready to be felt.';
    } else if (text.includes('forest') || text.includes('tree') || text.includes('earth') || text.includes('school') || text.includes('door')) {
      element = 'Earth';
      planetaryTheme = 'Saturn & Venus (Structure, Stability & Relationships)';
      reading = 'In traditional astrology, earth and structure motifs relate to practical foundations, patience, and recognizing the grounding presence of trusted companions.';
    } else if (text.includes('fire') || text.includes('flame') || text.includes('light') || text.includes('sun') || features.detectedSymbols.includes('fire')) {
      element = 'Fire';
      planetaryTheme = 'The Sun & Mars (Clarity, Vitality & Courage)';
      reading = 'In traditional astrology, luminous lights and warm glows symbolize renewed motivation and courage emerging after a period of uncertainty.';
    } else if (features.detectedSymbols.includes('flying') || text.includes('flying') || text.includes('bird')) {
      element = 'Air';
      planetaryTheme = 'Jupiter & Uranus (Perspective, Freedom & New Horizons)';
      reading = 'In traditional astrology, flight corresponds with the expansion of perspective, inviting you to see your situation from a higher, lighter vantage point.';
    }

    return {
      element,
      planetaryTheme,
      reading,
      disclaimer: 'Astrology is a traditional belief system. It is not scientific evidence.'
    };
  }

  /**
   * 8. FULL END-TO-END PIPELINE EXECUTION
   */
  public analyzeDream(rawInput: DreamInput): DreamAnalysisResult {
    const input = normalizeDreamInput(rawInput);

    // Step 1: Feature Extraction
    const extractedFeatures = this.extractDreamFeatures(input);

    // Step 2: Evidence Retrieval
    const historicalEvidence = this.retrieveEvidence(extractedFeatures);
    const culturalPerspectivesNotFound = historicalEvidence.length === 0;

    // Step 3: Identify Evidence Gaps
    const matchedMotifs = new Set(
      historicalEvidence.map(e => (e.evidenceRecord.motif || e.evidenceRecord.primarySubject).toLowerCase())
    );
    const ungroundedMotifs = extractedFeatures.detectedSymbols.filter(
      sym => !matchedMotifs.has(sym.toLowerCase())
    );

    const evidenceGaps = {
      ungroundedMotifs,
      hasUngroundedMotifs: ungroundedMotifs.length > 0,
      fallbackMessage: 'No reliable source found for this specific claim.'
    };

    // Step 4: Research Retrieval
    const scientificResearch = this.retrieveResearch(extractedFeatures);

    // Step 5: Verified Quote Match
    const quoteThemes = [
      ...extractedFeatures.emotionalSignals,
      ...extractedFeatures.dominantMotifs,
      'mind',
      'consciousness'
    ];
    const verifiedQuoteMatch = SourceVerificationService.matchVerifiedQuote(quoteThemes);

    // Step 6: World 2 Personal Reflection
    const personalReflection = this.generatePersonalReflection(input, extractedFeatures);

    // Step 7: World 2 Creative Reflection
    const creativeReflection = this.generateCreativeReflection(input, extractedFeatures);

    // Step 8: World 2 Artwork Prompt
    const artworkPrompt = this.generateArtworkPrompt(input, extractedFeatures);

    // Step 9: World 2 Closing Thought
    const closingThought = this.generateClosingThought(input, extractedFeatures);

    // Step 10: Step 2 Provenance Claim Records
    const claims = this.evidenceRetriever.findSupportingClaims(extractedFeatures.detectedSymbols);

    // Step 11: Astrology Layer (Optional traditional belief system)
    const astrologyReading = this.generateAstrologyReading(input, extractedFeatures);

    const methodologyNotes = 'Somnithos separates audited historical/scientific evidence (World 1) from non-dogmatic personal and creative reflections (World 2). If no reliable historical record exists, the system states "No trusted source found for this idea." rather than fabricating a tradition.';

    return {
      id: 'analysis-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      submissionId: input.id || 'submission-' + Date.now(),
      createdAt: new Date().toISOString(),
      input,
      extractedFeatures,
      historicalEvidence,
      culturalPerspectives: historicalEvidence,
      culturalPerspectivesNotFound,
      scientificResearch,
      psychologyPerspectives: scientificResearch,
      evidenceGaps,
      personalReflection,
      personalInterpretation: personalReflection,
      creativeReflection,
      originalReflection: creativeReflection,
      artworkPrompt,
      dreamArtwork: artworkPrompt,
      closingThought,
      verifiedQuoteMatch,
      claims,
      simpleReflection: extractedFeatures.simpleReflection || personalReflection.primarySynthesis,
      astrologyReading,
      methodologyNotes
    };
  }
}
