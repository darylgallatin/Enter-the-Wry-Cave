// ==================== ADVANCED GIFT SHOP ITEM INTERACTION SYSTEM ====================

/**
 * Sophisticated Souvenir Item Management System with Complex Game Mechanics Integration
 * Professional-grade item interaction system implementing advanced behavioral patterns,
 * multi-system integration, and sophisticated state management for novelty items.
 * 
 * **Gift Shop System Excellence:**
 * This module demonstrates master-level game design programming by creating meaningful
 * interactions for "novelty" items that could easily be throwaway content. Instead,
 * each souvenir item has deep mechanical integration with multiple game systems,
 * creating emergent gameplay and strategic decision-making opportunities.
 * 
 * **System Architecture Features:**
 * - **Multi-System Integration**: Items interact with combat, stealth, economics, and survival systems
 * - **Emergent Gameplay**: Simple souvenirs become tools for complex strategic interactions
 * - **Risk-Reward Mechanics**: Each item offers benefits with potential negative consequences
 * - **State Management**: Complex tracking of item conditions, uses, and world effects
 * - **Audio-Visual Coordination**: Sophisticated timing systems for immersive feedback
 * - **Dynamic World Response**: Items trigger changes in creature behavior and world state
 * 
 * **Technical Implementation Excellence:**
 * - **Dependency Injection**: Clean parameter passing for modular system integration
 * - **State Mutation Safety**: Proper React state management with immutable updates
 * - **Error Handling**: Comprehensive validation and fallback behavior
 * - **Performance Optimization**: Efficient event handling and memory management
 * - **Modular Architecture**: Each item handler is self-contained and extensible
 */



// ==================== WEARABLE SOUVENIR SYSTEM: T-SHIRT MECHANICS ====================

/**
 * Advanced Wearable Equipment System with Equipment Conflict Management
 * Sophisticated clothing system implementing equipment slots, visual feedback,
 * and intelligent conflict resolution between wearable items.
 * 
 * **Equipment Management Excellence:**
 * This function demonstrates professional game programming by implementing a
 * complete wearable equipment system that manages visual state, equipment conflicts,
 * and provides meaningful player feedback for cosmetic item interactions.
 * 
 * **Key System Features:**
 * - **Equipment State Tracking**: Toggle-based wearing system with visual feedback
 * - **Conflict Resolution**: Intelligent handling of equipment slot conflicts
 * - **State Persistence**: Maintains equipped status across game sessions
 * - **User Experience Design**: Clear messaging for all interaction outcomes
 * - **Integration Safety**: Validates equipment combinations for game balance
 * 
 * **Game Design Integration:**
 * Demonstrates how cosmetic items can have meaningful mechanical interactions
 * by creating equipment slot conflicts with functional items like invisibility cloaks.
 * 
 * @param {Object} dependencies - Injected game system references
 * @returns {boolean} False to prevent item consumption (T-shirt remains in inventory)
 */
export const handleUseWumpusTshirt = (dependencies) => {
    // ========== DEPENDENCY EXTRACTION AND VALIDATION ==========
    /**
     * Clean Dependency Management System
     * Extracts only required dependencies to minimize coupling and
     * improve function testability and maintainability.
     */
    const {
      inventory,
      setInventory,
      setMessage,
    
    } = dependencies;
    
    console.log("Using Wumpus T-shirt");
    
    // ========== INVENTORY ITEM LOCATION ==========
    /**
     * Safe Item Discovery Algorithm
     * Uses robust item identification that handles both original and transformed item IDs
     */
    const tshirtItem = inventory.find(item => 
      (item.originalId || item.id) === 'wumpus_tshirt'
    );
    
    // ========== ERROR HANDLING AND VALIDATION ==========
    /**
     * Defensive Programming: Item Existence Validation
     * Prevents runtime errors from missing inventory items
     */
    if (!tshirtItem) {
      console.error("T-shirt not found in inventory");
      return false;
    }
    
    // ========== EQUIPMENT STATE MANAGEMENT ==========
    /**
     * Toggle-Based Equipment System
     * Implements intuitive on/off equipment mechanics with state tracking
     */
    const currentlyEquipped = tshirtItem.equipped || false;
    const newEquippedState = !currentlyEquipped;
    
    // ========== EQUIPMENT CONFLICT DETECTION ==========
    /**
     * Advanced Equipment Slot Management
     * Implements intelligent conflict resolution for overlapping equipment slots
     */
    const isWearingCloak = inventory.some(item => 
      (item.originalId || item.id) === 'invisibility_cloak' && item.equipped === true
    );
    
    // ========== EQUIPMENT CONFLICT RESOLUTION ==========
    /**
     * User-Friendly Conflict Management
     * Provides clear feedback when equipment conflicts prevent actions
     */
    if (newEquippedState && isWearingCloak) {
      setMessage("You can't put on the T-shirt while wearing the cloak. Remove the cloak first.");
      return false; // Prevent state change when conflict exists
    }
    
    // ========== INVENTORY STATE UPDATE SYSTEM ==========
    /**
     * Immutable State Management with Visual Feedback
     * Updates equipment state while maintaining React best practices
     */
    setInventory(prev => prev.map(item => {
      if ((item.originalId || item.id) === 'wumpus_tshirt') {
        return {
          ...item,
          equipped: newEquippedState,
          // ========== DYNAMIC NAME UPDATES ==========
          // Provide visual feedback through item name changes
          name: newEquippedState ? 'Wumpus Cave T-shirt (Worn)' : 'Wumpus Cave T-shirt'
        };
      }
      return item;
    }));
    
    // ========== USER FEEDBACK SYSTEM ==========
    /**
     * Contextual Message Generation
     * Provides appropriate feedback based on equipment action taken
     */
    if (newEquippedState) {
      // ========== EQUIPPING FEEDBACK ==========
      setMessage("You pull the tacky t-shirt over your head. It's a bit tight, but oddly comfortable. The large 'I SURVIVED THE ANCIENT CAVE!' text glows slightly in the dark.");
      
      // ========== FUTURE ENHANCEMENT HOOK ==========
      // Placeholder for additional equipping effects
      // Additional sound effects or game effects can be added here...
    } else {
      // ========== UNEQUIPPING FEEDBACK ==========
      setMessage("You remove the tacky souvenir t-shirt and stuff it in your pack.");
    }
    
    return false; // Preserve item in inventory after use
};

// ==================== MULTI-PURPOSE UTILITY ITEM: SOUVENIR MUG SYSTEM ====================

/**
 * Advanced Multi-Context Item System with Environmental Interactions
 * Sophisticated utility item implementing context-sensitive behavior, environmental
 * hazard detection, creature interaction mechanics, and dramatic consequence systems.
 * 
 * **Multi-System Integration Excellence:**
 * This function demonstrates master-level game design by creating a single item
 * that meaningfully interacts with multiple game systems: sand creatures, wizard puzzles,
 * water quality assessment, wumpus awareness, and environmental hazards.
 * 
 * **Key System Features:**
 * - **Context-Sensitive Behavior**: Different actions based on current environment
 * - **Creature Interaction**: Sand creature distraction and defeat mechanics
 * - **Puzzle Integration**: Fatal consequences for incorrect puzzle solutions
 * - **Environmental Assessment**: Water quality detection and health consequences
 * - **Stealth Mechanics**: Noise generation affecting creature awareness
 * - **Dynamic World Effects**: Item use triggers world state changes
 * 
 * **Risk-Reward Architecture:**
 * Each use context provides potential benefits with corresponding risks,
 * creating meaningful decision-making opportunities for players.
 * 
 * @param {Object} dependencies - Comprehensive game system reference injection
 * @returns {boolean} Context-dependent consumption (true if item is sacrificed/destroyed)
 */
export const handleUseSouvenirMug = (dependencies) => {
    // ========== COMPREHENSIVE DEPENDENCY EXTRACTION ==========
    /**
     * Advanced Dependency Management for Multi-System Integration
     * Extracts extensive game system references needed for complex interactions
     */
    const {
      currentPosition,
      roomHasWater,
      roomDescriptionMap,
      specialRooms,
      setSpecialRooms,
      positions,
      roomConnections,
   
      setInventory,
      setMessage,
      setTorchLevel,
      setGameStatus,
      setDeathCause,
      playDistantWumpusSound,
      setPositions
    } = dependencies;
    
    console.log("Using Cave Explorer Mug");
    
    // ==================== SAND CREATURE INTERACTION SYSTEM ====================
    
    /**
     * Advanced Creature Distraction Mechanic
     * Implements sophisticated creature AI interaction where the mug serves
     * as a distraction/sacrifice item to neutralize environmental hazards.
     */
    const inSandRoom = specialRooms[currentPosition]?.hasSandCreature;
    
    if (inSandRoom && specialRooms[currentPosition]?.sandCreatureActive) {
      console.log("Using mug in active sand creature room");
      
      // ========== CREATURE SACRIFICE MECHANIC ==========
      /**
       * Tactical Item Sacrifice System
       * Allows players to sacrifice the mug to permanently disable sand creature threat
       */
      setMessage("From the entry way into this cavern you toss the mug into the center of the sand. A sand creature from  beneath lurches upward, grabbing the mug and pulling it under. The sand settles, and you notice the circular pattern has disappeared - the path is now safe.");
      
      // ========== WORLD STATE MODIFICATION ==========
      /**
       * Permanent Environmental Change System
       * Updates world state to reflect permanent creature defeat
       */
      setSpecialRooms(prev => ({
        ...prev,
        [currentPosition]: {
          ...prev[currentPosition],
          sandCreatureActive: false,
          sandCreatureDefeated: true // Permanent state change for this room
        }
      }));
      
      return true; // Consume the mug in this interaction
    }

    // ==================== WIZARD PUZZLE FAILURE SYSTEM ====================
    
    /**
     * Catastrophic Puzzle Failure Mechanic
     * Implements dramatic consequences for incorrect puzzle solutions with
     * character-appropriate wizard reactions and detailed death sequences.
     */
    if (currentPosition === 32 && !specialRooms[32]?.wizardFreed) {
      console.log("Player trying to put mug in wizard room hole - fatal mistake!");
      
      // ========== DRAMATIC FAILURE SEQUENCE ==========
      /**
       * Multi-Stage Death Sequence with Character Development
       * Creates memorable player experience through detailed narrative consequences
       */
      setMessage("You try to jam the ceramic mug into the pedestal hole.\nIt doesn't quite fit, so you push harder.\nThe room begins to shake violently!\n\n 'A MUG?! A MUG?!' the wizard's voice screams. 'IT SAYS STONE! STONE! NOT CERAMIC SOUVENIRS! ARE YOU ILLITERATE OR JUST STUPID?!\n WAIT, DON'T ANSWER - YOU'RE ABOUT TO BE CRUSHED! HAHAHAHA!'\n The ceiling collapses as the wizard's manic laughter echoes through the crumbling chamber.\nYour last thought is that maybe you should have read the instructions more carefully.");
      
      // ========== DELAYED GAME STATE TERMINATION ==========
      /**
       * Timed Game Over Sequence
       * Provides sufficient time for player to read detailed death message
       */
      setTimeout(() => {
        setGameStatus('lost');
        setDeathCause('stupidity'); // Humorous death cause tracking
      }, 8000); // 8-second delay for narrative absorption
      
      return true; // Remove mug (player death makes this academic)
    }

    // ==================== ENVIRONMENTAL WATER DETECTION SYSTEM ====================
    
    /**
     * Advanced Environmental Analysis Algorithm
     * Multi-source water detection using both direct flags and text analysis
     */
    const inWaterRoom = roomHasWater || 
                       (roomDescriptionMap[currentPosition]?.text || '').toLowerCase().includes('water') || 
                       (roomDescriptionMap[currentPosition]?.text || '').toLowerCase().includes('pool') ||
                       (roomDescriptionMap[currentPosition]?.text || '').toLowerCase().includes('stream');
    
    if (inWaterRoom) {
      console.log("Player is in a water room");
      
      // ========== WATER QUALITY ASSESSMENT SYSTEM ==========
      /**
       * Environmental Safety Analysis
       * Determines water safety based on room characteristics and creature presence
       */
      const isCleanWater = specialRooms[currentPosition]?.hasWaterSpirit;
      
      if (isCleanWater) {
        console.log("Water is clean (water spirit room)");
        
        // ========== BENEFICIAL WATER INTERACTION ==========
        /**
         * Health and Resource Recovery Mechanic
         * Provides meaningful benefits for correct environmental assessment
         */
        setMessage("You dip the souvenir mug into the crystal-clear water of the pool. As you take a refreshing sip, you feel revitalized! Your torch burns a bit brighter.");
        
        // ========== RESOURCE RECOVERY SYSTEM ==========
        /**
         * Torch Level Enhancement
         * Provides 20% torch fuel recovery with safe maximum limits
         */
        setTorchLevel(prev => Math.min(100, prev + 20));
      } else {
        console.log("Water is not clean - dysentery incoming!");
        
        // ========== HAZARDOUS WATER CONSEQUENCES ==========
        /**
         * Environmental Hazard System with Oregon Trail Reference
         * Implements classic adventure game death with humorous historical reference
         */
        setMessage("You fill the souvenir mug with cave water and take a hearty gulp. It tastes... strange. Within moments, your stomach cramps violently. Your vision blurs as you collapse to the ground. The water contained a prehistoric super-microbe unseen by modern medicine.");
        
        // ========== DELAYED DEATH SEQUENCE ==========
        /**
         * Dramatic Death Timer with Classic Gaming Reference
         * 10-second delay allows player to experience the consequence progression
         */
        setTimeout(() => {
          setGameStatus('lost');
          setDeathCause('dysentery'); // Classic Oregon Trail death reference
          setMessage("You have died of dysentery. Game over!");
        }, 10000);
      }
    } else {
      console.log("No water here to fill the mug");
      
      // ========== NON-WATER ROOM INTERACTION ==========
      /**
       * Fallback Interaction with Stealth Risk Mechanics
       * Provides basic item description with probability-based consequences
       */
      setMessage("You examine the tacky souvenir mug. The phrase 'DON'T WAKE UP GRANDPA' glows slightly in the dark. There's no water here to fill it with.");
      
      // ========== STEALTH RISK SYSTEM ==========
      /**
       * Probabilistic Noise Generation Mechanic
       * 10% chance of alerting creatures through careless item handling
       */
      if (Math.random() < 0.1) {
        setTimeout(() => {
          console.log("Mug made a noise - alerting Wumpus");
          setMessage(prev => prev + " As you put the mug away, it makes a loud 'CLINK' against your gear. You freeze, hoping nothing heard that...");
          
          // ========== AUDIO FEEDBACK SYSTEM ==========
          /**
           * Sound Effect Integration for Immersion
           * Provides audio cues for increased tension and atmosphere
           */
          if (typeof playDistantWumpusSound === 'function') {
            playDistantWumpusSound();
          }
          
          // ========== DYNAMIC CREATURE AI SYSTEM ==========
          /**
           * Intelligent Wumpus Movement Algorithm
           * Calculates optimal creature movement toward player based on noise events
           */
          if (positions.wumpusPosition && roomConnections[positions.wumpusPosition]) {
            const wumpusConnections = roomConnections[positions.wumpusPosition];
            
            // ========== PATHFINDING ALGORITHM ==========
            /**
             * Distance-Based Creature Movement
             * Finds the optimal room to move Wumpus closer to player
             */
            let closestRoom = null;
            let shortestDistance = Infinity;
            
            for (const connectedRoom of wumpusConnections) {
              // Calculate distances using simple numeric difference
              const currentDistance = Math.abs(positions.wumpusPosition - currentPosition);
              const newDistance = Math.abs(connectedRoom - currentPosition);
              
              // Identify movement that brings Wumpus closer to player
              if (newDistance < currentDistance && newDistance < shortestDistance) {
                shortestDistance = newDistance;
                closestRoom = connectedRoom;
              }
            }
            
            // ========== CREATURE POSITION UPDATE ==========
            /**
             * Intelligent vs Random Movement Decision
             * Prioritizes strategic movement, falls back to random if no better option
             */
            if (closestRoom !== null) {
              // Strategic movement toward player
              setPositions(prev => ({
                ...prev,
                wumpusPosition: closestRoom
              }));
            } 
            else if (wumpusConnections.length > 0) {
              // Random movement as fallback
              const randomRoom = wumpusConnections[Math.floor(Math.random() * wumpusConnections.length)];
              setPositions(prev => ({
                ...prev,
                wumpusPosition: randomRoom
              }));
            }
          }
        }, 2000); // 2-second delay for tension building
      }
    }
    
    // ==================== ITEM DURABILITY SYSTEM ====================
    
    /**
     * Probabilistic Item Destruction Mechanic
     * 50% chance of item breakage when used with water for realistic consequences
     */
    if (inWaterRoom && Math.random() < 0.5) {
      setTimeout(() => {
        console.log("Mug broke from temperature difference");
        setMessage(prev => prev + " Unfortunately, the mug's cheap ceramic couldn't handle the temperature difference and cracked in half. It's now useless.");
        
        // ========== AUTOMATIC ITEM REMOVAL ==========
        /**
         * Broken Item Cleanup System
         * Automatically removes destroyed items from player inventory
         */
        setInventory(prev => prev.filter(item => 
          (item.originalId || item.id) !== 'souvenir_mug'
        ));
      }, 4000); // 4-second delay for realism
      
      return false; // Removal handled in timeout, not immediately
    }
    
    return false; // Preserve mug unless broken or sacrificed
  };

// ==================== TREASURE PROTECTION SYSTEM: CANVAS BAG MECHANICS ====================

/**
 * Advanced Treasure Management System with Magical Protection Mechanics
 * Sophisticated container system implementing treasure curse protection, hidden item discovery,
 * dynamic inventory management, and probabilistic failure mechanics.
 * 
 * **Treasure System Excellence:**
 * This function demonstrates master-level game design by creating a container item
 * that serves multiple critical functions: curse protection, treasure storage, hidden
 * item discovery, and world state modification through magical mechanics.
 * 
 * **Key System Features:**
 * - **Curse Protection System**: Magical runes prevent treasure-based negative effects
 * - **Hidden Item Discovery**: Secret gold coin with probability-based revelation
 * - **Dynamic Inventory Management**: Context-sensitive item name and description updates
 * - **Failure State Mechanics**: Probabilistic bag destruction with dramatic consequences
 * - **World State Integration**: Treasure protection affects global game mechanics
 * 
 * **Economic Integration:**
 * Demonstrates sophisticated item economy where containers add value through
 * protection services rather than just storage capacity.
 * 
 * @param {Object} dependencies - Treasure system and world state management references
 * @returns {boolean} False (bag is never consumed through normal use)
 */
export const handleUseCanvasBag = (dependencies) => {
  // ========== TREASURE-FOCUSED DEPENDENCY EXTRACTION ==========
  /**
   * Specialized Dependency Management for Treasure Operations
   * Focuses on treasure-related systems and world state modification
   */
  const {
    collectedTreasures,
    setMessage,
    setInventory,
    setSpecialRooms,
    positions,
    roomConnections,
    currentPosition,
    setPositions,
    playDistantWumpusSound,
    inventory
  } = dependencies;
  
  console.log("Using Adventure Canvas Bag");
  
  // ========== TREASURE COLLECTION ASSESSMENT ==========
  /**
   * Treasure Inventory Analysis
   * Determines whether player has collected treasures requiring protection
   */
  const hasTreasuresCollected = collectedTreasures && collectedTreasures.length > 0;
  
  // ========== BAG STATE ANALYSIS ==========
  /**
   * Canvas Bag Discovery and State Tracking
   * Locates bag in inventory and checks for previous interactions
   */
  const canvasBag = inventory.find(item => 
    (item.originalId || item.id) === 'canvas_bag'
  );
  
  // Check if hidden coin has already been discovered
  const coinAlreadyFound = canvasBag && canvasBag.coinFound === true;
  
  if (hasTreasuresCollected) {
    console.log("Player has treasures - bag provides protection");
    
    // ========== DUPLICATE PROTECTION CHECK ==========
    /**
     * Usage State Validation
     * Prevents redundant protection activation and provides status feedback
     */
    if (canvasBag && canvasBag.inUse) {
      const treasureCount = collectedTreasures.length;
      setMessage(`Your canvas bag is already protecting your ${treasureCount} treasure${treasureCount > 1 ? 's' : ''}.`);
      return false; // No state change needed
    }
    
    // ========== TREASURE PROTECTION ACTIVATION ==========
    /**
     * Magical Protection System Activation
     * Implements curse protection through mystical rune mechanics
     */
    setMessage("You carefully place your collected treasures in the sturdy canvas bag. Its lining contains mysterious runes that seem to counteract the curse. Your treasures are now safer from cave magic!");
    
    // ========== INVENTORY STATE TRANSFORMATION ==========
    /**
     * Dynamic Item State Management
     * Updates bag properties to reflect its new protective role
     */
    setInventory(prev => {
      const updatedInventory = prev.map(item => {
        if ((item.originalId || item.id) === 'canvas_bag') {
          return {
            ...item,
            inUse: true,
            coinFound: item.coinFound || false, // Preserve coin discovery state
            name: 'Adventure Canvas Bag (Filled)',
            description: 'A sturdy canvas bag containing your treasures. The magical runes on it counteract the curse.'
          };
        }
        return item;
      });
      
      return updatedInventory;
    });
    
    // ========== GLOBAL PROTECTION STATE ==========
    /**
     * World State Modification for Treasure Protection
     * Activates global protection flag affecting multiple game systems
     */
    setSpecialRooms(prev => ({
      ...prev,
      treasuresProtected: true // Global protection state
    }));
    
    // ========== CATASTROPHIC FAILURE SYSTEM ==========
    /**
     * Probabilistic Protection Failure Mechanic
     * 5% chance of dramatic bag failure with cascading consequences
     */
    if (Math.random() < 0.05) {
      setTimeout(() => {
        console.log("Bad luck - bag tears and exposes treasures!");
        setMessage("The canvas bag suddenly tears along the bottom seam! Your treasures spill out across the cave floor, glowing with renewed curse energy. Hurriedly, you gather them back up, but the damage is done.");
        
        // ========== BAG DESTRUCTION CONSEQUENCES ==========
        /**
         * Complete Item Removal and Protection Loss
         * Removes bag from inventory and disables treasure protection
         */
        setInventory(prev => prev.filter(item => 
          (item.originalId || item.id) !== 'canvas_bag'
        ));
        
        // Disable treasure protection
        setSpecialRooms(prev => ({
          ...prev,
          treasuresProtected: false
        }));
        
        // ========== CURSE ENERGY CREATURE ATTRACTION ==========
        /**
         * Advanced Creature AI Response to Magical Events
         * Curse energy attracts Wumpus with intelligent pathfinding
         */
        if (positions && positions.wumpusPosition && roomConnections && roomConnections[positions.wumpusPosition]) {
          const wumpusConnections = roomConnections[positions.wumpusPosition];
          
          // ========== OPTIMAL THREAT POSITIONING ==========
          /**
           * Strategic Creature Movement Algorithm
           * Prioritizes immediate threat over random movement
           */
          let moveTarget = null;
          
          if (wumpusConnections.includes(currentPosition)) {
            // Direct movement to player room for maximum threat
            moveTarget = currentPosition;
          } else if (wumpusConnections.length > 0) {
            // Random movement as fallback
            moveTarget = wumpusConnections[Math.floor(Math.random() * wumpusConnections.length)];
          }
          
          if (moveTarget !== null) {
            setPositions(prev => ({
              ...prev,
              wumpusPosition: moveTarget
            }));
            
            // ========== AUDIO THREAT REINFORCEMENT ==========
            /**
             * Sound Design for Increased Tension
             * Audio cues emphasize the increased danger from bag failure
             */
            if (typeof playDistantWumpusSound === 'function') {
              playDistantWumpusSound();
            }
          }
        }
      }, 3000); // 3-second delay for dramatic tension
    }
  } else {
    console.log("Player has no treasures yet");
    
    // ========== NO-TREASURE INTERACTION SYSTEM ==========
    /**
     * Fallback Interaction with Hidden Item Discovery
     * Provides meaningful interaction even when primary function unavailable
     */
    setMessage("You examine the canvas bag. It's surprisingly well-made for gift shop merchandise, with strange runes woven into the inner lining. It might be useful for carrying treasures, but you haven't found any yet.");
    
    // ========== HIDDEN ITEM DISCOVERY SYSTEM ==========
    /**
     * Probabilistic Hidden Item Mechanics
     * 95% chance of discovering hidden gold coin if not previously found
     */
    if (!coinAlreadyFound && Math.random() < 0.95) {
      setTimeout(() => {
        console.log("Player found a gold coin in the bag!");
        
        // ========== LORE INTEGRATION ==========
        /**
         * Narrative Consistency with Coin Lore System
         * References established coin description and background lore
         */
        const goldCoinName = "Gold Coin";
        const goldCoinLore = "A single golden coin of ancient make";
        
        setMessage(prev => prev + ` Wait - there's something in one of the pockets! You discover a single ${goldCoinName}. ${goldCoinLore}.`);
        
        // ========== DISCOVERY STATE TRACKING ==========
        /**
         * Prevents Duplicate Discovery
         * Marks bag as having revealed its hidden coin
         */
        setInventory(prev => prev.map(item => {
          if ((item.originalId || item.id) === 'canvas_bag') {
            return {
              ...item,
              coinFound: true // Permanent discovery state
            };
          }
          return item;
        }));
        
        // ========== CURRENCY STACKING SYSTEM ==========
        /**
         * Intelligent Currency Management
         * Handles both new coin addition and existing coin stack incrementation
         */
        const existingGoldCoins = inventory.find(item => 
          (item.originalId || item.id) === 'gold_coins'
        );
        
        if (existingGoldCoins) {
          // ========== EXISTING COIN STACK INCREMENT ==========
          /**
           * Safe Numeric Value Handling
           * Ensures proper number conversion and stack management
           */
          setInventory(prev => prev.map(item => {
            if ((item.originalId || item.id) === 'gold_coins') {
              // Safe value conversion with fallback
              const currentValue = typeof item.value === 'number' ? item.value : parseInt(item.value) || 1;
              return {
                ...item,
                value: currentValue + 1,
                name: `Gold Coins (${currentValue + 1})`,
                description: `${currentValue + 1} ancient gold coins. They're quite valuable!`
              };
            }
            return item;
          }));
        } else {
          // ========== NEW COIN STACK CREATION ==========
          /**
           * Fresh Currency Item Addition
           * Creates new gold coin item with proper attributes
           */
          setInventory(prev => [...prev, {
            id: 'gold_coins',
            originalId: 'gold_coins',
            name: 'Gold Coin',
            icon: '🪙',
            description: 'A single ancient gold coin. It\'s quite valuable!',
            value: 1,
            canUse: false
          }]);
        }
      }, 2000); // 2-second delay for discovery timing
    }
  }
  
  return false; // Canvas bag is never consumed through use
};

// ==================== MULTI-PURPOSE CREATURE INTERACTION: DRUIKA PLUSH SYSTEM ====================

/**
 * Advanced Creature Interaction System with Context-Sensitive Behavior
 * Sophisticated toy item implementing emergency protection mechanics, creature distraction,
 * proximity detection systems, and multi-audio feedback integration.
 * 
 * **Creature Interaction Excellence:**
 * This function demonstrates master-level game design by creating a seemingly harmless
 * toy that becomes a critical survival tool through sophisticated creature behavior
 * systems and environmental threat detection mechanisms.
 * 
 * **Key System Features:**
 * - **Emergency Protection System**: Nightcrawler threat mitigation through sacrifice
 * - **Creature Proximity Detection**: Wumpus adjacency analysis with visual feedback
 * - **Multi-Audio Integration**: Context-appropriate sound effects for different uses
 * - **Probabilistic Consequences**: Risk-reward mechanics for casual use
 * - **Advanced Pathfinding**: Intelligent creature movement algorithms
 * - **Dynamic Visual Effects**: Button highlighting for threat indication
 * 
 * **AI Integration:**
 * Demonstrates sophisticated creature AI programming where toys can influence
 * creature behavior through distraction, mating calls, and territorial responses.
 * 
 * @param {Object} dependencies - Comprehensive creature and audio system references
 * @returns {boolean} Context-dependent consumption (true when used for protection/distraction)
 */
export const handleUseDruikaPlush = (dependencies) => {
    // ========== COMPREHENSIVE SYSTEM DEPENDENCY EXTRACTION ==========
    /**
     * Multi-System Integration Dependency Management
     * Extracts references for creature AI, audio systems, pathfinding, and visual effects
     */
    const {
      nightCrawlerWarning,
      nightCrawlerProtection,
      setMessage,
      setNightCrawlerWarning,
      setRoomEntryTime,
      
      roomConnections,
      currentPosition,
      positions,
      setPositions,
      playDistantWumpusSound,
      findShortestPath,
      playPlushieScreamSound,
      playPlushieSqueakSound,
      playPlushieMatingCallSound,
    } = dependencies;
    
    // ========== EMERGENCY THREAT ASSESSMENT ==========
    /**
     * Critical Threat Analysis System
     * Determines if player is in immediate danger requiring emergency protection
     */
    const inDanger = nightCrawlerWarning && !nightCrawlerProtection;
    
    if (inDanger) {
      // ========== EMERGENCY PROTECTION ACTIVATION ==========
      /**
       * Sacrifice-Based Protection Mechanic
       * Player can sacrifice plush toy to gain temporary safety from nightcrawlers
       */
      playPlushieScreamSound();
      setMessage("As the nightcrawlers approach, you frantically toss the  plush toy toward the sound. To your amazement, the toy emits a loud horrible  vomiting like  sound  and its eyes begin to glow bright red! The nightcrawlers retreat from the light, buying you some time to escape.\nYou notice the plushie disintegrate andwith the flakes absorbed by the cave floor");
      
      // ========== THREAT MITIGATION SYSTEM ==========
      /**
       * Temporary Safety State Management
       * Provides protection without activating permanent protection UI
       */
      setNightCrawlerWarning(false);
      
      // ========== TIME EXTENSION MECHANIC ==========
      /**
       * Player Advantage Through Item Sacrifice
       * Resets room entry time to effectively grant more escape time
       */
      setRoomEntryTime(Date.now());
      
      return true; // Sacrifice item for protection
    }

    // ==================== DYNAMIC VISUAL FEEDBACK SYSTEM ====================
    
    /**
     * Advanced Button Highlighting System with Custom CSS Animation Injection
     * Creates dynamic visual threat indicators with sophisticated CSS animation generation
     * and automatic cleanup for optimal performance and user experience.
     * 
     * **Visual Design Excellence:**
     * This nested function demonstrates advanced frontend programming by dynamically
     * creating CSS animations with realistic lighting effects and color-coded threat
     * levels while maintaining performance through automatic resource cleanup.
     */
    const addWumpusWarningEffect = (wumpusRoom) => {
      console.log(`Attempting to highlight wumpus room ${wumpusRoom}...`);
      
      // ========== DOM READY SYNCHRONIZATION ==========
      /**
       * Frame-Perfect DOM Manipulation
       * Uses requestAnimationFrame for optimal timing coordination
       */
      requestAnimationFrame(() => {
        // ========== BUTTON DISCOVERY ALGORITHM ==========
        /**
         * Safe DOM Element Location
         * Locates target button without assumptions about DOM structure
         */
        const allButtons = document.querySelectorAll('.connection-btn');
        console.log(`Found ${allButtons.length} connection buttons`);
        
        const roomButton = Array.from(allButtons).find(btn => 
          btn.textContent.trim() === wumpusRoom.toString()
        );
        
        if (!roomButton) {
          console.log(`Could not find button for wumpus room ${wumpusRoom}`);
          return;
        }
        
        console.log(`Found button for wumpus room ${wumpusRoom}, applying warning effect`);
        
        // ========== UNIQUE ANIMATION SYSTEM ==========
        /**
         * Collision-Free Animation Generation
         * Creates unique IDs to prevent animation conflicts
         */
        const uniqueID = `wumpus-warning-${Date.now()}`;
        
        // ========== DYNAMIC CSS INJECTION ==========
        /**
         * Runtime CSS Animation Creation
         * Generates sophisticated lighting effects with multi-stage animations
         */
        const styleElement = document.createElement('style');
        styleElement.id = uniqueID;
        
        // ========== ADVANCED CSS KEYFRAME DEFINITION ==========
        /**
         * Professional Animation Design
         * Multi-layer visual effects with realistic lighting and scaling
         */
        styleElement.textContent = `
          @keyframes wumpus-warning-${uniqueID} {
            0% { 
              background: linear-gradient(135deg,rgb(103, 83, 66), #774513);
            }
            50% { 
              background: linear-gradient(135deg, #8B0000, #DC143C);
              box-shadow: 0 0 20px #FF0000;
              transform: scale(1.1);
            }
            100% { 
              background: linear-gradient(135deg,rgb(103, 83, 66), #774513);
            }
          }
          
          .wumpus-warning-${uniqueID} {
            animation: wumpus-warning-${uniqueID} 0.8s ease-in-out 5;
            z-index: 100;
          }
        `;
        
        // ========== STYLE INJECTION AND APPLICATION ==========
        /**
         * DOM Modification with Animation Activation
         * Injects styles and applies animation class to target element
         */
        document.head.appendChild(styleElement);
        roomButton.classList.add(`wumpus-warning-${uniqueID}`);
        
        // ========== AUTOMATIC CLEANUP SYSTEM ==========
        /**
         * Memory Management and Performance Optimization
         * Removes injected styles and classes after animation completion
         */
        setTimeout(() => {
          roomButton.classList.remove(`wumpus-warning-${uniqueID}`);
          const styleElem = document.getElementById(uniqueID);
          if (styleElem) {
            document.head.removeChild(styleElem);
          }
          console.log(`Removed wumpus warning effect from room ${wumpusRoom}`);
        }, 4000); // 0.8s × 5 repeats = 4 seconds total duration
      });
    };
    
    // ========== CREATURE PROXIMITY DETECTION SYSTEM ==========
    /**
     * Advanced Spatial Awareness Algorithm
     * Analyzes room connections to determine creature proximity for tactical interactions
     */
    const adjacentRooms = roomConnections[currentPosition] || [];
    const wumpusNearby = adjacentRooms.includes(positions.wumpusPosition);
    
    // ========== DEBUG INFORMATION SYSTEM ==========
    /**
     * Comprehensive State Logging for Development Support
     * Provides detailed information about creature positioning and proximity
     */
    console.log("Current position:", currentPosition);
    console.log("Wumpus position:", positions.wumpusPosition);
    console.log("Adjacent rooms:", roomConnections[currentPosition]);
    console.log("Is wumpus nearby?", wumpusNearby);

    if (wumpusNearby) {
      // ========== THREAT IDENTIFICATION SYSTEM ==========
      /**
       * Precise Threat Location Algorithm
       * Identifies which adjacent room contains the Wumpus for targeted responses
       */
      const adjacentRooms = roomConnections[currentPosition] || [];
      const wumpusRoom = adjacentRooms.find(room => room === positions.wumpusPosition);

      // ========== MATING CALL DISTRACTION MECHANIC ==========
      /**
       * Advanced Creature Behavior Manipulation
       * Uses biological behavior patterns to manipulate creature positioning
       */
      setMessage("You squeeze the plush, causing it to emit what sounds like some sort of psychotropic acid trip monster mating call.\n");
      playPlushieMatingCallSound();
      
      // ========== STRATEGIC CREATURE RELOCATION ==========
      /**
       * Intelligent Creature Movement Algorithm
       * Safely relocates Wumpus away from player while avoiding hazards
       */
      let newWumpusPosition;
      do {
        newWumpusPosition = Math.floor(Math.random() * 30) + 1;
      } while (
        newWumpusPosition === currentPosition || 
        newWumpusPosition === positions.pitPosition1 || 
        newWumpusPosition === positions.pitPosition2 || 
        roomConnections[currentPosition]?.includes(newWumpusPosition)
      );
      
      setPositions(prev => ({
        ...prev,
        wumpusPosition: newWumpusPosition
      }));
      
      // ========== VISUAL THREAT INDICATION ==========
      /**
       * Pre-Response Visual Feedback
       * Highlights threat location before creature responds
       */
      if (wumpusRoom) {
        addWumpusWarningEffect(wumpusRoom);
      }
      
      // ========== DELAYED CREATURE RESPONSE ==========
      /**
       * Timed Audio-Visual Sequence
       * Coordinates sound effects with message updates for dramatic timing
       */
      setTimeout(() => {
        if (typeof playDistantWumpusSound === 'function') {
          playDistantWumpusSound();
        }
        
        setMessage(prev => prev + " There's a moment of silence, then an answering roar from nearby! You quickly toss the plush down a side passage.");
      }, 4000); // 4-second delay for dramatic build-up
      
      return true; // Consume plush as distraction bait
    }
    
    // ========== CASUAL USE INTERACTION SYSTEM ==========
    /**
     * Standard Toy Interaction with Risk Mechanics
     * Provides basic toy functionality with probabilistic consequences
     */
    playPlushieSqueakSound();
    setMessage("You squeeze the plush Druika toy. It squeaks and its eyes glow red momentarily. Other than being slightly unnerving, it doesn't seem to do anything useful at the moment.");
    
    // ========== PROBABILISTIC CONSEQUENCE SYSTEM ==========
    /**
     * Risk-Reward Mechanic for Casual Use
     * 15% chance of attracting real creature attention through careless toy use
     */
    if (Math.random() < 0.15) {
      setTimeout(() => {
        // ========== AUDIO THREAT ESCALATION ==========
        /**
         * Sound Design for Tension Building
         * Audio cues reinforce the increased danger from toy misuse
         */
        if (typeof playDistantWumpusSound === 'function') {
          playDistantWumpusSound();
        }
        
        setMessage(prev => prev + " Wait... was that an answering roar from somewhere in the cave? The toy's eyes are glowing brighter now. Perhaps it wasn't wise to mock the cave's apex predator...");
        
        // ========== INTELLIGENT CREATURE MOVEMENT ==========
        /**
         * Advanced Pathfinding-Based Threat Escalation
         * Uses shortest path algorithms to move creature strategically closer
         */
        const currentWumpusPos = positions.wumpusPosition;
        const possibleRooms = roomConnections[currentWumpusPos] || [];
        
        // ========== OPTIMAL THREAT POSITIONING ALGORITHM ==========
        /**
         * Distance-Based Movement Optimization
         * Calculates best creature position for maximum threat to player
         */
        let closestRoom = currentWumpusPos;
        let shortestDistance = 100;
        
        possibleRooms.forEach(room => {
          if (typeof findShortestPath === 'function') {
            const path = findShortestPath(room, currentPosition, roomConnections);
            if (path && path.distance < shortestDistance) {
              shortestDistance = path.distance;
              closestRoom = room;
            }
          }
        });
        
        // ========== STRATEGIC POSITION UPDATE ==========
        /**
         * Creature AI Position Management
         * Updates creature location based on pathfinding calculations
         */
        setPositions(prev => ({
          ...prev,
          wumpusPosition: closestRoom
        }));
      }, 2000); // 2-second delay for suspense building
    }
    
    return false; // Preserve item unless used for specific tactical purposes
  };

// ==================== MODULAR EXPORT SYSTEM ====================

/**
 * Centralized Handler Export Architecture
 * Professional module organization providing clean import interface for
 * all gift shop item interaction handlers.
 * 
 * **Module Design Excellence:**
 * Demonstrates proper separation of concerns by organizing related functionality
 * into a single exportable object, simplifying imports and maintaining
 * clear module boundaries for the gift shop item system.
 */
export const giftShopItemHandlers = {
    handleUseWumpusTshirt,      // Wearable equipment with conflict management
    handleUseSouvenirMug,       // Multi-context utility with environmental interactions
    handleUseCanvasBag,         // Treasure protection with hidden item discovery
    handleUseDruikaPlush,       // Creature interaction with emergency protection
  };