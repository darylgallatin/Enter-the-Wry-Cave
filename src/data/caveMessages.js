// ==================== CAVEMESSAGES.JS - SARCASTIC CAVE COMMENTARY SYSTEM ====================
/**
 * Advanced humor and atmosphere enhancement system for cave interaction
 * 
 * This sophisticated messaging system provides the cave with a distinct sarcastic
 * personality, delivering context-aware commentary that enhances immersion and
 * provides comic relief during tense gameplay moments. The system combines
 * random humor with intelligent game state analysis for dynamic responses.
 * 
 * Core Features:
 * - **Sarcastic Personality**: Consistent cave character with dark humor
 * - **Context-Aware Responses**: Dynamic messages based on game state
 * - **Progress Integration**: Comments on player achievements and failures
 * - **Emoji Enhancement**: Visual elements adding personality to text
 * - **Narrative Integration**: Respects story progression (wizard freedom)
 * 
 * Technical Architecture:
 * - **Random Selection**: Mathematical randomization for variety
 * - **Game State Analysis**: Multi-factor contextual decision making
 * - **Global State Checking**: Integration with narrative progression flags
 * - **Performance Optimization**: Efficient message selection algorithms
 * - **Extensible Design**: Easy addition of new message categories
 * 
 * @fileoverview Sarcastic cave commentary system with context-aware humor
 */

// ==================== RANDOM CAVE MESSAGE GENERATOR ====================
/**
 * Primary cave message system with 20 sarcastic comments and narrative integration
 * 
 * This function serves as the main source of cave personality, providing a diverse
 * collection of sarcastic, humorous, and atmospheric messages that enhance the
 * game's dark comedy elements. The system respects narrative progression by
 * checking wizard freedom status before delivering messages.
 * 
 * Message Categories:
 * - **Death Predictions**: Dark humor about player survival odds
 * - **Commercial Parodies**: Satirical advertisements and business references
 * - **Statistical Humor**: Fake statistics and probability jokes
 * - **Personal Life Satire**: Humorous references to outside world
 * - **Meta-Gaming Jokes**: Self-aware commentary about adventure game tropes
 * 
 * Technical Features:
 * - **Wizard Integration**: Checks global WIZARD_FREED flag for narrative respect
 * - **Random Selection**: Mathematical floor function for even distribution
 * - **Emoji Enhancement**: Visual personality elements throughout messages
 * - **Return Handling**: Null return when wizard freed to stop commentary
 * 
 * @returns {string|null} Random sarcastic cave message or null if wizard freed
 */
export const getRandomCaveMessage = () => {
  // === NARRATIVE PROGRESSION CHECK ===
  // Check if wizard has been freed - no more cave messages after story resolution
  if (window.WIZARD_FREED) {
    return null; // No more cave messages
  }
  
  // === COMPREHENSIVE SARCASTIC MESSAGE COLLECTION ===
  const caveMessages = [
    // === DEATH PREDICTION HUMOR ===
    "Oh, you're still alive? I had 50 gold riding on you falling in a pit by now. 🎲",
    "Fun fact: You're the 47th person to enter this room. The other 46? Let's not talk about them... 💀",
    "The cave bookies are taking bets on your demise. Pit death is 3:1, Druika is 2:1. 📊",
    "Breaking news: Local Druika voted 'Most Likely to Eat You' three years running! 🏆",
    "Cave tip #73: That sound behind you? Probably nothing. Definitely not teeth. 😬",
    "Status update: You've walked 2,847 steps today. The Druika? Only 6. It's gaining. 👣",
    "Weather alert: Chance of survival dropping faster than cave temperature. ❄️",
    "Survey says: 9 out of 10 caves prefer their adventurers lightly seasoned. 🧂",
    "The bats have started a betting pool. You lasting another hour is 10:1 odds. 🦇",
    
    // === COMMERCIAL PARODY HUMOR ===
    "ADVERTISEMENT: Visit Throk's Gift Shop! Our t-shirts outlast most adventurers! 🛍️",
    "SALE! Grok's Gift Shop: 20% off 'I Almost Survived' memorial plaques! 🪦",
    "PSA: The gift shop now accepts IOUs from 'probably doomed' adventurers! 💳",
    "Remember: If you die,Throk gets your stuff. It's in the fine print. 📜",
    
    // === PERSONAL LIFE SATIRE ===
    "Your spouse called. They're redecorating your room into a yoga studio. 🧘‍♀️",
    "Your mother sent a message: 'Are you eating enough? The Druika looks well-fed.' 🍽️",
    "Your life insurance company wants to discuss your 'high-risk lifestyle choices.' 📋",
    "I bet you used to work in tin-can telecom or IT didn't you? Did you try turning it off and back on?' 💻",
    
    // === WEATHER & ATMOSPHERIC HUMOR ===
    "Weather update: 100% chance of darkness with a strong possibility of teeth. 🌧️",
    "Today's horoscope: Avoid tall dark strangers. Especially hairy ones with claws. ♈",
    
    // === META-GAMING & REVIEW HUMOR ===
    "Did you know? This cave has a 1-star Yelp review. Something about 'too many deaths.' ⭐",
    "Your torch insurance company called. They're denying your claim. 🔥",
  ];
  
  // === RANDOM MESSAGE SELECTION ===
  // Mathematical randomization for even distribution across all messages
  return caveMessages[Math.floor(Math.random() * caveMessages.length)];
};

// ==================== SPECIALIZED MESSAGE CATEGORIES ====================
/**
 * Curated message collections for specific thematic content
 * 
 * These specialized arrays provide focused humor categories that can be used
 * for specific contexts or situations. They demonstrate the extensible nature
 * of the messaging system and provide examples for future content expansion.
 * 
 * Categories:
 * - **Death Predictions**: Direct survival probability humor
 * - **Gift Shop Advertisements**: Commercial parody messaging
 * 
 * @exports Specialized message arrays for focused humor delivery
 */

// === DEATH PREDICTION COLLECTION ===
/**
 * Focused collection of survival probability humor
 * Direct and dark predictions about player longevity
 */
export const deathPredictions = [
  "I give you 10 more minutes. 15 if you're lucky.",
  "The smart money says you won't see tomorrow.",
  "Even the bats are making funeral arrangements.",
];

// === GIFT SHOP ADVERTISEMENT COLLECTION ===
/**
 * Commercial parody messages for humorous atmosphere
 * Satirical business references and adventure game commerce humor
 */
export const giftShopAds = [
  "Throk's Gift Shop: Where your gold goes when you don't!",
  "NEW at Throk's: 'My parent went to a cursed cave and all I got was this orphan status' shirts!",
  "Throk's having a sale: Buy 2 souvenirs, get a free eulogy!",
];

// ==================== CONTEXTUAL CAVE MESSAGE SYSTEM ====================
/**
 * Advanced context-aware messaging engine with comprehensive game state analysis
 * 
 * This sophisticated function analyzes multiple aspects of the current game state
 * to deliver contextually appropriate humor and commentary. It demonstrates
 * advanced game programming by integrating inventory analysis, progress tracking,
 * equipment status, and narrative progression into a cohesive response system.
 * 
 * Analysis Categories:
 * - **Light Source Management**: Torch levels, lantern status, backup supplies
 * - **Progress Tracking**: Move counters and treasure collection ratios
 * - **Equipment Analysis**: Inventory scanning for relevant items
 * - **Survival Assessment**: Multi-factor risk evaluation
 * - **Narrative Respect**: Integration with story progression flags
 * 
 * Technical Features:
 * - **Multi-Factor Analysis**: Sophisticated game state evaluation
 * - **Equipment Detection**: Advanced inventory scanning algorithms
 * - **Progress Mathematics**: Ratio calculations for treasure completion
 * - **Debug Integration**: Comprehensive logging for development
 * - **Fallback Architecture**: Graceful degradation to random messages
 * 
 * @param {Object} gameState - Comprehensive game state object for analysis
 * @param {number} gameState.torchLevel - Current torch fuel level (0-100)
 * @param {number} gameState.moveCounter - Number of moves player has made
 * @param {Array} gameState.inventory - Player's current inventory items
 * @param {Array} gameState.collectedTreasures - List of treasures found
 * @param {Array} gameState.treasurePieces - Total available treasures
 * @returns {string|null} Context-appropriate message or null for random selection
 */
export const getContextualCaveMessage = (gameState) => {
  // === GAME STATE DESTRUCTURING ===
  const { torchLevel, moveCounter, inventory, collectedTreasures, treasurePieces } = gameState;

  // === NARRATIVE PROGRESSION CHECK ===
  // Check if wizard has been freed - respect story progression
  if (window.WIZARD_FREED) {
    return null; // No more cave messages
  }
  
  // === ADVANCED EQUIPMENT ANALYSIS ===
  /**
   * Sophisticated lantern detection with multi-criteria validation
   * 
   * This analysis checks for active lanterns with fuel, providing comprehensive
   * equipment status for intelligent message selection. It demonstrates advanced
   * inventory management and equipment state tracking.
   */
  const hasActiveLantern = inventory.some(item => 
    (item.originalId || item.id) === 'lantern' && item.isActive && item.fuel > 0
  );
  
  // === COMPREHENSIVE DEBUG LOGGING ===
  /**
   * Development-focused logging system for context analysis debugging
   * 
   * Provides detailed insight into decision-making process and game state
   * factors being considered for message selection.
   */
  console.log("CAVE MESSAGE - Checking context:", {
    torchLevel,
    hasActiveLantern,
    moveCounter,
    hasOil: inventory.some(item => (item.originalId || item.id) === 'torch_oil'),
    treasureProgress: `${collectedTreasures.length}/${treasurePieces.length}`
  });
  
  // ==================== CRITICAL LIGHT SOURCE ANALYSIS ====================
  /**
   * Emergency lighting situation detection with multi-equipment consideration
   * 
   * Handles critically low torch levels while accounting for backup lantern
   * equipment. Provides urgent survival advice with characteristic humor.
   */
  if (torchLevel <= 15 && !hasActiveLantern) {
    console.log("CAVE MESSAGE - Torch critically low, no lantern");
    const darkMessages = [
      "Dying in the dark? How original. The last 12 adventurers tried that too. 🕯️",
      "Pro tip: Torches work better when they're actually lit. Just saying. 💡",
      "I'd offer you a light, but I'm a cave. I don't have thumbs. 🔦",
    ];
    return darkMessages[Math.floor(Math.random() * darkMessages.length)];
  }
  
  // === EQUIPMENT TRANSITION HUMOR ===
  /**
   * Special commentary for torch-to-lantern equipment transitions
   * 
   * Recognizes when players have upgraded their lighting equipment and
   * provides appropriately sarcastic commentary about the improvement.
   */
  if (torchLevel === 0 && hasActiveLantern) {
    console.log("CAVE MESSAGE - Torch out but lantern active");
    const lanternMessages = [
      "Fancy magical lantern you've got there. Compensating for something? 🏮",
      "Oh look, someone brought their night light. How precious. 🏮",
      "That glowing bauble won't save you from what's coming. But it's pretty! ✨",
    ];
    return lanternMessages[Math.floor(Math.random() * lanternMessages.length)];
  }
  
  // === MODERATE LIGHT CONCERN MESSAGING ===
  /**
   * Warning system for declining torch levels without backup equipment
   * 
   * Provides early warning humor for players approaching lighting crises
   * while maintaining the cave's sarcastic personality.
   */
  if (torchLevel < 60 && !hasActiveLantern) {
    console.log("CAVE MESSAGE - Torch getting low");
    const lowTorchMessages = [
      "I see you're going for the 'dying in the dark' achievement. Bold choice! 🕯️",
      "Your torch is dimmer than your future. Impressive! 🕯️",
      "Running low on light? The Druika prefers its meals in the dark anyway. 🌑",
    ];
    return lowTorchMessages[Math.floor(Math.random() * lowTorchMessages.length)];
  }
  
  // ==================== PROGRESS MILESTONE COMMENTARY ====================
  /**
   * Achievement-based messaging system with milestone recognition
   * 
   * Tracks player progress through move counting and provides increasingly
   * impressed (but still sarcastic) commentary as survival time increases.
   */
  
  // === HIGH PROGRESS MILESTONE ===
  if (moveCounter > 30) {
    console.log("CAVE MESSAGE - High move count (30+)");
    return "30 moves and still alive? The cave elders owe me money. 💸";
  } 
  
  // === MEDIUM PROGRESS MILESTONE ===
  else if (moveCounter > 20) {
    console.log("CAVE MESSAGE - Medium move count (20+)");
    return "20 moves already? Most people don't last this long. I'm almost impressed. Almost. 🎯";
  }
  
  // ==================== TREASURE PROGRESS ANALYSIS ====================
  /**
   * Mathematical treasure completion tracking with ratio-based messaging
   * 
   * Analyzes treasure collection progress using mathematical ratios to
   * determine completion percentage and provide appropriate commentary
   * for players approaching victory conditions.
   */
  const treasureRatio = treasurePieces.length > 0 ? collectedTreasures.length / treasurePieces.length : 0;
  if (treasureRatio > 0.5 && treasureRatio < 1) {
    console.log("CAVE MESSAGE - Treasure progress over 50%");
    return `Over halfway done with treasures? Don't get cocky. That's when they usually die. 💎`;
  }
  
  // ==================== COMPREHENSIVE SUPPLY ANALYSIS ====================
  /**
   * Multi-equipment supply shortage detection system
   * 
   * Analyzes multiple equipment factors simultaneously to identify dangerous
   * supply situations where players lack both primary and backup lighting
   * solutions along with emergency supplies.
   */
  const hasOil = inventory.some(item => (item.originalId || item.id) === 'torch_oil');
  if (torchLevel < 50 && !hasOil && !hasActiveLantern) {
    console.log("CAVE MESSAGE - Low torch, no oil, no lantern");
    return "No torch oil? No backup light? Living dangerously, I see. The darkness approves. 🛢️";
  }
  
  // === FALLBACK TO RANDOM SELECTION ===
  /**
   * Graceful degradation to random message system
   * 
   * When no specific contextual conditions are met, the system gracefully
   * falls back to the random message generator, ensuring consistent
   * personality delivery regardless of game state.
   */
  console.log("CAVE MESSAGE - No special context found");
  return null; // Triggers random message selection in calling code
};