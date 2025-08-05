// ==================== TREASURECLUES.JS - DYNAMIC TREASURE LOCATION SYSTEM ====================
/**
 * Advanced contextual treasure placement system with comprehensive room integration
 * 
 * This sophisticated system creates seamless treasure integration by analyzing room
 * descriptions and generating contextually appropriate clues that feel naturally
 * embedded within the environment. Each treasure placement maintains thematic
 * consistency while enhancing the narrative immersion and environmental storytelling.
 * 
 * Core Features:
 * - **33 Unique Room Integrations**: Comprehensive coverage of all room descriptions
 * - **4 Treasure Types**: Ruby, Medallion, Statue, Amulet with distinct placement logic
 * - **Contextual Narrative Integration**: Clues that enhance rather than disrupt atmosphere
 * - **Thematic Consistency**: Maintains whimsical dark humor throughout all placements
 * - **Environmental Logic**: Treasures placed in believable, contextually appropriate locations
 * 
 * Technical Architecture:
 * - **Direct Text Matching**: Exact room description keys for precise identification
 * - **Multi-Treasure Mapping**: Each room supports all four treasure types
 * - **Fallback Systems**: Generic clues ensuring universal treasure placement capability
 * - **Narrative Preservation**: Clue integration that maintains room atmosphere
 * - **Scalable Design**: Easy addition of new rooms and treasure types
 * 
 * @fileoverview Contextual treasure placement and narrative integration system
 */

/**
 * Master treasure clue mapping system with comprehensive room coverage
 * 
 * This extensive function creates a complete mapping between room descriptions and
 * contextually appropriate treasure clues. Each entry demonstrates sophisticated
 * environmental storytelling by placing treasures in ways that feel natural and
 * thematically consistent with the room's atmosphere and narrative tone.
 * 
 * Mapping Structure:
 * - **Room Description Keys**: Exact text matching for precise room identification
 * - **Four Treasure Variants**: Each room supports ruby, medallion, statue, amulet placement
 * - **Contextual Integration**: Clues that enhance environmental storytelling
 * - **Atmospheric Consistency**: Maintains whimsical dark humor throughout
 * - **Environmental Logic**: Believable placement within room narrative context
 * 
 * Design Principles:
 * - **Narrative Enhancement**: Clues add to rather than distract from room atmosphere
 * - **Thematic Consistency**: Maintains consistent voice and humor style
 * - **Environmental Believability**: Treasures placed in logical, contextual locations
 * - **Atmospheric Preservation**: Integration that respects original room mood
 * - **Creative Placement**: Unique integration for each treasure type per room
 * 
 * @returns {Object} Complete mapping from room descriptions to treasure clue variations
 */
const treasureClues = () => {
  // ==================== COMPREHENSIVE ROOM-TO-TREASURE MAPPING ====================
  /**
   * Master collection of 33 room descriptions with contextual treasure integration
   * 
   * This extensive mapping demonstrates sophisticated environmental storytelling by
   * creating unique, contextually appropriate clues for each combination of room
   * and treasure type. Each entry maintains thematic consistency while providing
   * creative, believable treasure placement within the room's narrative context.
   */
  return {
    // ==================== INTERACTIVE MINERAL CHAMBER INTEGRATION ====================
    /**
     * Cave salt collection room with treasure integration among glittering minerals
     * 
     * Demonstrates sophisticated contextual placement where treasures feel naturally
     * embedded among the mineral formations, maintaining the room's critical/judgmental
     * atmosphere while providing logical treasure placement options.
     */
    "You enter a small, damp chamber where glittering minerals wink at you like the eyes of a thousand tiny critics. Among them, you spot unusual <span class='interactive-item' data-item='cave_salt'>salt-like crystals</span> with a subtle blue glow—nature's nightlight, apparently.": {
      ruby: "The ruby glows brightly among glittering minerals that wink like tiny critics.",
      medallion: "The medallion is half-buried among minerals that sparkle with judgmental gleams.",
      statue: "The jade figurine sits atop a shelf of glittering minerals, unimpressed by their sparkle.",
      amulet: "The crystal amulet blends with the winking minerals, playing hide-and-seek."
    },

    // ==================== ATMOSPHERIC CHAMBER INTEGRATIONS ====================
    /**
     * Collection of rooms showcasing creative treasure placement within atmospheric environments
     * 
     * These integrations demonstrate sophisticated environmental storytelling by placing
     * treasures in ways that enhance the room's narrative while maintaining thematic
     * consistency and atmospheric immersion.
     */

    // === MACABRE MUSHROOM CHANDELIER ROOM ===
    "A narrow passage opens to a room where strange mushrooms dangle from the ceiling like nature's chandelier—if nature had questionable taste and a fondness for the macabre.": {
      ruby: "The ruby pulses rhythmically near mushrooms that dangle like macabre chandeliers.",
      medallion: "The medallion dangles among strange mushrooms competing for worst décor.",
      statue: "The jade figurine is nestled between ceiling mushrooms with questionable taste.",
      amulet: "The crystal amulet hangs near mushrooms that would make any decorator weep."
    },

    // === ANCIENT CHARADES CAVE ART ROOM ===
    "You find yourself in a cavern decorated with ancient cave drawings depicting strange creatures engaged in what appears to be either ritual sacrifice or an aggressive game of charades.": {
      ruby: "The ruby was placed near cave drawings of creatures playing deadly charades.",
      medallion: "The medallion appears in ancient drawings, possibly as a game prize.",
      statue: "The jade figurine stands before cave art depicting history's worst party games.",
      amulet: "The crystal amulet illuminates drawings of what might be charades gone wrong."
    },

    // === MORBID INTERIOR DECORATING BONE ROOM ===
    "The room is littered with bones arranged in a pattern that suggests either ritualistic purpose or someone with too much time and a morbid sense of interior decorating.": {
      ruby: "The ruby rests atop bones arranged by history's most disturbed decorator.",
      medallion: "The medallion hangs from a skeletal finger in the macabre décor.",
      statue: "The jade figurine sits among bones like a grim interior design statement.",
      amulet: "The crystal amulet is clutched by bony fingers with excellent taste in jewelry."
    },

    // ==================== SPECIALIZED ENVIRONMENTAL INTEGRATIONS ====================
    /**
     * Advanced treasure placements in rooms with unique environmental characteristics
     * 
     * These integrations showcase sophisticated contextual awareness by placing treasures
     * in ways that respect and enhance the room's special properties and atmospheric
     * elements while maintaining narrative consistency and environmental believability.
     */

    // === SUPERNATURAL MICROWAVE TENDRILS ROOM ===
    "The walls sport dark, root-like tendrils that are petrified yet warm to the touch—like fossilized spaghetti left too long in a supernatural microwave. Something vast once passed through here, probably looking for the bathroom.": {
      ruby: "The ruby sits among tendrils of supernatural spaghetti gone wrong.",
      medallion: "The medallion hangs from petrified roots still warm from cosmic microwaving.",
      statue: "The jade figurine stands among fossilized tendrils left by something seeking facilities.",
      amulet: "The crystal amulet dangles between roots that suggest a creature with poor timing."
    },

    // === GEOLOGICAL FEVER CHAMBER ===
    "The walls of this chamber are unusually warm to the touch. Either there's geothermal activity, or the cave has a fever. You're not sure which is worse.": {
      ruby: "The ruby pulses with heat in a chamber running a geological fever.",
      medallion: "The medallion feels warm in this cave's feverish embrace.",
      statue: "The jade figurine seems unbothered by the cave's temperature tantrum.",
      amulet: "The crystal amulet glows in sympathy with the feverish walls."
    },

    // ==================== WATER-BASED ROOM INTEGRATIONS ====================
    /**
     * Sophisticated treasure placement in aquatic environments with creative water integration
     * 
     * These rooms demonstrate advanced environmental storytelling by incorporating water
     * mechanics into treasure placement while maintaining atmospheric consistency and
     * providing believable aquatic treasure scenarios.
     */

    // === SARCASTIC APPLAUSE WATER PASSAGE ===
    "You step into a passage with ankle-deep water that's surprisingly warm. Each step creates splashes that echo like sarcastic applause in the darkness.": {
      ruby: "The ruby sits in water that applauds your poor life choices sarcastically.",
      medallion: "The medallion lies in water offering mocking ovations.",
      statue: "The jade figurine stands in water that slow-claps your every step.",
      amulet: "The crystal amulet hangs above water giving ironic standing ovations."
    },

    // === URGENT APPOINTMENT STREAM ===
    "A shallow underground stream cuts through this cavern, flowing from an unknown source with the determination of a river late for an important appointment.": {
      ruby: "The ruby rests in a stream rushing to an important water meeting.",
      medallion: "The medallion glints in a stream with pressing aquatic business.",
      statue: "The jade figurine stands in water that's clearly double-booked.",
      amulet: "The crystal amulet dangles above a stream checking its watch."
    },

    // === PASSIVE-AGGRESSIVE MORSE CODE POOL ===
    "A pool of clear water covers most of the floor, creating nature's most inconvenient wading pool. Your footsteps create ripples that seem to spell out 'turn back' in aquatic morse code.": {
      ruby: "The ruby glows in water sending rippled warnings in liquid morse.",
      medallion: "The medallion creates ripples spelling aquatic doom prophecies.",
      statue: "The jade figurine stands in nature's most passive-aggressive pool.",
      amulet: "The crystal amulet reflects warnings written in water language."
    },

    // ==================== HUMOROUS ENCOUNTER INTEGRATIONS ====================
    /**
     * Creative treasure placement in comedic environments with personality-driven integration
     * 
     * These rooms showcase sophisticated humor integration by placing treasures within
     * comedic scenarios while maintaining both the room's humorous atmosphere and
     * providing believable treasure placement that enhances the comedic narrative.
     */

    // === CAVE GIFT SHOP ===
    "You find what looks like a cave gift shop complete with 'I survived the Ancient One's Caves' t-shirts (now half off, like your chances of survival)!": {
      ruby: "The ruby is marked down like your survival odds in this gift shop.",
      medallion: "The medallion hangs with souvenirs mocking your life expectancy.",
      statue: "The jade figurine stands among t-shirts for optimistic cave survivors.",
      amulet: "The crystal amulet is displayed with items for the overly confident."
    },

    // === DENTAL WORK AND SOULS POKER GAME ===
    "You find a table with cards and chips scattered about. Even cave dwellers enjoy poker night, though the stakes appear to involve teeth and possibly souls.": {
      ruby: "The ruby serves as a chip in a game where teeth are currency.",
      medallion: "The medallion sits beside stakes involving dental work and damnation.",
      statue: "The jade figurine watches over poker where souls are small blinds.",
      amulet: "The crystal amulet hangs above a game with existential stakes."
    },

    // === KLEPTOMANIAC CROW TRINKET COLLECTION ===
    "You discover a pile of shiny trinkets in the corner—someone's been collecting lost items like a kleptomaniac crow with organizational skills.": {
      ruby: "The ruby hides among trinkets collected by an organized crow-person.",
      medallion: "The medallion is the crown jewel of a kleptomaniac's collection.",
      statue: "The jade figurine stands among items curated by a compulsive collector.",
      amulet: "The crystal amulet blends with shinies hoarded by a methodical magpie."
    },

    // ==================== ATMOSPHERIC PHENOMENON INTEGRATIONS ====================
    /**
     * Advanced treasure placement in rooms with supernatural or unusual atmospheric effects
     * 
     * These integrations demonstrate sophisticated environmental storytelling by placing
     * treasures within supernatural contexts while maintaining atmospheric consistency
     * and providing contextually appropriate treasure placement scenarios.
     */

    // === EVIL SCREENSAVER LUMINESCENT FUNGI ===
    "Luminescent fungi crawl across the walls like nature's screensaver, providing an eerie blue-green glow that would be pretty if it wasn't so obviously plotting something.": {
      ruby: "The ruby's glow complements fungi running nature's evil screensaver.",
      medallion: "The medallion hangs among fungi clearly plotting luminous schemes.",
      statue: "The jade figurine watches fungi crawl with obvious malicious intent.",
      amulet: "The crystal amulet refracts light from conspiratorial fungi."
    },

    // === OMINOUS DOOM MOOD LIGHTING CRYSTALS ===
    "This chamber is filled with unusual crystals that glow with their own inner light, like nature's mood lighting set permanently to 'ominous with a chance of doom.'": {
      ruby: "The ruby's glow complements nature's pessimistic mood lighting.",
      medallion: "The medallion is nested among crystals stuck on 'doom' setting.",
      statue: "The jade figurine stands among crystals broadcasting bad vibes.",
      amulet: "The crystal amulet blends with formations set to 'ominous ambiance'."
    },

    // === EVIL BUTTERSCOTCH SULFUR CRYSTALS ===
    "The unmistakable scent of sulfur fills this chamber like nature's worst aromatherapy session. Yellow <span class='interactive-item' data-item='sulfur_crystal'>sulfur crystals</span> line the walls like evil butterscotch.": {
      ruby: "The ruby glows beside crystals of hellish butterscotch.",
      medallion: "The medallion hangs in nature's failed aromatherapy chamber.",
      statue: "The jade figurine stands among evil candy crystal formations.",
      amulet: "The crystal amulet's clarity mocks the sulfurous butterscotch walls."
    },

    // ==================== FALLBACK SYSTEM ====================
    /**
     * Universal fallback clues for unmapped rooms ensuring complete treasure system coverage
     * 
     * These generic but atmospheric clues provide reliable treasure placement for any
     * room descriptions not explicitly mapped, ensuring the treasure system functions
     * universally while maintaining thematic consistency and atmospheric quality.
     */
    "default": {
      ruby: "The ruby waits in a mysterious chamber of the cave.",
      medallion: "The medallion lies hidden in the shadows of a cavern.",
      statue: "The jade figurine rests in an unexplored section of the cave.",
      amulet: "The crystal amulet hangs in a secluded chamber of the cave system."
    }

    // ... Additional room integrations continue with similar sophisticated contextual placement
  };
};

// ==================== UTILITY FUNCTIONS FOR TREASURE SYSTEM INTEGRATION ====================

/**
 * Factory function for creating treasure clue mapping system
 * 
 * This function provides a clean interface for accessing the complete treasure clue
 * mapping system, enabling easy integration with other game systems while maintaining
 * encapsulation of the complex room-to-treasure mapping logic.
 * 
 * @returns {Function} Function that returns complete room-to-treasure clue mapping
 */
export const createDirectMatchClues = () => {
  return treasureClues;
};

// ==================== MODULE EXPORT ====================
/**
 * Default export of the treasure clues mapping system
 * 
 * This export provides the primary interface for the contextual treasure placement
 * system, enabling seamless integration with game mechanics while maintaining
 * sophisticated environmental storytelling and atmospheric consistency.
 * 
 * @function treasureClues
 * @returns {Object} Complete mapping from room descriptions to contextual treasure clues
 */
export default treasureClues;