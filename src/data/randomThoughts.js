// ==================== RANDOMTHOUGHTS.JS - PLAYER INTROSPECTION SYSTEM ====================
/**
 * Advanced player psychology and atmospheric enhancement system
 * 
 * This sophisticated system transforms generic quiet moments into rich character
 * development opportunities by providing authentic inner monologue that reveals
 * personality, backstory, motivation, and psychological state. The system creates
 * deeper immersion through realistic stream-of-consciousness thoughts.
 * 
 * Core Features:
 * - **Character Development**: Personal history and motivation revelation
 * - **Atmospheric Enhancement**: Environmental awareness and mood building
 * - **Humor Integration**: Self-deprecating and observational comedy
 * - **Monster Psychology**: Creative speculation about the Druika
 * - **Mission Context**: Emotional stakes and village connection
 * - **Dynamic Delivery**: Varied endings preventing repetition
 * 
 * Technical Architecture:
 * - **Probability-Based Selection**: 50% chance for thoughts vs default message
 * - **Categorized Content**: Organized thoughts for thematic consistency
 * - **Dynamic Combination**: Thought + random ending system
 * - **Immersive Writing**: Authentic psychological realism
 * - **Atmospheric Integration**: Seamless environmental storytelling
 * 
 * @fileoverview Player introspection and atmospheric enhancement system
 */

// ==================== COMPREHENSIVE THOUGHT COLLECTION ====================
/**
 * Multi-dimensional thought catalog with 58 unique player reflections
 * 
 * This extensive collection provides rich character psychology through carefully
 * crafted inner monologue that reveals personality, backstory, motivation, and
 * psychological state. Each category serves specific narrative and atmospheric
 * purposes while maintaining authentic voice consistency.
 * 
 * Psychological Categories:
 * - **Self-Deprecating Humor**: Relatable anxieties and absurd observations
 * - **Environmental Awareness**: Atmospheric and sensory observations
 * - **Personal History**: Character background and relationship development
 * - **Monster Theorizing**: Creative speculation with comedic elements
 * - **Mission Stakes**: Emotional motivation and village connection
 * 
 * Writing Techniques:
 * - **Stream-of-Consciousness**: Natural thought flow patterns
 * - **Humor Balance**: Comedy relief without breaking immersion
 * - **Emotional Depth**: Genuine stakes and character investment
 * - **World-Building**: Village life and quest context integration
 * 
 * @constant {Array<string>} randomThoughts - Collection of 58 unique player thoughts
 */
const randomThoughts = [
  // ==================== HUMOROUS SELF-DEPRECATING THOUGHTS ====================
  /**
   * Relatable anxiety and absurd everyday concerns in extraordinary circumstances
   * 
   * These thoughts provide comic relief while revealing character personality
   * through relatable worries and self-deprecating humor that contrasts with
   * the serious danger of the cave environment.
   */
  "Did I leave the medieval ironing board on?",
  "My torch tax return is definitely overdue now.",
  "I wonder if 'Druika' is its first name or last name?",
  "Did that drunk village elder mention anything about cave bats?",
  "I should have packed more snacks for this adventure.",
  "If I get out alive, I'm definitely asking for a raise.",
  "Next time I'll hire a Druika exterminator and stay home.",
  "Why do magical artifacts always end up in horrifying caves?",
  "I bet the Druika doesn't have to deal with dungeon dampness affecting its joints.",
  "That tavern job is looking pretty good right about now.",
  
  // ==================== ATMOSPHERIC CAVE MUSINGS ====================
  /**
   * Environmental awareness and sensory observations for immersive atmosphere
   * 
   * These thoughts build atmospheric tension and environmental awareness,
   * demonstrating the character's observational skills and creating sensory
   * immersion through detailed cave descriptions and supernatural awareness.
   */
  "The silence here feels almost... deliberate.",
  "I've lost track of time in this endless darkness.",
  "These cave formations must be at least older than my mother-in-law. Thousands of years old",
  "The air feels different in this part of the cave.",
  "Something about the echo in here feels unnatural.",
  "It's strangely peaceful when nothing is trying to eat or envelop me with acid goo.",
  "The weight of the mountain above is almost palpable.",
  "The shadows seem to move differently in this chamber. I hope they don't ask me anything",
  "My torch casts such strange patterns on these walls. Eerie",
  "I've never seen stone formations quite like these before. Except at Uncle Bob's rock collection room",
  "I'd pay good money if this insane cave would stop talking.",
  "When did that horrible wierd music emanating from the cave walls begin?",
  "To whom do I complain too about the service in this cave",
  
  // ==================== CHARACTER BACKGROUND & RELATIONSHIPS ====================
  /**
   * Personal history and emotional connections for character development
   * 
   * These thoughts reveal the character's background, relationships, and
   * emotional stakes, creating investment in the character's survival and
   * success while building the world beyond the cave through personal connections.
   */
  "My mother always said my curiosity would lead me to strange places.",
  "I promised my sister I'd be back for the harvest festival. They like to dress me up in a coccoon",
  "The village elder's warnings echo in my mind.",
  "Maybe father was right about me needing a 'real job'.",
  "I wonder if they're still looking for me back at the village.",
  "Will anyone remember my name if I don't return?",
  "I miss the smell of fresh bread from the village bakery.",
  "I should have said goodbye to Elric before I left.",
  "The artifact better be worth all this trouble.",
  "I hope someone fed my cat while I'm gone.",
  
  // ==================== DRUIKA PSYCHOLOGICAL SPECULATION ====================
  /**
   * Creative monster psychology with humor and humanity
   * 
   * These thoughts demonstrate the character's creative thinking and humor
   * while humanizing the monster threat through imaginative speculation.
   * The emoji usage adds personality while maintaining game atmosphere.
   */
  "What does a Druika eat when adventurers aren't available? 🍕 Cave pizza?",
  "I wonder how old the Druika really is... probably still gets carded at the gift shop 🎂",
  "Does the Druika have a family somewhere? Sunday dinners must be awkward 👨‍👩‍👧‍👦",
  "Maybe the Druika is just misunderstood and needs a hug 🤗 (from very far away)",
  "What if the Druika is also searching for the treasures? 💰 We could split them 70-30... I get 70",
  "The Druika must know these caves better than anyone. Probably has a favorite coffee spot ☕",
  "Are there baby Druika somewhere? Do they play peek-a-boo? 👶 Actually, let's not find out",
  "Perhaps the Druika was human once, before switching to an all-mushroom diet 🍄",
  "I wonder if anyone has ever befriended a Druika. BFF bracelets and everything? 👯‍♂️",
  "What if I'm not hunting the Druika... but we're in an elaborate game of hide-and-seek? 🙈",
  "Does the Druika have hobbies? Knitting? Sudoku? Interpretive dance? 💃",
  "The Druika probably has strong opinions about pineapple on pizza 🍍",
  "I bet the Druika gives terrible Yelp reviews: 'Adventurer was stringy, 2 stars' ⭐",
  "Maybe the Druika just wants someone to play board games with 🎲",
  "Plot twist: What if the Druika is writing thoughts about ME right now? 📝",
  
  // ==================== VILLAGE CURSE & MISSION STAKES ====================
  /**
   * Emotional motivation and mission context for narrative depth
   * 
   * These thoughts maintain connection to the quest's emotional stakes and
   * the character's motivation, ensuring the mission remains personally
   * meaningful rather than abstract treasure hunting.
   */
  "Will finding the treasures truly lift the village's curse?",
  "How many have tried this quest before me?",
  "The drought back home will only worsen if I fail.",
  "The elder's daughter looked so hopeful when I volunteered.",
  "The village needs those artifacts more than ever now.",
  "I can still hear the children coughing from the curse's effects.",
  "That odd merchant warned me about the cave's illusions.",
  "The ancient books mentioned something about the moon's alignment.",
  "Grandfather used to tell stories about these caves.",
  "The village hasn't seen rain in almost a year now."
];

// ==================== DYNAMIC MESSAGE GENERATION SYSTEM ====================
/**
 * Sophisticated probability-based message delivery with dynamic combination system
 * 
 * This advanced function creates varied player introspection by combining random
 * thoughts with varied paranoid endings, providing fresh content even when the
 * same thought is selected. The system balances standard quiet messages with
 * character development opportunities.
 * 
 * Technical Features:
 * - **50/50 Probability**: Balanced delivery between default and thoughts
 * - **Random Selection**: Mathematical randomization for thought variety
 * - **Dynamic Combination**: Thought + ending for maximum content variation
 * - **Authentic Voice**: Stream-of-consciousness writing style
 * - **Paranoia Integration**: Self-aware endings matching cave atmosphere
 * 
 * Psychological Design:
 * - **Realistic Thought Patterns**: Authentic stream-of-consciousness flow
 * - **Self-Awareness**: Meta-commentary about situation and inner monologue
 * - **Anxiety Expression**: Realistic paranoia and nervous humor
 * - **Character Consistency**: Maintained voice and personality throughout
 * 
 * @returns {string} Either default quiet message or dynamic thought combination
 */
const getQuietMessage = () => {
  // === PROBABILITY-BASED SELECTION ===
  // 50% chance to show a random thought, 50% to show default message
  if (Math.random() < 0.5) {
    // Return default message for standard quiet atmosphere
    return 'All seems quiet here.';
  }
  
  // === RANDOM THOUGHT SELECTION ===
  // Mathematical randomization for even distribution across all thoughts
  const randomIndex = Math.floor(Math.random() * randomThoughts.length);
  const thought = randomThoughts[randomIndex];
  
  // ==================== DYNAMIC ENDING SYSTEM ====================
  /**
   * Collection of 20 varied paranoid and self-aware endings
   * 
   * These endings provide authentic nervous humor and self-awareness that
   * matches the character's psychological state in a dangerous environment.
   * Each ending adds personality while maintaining atmospheric tension.
   * 
   * Ending Categories:
   * - **Self-Deprecating**: Humor about inner monologue and situation
   * - **Paranoid Awareness**: Nervous observations about environment
   * - **Meta-Commentary**: Self-aware thoughts about thinking out loud
   * - **Atmospheric Tension**: Maintaining suspense while adding personality
   * - **Nervous Humor**: Authentic anxiety expression through comedy
   */
  const endings = [
    // === SELF-DEPRECATING META-HUMOR ===
    "but what do I know? I'm just talking to myself in a cave that also talks .",
    "...or maybe that's just the echo of my sanity leaving.",
    "I should really stop thinking out loud.",
    "(note to self: stop narrating my own doom)",
    "...did I mention I have trust issues with silence?",
    
    // === ATMOSPHERIC PARANOIA ===
    "though the silence here has a suspicious quality to it.",
    "but my torch keeps flickering like it disagrees.",
    "assuming those aren't teeth I hear chattering in the darkness.",
    "...why did I just hear something giggle?",
    "...wait, did that shadow just move?",
    "...the cave seems to be listening though.",
    "but my paranoia and I respectfully disagree.",
    "...why do I feel like I'm being watched? 👀",
    
    // === NERVOUS HUMOR & JINXING ===
    "at least that's what I keep telling myself.",
    "famous last words, probably.",
    "...aaand now I've jinxed it.",
    "totally not suspicious at all. Nope.",
    "I'm sure everything is PERFECTLY FINE.",
    
    // === PHYSICAL NERVOUS REACTIONS ===
    "* nervously checks over shoulder *",
    "* whistles nervously in the dark *",
  ];

  // === DYNAMIC COMBINATION ===
  // Pick a random ending for maximum content variation
  const randomEnding = endings[Math.floor(Math.random() * endings.length)];
  
  // Return combined thought and ending with natural flow
  return `${thought}, ${randomEnding}`;
};

// ==================== MODULE EXPORT ====================
/**
 * Export the quiet message generator as default export
 * 
 * This function provides rich character development through inner monologue,
 * transforming simple quiet moments into opportunities for atmospheric
 * enhancement, character development, and immersive storytelling.
 * 
 * @function getQuietMessage
 * @returns {string} Dynamic player thought or standard quiet message
 */
export default getQuietMessage;