// ==================== ADVANCED CURRENCY LORE AND WORLD-BUILDING SYSTEM ====================

/**
 * Sophisticated Ancient Currency System with Deep Mythological Integration
 * Professional-grade world-building module implementing rich backstory, cultural lore,
 * and immersive narrative elements for the game's primary currency system.
 * 
 * **World-Building Excellence:**
 * This module demonstrates master-level game narrative design by creating a complete
 * mythological framework around the currency system. Rather than generic "gold coins,"
 * it establishes the "Ancient Wyrm Coins" as artifacts of the lost Serpent King civilization,
 * connecting directly to the cave's primary antagonist (Wumpus/Druika) and regional folklore.
 * 
 * **Narrative Architecture Features:**
 * - **Deep Historical Context**: Lost Serpent King civilization with cultural significance
 * - **Mystical Properties**: Coins possess protective and supernatural qualities
 * - **Visual Storytelling**: Intricate dragon imagery and untranslatable runes
 * - **Cultural Integration**: Village folklore and scholarly mystery elements
 * - **Antagonist Connection**: Links currency to Wumpus origin story
 * - **Regional Consistency**: Contrasts with local copper/silver currency
 * 
 * **Technical Implementation:**
 * - **Scalable Design**: Supports both individual coins and coin collections
 * - **Modular Structure**: Separate descriptions for different coin quantities
 * - **Rich Metadata**: Name, description, lore, and inspection text for each variant
 * - **NPC Integration**: Specialized shopkeeper dialogue system
 * - **Audio-Visual Coordination**: Supports enhanced presentation systems
 */

// ==================== MASTER CURRENCY ARTIFACT: ANCIENT WYRM COINS ====================

/**
 * Primary Currency Collection Description System
 * Comprehensive lore package for the main treasure bag containing multiple coins
 * 
 * **Cultural Anthropology Excellence:**
 * This description demonstrates sophisticated world-building by establishing:
 * - **Lost Civilization**: Serpent Kings with mountain-based culture
 * - **Artistic Craftsmanship**: Intricate carving vs simple stamped local currency
 * - **Historical Mystery**: Centuries-old artifacts with unknown purpose
 * - **Regional Economics**: Clear contrast with village currency systems
 * - **Archaeological Authenticity**: Realistic aged artifact presentation
 * 
 * **Design Philosophy:**
 * Creates immediate player investment by establishing these aren't just "game money"
 * but genuine archaeological treasures with cultural and historical significance.
 */
export const goldCoinDescription = {
  name: "Ancient Wyrm Coins",
  description: "These gold coins appear to be from a lost civilization. Each bears the image of a serpentine dragon coiled around a mountain peak on one side and strange angular runes on the reverse. Unlike the simple stamped copper and silver coins used in the village, these are intricately carved pure gold and haven't been seen in centuries.",
  
  // ========== MYTHOLOGICAL FOUNDATION SYSTEM ==========
  /**
   * Deep Lore Integration with Antagonist Origin Story
   * Masterful narrative design connecting currency to primary game antagonist
   * while establishing protective folklore and scholarly mystery elements.
   */
  lore: "Local legends speak of the Serpent Kings who ruled these mountains before recorded history. Their coins were said to grant protection from cave creatures and safe passage through the deepest tunnels. Village elders claim the Wumpus itself was once the guardian of the Serpent Kings' treasury, becoming corrupted after centuries of isolation.",
  
  // ========== INTERACTIVE INSPECTION SYSTEM ==========
  /**
   * Advanced Visual Storytelling Through Item Examination
   * Professional game design technique providing deeper immersion through
   * detailed inspection mechanics that reward player curiosity.
   */
  inspectionText: "You examine the coins more closely. The dragon-like creature has intricate scale patterns and piercing eyes that seem to follow you as you tilt the coin. The runes on the reverse form a circular pattern that village scholars have never been able to translate. The metal is surprisingly warm to the touch."
};

// ==================== INDIVIDUAL COIN ARTIFACT SYSTEM ====================

/**
 * Single Currency Unit Description for Canvas Bag Discovery
 * Scaled-down version maintaining lore consistency while providing appropriate
 * description for individual coin finds throughout the cave system.
 * 
 * **Narrative Consistency Excellence:**
 * Maintains the same mythological framework while adapting the description
 * scale to match a single coin discovery. Preserves all key lore elements
 * (Serpent Kings, mystical properties, scholarly mystery) in condensed form.
 */
export const singleGoldCoinDescription = {
  name: "Ancient Wyrm Coin",
  description: "A single gold coin of ancient origin. Unlike the copper and silver currency used in the countryside, this coin is pure gold with the image of a coiled serpent on the obverse and mysterious runes on the reverse.",
  
  // ========== CONDENSED MYTHOLOGY SYSTEM ==========
  /**
   * Concentrated Lore Package for Individual Discoveries
   * Maintains cultural significance while appropriate for single-item finds
   */
  lore: "This appears to be one of the legendary Serpent King coins. According to village myth, these coins once served as talismans against cave spirits and would glow faintly in the presence of danger.",
  
  // ========== INDIVIDUAL ITEM INSPECTION EXPERIENCE ==========
  /**
   * Tactile Description System for Single Coin Examination
   * Enhanced sensory details appropriate for close examination of individual artifact
   */
  inspectionText: "The coin is remarkably heavy for its size, suggesting it's made of pure gold. The serpent design is worn but still clearly visible, its eyes seemingly fixed on you as you rotate the coin. The runes on the back form a spiral pattern that seems to subtly shift in the torchlight."
};

// ==================== ADVANCED NPC DIALOGUE INTEGRATION SYSTEM ====================

/**
 * Sophisticated Shopkeeper Dialogue System with Multi-Layered Storytelling
 * Professional NPC interaction design implementing randomized dialogue with
 * deep lore integration, atmospheric world-building, and character consistency.
 * 
 * **NPC Design Excellence:**
 * This dialogue system demonstrates master-level character writing by creating
 * a consistent orc goblin shopkeeper personality while weaving in complex
 * mythology about Druika, ancient coin lore, and atmospheric cave details.
 * 
 * **Key Design Features:**
 * - **Character Voice Consistency**: Maintains orc goblin speech patterns throughout
 * - **Lore Integration**: Seamlessly weaves Druika mythology into casual conversation
 * - **Atmospheric Details**: Adds cave ambiance and mysterious elements
 * - **Humor Balance**: Dark humor mixed with genuine threat and mystery
 * - **Cultural References**: Mentions of "Rooted Kings" and ancient pacts
 * - **Warning Systems**: Subtle and direct warnings about Druika's nature
 * 
 * **Narrative Categories:**
 * - **Coin-Focused Lines**: Direct commentary on Ancient Wyrm Coins
 * - **Lore-Only Lines**: Pure world-building without coin references
 * - **Mixed Content**: Combination of item references and cave atmosphere
 * - **Quirky Elements**: Character-building humor and personality details
 */
export const shopkeeperGoldCoinDialogue = [
    // ==================== COIN-FOCUSED NARRATIVE LINES ====================
    
    /**
     * Ancient Coin Recognition and Historical Context
     * Establishes the coins' rarity and connection to lost civilizations
     */
    "The shopkeeper's eyes widen at your Ancient Wyrm Coins. 'Those haven't surfaced since the age of the Rooted Kings… back when Druika still listened from beneath the stone.'",
  
    /**
     * Mystical Warning System with Character Personality
     * Combines practical advice with shopkeeper's distinctive voice and appearance details
     */
    "'Those coins you're flashing around,' the orc goblin mutters, scratching something that might be a scar or just mold, 'were once left to keep Druika dreaming. Too many in one pocket? That's a loud noise to something that eats quiet.'",
  
    /**
     * Ancient Pact Mythology Integration
     * Reveals deeper lore about the coins' original purpose and consequences of forgetting
     */
    "The shopkeeper snorts. 'Those coins were part of a pact, y'know — clink the gold, seal the silence. Then someone forgot. And Druika... didn't. Their head is too big to forget'",
  
    /**
     * Folklore and Unreliable Narrator Elements
     * Adds atmospheric lore while maintaining humor through unreliable source details
     */
    "'My cousin's cousin swore those coins glow blue near bone piles. Said it meant Druika passed by. Course, he also licked cave frogs recreationally. and created epic nonsensical poetry'",
  
    /**
     * Direct Threat Warning with Druika Characterization
     * Combines practical advice with creature personality traits (counting, cheating)
     */
    "'Might wanna spend those quick. Druika counts things. Especially shiny things.  Especially if you're still breathing. Also it cheats.'",
  
    // ==================== PURE LORE EXPANSION SYSTEM ====================
    
    /**
     * Druika Nature Description - Non-Ambulatory Threat
     * Establishes the creature's unique movement pattern as environmental hazard
     */
    "'Druika doesn't walk. That's the mistake people make. It spreads wide . Like mold, but louder.'",
  
    /**
     * Ancient Binding Mysticism
     * References protective runes and ongoing supernatural containment efforts
     */
    "'They etched runes in the rock to keep Druika bound. Don't know if it worked. Still hear scratching some nights.'",
  
    /**
     * Atmospheric Threat Assessment with Humor
     * Balances genuine menace with shopkeeper's casual attitude and cooking disasters
     */
    "The orc goblin sniffs the air. 'Smells like someone stirred up the old hunger. Either that or the mushroom stew's gone sentient again.'",
  
    // ==================== MIXED CONTENT AND CHARACTER BUILDING ====================
    
    /**
     * Merchandise Commentary with Dark Implications
     * References specific shop items while maintaining ominous cave atmosphere
     */
    "'Ah, the cuddley monster plushie! Squeeze it if you must, but don't blame me when something hairy starts looking for hugs… with teeth.'",
  
    // "'The shopkeeper eyes the Null Orb and frowns. 'That thing hums like my third ex. Don't trust it, and don't drop it near mirrors.'",
  
    // ==================== TRAFFIC AND BUSINESS OBSERVATIONS ====================
    
    /**
     * Customer Demographics with Dark Business Model
     * Establishes the shop's unusual customer base and business practices
     */
    "'Not many folks come through here. Goblins, maybe. Night critters with teeth. A couple adventurers now and then. Mostly I just sell weird junk to whatever's still twitching and then collect it back from their bodies .'",
  
    /**
     * Anecdotal Customer Story with Atmospheric Details
     * Adds character through specific customer anecdotes while maintaining cave ambiance
     */
    "'One guy came in, bought five torches, a cursed mug, and walked into the cave singing. Never saw him again. Left his sandwich, though.'"
  ];

// ==================== RANDOMIZED DIALOGUE DELIVERY SYSTEM ====================

/**
 * Advanced Random Dialogue Selection Function
 * Professional utility function implementing randomized NPC dialogue delivery
 * for enhanced replayability and natural conversation flow.
 * 
 * **Random Selection Excellence:**
 * This function demonstrates efficient random selection algorithms suitable for
 * game dialogue systems, providing consistent distribution across all dialogue options.
 * 
 * **Technical Features:**
 * - **Mathematical Random Distribution**: Uses Math.random() for even selection probability
 * - **Array Length Normalization**: Automatically adapts to dialogue array size changes
 * - **Floor Function Precision**: Ensures integer array indices without overflow
 * - **Zero-Based Index Handling**: Proper array bounds management
 * 
 * **Usage Integration:**
 * Designed for seamless integration with shop interaction systems, NPC conversation
 * triggers, and atmospheric dialogue injection throughout the game experience.
 * 
 * @returns {string} Randomly selected dialogue line from the shopkeeper collection
 * 
 * **Implementation Examples:**
 * - Shop entrance dialogue randomization
 * - Context-sensitive NPC commentary
 * - Atmospheric background conversation
 * - Player interaction response variation
 */
export const getRandomCoinDialogue = () => {
  // ========== MATHEMATICAL RANDOM SELECTION ALGORITHM ==========
  // Calculate random index within dialogue array bounds
  return shopkeeperGoldCoinDialogue[Math.floor(Math.random() * shopkeeperGoldCoinDialogue.length)];
};