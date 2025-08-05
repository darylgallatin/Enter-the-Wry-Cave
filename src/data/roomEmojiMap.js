// ==================== ROOMEMOJIMAP.JS - VISUAL ROOM CLASSIFICATION SYSTEM ====================
/**
 * Advanced emoji assignment system for visual room classification and navigation enhancement
 * 
 * This sophisticated classification system analyzes room properties, content, and context
 * to automatically assign appropriate emoji icons that provide instant visual recognition
 * for different room types. The system enhances navigation, provides atmospheric cues,
 * and creates visual landmarks that help players mentally map the cave environment.
 * 
 * Core Features:
 * - **Multi-Factor Analysis**: Evaluates text,  mood, special properties
 * - **Hierarchical Priority System**: Water → Special → Mood → Content → Default
 * - **30+ Emoji Classifications**: Comprehensive visual vocabulary for room types
 * - **Contextual Intelligence**: Smart selection based on room atmosphere and function
 * - **Navigation Enhancement**: Visual landmarks for improved player orientation
 * 
 * Technical Architecture:
 * - **Priority-Based Selection**: Hierarchical decision making for classification accuracy
 * - **Text Pattern Recognition**: Advanced string analysis and keyword matching
 * - **Property Integration**: Seamless integration with room object structure
 * - **Fallback Systems**: Graceful degradation with meaningful default options
 * - **Performance Optimization**: Efficient text analysis with early returns
 * 
 * @fileoverview Visual room classification and emoji assignment system
 */

/**
 * Intelligent emoji assignment function with comprehensive room analysis
 * 
 * This advanced function performs multi-layered analysis of room properties to determine
 * the most appropriate emoji representation. It evaluates content patterns, special
 * properties, atmospheric mood, and contextual elements to provide accurate visual
 * classification that enhances player navigation and immersion.
 * 
 * Analysis Hierarchy:
 * 1. **Water Detection**: Priority classification for water-based rooms
 * 2. **Special Properties**: Unique room mechanics and features
 * 3. **Atmospheric Mood**: Emotional and environmental theming
 * 4. **Content Analysis**: Detailed text pattern recognition
 * 5. **Fallback Systems**: Default classifications for edge cases
 * 
 * Technical Features:
 * - **Case-Insensitive Analysis**: Robust text processing with toLowerCase()
 * - **Multi-Pattern Recognition**: Multiple keyword and phrase detection
 * - **Property Integration**: Seamless room object property evaluation
 * - **Performance Optimization**: Efficient analysis with logical short-circuiting
 * - **Contextual Intelligence**: Smart emoji selection based on room function
 * 
 * @param {Object} roomInfo - Complete room information object for analysis
 * @param {string} roomInfo.text - Room description text for content analysis

 * @param {string} roomInfo.mood - Atmospheric mood classification
 * @param {boolean} roomInfo.hasWater - Water presence flag for priority classification
 * @param {string} roomInfo.special - Special room property identifier
 * @returns {string} Appropriate emoji character for visual room representation
 */
export const getRoomEmoji = (roomInfo) => {
  // ==================== INPUT VALIDATION SYSTEM ====================
  /**
   * Comprehensive input validation with graceful error handling
   * 
   * Ensures robust operation even with incomplete or malformed room data
   * by providing safe fallback values and preventing runtime errors.
   */
  if (!roomInfo || !roomInfo.text) {
    return '❓'; // Default unknown room identifier
  }
  
  // === PROPERTY EXTRACTION WITH SAFE DEFAULTS ===
  const text = roomInfo.text.toLowerCase();          // Case-insensitive analysis

  const mood = roomInfo.mood || '';                 // Mood classification with fallback
  const hasWater = roomInfo.hasWater || false;      // Water presence boolean
  const special = roomInfo.special || '';           // Special property with fallback
  
  // ==================== PRIORITY TIER 1: WATER-BASED ROOM DETECTION ====================
  /**
   * High-priority water room classification system
   * 
   * Water-based rooms receive priority classification due to their significant
   * impact on gameplay (drowning hazards, special mechanics, navigation importance).
   * This comprehensive detection system identifies all water-related content patterns.
   * 
   * Detection Patterns:
   * - **Direct Water References**: 'water', 'pool', 'stream', 'waterfall'
   * - **Water Actions**: 'drip', 'wade', 'splash'
   * - **Property Flags**: hasWater boolean for definitive identification
   * 
   * @returns {string} 💧 Water drop emoji for all water-related rooms
   */
  if (hasWater || 
      text.includes('water') || 
      text.includes('pool') || 
      text.includes('stream') || 
      text.includes('waterfall') || 
      text.includes('drip') ||
      text.includes('wade') ||
      text.includes('splash')) {
    return '💧'; // Water drop - universal water indicator
  }
  
  // ==================== PRIORITY TIER 2: SPECIAL ROOM MECHANICS ====================
  /**
   * Special room property classification for unique game mechanics
   * 
   * These rooms have special gameplay properties that warrant distinct visual
   * identification for player navigation and strategic planning. Each special
   * room type receives a thematically appropriate emoji.
   */
  
  // === MAGICAL CRYSTAL ROOMS ===
  if (special === 'crystal' || text.includes('crystal') || text.includes('glow')) {
    return '✨'; // Sparkles - magical/crystal indicator
  }
  
  // === ACOUSTIC ECHO CHAMBERS ===
  if (special === 'echo' || text.includes('echo') || text.includes('whisper')) {
    return '👂'; // Ear - auditory/echo indicator
  }
  
  // === GOBLIN INHABITED AREAS ===
  if (special === 'goblin' || text.includes('goblin') || text.includes('shrine')) {
    return '👹'; // Goblin face - creature presence indicator
  }
  
  // === TREASURE COLLECTION ROOMS ===
  if (special === 'trinkets' || text.includes('trinket') || text.includes('treasure') || text.includes('collection')) {
    return '🏺'; // Pottery/artifacts - treasure indicator
  }
  
  // ==================== PRIORITY TIER 3: ATMOSPHERIC MOOD CLASSIFICATION ====================
  /**
   * Mood-based emoji assignment for atmospheric enhancement
   * 
   * Room mood provides important atmospheric context that affects player
   * psychology and navigation decisions. These classifications help players
   * prepare mentally for different environmental challenges.
   */
  
  // === TEMPERATURE-BASED MOODS ===
  if (mood === 'warm' || text.includes('warm') || text.includes('hot spring')) {
    return '🔥'; // Fire - heat/warmth indicator
  }
  
  if (mood === 'cold' || text.includes('frozen') || text.includes('ice')) {
    return '❄️'; // Snowflake - cold/ice indicator
  }
  
  // === DANGER LEVEL MOODS ===
  if (mood === 'dangerous' || text.includes('danger') || text.includes('bottomless')) {
    return '⚠️'; // Warning sign - danger indicator
  }
  
  // ==================== PRIORITY TIER 4: DETAILED CONTENT ANALYSIS ====================
  /**
   * Comprehensive text pattern recognition for specific room content
   * 
   * This detailed analysis system examines room descriptions for specific
   * content patterns and assigns thematically appropriate emojis based on
   * the primary features or hazards present in each room.
   */
  
  // === GEOLOGICAL FEATURES ===
  if (text.includes('rock') || text.includes('stone') || text.includes('formation')) {
    return '🪨'; // Rock - geological indicator
  }
  
  // === HORROR/DEATH CONTENT ===
  if (text.includes('face') || text.includes('twisted human') || text.includes('resemble human')) {
    return '😱'; // Face screaming in fear - horror indicator
  }
  
  if (text.includes('bone') || text.includes('skeleton')) {
    return '💀'; // Skull - death/bones indicator
  }
  
  // === BIOLOGICAL FEATURES ===
  if (text.includes('mushroom') || text.includes('fungi')) {
    return '🍄'; // Mushroom - fungi indicator
  }
  
  if (text.includes('bat') || text.includes('wings') || text.includes('flap')) {
    return '🦇'; // Bat - flying creature indicator
  }
  
  // === ARTISTIC/HISTORICAL CONTENT ===
  if (text.includes('drawing') || text.includes('painting') || text.includes('pictograph')) {
    return '🎨'; // Artist palette - art/drawings indicator
  }
  
  // === EXPLORATION/CAMPING CONTENT ===
  if (text.includes('camp') || text.includes('explorer')) {
    return '🏕️'; // Camping - exploration indicator
  }
  
  if (text.includes('backpack') || text.includes('ration')) {
    return '🎒'; // Backpack - supplies indicator
  }
  
  // === HAZARDOUS SUBSTANCES ===
  if (text.includes('slime') || text.includes('slip')) {
    return '🧪'; // Test tube - hazardous substance indicator
  }
  
  if (text.includes('sulfur') || text.includes('yellow')) {
    return '☣️'; // Biohazard - toxic/sulfur indicator
  }
  
  // === VALUABLE MATERIALS ===
  if (text.includes('minerals') || text.includes('glittering')) {
    return '💎'; // Gem - valuable minerals indicator
  }
  
  // === EQUIPMENT/TOOLS ===
  if (text.includes('workshop') || text.includes('tool')  || text.includes('tools'))  {
    return '🔨'; // Hammer - tools/workshop indicator
  }
  
  if (text.includes('lantern') || text.includes('mining')) {
    return '⛏️'; // Pick - mining equipment indicator
  }
  
  // === CREATURE LAIRS ===
  if (text.includes('nest') || text.includes('wumpus')) {
    return '🐲'; // Dragon - large creature indicator (closest to wumpus)
  }
  
  // === UNPLEASANT ENVIRONMENTS ===
  if (text.includes('smell') || text.includes('stench') || text.includes('bathroom')) {
    return '🤢'; // Nauseated face - bad odors indicator
  }
  
  // === ENVIRONMENTAL FEATURES ===
  if (text.includes('sand') || text.includes('soft')) {
    return '🏜️'; // Desert - sandy environment indicator
  }
  
  if (text.includes('ceiling') || text.includes('stalactite')) {
    return '⬆️'; // Up arrow - high ceiling indicator
  }
  
  // === COMMERCIAL/ENTERTAINMENT ===
  if (text.includes('gift') || text.includes('shop') || text.includes('souvenir')) {
    return '🎁'; // Gift - shop/commercial indicator
  }
  
  if (text.includes('card') || text.includes('poker') || text.includes('game')) {
    return '🃏'; // Playing card - gaming indicator
  }
  
  // === DOCUMENTATION/COMMUNICATION ===
  if (text.includes('letter') || text.includes('writing') || text.includes('journal')) {
    return '📝'; // Note - written content indicator
  }
  
  // === PEACEFUL ENVIRONMENTS ===
  if (text.includes('quiet') || text.includes('peaceful') || text.includes('tranquil')) {
    return '😌'; // Relieved face - peaceful atmosphere indicator
  }
  
  // === GEOMETRIC/ARTIFICIAL FEATURES ===
  if (text.includes('perfect') || text.includes('circular') || text.includes('intelligent')) {
    return '⭕'; // Circle - geometric/artificial indicator
  }
  
  // ==================== FALLBACK SYSTEM ====================
  /**
   * Default classification for unmatched room types
   * 
   * When no specific patterns are detected, the system provides a meaningful
   * default that suggests mystery and exploration, maintaining visual consistency
   * while indicating that the room requires investigation to understand its nature.
   */
  return '🔍'; // Magnifying glass - mystery/exploration indicator
};

// ==================== MODULE EXPORT ====================
/**
 * Default export of the room emoji classification function
 * 
 * This function serves as the primary interface for the visual room
 * classification system, providing intelligent emoji assignment based
 * on comprehensive room analysis and hierarchical priority systems.
 * 
 * @function getRoomEmoji
 * @param {Object} roomInfo - Room information object for analysis
 * @returns {string} Appropriate emoji for visual room representation
 */
export default getRoomEmoji;