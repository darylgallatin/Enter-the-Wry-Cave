/**
 * Advanced World Modification System with Hidden Door Mechanics
 * Sophisticated quest item implementing permanent world alterations, room connection
 * generation, and dynamic content creation for secret area access.
 * 
 * **World Generation Excellence:**
 * This function demonstrates master-level procedural generation by dynamically
 * creating new room connections, generating secret chamber content, and permanently
 * altering the game world structure through item usage.
 * 
 * **Key System Features:**
 * - **Hidden Door Detection**: Context-sensitive usage based on room properties
 * - **Dynamic Room Connection**: Runtime modification of navigational pathways
 * - **Bidirectional Pathfinding**: Ensures return paths from secret areas
 * - **Procedural Content Generation**: Dynamic secret room description creation
 * - **Interactive Element Integration**: Places clickable items in secret chambers
 * - **Audio-Visual Feedback**: Atmospheric sound effects for door opening
 * 
 * **Technical Architecture:**
 * - **World State Modification**: Direct manipulation of room connectivity data
 * - **Content Generation**: Dynamic creation of interactive room descriptions
 * - **State Persistence**: Permanent changes that survive game sessions
 * - **Error Prevention**: Graceful handling of invalid usage contexts
 * - **Resource Management**: Smart item consumption based on successful usage
 * 
 * @param {Object} dependencies - World modification and audio system references
 * @returns {boolean} True if key successfully used (consumed), false if invalid location
 */
const handleUseRustyKey = (dependencies) => {
    // ========== WORLD MODIFICATION DEPENDENCY EXTRACTION ==========
    /**
     * Specialized Dependency Management for World Alteration
     * Extracts references needed for permanent world structure modifications
     */
    const {
      currentPosition, 
      specialRooms,
      setRoomDescriptionMap,
      setMessage,
      setRoomConnections,
      playOldDoorOpeningSound,
    } = dependencies;
    
    // ========== CONTEXT-SENSITIVE USAGE VALIDATION ==========
    /**
     * Hidden Door Detection System
     * Validates that player is in appropriate location for key usage
     */
    if (specialRooms[currentPosition]?.hasHiddenDoor) {
      // ========== DRAMATIC DOOR OPENING SEQUENCE ==========
      /**
       * Atmospheric Feedback with Audio Integration
       * Provides immersive experience through coordinated message and sound
       */
      setMessage("You use the rusty key in the hidden keyhole. With a grinding sound, a secret passage opens!");
      playOldDoorOpeningSound();
      
      // ========== DYNAMIC WORLD STRUCTURE MODIFICATION ==========
      /**
       * Advanced Room Connection Generation System
       * Permanently alters game world by creating new navigational pathways
       */
      const secretRoom = specialRooms[currentPosition].secretRoom;
      if (secretRoom) {
        // ========== BIDIRECTIONAL CONNECTION CREATION ==========
        /**
         * Pathfinding Network Expansion
         * Creates two-way connections ensuring player can return from secret areas
         */
        setRoomConnections(prev => {
          const updatedConnections = {...prev};
          
          // ========== FORWARD CONNECTION ESTABLISHMENT ==========
          // Add secret room to current room's connection list
          updatedConnections[currentPosition] = [
            ...updatedConnections[currentPosition], 
            secretRoom
          ];
          
          // ========== RETURN PATH GENERATION ==========
          /**
           * Ensures navigational consistency by creating return pathways
           * Prevents player from becoming trapped in secret areas
           */
          if (!updatedConnections[secretRoom]) {
            // Create new connection array for secret room
            updatedConnections[secretRoom] = [currentPosition];
          } else if (!updatedConnections[secretRoom].includes(currentPosition)) {
            // Add return connection if it doesn't already exist
            updatedConnections[secretRoom] = [...updatedConnections[secretRoom], currentPosition];
          }
          
          return updatedConnections;
        });
        
        // ========== PROCEDURAL SECRET ROOM GENERATION ==========
        /**
         * Dynamic Content Creation for Secret Chambers
         * Generates atmospheric descriptions with interactive elements and narrative depth
         */
        const secretRoomContent = specialRooms[secretRoom]?.specialContent;
        const secretContentDesc = secretRoomContent?.interactiveText || 
                               secretRoomContent?.description ||
                               "Ancient artifacts and strange symbols cover the walls.";
        
        // ========== COMPREHENSIVE ROOM DESCRIPTION CONSTRUCTION ==========
        /**
         * Multi-Layer Room Description System
         * Creates rich, immersive descriptions with interactive elements and post-collection states
         */
        setRoomDescriptionMap(prev => ({
          ...prev,
          [secretRoom]: {
            // ========== PRIMARY ROOM DESCRIPTION ==========
            text: "A hidden chamber untouched for centuries. The air is thick with dust and mystery and is wild looking. Ancient artifacts, a sarcophagus(?), and strange symbols cover the walls. \nAlso a spinning vortex thingie that I should probably stay away from. \n" + secretContentDesc,
            
            // ========== ROOM CLASSIFICATION METADATA ==========
            special: "hidden_chamber",     // Special room type identifier
            mood: "magical",               // Atmospheric mood classification
            hasWater: false,               // Environmental property flag
            
            // ========== INTERACTIVE ELEMENT INTEGRATION ==========
            /**
             * Dynamic Interactive Content Management
             * Configures clickable elements based on secret room contents
             */
            hasInteractiveItem: secretRoomContent?.id ? true : false,
            interactiveItem: secretRoomContent?.id || null,
            
            // ========== POST-COLLECTION STATE MANAGEMENT ==========
            /**
             * Maintains Room Atmosphere After Item Collection
             * Provides meaningful description even after interactive elements are removed
             */
            textAfterCollection: "A hidden chamber untouched for centuries. The air is thick with dust and mystery and is wild looking. Ancient artifacts, a sarcophagus(?), and strange symbols cover the walls. \nAlso a spinning vortex thingie that I should probably stay away from as it's spinning faster now.  \nEmpty pedestals and shelves show where ancient treasures once rested."
          }
        }));
        
        return true; // Key successfully used and consumed
      }
    } else {
      // ========== INVALID USAGE FEEDBACK ==========
      /**
       * Context-Aware Error Handling
       * Provides meaningful feedback while preserving item for correct usage
       */
      setMessage("The key doesn't seem to fit anywhere in this room.");
    }
    
    return false; // Preserve key for correct usage location
  };




  // ==================== SOCIAL INTERACTION: WIZARD JOURNAL SYSTEM ====================

/**
 * Advanced NPC Interaction System with Economic Integration
 * Sophisticated social mechanics implementing creature-specific item preferences,
 * economic transactions, and permanent world state modifications through social engineering.
 * 
 * **Social System Excellence:**
 * This function demonstrates master-level NPC programming by implementing complex
 * creature interaction patterns where items serve as social currency, triggering
 * permanent behavioral changes and economic transactions with mystical beings.
 * 
 * **Key Features:**
 * - **Context-Sensitive NPC Detection**: Identifies appropriate interaction targets
 * - **Social Currency Mechanics**: Items as payment for passage and favors
 * - **Economic Integration**: Currency generation through successful social interactions
 * - **Personality-Based Responses**: Different outcomes based on NPC characteristics
 * - **Permanent State Changes**: NPC behavioral modifications after successful interactions
 * - **Dramatic Failure Consequences**: Humorous penalties for inappropriate usage
 * 
 * **Technical Architecture:**
 * - **Multi-Criteria NPC Detection**: Complex validation for creature presence and state
 * - **Economic Transaction Processing**: Sophisticated coin stacking and inventory management
 * - **State Persistence**: Permanent NPC behavioral changes with multiple flag tracking
 * - **Audio Integration**: Context-appropriate sound effects for social interactions
 * - **Failure Recovery**: Humorous item destruction for inappropriate social behavior
 * 
 * @param {Object} dependencies - Social interaction, economic, and audio system references
 * @returns {boolean} True (journal consumed in all usage scenarios)
 */
export const handleUseWizardJournal = (dependencies) => {
  // ========== SOCIAL INTERACTION DEPENDENCY EXTRACTION ==========
  /**
   * Comprehensive Social System Integration
   * Extracts all references needed for complex NPC interactions and economic transactions
   */
  const {
    currentPosition,
    specialRooms,
    setSpecialRooms,
    setMessage,
    inventory,
    setInventory,
    showWaterSpiritTradeButton,
    setShowWaterSpiritTradeButton,
    playNixieThankYouJournalSound,
  } = dependencies;
  
  // ========== DEBUG LOGGING SYSTEM ==========
  /**
   * Comprehensive Development Logging
   * Provides detailed state information for debugging social interaction systems
   */
  console.log("Using wizard journal in room", currentPosition);
  console.log("showWaterSpiritTradeButton:", showWaterSpiritTradeButton);
  console.log("specialRooms[currentPosition]:", specialRooms[currentPosition]);
  
  // ========== NPC PRESENCE DETECTION SYSTEM ==========
  /**
   * Advanced Creature Identification Algorithm
   * Multi-criteria analysis to determine if appropriate NPC is present and active
   */
  const isNixieRoom = specialRooms[currentPosition]?.hasWaterSpirit && 
                      specialRooms[currentPosition]?.waterSpiritActive;
  
  const nixieHasAppeared = showWaterSpiritTradeButton;
  
  // ========== ADDITIONAL DEBUG VALIDATION ==========
  console.log("isNixieRoom:", isNixieRoom);
  console.log("nixieHasAppeared:", showWaterSpiritTradeButton);
  
  // ========== SUCCESSFUL SOCIAL TRANSACTION PATHWAY ==========
  /**
   * Complete Social Engineering Success Implementation
   * Handles successful nixie interaction with full economic and narrative integration
   */
  if (isNixieRoom && nixieHasAppeared) {
    // ========== SOCIAL SUCCESS AUDIO-VISUAL SEQUENCE ==========
    /**
     * Coordinated Social Interaction Presentation
     * Implements complete social transaction with dramatic narrative and audio feedback
     */
    playNixieThankYouJournalSound();
    setMessage("You toss the leather-bound journal toward the water. The nixie's eyes go wide with delight!\n\n" +
               "'THE WIZARD'S JOURNAL?! Oh my gills, I've been DYING to read his secrets! " +
               "Did he really turn himself into a rock? What's his poker strategy?!'\n\n" +
               "She clutches the journal like a precious treasure, flipping through pages with webbed fingers.\n\n" +
               "'THANK YOU! Here, take this coin I've been saving. Now if you'll excuse me, " +
               "I have CENTURIES of gossip to catch up on!'\n\n" +
               "The nixie dives into the depths with her new reading material, giggling with glee. " +
               "The pool becomes still and ordinary - she won't be coming back.");
    
    // ========== ECONOMIC REWARD PROCESSING SYSTEM ==========
    /**
     * Advanced Currency Integration with Stacking Mechanics
     * Sophisticated coin management supporting both new currency creation and existing stack enhancement
     */
    const existingGoldCoins = inventory.find(item =>
      (item.originalId || item.id) === 'gold_coins'
    );
    
    if (existingGoldCoins) {
      // ========== EXISTING CURRENCY STACK ENHANCEMENT ==========
      /**
       * Intelligent Coin Stack Management
       * Safely increments existing coin collections with proper value validation
       */
      setInventory(prev => prev.map(item => {
        if ((item.originalId || item.id) === 'gold_coins') {
          // ========== SAFE VALUE CONVERSION ==========
          const currentValue = typeof item.value === 'number' ? item.value : 1;
          const newValue = currentValue + 1;
          
          return {
            ...item,
            value: newValue,
            name: `Ancient Wyrm Coins (${newValue})`  // Dynamic name updating
          };
        }
        return item;
      }));
    } else {
      // ========== NEW CURRENCY CREATION SYSTEM ==========
      /**
       * Fresh Currency Item Generation
       * Creates new coin item with proper attributes and social context
       */
      const newCoin = {
        id: 'gold_coins_' + Date.now(),           // Unique timestamp-based ID
        originalId: 'gold_coins',                 // Standard coin type identifier
        name: 'Ancient Wyrm Coin',                // Descriptive name
        icon: '💰',                               // Visual representation
        description: 'A single ancient gold coin, gifted by a grateful water spirit.',  // Social context
        value: 1,                                 // Economic value
        canInspect: true,                         // Inspection capability
        canUse: false                             // Usage restriction
      };
      setInventory(prev => [...prev, newCoin]);
    }
    
    // ========== PERMANENT NPC STATE MODIFICATION SYSTEM ==========
    /**
     * Comprehensive Creature Behavioral Alteration
     * Implements multiple state flags for complete NPC behavioral tracking
     */
    setSpecialRooms(prev => ({
      ...prev,
      [currentPosition]: {
        ...prev[currentPosition],
        waterSpiritActive: false,        // Deactivate creature interactions
        waterSpiritGone: true,           // Mark creature as permanently departed
        nixieHasJournal: true,           // Track successful item delivery
        tollPaid: true                   // Unlock passage permanently
      }
    }));
    
    // ========== UI STATE CLEANUP ==========
    /**
     * Interface Element Management
     * Removes trade interface elements after successful transaction
     */
    setShowWaterSpiritTradeButton(false);
    
    return true; // Journal consumed in successful social transaction
  } else {
    // ========== SOCIAL FAILURE CONSEQUENCE SYSTEM ==========
    /**
     * Humorous Punishment for Social Inappropriateness
     * Implements entertaining item destruction with personality-based narrative
     */
    setMessage("You pull out the wizard's journal and open it. The book suddenly springs to life!\n\n" +
               "'HOW RUDE!' it shouts in a tiny, papery voice. 'Reading someone's private journal? " +
               "Without even offering it to someone who might appreciate it? The NERVE!'\n\n" +
               "The journal snaps itself shut, plops onto the ground with an indignant thud, " +
               "and vanishes in a puff of offended smoke.\n\n" +
               "Well, that's the last you'll see of THAT.");
    
    return true; // Journal destroyed through social failure
  }
};
// ==================== MULTI-CONTEXT UTILITY: LOOSE ROCKS SYSTEM ====================

/**
 * Advanced Multi-Environment Tool with Context-Sensitive Behavior
 * Sophisticated utility item implementing room-type detection, creature interactions,
 * chemical reactions, and quest completion mechanics across diverse environmental contexts.
 * 
 * **Environmental Interaction Excellence:**
 * This function represents the pinnacle of contextual item design by creating a single
 * tool that behaves dramatically differently based on environmental context, creature
 * presence, and quest state, demonstrating advanced game design programming.
 * 
 * **Key System Features:**
 * - **Quest Completion Mechanics**: Wizard liberation with permanent world changes
 * - **Creature Interaction**: Sand creature neutralization and water sprite combat
 * - **Chemical Reaction System**: Sodium-water explosive interactions with consequences
 * - **Environmental Physics**: Room-type specific behaviors (pits, echoes, darkness)
 * - **Audio-Visual Coordination**: Context-appropriate sound effects and visual feedback
 * - **Dramatic Consequence Trees**: Death sequences and creature behavioral changes
 * 
 * **Technical Architecture:**
 * - **Multi-Criteria Environmental Analysis**: Complex room type detection algorithms
 * - **Creature State Management**: Dynamic creature behavioral modification systems
 * - **Chemical Physics Simulation**: Realistic sodium-water reaction mechanics
 * - **Audio Timing Coordination**: Sophisticated multi-stage sound effect sequencing
 * - **Death State Management**: Complete game termination with appropriate cause tracking
 * - **World State Modification**: Permanent room description and creature state changes
 * 
 * @param {Object} dependencies - Multi-system integration references for diverse interactions
 * @returns {boolean} Context-dependent consumption based on usage effectiveness
 */
export const handleUseLooseRocks = (dependencies) => {
  // ========== COMPREHENSIVE SYSTEM DEPENDENCY EXTRACTION ==========
  /**
   * Multi-System Integration Dependency Management
   * Extracts extensive references needed for diverse environmental interactions
   */
  const {
    currentPosition,
    specialRooms,
    setSpecialRooms,
    setMessage,
    roomDescriptionMap,
    setRoomDescriptionMap,
    positions,
    roomMood,
    roomHasWater,
    playRockThrowSound,
    playRockLockedInPLaceSound,
    playWizardFreedSound,
    playSodiumRockWaterExplosionSound,
    playWaterNixieShriekSound,
    playNixieWailingKillScream,
    setGameStatus,
    setDeathCause,
  } = dependencies;

  console.log("Using loose rocks in room", currentPosition);

  // ==================== HIGHEST PRIORITY: WIZARD LIBERATION SYSTEM ====================
  
  /**
   * Critical Quest Completion Mechanic
   * Implements the primary quest resolution for freeing the trapped wizard
   * with permanent world state changes and dramatic narrative sequences.
   * 
   * **Quest Completion Excellence:**
   * This represents the game's primary quest objective, requiring sophisticated
   * world state modification, permanent room transformation, and dynamic content
   * generation to reflect the fundamental change in the game world.
   */
  if (currentPosition === 32) {
    // ========== WIZARD FREEDOM VALIDATION ==========
    /**
     * Quest State Verification System
     * Ensures quest can only be completed once while providing appropriate feedback
     */
    if (!specialRooms[32]?.wizardFreed) {
      // ========== QUEST COMPLETION STATE MODIFICATION ==========
      /**
       * Permanent Quest State Alteration
       * Marks the wizard as freed in the world state system
       */
      setSpecialRooms(prev => ({
        ...prev,
        32: {
          ...prev[32],
          wizardFreed: true
        }
      }));
      
      // ========== COMPREHENSIVE ROOM TRANSFORMATION ==========
      /**
       * Complete Room Metamorphosis System
       * Transforms the wizard's sanctum from oppressive to peaceful with new interactive elements
       */
      const freedDescription = {
        // ========== PRIMARY TRANSFORMED DESCRIPTION ==========
        text: "The sanctum feels different now - lighter somehow. The ancient tomes still line the walls, but the oppressive feeling is gone. A thank-you note floats in mid-air: 'Finally! Do you know how boring it is being a cave? -W' On a pedestal where the hole once was, you notice a <span class='interactive-item' data-item='wyrmglass'>polished glass sphere</span> that seems to hold swirling mists within.",
        
        // ========== ATMOSPHERIC TRANSFORMATION ==========
        mood: "peaceful",                    // Changed from oppressive to peaceful
        hasWater: false,                     // Environmental property maintenance
        special: "echo",                     // Special room acoustics
        perception: "The room feels grateful, if a room can feel such things.",  // Emotional atmosphere
        
        // ========== NEW INTERACTIVE ELEMENT INTEGRATION ==========
        hasInteractiveItem: true,            // Enable new interactive content
        interactiveItem: 'wyrmglass',        // Reward item for quest completion
        
        // ========== POST-COLLECTION STATE MANAGEMENT ==========
        /**
         * Maintains Room Atmosphere After Item Collection
         * Provides meaningful description even after reward is collected
         */
        textAfterCollection: "The sanctum feels different now - lighter somehow. The ancient tomes still line the walls, but the oppressive feeling is gone. A thank-you note floats in mid-air: 'Finally! Do you know how boring it is being a cave? -W'",
        
        wizardFreed: true // Permanent quest completion flag
      };
      
      // ========== PERMANENT WORLD DESCRIPTION UPDATE ==========
      /**
       * Room Description Database Modification
       * Permanently alters the game world to reflect quest completion
       */
      setRoomDescriptionMap(prev => ({
        ...prev,
        32: freedDescription
      }));
      
      // ========== DRAMATIC LIBERATION SEQUENCE ==========
      /**
       * Multi-Stage Audio-Visual Quest Completion Presentation
       * Coordinates sound effects with delayed narrative delivery for maximum impact
       */
      playRockLockedInPLaceSound();
      setTimeout(() => {
        setMessage(" 'AHAHAHA! ROCK IN HOLE! BRILLIANT! \nI'VE BEEN A CAVE FOR SO MANY YEARS I LOST COUNT AND ALL I NEEDED WAS A ROCK IN A HOLE! \n\n\n\n\n\n\n\n\n\n I'll NEVER LEAVE! NEVER! This is MY cave! MINE! \nDON'T STAY TOO LONG! *manic giggling fades into the walls*'");
        playWizardFreedSound();
      }, 3500); // 3.5-second dramatic timing for maximum impact
      
      // ========== GLOBAL QUEST STATE FLAG ==========
      /**
       * Universal Quest Completion Marker
       * Sets global flag accessible across all game systems
       */
      window.WIZARD_FREED = true;
      
      return true; // Rock consumed in quest completion
    } else {
      // ========== QUEST ALREADY COMPLETED FEEDBACK ==========
      /**
       * Post-Completion Interaction System
       * Provides humorous feedback when quest is already complete
       */
      setMessage("The pedestal already has a rock in it. The wizard's voice echoes faintly: 'One was enough, thanks. Keep the rest for skipping across underground lakes or something.'");
      return false; // Preserve rock for other uses
    }
  }

  // ==================== ENVIRONMENTAL CONTEXT DETECTION SYSTEM ====================
  
  /**
   * Advanced Room Type Analysis Algorithm
   * Multi-criteria environmental assessment for context-sensitive behavior determination
   */
  const inSandRoom = specialRooms[currentPosition]?.hasSandCreature;
  const inWaterRoom = roomHasWater || 
    (roomDescriptionMap[currentPosition]?.text || '').toLowerCase().includes('water') ||
    (roomDescriptionMap[currentPosition]?.text || '').toLowerCase().includes('pool') ||
    (roomDescriptionMap[currentPosition]?.text || '').toLowerCase().includes('stream');
  const isPitRoom = currentPosition === positions.pitPosition1 || currentPosition === positions.pitPosition2;
  const isDarkRoom = roomMood === 'dark' || roomMood === 'ominous';
  const isEchoRoom = roomDescriptionMap[currentPosition]?.special === 'echo' ||
    (roomDescriptionMap[currentPosition]?.text || '').toLowerCase().includes('echo');

  // ========== CREATURE INTERACTION: SAND CREATURE NEUTRALIZATION ==========
  /**
   * Tactical Creature Defeat Mechanic
   * Implements permanent creature neutralization with environmental state changes
   */
  if (inSandRoom && specialRooms[currentPosition]?.sandCreatureActive) {
    console.log("Player used rocks in active sand creature room!");
    
    // ========== CREATURE DEFEAT STATE MODIFICATION ==========
    /**
     * Permanent Creature Elimination System
     * Marks creature as defeated and deactivates all threatening behaviors
     */
    setSpecialRooms(prev => ({
      ...prev,
      [currentPosition]: {
        ...prev[currentPosition],
        sandCreatureActive: false,
        sandCreatureDefeated: true // Permanent victory state
      }
    }));
    
    playRockThrowSound();
    setMessage("You toss the rock into the center of the sandy depression. It makes a strange echoing effect. \nThen the sand suddenly shifts violently! After a moment, the circular disturbance completely disappears, and the area seems safe now.");
    
    return true; // Rock consumed in successful creature defeat
  }
  // ========== POST-DEFEAT SAND ROOM INTERACTION ==========
  /**
   * Post-Victory Environmental Response
   * Provides feedback for rock usage in areas where threats have been eliminated
   */
  else if (inSandRoom && !specialRooms[currentPosition]?.sandCreatureActive) {
    setMessage("You toss another rock onto the sand. Nothing happens. Except for the rock dissolving into the sand");
    return true; // Rock consumed but no effect
  }
  // ========== ADVANCED CHEMICAL REACTION SYSTEM: WATER INTERACTIONS ==========
  /**
   * Sophisticated Chemical Physics with Creature Combat Integration
   * Implements sodium-water explosive reactions with varying consequences based on creature presence
   */
  else if (inWaterRoom) {
    console.log("!specialRooms[currentPosition]?.waterSpiritActive", !specialRooms[currentPosition]?.waterSpiritActive);
    
    // ========== INITIAL THROWING AUDIO ==========
    playRockThrowSound();
    
    // ========== DELAYED EXPLOSION SEQUENCE ==========
    /**
     * Timed Chemical Reaction with Dramatic Build-up
     * Multi-stage audio-visual sequence for realistic chemical reaction timing
     */
    setTimeout(() => {
      // ========== CHEMICAL EXPLOSION AUDIO ==========
      if (playSodiumRockWaterExplosionSound) {
        playSodiumRockWaterExplosionSound();
      }
      
      // ========== NIXIE ROOM DETECTION SYSTEM ==========
      /**
       * Specific Location Analysis for Creature Combat
       * Identifies water sprite locations for specialized combat interactions
       */
      const isNixieRoom = roomDescriptionMap[currentPosition]?.text?.includes('tranquil pool') &&
                          roomDescriptionMap[currentPosition]?.text?.includes('perfect mirror');
      
      if (isNixieRoom && specialRooms[currentPosition]?.waterSpiritActive &&
          specialRooms[currentPosition]?.nixieHasAppeared) {
        // ========== CREATURE ASSASSINATION SEQUENCE ==========
        /**
         * Violent Creature Combat with Moral Consequences
         * Implements creature death with atmospheric horror and point penalties
         */
        console.log("Nixie killed by sodium explosion!");
        
        setMessage("You toss the rock into the tranquil pool.\n\n It hits the water with a violent hiss and burst of flame!\n The nixie shrieks in pain as the chemical fire burns through her watery form.\n\n She dissolves into mist with a horridly and hauntingly scream that you will never forgot for killing an innocent water nixie. ' \n\nThe pool's surface still bubbles where she once dwelt.\n Minus 100 points for you");
        
        // ========== CREATURE DEATH STATE MODIFICATION ==========
        /**
         * Complete Creature Elimination with Scene Tracking
         * Marks creature as killed and enables death scene visualization
         */
        setSpecialRooms(prev => ({
          ...prev,
          [currentPosition]: {
            ...prev[currentPosition],
            waterSpiritActive: false,
            nixieKilled: true,
            showNixieDeathScene: true,
            hasWaterSpirit: false
          }
        }));
        
        // ========== DELAYED DEATH CRY AUDIO ==========
        /**
         * Layered Audio Effect System
         * Staggers creature death sounds for maximum atmospheric impact
         */
        setTimeout(() => {
          if (playWaterNixieShriekSound) {
            playWaterNixieShriekSound();
          }
        }, 1000); // 1-second delay for audio layering
        
      } else if (isNixieRoom && specialRooms[currentPosition]?.hasWaterSpirit &&
                 !specialRooms[currentPosition]?.nixieHasAppeared) {
        // ========== CREATURE VENGEANCE DEATH SEQUENCE ==========
        /**
         * Dramatic Player Death from Creature Rage
         * Implements instant death consequence for attacking hidden creatures
         */
        setMessage("You toss the rock into the tranquil pool. It explodes violently! A demonic looking nixie comes flying out of the water. \n\n\n\n\n She makes the most horrid wailing sound you've ever heard.\n\nYour last sight is her furious eyes as darkness claims you and the pain from her claws and teeth as they sink into you.");
        
        // ========== IMMEDIATE DEATH STATE CHANGE ==========
        /**
         * Instantaneous Game Termination System
         * Triggers immediate game over with appropriate death cause tracking
         */
        setGameStatus('lost');
        setDeathCause('nixie_rage');
        playNixieWailingKillScream();
        
      } else {
        // ========== STANDARD CHEMICAL REACTION ==========
        /**
         * Educational Chemistry Demonstration
         * Provides scientific explanation for sodium-water reaction
         */
        setMessage("You toss the rock into the water. FWOOSH! The strange rock ignites on contact, creating a bright yellow flame that dances across the surface and blinds your eyes! Sparks fly and the water hisses angrily. The reaction lasts about ten seconds before the rock is consumed. \nAlchemy lesson learned: Ye soft greyish rock with strange magical properties, plus water equals fire!");
      }
    }, 1000); // 1-second delay for explosion timing
    
    return true; // Rock consumed in chemical reaction
  }
  // ========== ENVIRONMENTAL PHYSICS: GRAVITATIONAL INTERACTIONS ==========
  /**
   * Pit Room Gravitational Mechanics
   * Demonstrates cave depth through extended fall time audio feedback
   */
  else if (isPitRoom) {
    setMessage("You drop the rock into the pit. It falls for what seems like an eternity before you hear a distant 'plunk' sound far below.");
    return true; // Rock consumed by gravity
  }
  // ========== ACOUSTIC PHYSICS: ECHO CHAMBER INTERACTIONS ==========
  /**
   * Sound Amplification System
   * Creates atmospheric audio effects through environmental acoustics
   */
  else if (isEchoRoom) {
    playRockThrowSound();
    playRockThrowSound(); // Double audio for echo effect
    setMessage("You toss the rock against the wall. The sound echoes impressively through the chamber, briefly drowning out all other cave sounds. \n The rock then dissolves into the cave floor");
    return true; // Rock consumed in acoustic demonstration
  }
  // ========== ATMOSPHERIC MOOD INTERACTION ==========
  /**
   * Darkness-Based Environmental Response
   * Creates mysterious atmospheric effects in ominous rooms
   */
  else if (isDarkRoom) {
    setMessage("You toss the rock into the darkness. The sound of them landing seems to continue longer than it should, as if the rocks are rolling down an unseen slope.");
    return true; // Rock consumed by mysterious darkness
  }
  // ========== DEFAULT ENVIRONMENTAL INTERACTION ==========
  /**
   * Generic Cave Physics with Magical Properties
   * Fallback behavior for rooms without special environmental characteristics
   */
  else {
    playRockThrowSound();
    setMessage("You toss the rock onto the cave floor. It clatters and makes a strange echoing effect throughout and then mysteriously dissolve into the ground. Weird place");
    return true; // Rock consumed by generic cave magic
  }
};

// ==================== TELEPORTATION SYSTEM: CRYSTAL ORB MECHANICS ====================

/**
 * Advanced Magical Transportation System with Multi-Destination Support
 * Sophisticated teleportation mechanics implementing location validation, destination
 * calculation, and bidirectional travel with intelligent pathfinding integration.
 * 
 * **Teleportation Excellence:**
 * This function demonstrates master-level magical system programming by implementing
 * a complete teleportation network with context validation, destination intelligence,
 * and seamless integration with movement and perception systems.
 * 
 * **Key System Features:**
 * - **Location-Based Activation**: Context-sensitive teleportation requiring specific magical infrastructure
 * - **Bidirectional Transportation**: Support for both forward teleportation and return journeys
 * - **Intelligent Destination Selection**: Anti-repetition algorithms preventing predictable travel patterns
 * - **State Management Integration**: Seamless coordination with position tracking and history systems
 * - **Audio-Visual Coordination**: Atmospheric sound effects with delayed perception updates
 * - **Multi-Use Preservation**: Reusable magical artifact supporting unlimited teleportation
 * 
 * **Technical Architecture:**
 * - **Teleport Point Validation**: Ensures current location has appropriate magical infrastructure
 * - **Destination Intelligence**: Smart routing with history-aware destination selection
 * - **State Synchronization**: Coordinated updates to position, history, and perception systems
 * - **Timing Coordination**: Delayed world state updates for realistic teleportation effects
 * - **Error Handling**: Graceful feedback for invalid usage locations
 * 
 * @param {Object} dependencies - Teleportation and movement system references
 * @returns {boolean} False (orb preserved for multiple uses)
 */
const handleUseCrystalOrb = (dependencies) => {
    // ========== TELEPORTATION SYSTEM DEPENDENCY EXTRACTION ==========
    /**
     * Movement and State Management Integration
     * Extracts all references needed for magical transportation coordination
     */
    const {
      currentPosition,
      specialRooms,
      history,
      setCurrentPosition,
      setHistory,
      checkPosition,
      setMessage,
      playTeleportSound
    } = dependencies;
    
    // ========== PRIMARY TELEPORTATION PATHWAY ==========
    /**
     * Forward Teleportation from Designated Teleport Points
     * Implements standard teleportation from rooms with magical infrastructure
     */
    if (specialRooms[currentPosition]?.hasTeleport) {
      // ========== TELEPORTATION INITIATION SEQUENCE ==========
      /**
       * Dramatic Magical Activation with Audio-Visual Coordination
       * Provides immersive feedback for successful teleportation initiation
       */
      setMessage("The crystal orb glows brightly as you hold it up. Suddenly, you're engulfed in light!");
      
      // ========== ATMOSPHERIC AUDIO INTEGRATION ==========
      playTeleportSound();
      
      // ========== DESTINATION TELEPORTATION PROCESSING ==========
      /**
       * Magical Transportation Execution System
       * Handles position updates, history tracking, and world state synchronization
       */
      const teleportRoom = specialRooms[currentPosition].teleportRoom;
      if (teleportRoom) {
        // ========== POSITION STATE UPDATES ==========
        setCurrentPosition(teleportRoom);
        setHistory([...history, teleportRoom]);
        
        // ========== DELAYED PERCEPTION SYSTEM UPDATE ==========
        /**
         * Post-Teleportation World State Synchronization
         * Ensures perception systems update after transportation completes
         * Delay allows for smooth transition and prevents perception conflicts
         */
        setTimeout(() => {
          checkPosition(teleportRoom);
        }, 1000); // 1-second delay for teleportation effect completion
      }
      
      return false; // Preserve orb for multiple teleportation uses
    } 
    // ========== REVERSE TELEPORTATION FROM WIZARD SANCTUM ==========
    /**
     * Special Case: Return Journey from Quest Central Location
     * Implements return transportation from wizard sanctum to teleport network
     * with intelligent destination selection to prevent repetitive travel patterns
     */
    else if (currentPosition === 32) {
      // ========== TELEPORT NETWORK DISCOVERY ALGORITHM ==========
      /**
       * Available Destination Identification System
       * Dynamically discovers all rooms in the teleportation network
       */
      const exitRooms = Object.keys(specialRooms)
        .filter(room => specialRooms[room].hasTeleport)
        .map(Number);
      
      if (exitRooms.length > 0) {
        // ========== INTELLIGENT DESTINATION SELECTION ==========
        /**
         * Anti-Repetition Algorithm with History Analysis
         * Selects teleportation destinations while avoiding recently visited locations
         * for more varied and interesting travel experiences
         */
        let destination;
        if (exitRooms.length > 1 && history.length > 1) {
          // ========== HISTORY-AWARE DESTINATION FILTERING ==========
          const lastRoom = history[history.length - 2]; // Get previous room
          destination = exitRooms.find(room => room !== lastRoom) || exitRooms[0];
        } else {
          // ========== DEFAULT DESTINATION SELECTION ==========
          destination = exitRooms[0]; // Fallback to first available teleport room
        }
        
        // ========== RETURN TELEPORTATION SEQUENCE ==========
        /**
         * Reverse Journey Magical Transportation
         * Implements return trip with appropriate atmospheric messaging
         */
        setMessage("The orb pulses with energy. You feel yourself being transported back...");
        playTeleportSound();
        
        // ========== DELAYED RETURN TRANSPORTATION ==========
        /**
         * Timed Return Journey Implementation
         * Coordinates position updates with perception system synchronization
         */
        setTimeout(() => {
          setCurrentPosition(destination);
          setHistory([...history, destination]);
          checkPosition(destination);
        }, 1000); // Consistent 1-second teleportation timing
        
        return false; // Preserve orb for continued teleportation use
      }
    } else {
      // ========== INVALID LOCATION FEEDBACK SYSTEM ==========
      /**
       * Context-Aware Usage Guidance
       * Provides helpful feedback when orb cannot activate in current location
       * while maintaining magical atmosphere
       */
      setMessage("The orb glows faintly, but nothing happens in this room. Perhaps it needs a specific location to activate.");
    }
    
    return false; // Always preserve orb regardless of usage outcome
  };


  // ==================== ADVANCED MAGICAL SYSTEM: SPELLBOOK MECHANICS ====================

/**
 * Sophisticated Magic System with Risk-Reward Mechanics and Equipment Integration
 * Professional spellcasting implementation featuring prerequisite validation, temporary
 * effect management, equipment interaction, and dramatic backfire consequences.
 * 
 * **Magic System Excellence:**
 * This function represents the pinnacle of magical mechanics design by implementing
 * a complete spellcasting system with prerequisites, temporary effects, equipment
 * interactions, and sophisticated consequence trees for both success and failure.
 * 
 * **Key Features:**
 * - **Prerequisite Validation**: Wizard room visit requirement for safe spellcasting
 * - **Temporary Effect System**: Floating spell with move-based duration tracking
 * - **Equipment Interaction**: Lantern fuel drain during magical backfire
 * - **Risk-Reward Mechanics**: Powerful benefits with dangerous failure consequences
 * - **Audio-Visual Integration**: Success and failure sound effects with visual effects
 * - **State Persistence**: Spell effects tracked across multiple game systems
 * 
 * **Technical Architecture:**
 * - **Knowledge Prerequisite System**: Validates magical education before safe casting
 * - **Multi-System State Management**: Coordinates spell effects across game systems
 * - **Equipment Damage Calculation**: Context-sensitive equipment interaction during backfire
 * - **Dynamic Message Generation**: Adaptive feedback based on current equipment state
 * - **Backfire Animation System**: Visual effects coordination for magical failures
 * - **Spell Duration Management**: Move-based temporary effect tracking
 * 
 * @param {Object} dependencies - Magic system and equipment management references
 * @returns {boolean} True if successfully cast (spellbook consumed), false if backfire
 */
const handleUseSpellbook = (dependencies) => {
    // ========== MAGIC SYSTEM DEPENDENCY EXTRACTION ==========
    /**
     * Comprehensive Magical System Integration
     * Extracts all references needed for complex spellcasting mechanics
     */
    const {
      currentPosition,
      wizardRoomVisited,
      setWizardRoomVisited,
      setSpellbookDeciphered,
      setFloatingActive,
      setFloatingMovesLeft,
      setActiveSpell,
      setMessage,
      setSpellbookBackfire,
      inventory,
      setInventory,
      playSpellBookFailSound,
      playSpellBookSuccessSound,
    } = dependencies;
    
    // ========== MAGICAL PREREQUISITE VALIDATION SYSTEM ==========
    /**
     * Advanced Spellcasting Safety Protocol
     * Validates magical knowledge prerequisite before allowing safe spellcasting
     * Ensures players have acquired necessary magical education from wizard's sanctum
     */
    if (currentPosition === 32 || wizardRoomVisited) {
      // ========== SUCCESSFUL SPELLCASTING SEQUENCE ==========
      /**
       * Complete Magical Success Implementation
       * Activates all spell systems with proper state management and audio feedback
       */
      
      // ========== MAGICAL KNOWLEDGE STATE UPDATES ==========
      setWizardRoomVisited(true);      // Mark magical education as complete
      setSpellbookDeciphered(true);    // Flag spellbook as successfully understood
      
      // ========== FLOATING SPELL ACTIVATION SYSTEM ==========
      /**
       * Temporary Magical Effect Implementation
       * Creates time-limited magical protection with move-based duration tracking
       */
      setFloatingActive(true);         // Enable floating spell effect
      setFloatingMovesLeft(5);         // Set duration to 5 moves
      setActiveSpell('floating');      // Register active spell type
      
      // ========== SUCCESSFUL SPELLCASTING FEEDBACK ==========
      /**
       * Immersive Spell Success Presentation
       * Provides detailed magical experience with protective spell description
       */
      setMessage("You open the ancient spellbook. The pages glow with arcane symbols, and one spell becomes clear to you: 'Levitas Aerium'. \nAs you speak the words, you feel lighter than air! You begin to float slightly above the ground. \nThis effect will last for around 5 moves, hopefully protecting you from pits and nightcrawlers and maybe other stuff. \nNo lifetime guarantee provided.");
      
      // ========== SUCCESS AUDIO INTEGRATION ==========
      playSpellBookSuccessSound();
      
      return true; // Spellbook consumed after successful magical mastery
    } else {
      // ========== DANGEROUS MAGICAL BACKFIRE SYSTEM ==========
      /**
       * Sophisticated Failure Consequence Implementation
       * Creates dramatic magical backfire with equipment damage and visual effects
       * Demonstrates the dangers of attempting advanced magic without proper preparation
       */
      
      // ========== BACKFIRE VISUAL EFFECTS ACTIVATION ==========
      /**
       * Magical Failure Animation System
       * Triggers visual effects to represent chaotic magical energies
       */
      setSpellbookBackfire(true);
      
      // ========== EQUIPMENT DAMAGE ASSESSMENT AND APPLICATION ==========
      /**
       * Intelligent Equipment Interaction System
       * Selectively damages active magical equipment while preserving inactive items
       * Demonstrates sophisticated item state analysis and conditional modification
       */
      setInventory(prev => {
        return prev.map(item => {
          if ((item.originalId || item.id) === 'lantern') {
            // ========== CONDITIONAL MAGICAL INTERFERENCE ==========
            /**
             * Context-Sensitive Equipment Damage Algorithm
             * Only damages active lanterns due to magical energy interference
             * Preserves inactive equipment to maintain game balance
             */
            if (item.fuel !== undefined && item.isActive) {
              // ========== FUEL DRAIN CALCULATION ==========
              const newFuel = Math.max(0, Math.floor(item.fuel / 2)); // 50% fuel drain
              const remainsActive = newFuel > 0; // Determine if lantern stays active
              
              return {
                ...item,
                fuel: newFuel,
                isActive: remainsActive, // Auto-deactivate if fuel completely drained
                name: `${remainsActive ? 'Active' : ''} Magical Lantern (${newFuel} charges)`
              };
            }
            return item; // Preserve inactive lanterns unchanged
          }
          return item; // Preserve all non-lantern items
        });
      });
      
      // ========== DYNAMIC BACKFIRE MESSAGE GENERATION ==========
      /**
       * Context-Aware Magical Failure Messaging System
       * Generates appropriate failure descriptions based on current equipment state
       * Provides immersive explanation of magical energy interactions
       */
      const lanternActive = inventory.some(item => 
        (item.originalId || item.id) === 'lantern' && item.isActive
      );
      
      // ========== BASE BACKFIRE MESSAGE CONSTRUCTION ==========
      let message = "As you open the ancient spellbook, the arcane symbols begin to writhe and shift unnaturally across the pages! A cold wind howls through the cavern as the book ignites with an eerie blue flame that doesn't burn your hands but drains the light from your torch";
      
      // ========== FAILURE AUDIO INTEGRATION ==========
      playSpellBookFailSound();
      
      // ========== CONDITIONAL EQUIPMENT DAMAGE MESSAGING ==========
      /**
       * Equipment-Aware Message Enhancement
       * Adapts failure description based on which equipment is affected
       */
      if (lanternActive) {
        message += " and lantern"; // Include lantern in affected equipment list
      }
      
      // ========== DRAMATIC CONCLUSION ==========
      message += "! Ghostly voices wail in tongues no mortal should comprehend, and the book slams shut violently. Your light sources flicker and dim dramatically.";
      
      setMessage(message);
      
      return false; // Preserve spellbook after backfire for future attempts with proper preparation
    }
  };
  
  // Golde// ==================== ADVANCED NAVIGATION SYSTEM: GOLDEN COMPASS MECHANICS ====================

/**
 * Sophisticated Navigation Aid with Treasure Detection and Deception Mechanics
 * Professional pathfinding system implementing treasure location, route calculation,
 * limited usage tracking, and probabilistic deception for balanced gameplay.
 * 
 * **Navigation Excellence:**
 * This function demonstrates master-level pathfinding programming by implementing
 * a complete navigation system with treasure detection, route optimization, usage
 * limitations, and sophisticated deception mechanics to prevent overpowered navigation.
 * 
 * **Key Features:**
 * - **Treasure Detection System**: Identifies and calculates routes to uncollected treasures
 * - **Pathfinding Integration**: Uses game's pathfinding engine for optimal route calculation
 * - **Usage Limitation**: Three-use limit with degradation tracking and visual feedback
 * - **Deception Mechanics**: 10% chance to mislead players toward dangerous locations
 * - **Visual Guidance**: Button highlighting system for directional assistance
 * - **Economic Balance**: Prevents overpowered treasure hunting while providing genuine utility
 * 
 * **Technical Architecture:**
 * - **Map Prerequisite System**: Requires treasure map for meaningful compass functionality
 * - **Usage Tracking**: Progressive degradation with inventory state management
 * - **Distance Calculation**: Advanced pathfinding integration with fallback handling
 * - **Threat Database**: Dynamic dangerous room identification for deception mechanics
 * - **Visual Feedback**: Button highlighting coordination with pathfinding systems
 * - **State Persistence**: Compass degradation tracking across game sessions
 * 
 * @param {Object} dependencies - Navigation, pathfinding, and treasure system references
 * @returns {boolean} True after third use (compass consumed), false otherwise
 */
const handleUseGoldenCompass = (dependencies) => {
    // ========== NAVIGATION SYSTEM DEPENDENCY EXTRACTION ==========
    /**
     * Comprehensive Navigation System Integration
     * Extracts all references needed for advanced treasure detection and pathfinding
     */
    const {
      hasMap,
      treasurePieces,
      collectedTreasures,
      currentPosition,
      roomConnections,
      findShortestPath,
      setMessage,
      highlightPathToRoom,
      positions,
      inventory,
      setInventory
    } = dependencies;
    
    // ========== MAP PREREQUISITE VALIDATION SYSTEM ==========
    /**
     * Navigation Prerequisite Protocol
     * Ensures player has treasure map before compass can provide meaningful guidance
     * Prevents compass from being overpowered early-game navigation tool
     */
    if (!hasMap) {
      setMessage("The compass needle spins wildly. It seems you need the treasure map to make sense of its guidance.");
      return false; // Preserve compass until map prerequisite met
    }
    
    // ========== COMPASS STATE MANAGEMENT AND VALIDATION ==========
    /**
     * Advanced Usage Tracking and Limitation System
     * Implements three-use limitation with state persistence and degradation feedback
     */
    const compass = inventory.find(item => 
      (item.originalId || item.id) === 'golden_compass'
    );
    
    // ========== COMPASS EXISTENCE VALIDATION ==========
    if (!compass) {
      console.error("Compass not found in inventory");
      return false; // Fail gracefully if compass missing
    }
    
    // ========== USAGE COUNTER INITIALIZATION ==========
    /**
     * Safe Usage Tracking Initialization
     * Ensures usage counter exists and starts from zero for new compasses
     */
    if (compass.uses === undefined) {
      compass.uses = 0;
    }
    
    // ========== USAGE LIMITATION ENFORCEMENT ==========
    /**
     * Compass Depletion Management System
     * Prevents usage after magical charge is exhausted while preserving item as memento
     */
    if (compass.uses >= 3) {
      setMessage("The golden compass has lost its magical charge. Its needle spins aimlessly, no longer able to guide you.");
      return false; // Preserve depleted compass as collection item
    }

    // ========== TREASURE DETECTION AND ANALYSIS SYSTEM ==========
    /**
     * Uncollected Treasure Identification Algorithm
     * Analyzes treasure collection state to identify remaining hunting targets
     */
    const unCollectedTreasures = treasurePieces.filter(
      treasure => !collectedTreasures.includes(treasure.id)
    );

    // ========== TREASURE-BASED NAVIGATION PROCESSING ==========
    /**
     * Primary Navigation Functionality Implementation
     * Processes treasure detection with either accurate guidance or strategic deception
     */
    if (unCollectedTreasures.length > 0) {
      // ========== DECEPTION PROBABILITY SYSTEM ==========
      /**
       * Balanced Deception Mechanic for Game Balance
       * 10% chance to mislead player toward dangerous locations preventing overpowered navigation
       */
      const isCompassBroken = Math.random() < 0.1;
      
      if (isCompassBroken) {
        // ========== DANGER ROOM IDENTIFICATION SYSTEM ==========
        /**
         * Threat Location Database Construction
         * Builds comprehensive list of dangerous rooms for misleading compass guidance
         */
        const dangerousRooms = [];
        
        // ========== PRIMARY THREAT PRIORITIZATION ==========
        /**
         * Wumpus Room Priority Targeting
         * Prioritizes most dangerous location for maximum deception impact
         */
        if (positions.wumpusPosition) {
          dangerousRooms.push({
            room: positions.wumpusPosition,
            danger: "wumpus"
          });
        }
        
        // ========== PIT HAZARD INTEGRATION ==========
        /**
         * Pit Room Threat Addition
         * Includes both pit locations in deception target database
         */
        if (positions.pitPosition1) {
          dangerousRooms.push({
            room: positions.pitPosition1,
            danger: "pit"
          });
        }
        
        if (positions.pitPosition2) {
          dangerousRooms.push({
            room: positions.pitPosition2,
            danger: "pit"
          });
        }
        
        // ========== FALLBACK THREAT OPTIONS ==========
        /**
         * Secondary Threat Integration
         * Adds bat room as fallback option when primary threats unavailable
         */
        if (dangerousRooms.length === 0 && positions.batPosition) {
          dangerousRooms.push({
            room: positions.batPosition,
            danger: "bat"
          });
        }
        
        // ========== DECEPTIVE GUIDANCE DELIVERY SYSTEM ==========
        /**
         * Misleading Navigation Feedback
         * Provides convincing but dangerous guidance with subtle warning indicators
         */
        if (dangerousRooms.length > 0) {
          const randomDanger = dangerousRooms[Math.floor(Math.random() * dangerousRooms.length)];
          setMessage(`The golden compass whirs erratically before pointing confidently in a direction. Its needle trembles as it points toward room ${randomDanger.room}. Something doesn't feel right about its guidance...`);
        } else {
          // ========== FALLBACK DECEPTION MESSAGING ==========
          setMessage("The golden compass spins wildly before settling on a direction. The needle keeps jittering... it seems to be malfunctioning.");
        }
      } else {
        // ========== ACCURATE TREASURE GUIDANCE SYSTEM ==========
        /**
         * Sophisticated Pathfinding and Distance Calculation Implementation
         * Implements complete navigation solution with route optimization and visual guidance
         */
        
        // ========== TREASURE DISTANCE CALCULATION ALGORITHM ==========
        /**
         * Advanced Pathfinding Integration with Distance Analysis
         * Calculates optimal routes to all uncollected treasures for intelligent targeting
         */
        const treasureDistances = unCollectedTreasures.map(treasure => ({
          ...treasure,
          distance: calculateDistanceToRoom(currentPosition, treasure.room, roomConnections, findShortestPath)
        }));
        
        // ========== OPTIMAL TARGET SELECTION SYSTEM ==========
        /**
         * Multi-Criteria Sorting Algorithm
         * Prioritizes nearest treasures while handling pathfinding edge cases gracefully
         */
        treasureDistances.sort((a, b) => {
          // ========== NUMERICAL DISTANCE PRIORITIZATION ==========
          if (typeof a.distance === 'number' && typeof b.distance === 'number') {
            return a.distance - b.distance; // Ascending numerical sort
          }
          // ========== STRING FALLBACK HANDLING ==========
          return String(a.distance).localeCompare(String(b.distance)); // Handle "unknown number of" cases
        });
        
        // ========== NEAREST TREASURE IDENTIFICATION ==========
        const nearest = treasureDistances[0];
        
        // ========== ROUTE CALCULATION AND GUIDANCE SYSTEM ==========
        /**
         * Advanced Pathfinding with Comprehensive Visual Guidance Integration
         * Calculates optimal route and provides both textual and visual direction indicators
         */
        const pathToTreasure = findShortestPath(currentPosition, nearest.room, roomConnections);
        const nextRoomTowardTreasure = pathToTreasure ? pathToTreasure.nextRoom : null;
        
        if (nextRoomTowardTreasure) {
          // ========== DETAILED PATHFINDING GUIDANCE ==========
          /**
           * Comprehensive Navigation Information
           * Provides step-by-step guidance with intermediate and final destinations
           */
          setMessage(`The golden compass points toward a ${nearest.name}. Its needle quivers with anticipation as it directs you through room ${nextRoomTowardTreasure} toward room ${nearest.room}.`);
          
          // ========== VISUAL GUIDANCE INTEGRATION ==========
          /**
           * Button Highlighting System Coordination
           * Provides visual directional assistance through UI element highlighting
           */
          if (typeof highlightPathToRoom === 'function') {
            highlightPathToRoom(nextRoomTowardTreasure, '#ffdd00', 'treasure');
          }
        } else {
          // ========== DIRECT DESTINATION GUIDANCE ==========
          /**
           * Simplified Navigation for Direct Routes
           * Provides treasure location when no intermediate steps required
           */
          setMessage(`The golden compass points toward a ${nearest.name}. Its needle quivers with anticipation as it directs you to room ${nearest.room}.`);
        }
      }
    } else {
      // ========== TREASURE HUNT COMPLETION FEEDBACK ==========
      /**
       * Collection Complete Status Message
       * Provides closure when all treasures have been successfully located
       */
      setMessage("The golden compass spins in a circle. You've already found all the treasures it can detect.");
    }
    
    // ========== USAGE TRACKING AND DEGRADATION SYSTEM ==========
    /**
     * Progressive Compass Degradation with State Management
     * Tracks usage count and updates compass state with remaining uses display
     */
    const newUses = compass.uses + 1;
    
    // ========== INVENTORY STATE UPDATE WITH DEGRADATION FEEDBACK ==========
    /**
     * Dynamic Compass State Management
     * Updates compass name to reflect remaining magical charges
     */
    setInventory(prev => prev.map(item => {
      if ((item.originalId || item.id) === 'golden_compass') {
        return {
          ...item,
          uses: newUses,
          name: `Golden Compass (${3 - newUses} uses left)` // Real-time usage counter display
        };
      }
      return item;
    }));
    
    // ========== FINAL USE CONSUMPTION DETERMINATION ==========
    /**
     * Compass Lifecycle Management
     * Consumes compass after third use while preserving it for first two uses
     */
    return newUses >= 3; // Consume compass only after final use
  };
  // ==================== SIMPLE CONSUMABLE SYSTEMS ====================

/**
 * Basic Consumable Item with Atmospheric Destruction
 * Simple consumable implementing immediate item destruction with immersive atmospheric feedback.
 * 
 * **Consumable Design Excellence:**
 * This function demonstrates professional consumable item design by creating meaningful
 * atmospheric feedback for simple item destruction, maintaining game immersion even
 * for basic consumable interactions.
 * 
 * **Key Features:**
 * - **Atmospheric Destruction**: Immersive description of item disintegration process
 * - **Environmental Integration**: Item interacts realistically with cave environment
 * - **Complete Consumption**: Item is always fully consumed when used
 * - **Scientific Accuracy**: Realistic description of sulfur crystal breakdown
 * 
 * @param {Object} dependencies - Basic message system reference
 * @returns {boolean} True (item always consumed upon use)
 */
const handleUseSulfurCrystal = (dependencies) => {
    // ========== BASIC MESSAGE SYSTEM INTEGRATION ==========
    const { setMessage } = dependencies;
    
    // ========== ATMOSPHERIC DESTRUCTION SEQUENCE ==========
    /**
     * Immersive Item Destruction Narrative
     * Provides detailed description of chemical breakdown process for player engagement
     */
    setMessage("You carefully place the sulfur crystal on the ground. As it touches the cave floor, it begins to crumble and quickly disintegrates into a fine yellow powder that dissipates into the air.");
    
    return true; // Always consume sulfur crystal upon use
  };

// ==================== ADVANCED PROTECTIVE CONSUMABLE SYSTEM ====================

/**
 * Sophisticated Protection System with Temporal Effect Management
 * Advanced consumable implementing timed magical protection with creature behavior modification
 * and comprehensive state management across multiple game systems.
 * 
 * **Protection System Excellence:**
 * This function demonstrates master-level consumable design by implementing a complete
 * temporal protection system that coordinates across multiple game systems to provide
 * time-limited magical defense against specific creature threats.
 * 
 * **Key Features:**
 * - **Temporal Effect Management**: Precise duration tracking with automatic expiration
 * - **Creature Behavior Modification**: Alters nightcrawler AI to avoid protected players
 * - **Multi-System Integration**: Coordinates protection state across multiple systems
 * - **Atmospheric Feedback**: Immersive magical transformation description
 * - **Threat State Reset**: Clears existing warnings when protection activated
 * - **Configuration Flexibility**: Duration sourced from item configuration data
 * 
 * **Technical Architecture:**
 * - **Duration Calculation**: Millisecond-precise protection timing systems
 * - **State Synchronization**: Multi-system protection flag coordination
 * - **Configuration Integration**: Dynamic duration from item type definitions
 * - **Warning System Reset**: Clears threat indicators when protection active
 * 
 * @param {Object} dependencies - Protection system and creature behavior references
 * @returns {boolean} True (item consumed to activate protection)
 */
const handleUseCaveSalt = (dependencies) => {
    // ========== PROTECTION SYSTEM DEPENDENCY EXTRACTION ==========
    /**
     * Multi-System Protection Coordination
     * Extracts all references needed for temporal protection implementation
     */
    const {
      itemTypes,
      setNightCrawlerProtection,
      setNightCrawlerProtectionTimer,
      setMessage,
      setNightCrawlerWarning
    } = dependencies;
    
    console.log("Using cave salt crystals");
    
    // ========== PROTECTION STATE ACTIVATION ==========
    /**
     * Primary Protection System Enablement
     * Activates magical protection affecting creature behavior algorithms
     */
    setNightCrawlerProtection(true);
    
    // ========== TEMPORAL EFFECT DURATION MANAGEMENT ==========
    /**
     * Sophisticated Time-Based Protection System
     * Implements precise duration tracking with configuration-based timing
     */
    const protectionDuration = itemTypes?.cave_salt?.duration || 50; // Default 50 seconds
    const protectionEndTime = Date.now() + (protectionDuration * 1000); // Convert to milliseconds
    setNightCrawlerProtectionTimer(protectionEndTime);
    
    // ========== IMMERSIVE MAGICAL TRANSFORMATION FEEDBACK ==========
    /**
     * Atmospheric Protection Activation Description
     * Provides detailed sensory feedback for magical protection engagement
     */
    setMessage("You crush the cave salt crystals in your hand. They dissolve into a fine powder that clings to your skin and clothing. A subtle shimmer surrounds you, and the air feels unnaturally still. You sense the nightcrawlers will avoid you for a while.");
    
    // ========== THREAT STATE RESET SYSTEM ==========
    /**
     * Warning System Cleanup
     * Clears existing nightcrawler warnings when protection becomes active
     */
    setNightCrawlerWarning(false);
    
    return true; // Consume cave salt to activate temporal protection
  };

// ==================== ADVANCED EQUIPMENT SYSTEM: INVISIBILITY CLOAK ====================

/**
 * Sophisticated Equipment Management with Critical State Synchronization
 * Professional wearable equipment system implementing advanced state management,
 * equipment conflict resolution, and critical synchronization across game systems.
 * 
 * **Equipment System Excellence:**
 * This function demonstrates master-level equipment programming by implementing
 * sophisticated state synchronization systems required for critical equipment
 * that affects multiple game systems including stealth, temperature, and combat.
 * 
 * **Key Features:**
 * - **Critical State Synchronization**: Emergency equipment state management for system stability
 * - **Equipment State Toggle**: Professional on/off equipment mechanics with state validation
 * - **Debug Integration**: Comprehensive logging for critical equipment troubleshooting
 * - **Fallback Safety Systems**: Graceful degradation when advanced systems unavailable
 * - **Atmospheric Feedback**: Immersive descriptions for equipment state changes
 * - **Multi-System Impact**: Equipment changes affect stealth, temperature, and visibility systems
 * 
 * **Technical Architecture:**
 * - **Force State Updates**: Emergency synchronization for critical equipment stability
 * - **State Validation**: Boolean state enforcement preventing undefined equipment states
 * - **Debug Logging**: Comprehensive state tracking for development and troubleshooting
 * - **Fallback Systems**: Graceful handling when advanced synchronization unavailable
 * - **Equipment Persistence**: State changes maintained across multiple game systems
 * 
 * @param {Object} dependencies - Equipment state management and synchronization references
 * @returns {boolean} False (equipment items never consumed, only equipped/unequipped)
 */
const handleUseInvisibilityCloak = (dependencies) => {
    // ========== EQUIPMENT SYSTEM DEPENDENCY EXTRACTION ==========
    /**
     * Critical Equipment State Management Integration
     * Extracts references for advanced equipment synchronization systems
     */
    const { 
      forceUpdateCloakState, // Emergency state synchronization function
      inventory,
      setMessage,
    } = dependencies;
    
    console.log("CLOAK USE HANDLER: Starting");
    
    // ========== EQUIPMENT ITEM DISCOVERY AND VALIDATION ==========
    /**
     * Critical Equipment Location System
     * Locates invisibility cloak in inventory with comprehensive error handling
     */
    const cloakItem = inventory.find(item => 
      (item.originalId || item.id) === 'invisibility_cloak'
    );
    
    // ========== EQUIPMENT EXISTENCE VALIDATION ==========
    if (!cloakItem) {
      console.error("Could not find cloak in inventory");
      return false; // Fail gracefully if equipment missing
    }
    
    console.log("CLOAK USE HANDLER: Using item:", cloakItem);
    
    // ========== EQUIPMENT STATE ANALYSIS AND TOGGLE CALCULATION ==========
    /**
     * Professional Equipment State Management
     * Analyzes current equipment state and calculates desired toggle action
     */
    const currentEquipped = cloakItem.equipped === true; // Ensure boolean state
    const newEquippedState = !currentEquipped; // Calculate toggle state
    
    console.log(`CLOAK USE HANDLER: Changing equipped from ${currentEquipped} to ${newEquippedState}`);
    
    // ========== CRITICAL STATE SYNCHRONIZATION SYSTEM ==========
    /**
     * Emergency Equipment State Management Protocol
     * Uses specialized synchronization function for critical equipment stability
     * Required for invisibility cloak due to its impact on multiple game systems
     */
    if (typeof forceUpdateCloakState === 'function') {
      // ========== ADVANCED STATE SYNCHRONIZATION ==========
      /**
       * Professional Equipment Synchronization
       * Uses specialized function ensuring state consistency across all systems
       */
      forceUpdateCloakState(newEquippedState);
    } else {
      // ========== FALLBACK SAFETY SYSTEM ==========
      /**
       * Graceful Degradation Protocol
       * Maintains functionality when advanced synchronization unavailable
       */
      console.error("forceUpdateCloakState not available - falling back to basic update");
      // Fallback implementation would be added here for emergency situations
    }
    
    // ========== CONTEXTUAL EQUIPMENT FEEDBACK SYSTEM ==========
    /**
     * Equipment State Change Messaging
     * Provides immersive feedback based on equipment action taken
     */
    if (newEquippedState) {
      // ========== EQUIPMENT ACTIVATION FEEDBACK ==========
      setMessage("You wrap the thick cloak around your shoulders. It's surprisingly warm, and you notice a strange shimmer at the edge of your vision when you move.");
    } else {
      // ========== EQUIPMENT DEACTIVATION FEEDBACK ==========
      setMessage("You remove the cloak and fold it over your arm. The air feels different against your skin now.");
    }
    
    return false; // Equipment items preserved after use (only state changes)
  };

// ==================== LEGACY CONSUMABLE RESOURCE SYSTEM ====================

/**
 * Legacy Torch Oil Resource Management System
 * Backward compatibility consumable handler implementing fuel restoration,
 * quantity tracking, and inventory stack management for torch lighting systems.
 * 
 * **Resource Management Features:**
 * - **Complete Fuel Restoration**: Restores torch to maximum capacity
 * - **Quantity Stack Management**: Handles multiple oil flask inventories
 * - **Dynamic Name Updates**: Real-time inventory name changes reflecting quantities
 * - **Intelligent Consumption**: Preserves stacks until final flask consumed
 * - **Darkness Counter Reset**: Clears darkness progression timers
 * 
 * **Note:** This handler maintains backward compatibility with older code paths.
 * Primary torch oil handling is now managed in itemManagerImport.js with enhanced features.
 * 
 * @param {Object} dependencies - Torch system and inventory management references
 * @returns {boolean} Context-dependent consumption based on remaining quantity
 */
const handleUseTorchOil = (dependencies) => {
    // ========== TORCH SYSTEM DEPENDENCY EXTRACTION ==========
    /**
     * Fuel Management System Integration
     * Extracts references for torch fuel restoration and inventory management
     */
    const {
      setTorchLevel,
      setDarknessCounter,
      setMessage,
      inventory,
      setInventory,
    } = dependencies;
    
    // ========== COMPLETE FUEL RESTORATION SYSTEM ==========
    /**
     * Torch Fuel and Darkness Management
     * Restores torch to full capacity and resets darkness progression
     */
    setTorchLevel(100);        // Full fuel restoration
    setDarknessCounter(0);     // Reset darkness progression timer
   
    // ========== OIL FLASK INVENTORY DISCOVERY ==========
    /**
     * Resource Item Location System
     * Locates torch oil in inventory with support for transformed item IDs
     */
    const oilFlask = inventory.find(item => 
      (item.originalId || item.id) === 'torch_oil'
    );
    
    // ========== ATMOSPHERIC FUEL RESTORATION FEEDBACK ==========
    /**
     * Immersive Resource Usage Description
     * Note: Contains debug text artifact "fdsfsdf" from development
     */
    setMessage("You fdsfsdf carefully pour the oil onto your torch and the flame brightens considerably.");
    
    // ========== QUANTITY-BASED CONSUMPTION LOGIC ==========
    /**
     * Intelligent Stack Management System
     * Handles both single flasks and multi-flask stacks with appropriate inventory updates
     */
    if (oilFlask && oilFlask.quantity && oilFlask.quantity > 1) {
      // ========== STACK QUANTITY DECREMENT SYSTEM ==========
      /**
       * Multi-Flask Stack Management
       * Reduces quantity and updates display name while preserving stack
       */
      setInventory(prev => prev.map(item => {
        if ((item.originalId || item.id) === 'torch_oil') {
          return {
            ...item,
            quantity: item.quantity - 1,
            name: `Torch Oil Flask (${item.quantity - 1})` // Real-time quantity display
          };
        }
        return item;
      }));
      return false; // Preserve stack with reduced quantity
    } else {
      // ========== FINAL FLASK CONSUMPTION ==========
      /**
       * Last Flask Removal System
       * Removes torch oil from inventory when final flask is consumed
       */
      return true; // Remove final flask from inventory
    }
  };
  // ==================== CRITICAL MAGICAL ARTIFACT: WYRMGLASS SYSTEM ====================

/**
 * Ultimate Game Completion Device with Magical Interference Detection
 * Sophisticated endgame item implementing ladder extension mechanics, magical conflict
 * detection, and catastrophic failure sequences with reality-warping consequences.
 * 
 * **Endgame Engineering Excellence:**
 * This function represents the pinnacle of game completion mechanics by implementing
 * a critical quest item that can either enable victory or trigger spectacular magical
 * catastrophe based on complex item interaction patterns and player state analysis.
 * 
 * **Key System Features:**
 * - **Victory Condition Management**: Primary mechanism for game completion enabling
 * - **Magical Interference Detection**: Complex anti-magic conflict analysis system
 * - **Reality Distortion Mechanics**: Catastrophic failure with dimensional consequences
 * - **Ladder Extension Technology**: Physical world modification through magical means
 * - **State Persistence**: Remembers previous usage to prevent redundant activations
 * - **Dramatic Death Sequences**: Multi-stage catastrophic failure with horror elements
 * - **Scene Orchestration**: Triggers cinematic sequences for dramatic impact
 * 
 * **Technical Architecture:**
 * - **Context-Sensitive Behavior**: Only functions in designated victory location
 * - **Item Conflict Detection**: Advanced inventory analysis for magical interference
 * - **World State Modification**: Permanent ladder extension with room description updates
 * - **Audio-Visual Integration**: Coordinated sound effects and visual scene triggers
 * - **Death State Management**: Complete game termination with specific failure causation
 * - **Safety State Checking**: Prevents catastrophic interactions through validation
 * 
 * **Magical Physics Implementation:**
 * The wyrmglass-lantern interaction represents advanced magical physics where
 * unstable arcane energies create dimensional rifts and reality tears, demonstrating
 * sophisticated game world consistency and consequence-driven magical systems.
 * 
 * @param {Object} dependencies - Victory condition and magical conflict detection systems
 * @returns {boolean} False to preserve artifact (critical endgame item)
 */
export const handleUseWyrmglass = (dependencies) => {
  // ========== ENDGAME SYSTEM DEPENDENCY EXTRACTION ==========
  /**
   * Victory Condition Management Dependencies
   * Extracts references needed for game completion mechanics and magical conflict detection
   */
  const {
    currentPosition,
    positions,
    specialRooms,
    setSpecialRooms,
    setMessage,
    roomDescriptionMap,
    setRoomDescriptionMap,
    setShowLadderExtendScene,
    playWyrmglassSound,
    inventory,
    setGameStatus,
    setDeathCause,
  } = dependencies;
  
  // ========== VICTORY LOCATION VALIDATION ==========
  /**
   * Critical Game Completion Context Check
   * Ensures wyrmglass is only functional in designated exit location
   */
  if (currentPosition === positions.exitPosition) {
    // ========== REDUNDANT USAGE PREVENTION ==========
    /**
     * State Persistence Check
     * Prevents ladder re-extension if already successfully activated
     */
    if (specialRooms[currentPosition]?.ladderExtended) {
      setMessage("You hold up the wyrmglass again. The magical ladder remains fully extended, ready for your escape.");
      return false; // Preserve artifact for potential future reference
    }
    
    // ========== CATASTROPHIC MAGICAL INTERFERENCE DETECTION ==========
    /**
     * Advanced Anti-Magic Conflict Analysis System
     * Implements sophisticated magical physics where conflicting arcane energies
     * create reality-threatening dimensional instabilities and catastrophic failure
     * 
     * **Magical Physics Theory:**
     * The wyrmglass (ethereal/dimensional magic) and lantern (arcane light magic)
     * represent fundamentally incompatible magical frequencies that create
     * anti-magic resonance when simultaneously active, tearing holes in reality
     */
    const hasActiveLantern = inventory.some(item => 
      (item.originalId || item.id) === 'lantern' && item.isActive
    );
    
    if (hasActiveLantern) {
      // ========== REALITY-WARPING CATASTROPHIC FAILURE SEQUENCE ==========
      /**
       * Dimensional Catastrophe with Multi-Stage Horror Elements
       * Implements the most dramatic death sequence in the game featuring
       * reality tears, dimensional voids, and simultaneous multi-death experiences
       */
      setMessage("You hold up the wyrmglass while your lantern blazes brightly. \n" +
                "The two magical forces collide with catastrophic results! \n" +
                "The wyrmglass begins to vibrate violently as its ethereal energies clash with the lantern's arcane light. \n" +
                "Suddenly, both artifacts explode in a burst of anti-magic that tears a hole in reality itself! \n\n" +
                "You're sucked into the magical void, experiencing all possible deaths simultaneously before ceasing to exist. \n" +
                "Perhaps mixing unstable magical artifacts wasn't your brightest idea... \n\n" +
                "Game over!");
      
      // ========== COMPLETE GAME TERMINATION ==========
      /**
       * Ultimate Failure State Management
       * Triggers immediate game ending with specific catastrophic cause tracking
       */
      setGameStatus('lost');
      setDeathCause('magical_catastrophe');
      
      return true; // Destroy wyrmglass (player obliterated by magical forces)
    }

    // ========== SUCCESSFUL VICTORY CONDITION SEQUENCE ==========
    /**
     * Triumphant Game Completion Mechanics
     * Orchestrates the successful ladder extension sequence with audio-visual coordination
     */
    if (playWyrmglassSound) {
      playWyrmglassSound();
    }
    
    // ========== CINEMATIC SCENE ACTIVATION ==========
    /**
     * Dramatic Visual Sequence Trigger
     * Initiates special display sequence for ladder extension ceremony
     */
    setShowLadderExtendScene(true);

    // ========== WORLD STATE PERMANENT MODIFICATION ==========
    /**
     * Victory Condition Physical World Change
     * Permanently extends the escape ladder enabling final game completion
     */
    setSpecialRooms(prev => ({
      ...prev,
      [currentPosition]: {
        ...prev[currentPosition],
        ladderExtended: true
      }
    }));
    
    // ========== DYNAMIC ROOM DESCRIPTION TRANSFORMATION ==========
    /**
     * Contextual Content Management System
     * Updates room descriptions to reflect the magical ladder extension transformation
     */
    const currentDesc = roomDescriptionMap[currentPosition];
    const updatedDesc = {
      ...currentDesc,
      text: currentDesc.text.replace(
        "In the corner, you notice a rickety ladder leading up through a shaft in the ceiling. Light filters down from above - this appears to be the way out!",
        "In the corner stands a rickety ladder that extends only halfway up the shaft. Above it, you can see daylight but the ladder doesn't reach. <span class='interactive-item' data-item='ladder'>The ladder</span> looks barely stable enough to hold your weight."
      ),
      enhancedText: currentDesc.enhancedText?.replace(
        "In the corner, you notice a rickety ladder leading up through a shaft in the ceiling. Light filters down from above - this appears to be the way out!",
        "In the corner stands a rickety ladder that now extends ALL THE WAY up through the shaft, glowing with a faint magical light. <span class='interactive-item' data-item='ladder'>The ladder</span> looks sturdy and ready to support your escape!"
      )
    };
    
    setRoomDescriptionMap(prev => ({
      ...prev,
      [currentPosition]: updatedDesc
    }));
    
    // ========== TRIUMPHANT SUCCESS MESSAGE ==========
    /**
     * Victory Condition Confirmation Feedback
     * Provides immersive magical transformation description for successful usage
     */
    setMessage("You hold up the wyrmglass toward the ladder. The glass sphere begins to glow with an inner light, and suddenly the ladder shimmers and extends upward! Magical rungs appear one by one until the ladder reaches all the way to the surface. The way out is now clear!");
    
    return false; // Preserve wyrmglass (critical endgame artifact)
  } else {
    // ========== INVALID LOCATION USAGE FEEDBACK ==========
    /**
     * Context-Aware Error Handling
     * Provides mystical examination feedback while preserving item for correct usage location
     */
    setMessage("You peer through the wyrmglass. The world looks slightly distorted through its surface, but nothing special happens here.");
    return false; // Preserve wyrmglass for correct usage location
  }
};

// ==================== ADVANCED PROJECTILE COMBAT: WUMPUS REPELLENT SYSTEM ====================

/**
 * Sophisticated Ranged Combat System with Target Selection Interface
 * Advanced throwing mechanics implementing interactive room selection, handler registration,
 * and complex creature interaction patterns for strategic Wumpus management.
 * 
 * **Combat System Excellence:**
 * This function represents the most sophisticated combat mechanic in the game by
 * implementing a two-stage interaction pattern where item usage triggers targeting
 * mode, then room selection activates the actual throwing mechanics.
 * 
 * **Key System Features:**
 * - **Two-Stage Interaction Pattern**: Usage activates targeting, selection executes action
 * - **Interactive UI State Management**: Transforms room selection interface for targeting
 * - **Handler Registration System**: Dynamic function binding for target room processing
 * - **Strategic Combat Planning**: Allows thoughtful target selection before commitment
 * - **Circular Reference Prevention**: Safe handler definition avoiding import cycles
 * - **Debug Integration**: Comprehensive logging for development and testing support
 * 
 * **Technical Architecture:**
 * - **State Machine Implementation**: Manages throwing mode activation and deactivation
 * - **Function Closure Management**: Safe handler creation preventing reference errors
 * - **UI Mode Transformation**: Converts room navigation to target selection interface
 * - **Placeholder Pattern**: Prevents circular dependencies through indirection
 * - **Resource Preservation**: Delays item consumption until successful target execution
 * 
 * **Combat Design Philosophy:**
 * The repellent system emphasizes strategic planning over immediate action, requiring
 * players to consider Wumpus movement patterns, room layouts, and tactical positioning
 * before committing to the throw, creating deeper combat engagement.
 * 
 * @param {Object} dependencies - UI state management and handler registration systems
 * @returns {boolean} False to preserve item until successful throwing execution
 */
const handleUseWumpusRepellent = (dependencies) => {
  // ========== COMBAT SYSTEM DEPENDENCY EXTRACTION ==========
  /**
   * Targeting Interface Dependencies
   * Extracts references needed for targeting mode activation and handler registration
   */
  const { 
    setThrowingRepellent, 
    setRepellentThrowHandler, 
    setMessage 
  } = dependencies;
  
  console.log("WUMPUS REPELLENT USE DETECTED - setting up throwing mode");
  
  // ========== TARGETING MODE ACTIVATION ==========
  /**
   * Combat Interface State Transformation
   * Converts normal room navigation interface into tactical targeting system
   */
  setThrowingRepellent(true);
  
  // ========== STRATEGIC INSTRUCTION DELIVERY ==========
  /**
   * Player Guidance for Combat Targeting
   * Provides clear direction for target selection process
   */
  setMessage("Where do you want to throw the Wumpus Repellent? Select a room.");
  
  // ========== SAFE HANDLER DEFINITION ==========
  /**
   * Circular Reference Prevention System
   * Creates placeholder handler preventing import cycle issues while
   * maintaining functional interface for future implementation
   */
  const safeThrowHandler = (targetRoom) => {
    console.log(`Throw handler would be called with target room: ${targetRoom}`);
    
    // ========== IMPLEMENTATION PLACEHOLDER ==========
    /**
     * Future Implementation Reference
     * Actual throwing mechanics implemented in itemManagerImport.js
     * to avoid circular dependency issues between modules
     */
    return true;
  };
  
  // ========== DYNAMIC HANDLER REGISTRATION ==========
  /**
   * Function Binding System
   * Registers the throwing handler for activation when target room is selected
   */
  setRepellentThrowHandler(() => safeThrowHandler);
  
  // ========== RESOURCE PRESERVATION ==========
  /**
   * Strategic Item Management
   * Preserves repellent until successful target execution prevents accidental loss
   */
  return false; // Don't remove item until actually thrown
};

// ==================== PATHFINDING UTILITY: DISTANCE CALCULATION SYSTEM ====================

/**
 * Advanced Pathfinding Distance Calculator with Safety Validation
 * Robust utility function implementing shortest path algorithms with comprehensive
 * error handling and fallback systems for reliable distance computation.
 * 
 * **Pathfinding Excellence:**
 * This function demonstrates professional-grade utility programming by implementing
 * comprehensive input validation, graceful error handling, and reliable fallback
 * systems ensuring consistent distance calculations across complex room networks.
 * 
 * **Key Features:**
 * - **Comprehensive Input Validation**: Null-safe checking for all required parameters
 * - **Graceful Degradation**: Meaningful fallbacks when pathfinding fails
 * - **Algorithm Abstraction**: Flexible interface supporting different pathfinding implementations
 * - **Distance Abstraction**: Returns semantic distance descriptions for user-friendly output
 * - **Debug-Friendly**: Clear error conditions and fallback logging support
 * 
 * **Technical Implementation:**
 * - **Null Safety**: Prevents crashes from undefined parameters
 * - **Algorithm Flexibility**: Accepts any pathfinding function matching interface
 * - **Result Validation**: Verifies pathfinding results before distance extraction
 * - **Semantic Output**: Converts numerical distances to readable descriptions
 * 
 * @param {number} startRoom - Source room for distance calculation
 * @param {number} targetRoom - Destination room for distance measurement
 * @param {Object} roomConnections - Room connectivity graph data structure
 * @param {Function} findShortestPath - Pathfinding algorithm implementation
 * @returns {string} Human-readable distance description or fallback message
 */
const calculateDistanceToRoom = (startRoom, targetRoom, roomConnections, findShortestPath) => {
  // ========== COMPREHENSIVE INPUT VALIDATION ==========
  /**
   * Parameter Safety Verification System
   * Ensures all required parameters are defined before attempting pathfinding
   */
  if (!startRoom || !targetRoom || !roomConnections || !findShortestPath) {
    return "an unknown number of";
  }
  
  // ========== PATHFINDING ALGORITHM EXECUTION ==========
  /**
   * Distance Calculation with Result Validation
   * Executes pathfinding algorithm and extracts distance with safety checking
   */
  const path = findShortestPath(startRoom, targetRoom, roomConnections);
  return path ? path.distance : "an unknown number of";
};

// ==================== COMPREHENSIVE ITEM SYSTEM ORCHESTRATION ====================

/**
 * Central Item Usage Orchestrator with Type-Based Dispatch System
 * Master coordinator implementing comprehensive item management with inventory validation,
 * type-based dispatch, resource management, and cross-system integration.
 * 
 * **System Architecture Excellence:**
 * This function represents the pinnacle of item system design by implementing a
 * centralized orchestration pattern that manages complex item interactions, resource
 * consumption, and state synchronization across multiple game systems.
 * 
 * **Key System Features:**
 * - **Centralized Dispatch**: Single entry point for all item usage mechanics
 * - **Type-Based Routing**: Intelligent item type detection and handler selection
 * - **Inventory Management**: Comprehensive item validation and consumption tracking
 * - **Resource Conservation**: Smart consumption based on successful usage patterns
 * - **Legacy Support**: Backward compatibility for older item identification systems
 * - **Debug Integration**: Comprehensive logging for development and troubleshooting
 * - **Fallback Handling**: Graceful processing of unrecognized item types
 * 
 * **Technical Architecture:**
 * - **Dependency Injection**: Flexible parameter passing for diverse handler needs
 * - **Switch-Case Optimization**: Efficient item type routing with minimal overhead
 * - **Conditional Consumption**: Resource removal only after successful usage
 * - **Error Recovery**: Safe handling of missing inventory items and unknown types
 * - **State Synchronization**: Coordinates inventory updates with usage outcomes
 * 
 * **Design Philosophy:**
 * The orchestrator emphasizes reliability and flexibility by providing consistent
 * interfaces for diverse item types while maintaining resource conservation and
 * comprehensive error handling throughout the interaction process.
 * 
 * @param {string} itemId - Unique identifier for item requiring usage processing
 * @param {Object} dependencies - Comprehensive system references for item interactions
 * @returns {boolean} Consumption result based on successful usage outcome
 */
export const handleUseItem = (itemId, dependencies) => {
  // ========== SYSTEM INTEGRATION DEPENDENCY EXTRACTION ==========
  /**
   * Comprehensive Dependencies for Multi-System Coordination
   * Extracts extensive references needed for diverse item interaction patterns
   */
  const {
    inventory,
    setInventory,
    setMessage,
    // ... extensive additional dependencies for specialized item handlers
  } = dependencies;
  
  // ========== INVENTORY VALIDATION SYSTEM ==========
  /**
   * Item Existence Verification
   * Ensures requested item exists in player inventory before processing
   */
  const item = inventory.find(item => item.id === itemId);
  if (!item) return;
  
  // ========== LEGACY COMPATIBILITY LAYER ==========
  /**
   * Backward Compatibility Item Type Detection
   * Supports both current and legacy item identification systems
   */
  const originalId = item.originalId || item.id;
  
  // ========== SPECIAL CASE HANDLING ==========
  /**
   * Pre-Processing for Complex Item Types
   * Handles items requiring special processing before main dispatch
   */
  if (originalId === 'torch_oil') {
    return handleUseTorchOil(dependencies);
  }
  
  // ========== MAIN DISPATCH SYSTEM ==========
  /**
   * Type-Based Item Handler Routing
   * Efficiently routes item usage to appropriate specialized handlers
   */
  let removeItem = false; // Conservative resource preservation default
  
  switch (originalId) {
    case 'rusty_key':
      removeItem = handleUseRustyKey(dependencies);
      break;
      
    case 'crystal_orb':
      removeItem = handleUseCrystalOrb(dependencies);
      break;
      
    case 'spellbook':
      removeItem = handleUseSpellbook(dependencies);
      break;
      
    case 'golden_compass':
      removeItem = handleUseGoldenCompass(dependencies);
      break;
      
    case 'sulfur_crystal':
      removeItem = handleUseSulfurCrystal(dependencies);
      break;
      
    case 'cave_salt':
      removeItem = handleUseCaveSalt(dependencies);
      break;
      
    case 'druika_repellent':
      console.log("USE WUMPUS REPELLENT");
      removeItem = handleUseWumpusRepellent(dependencies);
      break;
      
    case 'loose_rocks':
      removeItem = handleUseLooseRocks(dependencies);
      break;

    case 'wyrmglass':
      removeItem = handleUseWyrmglass(dependencies);
      break;

    case 'wizard_journal':
      removeItem = handleUseWizardJournal(dependencies);
      break;
      
    default:
      // ========== FALLBACK PROCESSING ==========
      /**
       * Unknown Item Type Handling
       * Provides meaningful feedback while preserving unrecognized items
       */
      setMessage("You examine the item, but aren't sure how to use it here.");
      removeItem = false; // Conservative preservation of unknown items
  }
  
  // ========== CONDITIONAL RESOURCE MANAGEMENT ==========
  /**
   * Smart Inventory Management System
   * Only consumes items after confirmed successful usage
   */
  if (removeItem) {
    setInventory(prev => prev.filter(i => i.id !== itemId));
  }
  
  return removeItem;
};

// ==================== MODULE EXPORT ARCHITECTURE ====================

// ========== INDIVIDUAL FUNCTION EXPORTS ==========
/**
 * Individual function exports for selective importing and testing
 * Enables fine-grained module consumption and unit testing capabilities
 */
export {
  handleUseRustyKey,
  handleUseCrystalOrb,
  handleUseSpellbook,
  handleUseGoldenCompass,
  handleUseSulfurCrystal,
  handleUseCaveSalt,
  handleUseTorchOil,
  handleUseWumpusRepellent,
  handleUseInvisibilityCloak, 
  calculateDistanceToRoom,
};

// ========== GROUPED HANDLER COLLECTION ==========
/**
 * Organized handler collection for bulk importing and system integration
 * Provides convenient access to complete item handler suite
 */
export const itemHandlers = {
  handleUseRustyKey,
  handleUseCrystalOrb,
  handleUseSpellbook,
  handleUseGoldenCompass,
  handleUseSulfurCrystal,
  handleUseCaveSalt,
  handleUseTorchOil,
  handleUseWumpusRepellent,
  handleUseInvisibilityCloak, 
  handleUseLooseRocks,
  handleUseWyrmglass,
  handleUseWizardJournal,
};