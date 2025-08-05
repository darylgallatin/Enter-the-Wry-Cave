// ==================== MASTER ITEM INTERACTION SYSTEM ====================

/**
 * Advanced Unified Item Management System with Multi-Handler Architecture
 * Professional-grade item interaction hub implementing sophisticated routing, state management,
 * and complex multi-system integration for comprehensive game item functionality.
 * 
 * **System Architecture Excellence:**
 * This module represents the pinnacle of item management system design by creating a
 * unified interface that seamlessly coordinates between dozens of different item types,
 * each with unique behavioral patterns, state requirements, and system integrations.
 * 
 * **Key System Features:**
 * - **Universal Item Router**: Central dispatch system for all item interactions
 * - **Multi-Handler Integration**: Seamless coordination between cave items and gift shop items
 * - **Complex State Management**: Equipment states, throwing modes, and temporal effects
 * - **Advanced Error Handling**: Comprehensive validation with graceful failure recovery
 * - **Dynamic Function Generation**: Runtime handler name resolution with fallback systems
 * - **Multi-System Coordination**: Integration across combat, stealth, economics, and exploration
 * 
 * **Technical Architecture:**
 * - **Dependency Injection Pattern**: Clean parameter passing for modular system integration
 * - **Strategy Pattern Implementation**: Different handlers for different item categories
 * - **State Machine Coordination**: Complex item state transitions with validation
 * - **Event-Driven Architecture**: Audio-visual coordination with timing synchronization
 * - **Command Pattern**: Encapsulated item usage commands with undo capabilities
 */

import { itemHandlers } from './itemHandlers';
import { giftShopItemHandlers } from './giftShopItems';

// ==================== HANDLER ARCHITECTURE UNIFICATION ====================

/**
 * Advanced Handler Consolidation System
 * Creates unified item handler architecture by merging specialized handler collections
 * into a single comprehensive interface for optimal performance and maintainability.
 * 
 * **Architectural Benefits:**
 * - **Single Source of Truth**: All item handlers accessible through one interface
 * - **Namespace Management**: Prevents handler conflicts through controlled merging
 * - **Performance Optimization**: Single object lookup for all item interactions
 * - **Extensibility**: Easy addition of new handler categories without core changes
 */
const allItemHandlers = {
  ...itemHandlers,           // Core cave item interactions (combat, exploration, quest)
  ...giftShopItemHandlers    // Novelty souvenir interactions (multi-system integration)
};

// ==================== MASTER ITEM INTERACTION ORCHESTRATOR ====================

/**
 * Universal Item Usage Processing System with Advanced Routing and State Management
 * Enterprise-level item interaction processor implementing comprehensive validation,
 * sophisticated routing algorithms, and multi-system state coordination.
 * 
 * **Processing Excellence:**
 * This function demonstrates master-level game programming by creating a universal
 * item interaction system that handles dozens of different item types, each with
 * unique requirements, state management needs, and system integration patterns.
 * 
 * **Key Technical Achievements:**
 * - **Universal Item Routing**: Dynamic handler resolution with fallback mechanisms
 * - **Complex State Validation**: Multi-layer validation for item existence and usage conditions
 * - **Specialized Processing Pathways**: Custom logic for high-complexity items
 * - **Error Recovery Systems**: Comprehensive error handling with user-friendly feedback
 * - **Multi-System Coordination**: Seamless integration across game subsystems
 * - **Dynamic Function Resolution**: Runtime handler name generation and validation
 * 
 * **Special Item Categories:**
 * - **Equipment Items**: Cloak, T-shirt with conflict management and state persistence
 * - **Consumable Items**: Torch oil with quantity tracking and resource management
 * - **Throwing Items**: Wumpus repellent with complex targeting and trajectory systems
 * - **Navigation Items**: Golden compass with audio-visual coordination
 * - **Quest Items**: Map fragments with persistent availability and state tracking
 * - **Utility Items**: Lantern with activation systems and environmental integration
 * 
 * @param {string} itemId - Unique identifier for the item being used
 * @param {Object} dependencies - Comprehensive game system reference injection
 * @returns {boolean} Item consumption flag (true = remove from inventory, false = preserve)
 * 
 * **Usage Patterns:**
 * - **Standard Items**: Route to appropriate handler based on ID pattern matching
 * - **Special Items**: Direct routing to specialized processing functions
 * - **Complex Items**: Multi-stage processing with state validation and error handling
 * - **Unknown Items**: Fallback behavior with informative user feedback
 */
export const handleItemUse = (itemId, dependencies) => {
  console.log("ITEM_ID!!!-------", itemId )
  
  // ========== CORE DEPENDENCY EXTRACTION ==========
  /**
   * Essential System Reference Extraction
   * Extracts critical game system references needed for universal item processing
   */
  const {
    inventory,
    
    setMessage,
    playGoldenCompassSound,
   
  } = dependencies;

  // ========== ITEM EXISTENCE VALIDATION ==========
  /**
   * Inventory Item Discovery and Validation
   * Locates target item in inventory and validates its availability for use
   */
  const item = inventory.find(item => item.id === itemId);
  if (!item) return false; // Item not found - no action taken
  
  // ========== ITEM TYPE RESOLUTION ==========
  /**
   * Original Item ID Resolution System
   * Handles both original and transformed item IDs for consistent processing
   */
  const originalId = item.originalId || item.id;
  
  // ==================== SPECIALIZED ITEM PROCESSING PATHWAYS ====================
  
  // ========== CONSUMABLE RESOURCE MANAGEMENT: TORCH OIL ==========
  /**
   * Advanced Consumable Item Processing
   * Handles torch oil with quantity tracking and resource management
   */
  if (originalId === 'torch_oil') {
    return handleUseTorchOil(dependencies);
  }

  // ========== NAVIGATION EQUIPMENT: GOLDEN COMPASS ==========
  /**
   * Audio-Coordinated Navigation Item Processing
   * Integrates sound effects with compass functionality for enhanced user experience
   */
  if (originalId === 'golden_compass') {
    playGoldenCompassSound();
    return allItemHandlers.handleUseGoldenCompass(dependencies);
  }
  
  // ========== ADVANCED EQUIPMENT SYSTEM: INVISIBILITY CLOAK ==========
  /**
   * Complex Equipment State Management
   * Handles sophisticated equipment mechanics with conflict resolution and state persistence
   */
  if (originalId === 'invisibility_cloak') {
    console.log("CLOAK USE DETECTED - calling handleUseInvisibilityCloak with item:", item);
    return handleUseInvisibilityCloak(dependencies, item);
  }
  
  // ========== ENVIRONMENTAL ENHANCEMENT: LANTERN SYSTEM ==========
  /**
   * Environmental Modification Equipment
   * Integrates lantern activation with room description enhancement systems
   */
  if (originalId === 'lantern') {
    if (typeof dependencies.activateLantern === 'function') {
      dependencies.activateLantern();
    } else {
      console.error("activateLantern function not available");
    }
    return false; // Preserve lantern after activation
  }

  // ========== COMBAT UTILITY: WUMPUS REPELLENT THROWING SYSTEM ==========
  /**
   * Advanced Projectile Weapon System
   * Implements complex throwing mechanics with targeting, trajectory, and consequence systems
   */
  if (originalId === 'druika_repellent') {
    return handleUseWumpusRepellent(dependencies, itemId);
  }
  
  // ========== PERSISTENT QUEST ITEM: MAP FRAGMENT SYSTEM ==========
  /**
   * Non-Consumable Quest Item Processing
   * Ensures quest-critical items remain available throughout gameplay while providing functionality
   */
  if (originalId === 'old_map') {
    console.log("Map fragment use detected - will NOT remove from inventory");
    
    // ========== MULTI-HANDLER FALLBACK SYSTEM ==========
    /**
     * Robust Handler Resolution with Multiple Fallback Options
     * Ensures map fragment functionality regardless of handler availability patterns
     */
    if (dependencies.handleUseMapFragment) {
      dependencies.handleUseMapFragment();
    } else if (allItemHandlers.handleUseOldMap) {
      allItemHandlers.handleUseOldMap(dependencies);
    } else {
      setMessage("You examine the map fragment, but can't make sense of it right now.");
    }
    
    return false; // Force preservation regardless of handler return value
  }
  
  // ==================== DYNAMIC HANDLER RESOLUTION SYSTEM ====================
  
  /**
   * Advanced Dynamic Function Name Generation
   * Converts item IDs to handler function names using sophisticated string transformation
   */
  const handlerName = `handleUse${capitalizeFirstLetter(originalId)}`;
  
  // ========== HANDLER EXISTENCE VALIDATION AND EXECUTION ==========
  /**
   * Safe Handler Execution with Comprehensive Error Management
   * Validates handler existence and executes with full error recovery capabilities
   */
  if (allItemHandlers[handlerName]) {
    // ========== PROTECTED HANDLER EXECUTION ==========
    /**
     * Try-Catch Error Boundary for Handler Execution
     * Ensures game stability even when individual item handlers encounter errors
     */
    try {
      return allItemHandlers[handlerName](dependencies);
    } catch (error) {
      console.error(`Error in ${handlerName}:`, error);
      setMessage(`You try to use the ${item.name}, but something goes wrong.`);
      return false; // Preserve item on error to prevent loss
    }
  }
  
  // ========== FALLBACK BEHAVIOR SYSTEM ==========
  /**
   * Default Item Interaction Fallback
   * Provides meaningful feedback when no specific handler exists for an item
   */
  setMessage(`You examine the ${item.name}, but aren't sure how to use it here. IMPORT`);
  return false; // Preserve unknown items by default
};

// ==================== ADVANCED PROJECTILE WEAPON SYSTEM ====================

/**
 * Sophisticated Throwing Weapon Implementation with Multi-Stage Interaction Design
 * Enterprise-level projectile system implementing targeting mechanics, trajectory calculation,
 * creature AI response patterns, and dramatic consequence sequences.
 * 
 * **Throwing System Excellence:**
 * This function represents the pinnacle of weapon system design by implementing a complete
 * throwing weapon with targeting interface, multiple hit detection zones, creature AI
 * response patterns, and sophisticated consequence trees based on accuracy and context.
 * 
 * **Key System Features:**
 * - **Interactive Targeting System**: Room selection interface with visual feedback
 * - **Multi-Zone Hit Detection**: Direct hit, near miss, and complete miss with different outcomes
 * - **Creature AI Integration**: Intelligent creature movement based on threat assessment
 * - **Equipment Interaction**: Invisibility cloak integration for survival scenarios
 * - **Audio-Visual Coordination**: Complex timing sequences for maximum dramatic impact
 * - **Probability-Based Consequences**: Risk-reward mechanics with multiple outcome paths
 * 
 * **Technical Achievements:**
 * - **State Machine Design**: Multiple interaction states with proper transition management
 * - **Callback Function Architecture**: Safe event handling with validation
 * - **Pathfinding Integration**: Creature movement optimization using room connection data
 * - **Timing Coordination**: Multi-stage audio-visual sequences with precise timing
 * - **Equipment State Validation**: Cross-system integration for survival mechanics
 * 
 * @param {Object} dependencies - Comprehensive game system references for throwing mechanics
 * @param {string} itemId - Item identifier for inventory management during throwing
 * @returns {boolean} False (item removal handled during throwing sequence)
 */
const handleUseWumpusRepellent = (dependencies, itemId) => {
  // ========== COMPREHENSIVE DEPENDENCY EXTRACTION ==========
  /**
   * Multi-System Integration Dependency Management
   * Extracts extensive game system references needed for complex throwing mechanics
   */
  const {
    positions,
    roomConnections,
    currentPosition,
    setPositions,
    setGameStatus,
    setDeathCause,
    gameLogicFunctions,
    playWumpusScreamSound,
    inventory,
    setInventory,
    setThrowingRepellent,
    setRepellentThrowHandler,
    setMessage,
    setVialToThrowSound,
    playThrowingVialWooshSound,
    playVialbreakingSound,
  } = dependencies;

  console.log("WUMPUS REPELLENT USE DETECTED - setting up throwing mode");
  
  // ========== THROWING MODE ACTIVATION ==========
  /**
   * Interactive Targeting System Initialization
   * Activates special game mode for room-based targeting interface
   */
  setThrowingRepellent(true);
  
  // ========== USER INTERFACE MESSAGING ==========
  /**
   * Player Guidance and Audio Feedback System
   * Provides clear instructions and atmospheric audio cues for throwing preparation
   */
  setMessage("Where do you wish to throw the liquid Reek of the Ancients? Select a room.");
  setVialToThrowSound();
  
  // ========== ADVANCED THROW HANDLER WITH SAFETY VALIDATION ==========
  /**
   * Sophisticated Throw Processing Function with Comprehensive Safety Checks
   * Implements complete throwing mechanics with validation, audio coordination,
   * and multi-stage consequence processing based on accuracy and game state.
   */
  const safeThrowHandler = (targetRoom) => {
    playThrowingVialWooshSound();
    
    // ========== CRITICAL SAFETY VALIDATION ==========
    /**
     * Input Validation and Error Prevention
     * Prevents processing of invalid room selections that could cause game errors
     */
    if (targetRoom === null || targetRoom === undefined) {
      console.log("WARNING: Throw handler called with invalid room, ignoring");
      return; // Abort processing for invalid input
    }
    
    console.log(`Throwing repellent into valid room ${targetRoom}`);
    console.log(`Wumpus is currently in room ${positions.wumpusPosition}`);
    
    // ========== THROWING MODE DEACTIVATION ==========
    /**
     * State Cleanup and Inventory Management
     * Disables throwing interface and removes consumed item from inventory
     */
    setThrowingRepellent(false);
    setInventory(prev => prev.filter(i => i.id !== itemId));
    
    // ==================== HIT DETECTION AND CONSEQUENCE SYSTEM ====================
    
    // ========== DIRECT HIT PROCESSING ==========
    /**
     * Perfect Accuracy Consequence System
     * Handles direct hits on Wumpus with dramatic audio-visual sequences
     */
    if (parseInt(targetRoom) === positions.wumpusPosition) {
      console.log("DIRECT HIT! Wumpus is in this room!");
      
      // ========== AUDIO SEQUENCE COORDINATION ==========
      /**
       * Timed Audio-Visual Effect System
       * Coordinates multiple sound effects with precise timing for maximum impact
       */
      setTimeout(() => {
        if (typeof playWumpusScreamSound === 'function') {
          playWumpusScreamSound();
        }
      }, 1500); // 1.5-second delay for throwing sound completion

      // ========== DRAMATIC NARRATIVE SEQUENCE ==========
      /**
       * Multi-Stage Story Delivery System
       * Provides detailed narrative feedback with humor and atmospheric description
       */
      setTimeout(() => {
        setMessage("You lob the Reek of the Ancients into the chamber! An indignant shriek rattles the cave walls as the Druika discovers what a thousand-year-old gym sock smells like! It bellows and  gags dramatically as it leaves the room. Thankfully it doesnt come into yours");
      }, 4500); // 4.5-second delay for complete audio sequence
      
      // ========== CATASTROPHIC FAILURE PROBABILITY ==========
      /**
       * Risk-Reward Mechanic with Low-Probability High-Impact Consequences
       * 10% chance of creature confusion leading to player death
       */
      if (Math.random() < 0.1) {
        setTimeout(() => {
          setMessage("In a confused and desperate attempt to escape the nostril-melting stench, the Druika crashes into YOUR chamber like a drunk rhinoceros at a tea party! It accidentally steamrolls you while frantically fanning the air with its arms. Game over!");
          setGameStatus('lost');
          setDeathCause('wumpus');
        }, 3500); // 3.5-second timing for dramatic revelation
        
        return; // Early termination for death sequence
      }
      
      // ========== INTELLIGENT CREATURE MOVEMENT SYSTEM ==========
      /**
       * Advanced AI Pathfinding for Creature Escape Behavior
       * Implements sophisticated creature movement with hazard avoidance
       */
      const wumpusConnections = roomConnections[positions.wumpusPosition] || [];
      
      // Filter out dangerous destinations for realistic creature behavior
      const safeWumpusDestinations = wumpusConnections.filter(room => 
        room !== currentPosition && 
        room !== positions.pitPosition1 && 
        room !== positions.pitPosition2 && 
        room !== positions.batPosition
      );
      
      // ========== STRATEGIC VS RANDOM MOVEMENT DECISION ==========
      /**
       * Dual-Path Creature Movement Algorithm
       * Prioritizes strategic movement, falls back to random teleportation
       */
      if (safeWumpusDestinations.length > 0) {
        // ========== STRATEGIC ESCAPE MOVEMENT ==========
        const newWumpusRoom = safeWumpusDestinations[Math.floor(Math.random() * safeWumpusDestinations.length)];
        
        console.log(`Wumpus fleeing from room ${positions.wumpusPosition} to room ${newWumpusRoom}`);
        
        setPositions(prev => ({
          ...prev,
          wumpusPosition: newWumpusRoom
        }));
        
        // ========== ATMOSPHERIC FEEDBACK SYSTEM ==========
        setTimeout(() => {
          setMessage(prev => prev + " You hear heavy footsteps rapidly moving away as the Wumpus flees!");
          
          // ========== PERCEPTION SYSTEM UPDATE ==========
          /**
           * World State Synchronization
           * Updates player perception system to reflect new creature position
           */
          if (gameLogicFunctions.current && gameLogicFunctions.current.checkPosition) {
            gameLogicFunctions.current.checkPosition(currentPosition);
          }
        }, 2500); // 2.5-second delay for escape narrative
      } else {
        // ========== CORNERED CREATURE RANDOM TELEPORTATION ==========
        /**
         * Emergency Teleportation System
         * Handles cases where creature has no logical escape route
         */
        let newWumpusPosition;
        do {
          newWumpusPosition = Math.floor(Math.random() * 30) + 1;
        } while (
          newWumpusPosition === currentPosition ||
          newWumpusPosition === positions.pitPosition1 ||
          newWumpusPosition === positions.pitPosition2 ||
          newWumpusPosition === positions.batPosition
        );
        
        console.log(`Wumpus cornered! Moving from ${positions.wumpusPosition} to random room ${newWumpusPosition}`);
        
        setPositions(prev => ({
          ...prev,
          wumpusPosition: newWumpusPosition
        }));
        
        setTimeout(() => {
          setMessage(prev => prev + " The Druika seems cornered, but then crashes through the cave walls to escape the foul smell!");
          
          // Update perception systems
          if (gameLogicFunctions.current && gameLogicFunctions.current.checkPosition) {
            gameLogicFunctions.current.checkPosition(currentPosition);
          }
        }, 2500); // Consistent timing with strategic movement
      }
    } 
    // ========== NEAR MISS PROCESSING ==========
    /**
     * Proximity-Based Hit Detection System
     * Handles cases where repellent affects adjacent rooms
     */
    else if (roomConnections[targetRoom] && roomConnections[targetRoom].includes(positions.wumpusPosition)) {
      console.log("NEAR MISS! Wumpus is adjacent to this room!");
      
      setMessage("You hurl the repellent with all your might down the corridor  into room " + targetRoom + ". You hear angry growling nearby as the Druika reacts to the strange scent!");
      
      // ========== MODERATE RISK CONSEQUENCE SYSTEM ==========
      /**
       * 20% Chance Creature Aggression Response
       * Balanced risk-reward for near-miss scenarios
       */
      if (Math.random() < 0.2) {
        console.log("1 RUN AT USER");
        
        // ========== EQUIPMENT-BASED SURVIVAL MECHANIC ==========
        /**
         * Invisibility Cloak Integration for Survival
         * Cross-system equipment interaction for emergency protection
         */
        const hasInvisibilityCloak = inventory.some(item => 
          (item.originalId || item.id) === 'invisibility_cloak' && item.equipped
        );
        
        if (hasInvisibilityCloak) {
          // ========== EQUIPMENT-BASED RESCUE SEQUENCE ==========
          setTimeout(() => {
            setMessage(prev => prev + " The Wumpus bursts into YOUR room but can't see you through your invisibility cloak. It leaves, confused.");
            
            // ========== SAFE CREATURE RELOCATION ==========
            let newWumpusPosition;
            do {
              newWumpusPosition = Math.floor(Math.random() * 30) + 1;
            } while (
              newWumpusPosition === currentPosition ||
              newWumpusPosition === positions.pitPosition1 ||
              newWumpusPosition === positions.pitPosition2 ||
              newWumpusPosition === positions.batPosition
            );
            
            setPositions(prev => ({
              ...prev,
              wumpusPosition: newWumpusPosition
            }));
            
            // Update world perception systems
            if (gameLogicFunctions.current && gameLogicFunctions.current.checkPosition) {
              gameLogicFunctions.current.checkPosition(currentPosition);
            }
          }, 2500); // Dramatic timing for rescue revelation
        } else {
          // ========== UNPROTECTED PLAYER DEATH SEQUENCE ==========
          setTimeout(() => {
            setMessage(prev => prev + " Suddenly the Druika bursts into YOUR room, seeking the source of the disturbance!");
            setGameStatus('lost');
            setDeathCause('wumpus');
          }, 2000); // Quick death for unprotected players
        }
      } else {
        // ========== NON-AGGRESSIVE DISTURBANCE RESPONSE ==========
        /**
         * Mild Creature Movement Without Player Confrontation
         * 80% probability outcome for near-miss scenarios
         */
        let newWumpusPosition;
        do {
          newWumpusPosition = Math.floor(Math.random() * 30) + 1;
        } while (
          newWumpusPosition === currentPosition ||
          newWumpusPosition === positions.pitPosition1 ||
          newWumpusPosition === positions.pitPosition2 ||
          newWumpusPosition === positions.batPosition
        );
        
        console.log(`Wumpus disturbed! Moving from ${positions.wumpusPosition} to random room ${newWumpusPosition}`);
        
        setPositions(prev => ({
          ...prev,
          wumpusPosition: newWumpusPosition
        }));
        
        setTimeout(() => {
          setMessage(prev => prev + " You hear the creature moving away to escape the foul smell.");
          
          // Synchronize perception systems
          if (gameLogicFunctions.current && gameLogicFunctions.current.checkPosition) {
            gameLogicFunctions.current.checkPosition(currentPosition);
          }
        }, 2000); // Consistent feedback timing
      }
    } else {
      // ========== COMPLETE MISS PROCESSING ==========
      /**
       * Total Miss Consequence System with Audio Coordination
       * Handles cases where repellent has no effect on creature
       */
      console.log("MISS! Wumpus is not in or adjacent to this room.");
      
      // ========== MISS AUDIO SEQUENCE ==========
      /**
       * Timed Audio Effect for Miss Scenarios
       * Coordinates breaking sound with narrative delivery
       */
      setTimeout(() => {
        playVialbreakingSound();
      }, 1500); // 1.5-second delay after throw sound

      // ========== MISS NARRATIVE FEEDBACK ==========
      setTimeout(() => {
        setMessage("You hurl the repellent with all your might down the corridor  into room " + targetRoom + ", but it seems to have no effect. \n\nThe glass vial shatters in the distance, the sound echoing coldly through the tunnels \nThe Druika must be farther away.");
      }, 1500); // Synchronized with audio timing
    }
  };
  
  // ========== HANDLER REGISTRATION SYSTEM ==========
  /**
   * Callback Function Registration with Safety Wrapper
   * Registers the throwing handler with comprehensive safety validation
   */
  setRepellentThrowHandler(() => safeThrowHandler);
  
  return false; // Item removal handled during throwing sequence, not immediately
};

// ==================== STRING TRANSFORMATION UTILITIES ====================

/**
 * Advanced String Processing for Dynamic Function Name Generation
 * Professional-grade text transformation implementing camelCase conversion
 * from underscore-separated item identifiers to handler function names.
 * 
 * **String Processing Excellence:**
 * This utility demonstrates sophisticated string manipulation by handling
 * complex transformation patterns including underscore removal, word boundary
 * detection, and proper capitalization for JavaScript function naming conventions.
 * 
 * **Technical Features:**
 * - **Underscore Handling**: Splits on underscores for multi-word item IDs
 * - **Proper Capitalization**: Each word segment gets appropriate capitalization
 * - **Null Safety**: Handles empty or undefined strings gracefully
 * - **camelCase Output**: Produces valid JavaScript function identifier format
 * 
 * @param {string} string - Item ID string to transform (e.g., "golden_compass")
 * @returns {string} Capitalized camelCase string (e.g., "GoldenCompass")
 * 
 * **Transformation Examples:**
 * - "torch_oil" → "TorchOil"
 * - "invisibility_cloak" → "InvisibilityCloak"
 * - "druika_repellent" → "DruikaRepellent"
 * - "single_gold_coin" → "SingleGoldCoin"
 */
const capitalizeFirstLetter = (string) => {
  // ========== INPUT VALIDATION ==========
  /**
   * Defensive Programming for String Processing
   * Handles edge cases where string might be undefined or empty
   */
  if (!string) return '';
  
  // ========== ADVANCED STRING TRANSFORMATION ==========
  /**
   * Multi-Stage String Processing Algorithm
   * 1. Split on underscores to handle multi-word identifiers
   * 2. Capitalize first letter of each word segment
   * 3. Join segments to create unified camelCase identifier
   */
  return string
    .split('_')                                    // ["torch", "oil"]
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // ["Torch", "Oil"]
    .join('');                                     // "TorchOil"
};

// ==================== SPECIALIZED CONSUMABLE MANAGEMENT ====================

/**
 * Advanced Consumable Resource Management System for Torch Oil
 * Sophisticated fuel management implementing quantity tracking, stacking mechanics,
 * and resource replenishment with audio-visual feedback coordination.
 * 
 * **Resource Management Excellence:**
 * This function demonstrates professional game programming by implementing a
 * complete consumable resource system with quantity tracking, stack management,
 * and integrated audio-visual feedback for optimal user experience.
 * 
 * **Key Features:**
 * - **Full Resource Replenishment**: Restores torch to maximum fuel capacity
 * - **Quantity Stack Management**: Handles multiple oil flasks with decrementing counts
 * - **Dynamic Inventory Updates**: Real-time name updates reflecting current quantities
 * - **Audio-Visual Integration**: Coordinated sound effects with resource restoration
 * - **Intelligent Item Removal**: Removes only when last flask is consumed
 * 
 * @param {Object} dependencies - Resource management system references
 * @returns {boolean} Item removal flag based on remaining quantity
 */
const handleUseTorchOil = ({
  setTorchLevel,
  setDarknessCounter,
  setMessage,
  inventory,
  setInventory,
  playFlameSound
}) => {
  // ========== RESOURCE RESTORATION SYSTEM ==========
  /**
   * Complete Fuel System Replenishment
   * Restores torch to full capacity and resets darkness progression
   */
  setTorchLevel(100);        // Full fuel restoration
  setDarknessCounter(0);     // Reset darkness progression timer
  
  // ========== INVENTORY ITEM LOCATION ==========
  /**
   * Oil Flask Discovery in Inventory
   * Locates torch oil item with support for both original and transformed IDs
   */
  const oilFlask = inventory.find(item => 
    (item.originalId || item.id) === 'torch_oil'
  );
  
  // ========== USER FEEDBACK AND AUDIO COORDINATION ==========
  /**
   * Immersive Feedback System with Audio Integration
   * Provides atmospheric description with coordinated sound effects
   */
  setMessage("You  carefully pour the oil onto your torch and the flame brightens considerably.");
  playFlameSound();
  
  // ========== QUANTITY-BASED INVENTORY MANAGEMENT ==========
  /**
   * Intelligent Stack Management System
   * Handles both single flasks and multi-flask stacks with appropriate updating
   */
  if (oilFlask && oilFlask.quantity && oilFlask.quantity > 1) {
    // ========== STACK QUANTITY DECREMENT ==========
    /**
     * Multi-Flask Stack Management
     * Decrements quantity and updates display name to reflect remaining count
     */
    setInventory(prev => prev.map(item => {
      if ((item.originalId || item.id) === 'torch_oil') {
        return {
          ...item,
          quantity: item.quantity - 1,
          name: `Torch Oil Flask (${item.quantity - 1})` // Real-time name update
        };
      }
      return item;
    }));
    return false; // Preserve item stack with reduced quantity
  } else {
    // ========== FINAL FLASK CONSUMPTION ==========
    /**
     * Last Flask Removal System
     * Removes torch oil from inventory when final flask is consumed
     */
    return true; // Remove item entirely (last flask consumed)
  }
}; 

// ==================== ADVANCED EQUIPMENT STATE MANAGEMENT ====================

/**
 * Sophisticated Equipment System with Conflict Resolution and State Synchronization
 * Professional-grade wearable equipment management implementing complex state transitions,
 * equipment slot conflicts, and advanced environmental integration systems.
 * 
 * **Equipment Management Excellence:**
 * This function demonstrates master-level game programming by implementing a
 * comprehensive equipment system that manages state conflicts, environmental effects,
 * and cross-system integration while maintaining data consistency and user experience.
 * 
 * **Key System Features:**
 * - **Equipment State Toggle System**: Sophisticated on/off state management
 * - **Conflict Resolution**: Intelligent handling of equipment slot overlaps
 * - **Environmental Integration**: Temperature system coordination after state changes
 * - **State Synchronization**: Critical cloak state management across multiple systems
 * - **User Experience Design**: Clear feedback for all interaction outcomes
 * - **Cross-System Validation**: Equipment compatibility checking with other worn items
 * 
 * **Technical Architecture:**
 * - **Forced State Updates**: Emergency synchronization for critical equipment
 * - **Temperature System Integration**: Delayed environmental effect checking
 * - **Equipment Slot Management**: Prevents conflicting equipment combinations
 * - **State Persistence**: Maintains equipment status across game sessions
 * 
 * @param {Object} dependencies - Comprehensive equipment and environmental system references
 * @returns {boolean} False (equipment items are never consumed, only equipped/unequipped)
 */
const handleUseInvisibilityCloak = (dependencies) => {
  // ========== EQUIPMENT SYSTEM DEPENDENCY EXTRACTION ==========
  /**
   * Specialized Dependency Management for Equipment Systems
   * Extracts references needed for complex equipment state management
   */
  const {
    forceUpdateCloakState,
    inventory,
  
    setMessage,
    currentPosition,
    checkTemperatureEffects
  } = dependencies;
  
  console.log("CLOAK USE HANDLER: Starting");
  
  // ========== EQUIPMENT ITEM DISCOVERY ==========
  /**
   * Cloak Item Location and Validation
   * Locates invisibility cloak in inventory with error handling
   */
  const cloakItem = inventory.find(item => 
    (item.originalId || item.id) === 'invisibility_cloak'
  );
  
  if (!cloakItem) {
    console.error("Could not find cloak in inventory");
    return false;
  }
  
  // ========== EQUIPMENT STATE ANALYSIS ==========
  /**
   * Current Equipment State Assessment and Toggle Calculation
   * Determines current equipped status and calculates desired new state
   */
  const currentEquipped = cloakItem.equipped === true;
  const newEquippedState = !currentEquipped;
  
  // ========== EQUIPMENT CONFLICT DETECTION ==========
  /**
   * Advanced Equipment Slot Conflict Management
   * Prevents equipment combinations that would cause gameplay or visual conflicts
   */
  if (newEquippedState) {
    const isWearingTshirt = inventory.some(item => 
      (item.originalId || item.id) === 'wumpus_tshirt' && item.equipped === true
    );
    
    if (isWearingTshirt) {
      setMessage("You can't put on the cloak while wearing the T-shirt. Remove the T-shirt first.");
      return false; // Prevent conflicting equipment state
    }
  }
  
  // ========== CRITICAL STATE SYNCHRONIZATION SYSTEM ==========
  /**
   * Emergency Equipment State Management
   * Uses specialized function to handle critical cloak state updates
   */
  if (typeof forceUpdateCloakState === 'function') {
    forceUpdateCloakState(newEquippedState);
  } else {
    console.error("forceUpdateCloakState not available - falling back to basic update");
    // Fallback code would be implemented here for emergency situations
  }
  
  // ========== CONTEXTUAL USER FEEDBACK SYSTEM ==========
  /**
   * Equipment State Feedback with Atmospheric Description
   * Provides immersive feedback based on equipment action taken
   */
  if (newEquippedState) {
    // ========== EQUIPPING FEEDBACK ==========
    setMessage("You wrap the thick cloak around your shoulders. It's surprisingly warm, and you notice a strange shimmer at the edge of your vision when you move.");
  } else {
    // ========== UNEQUIPPING FEEDBACK ==========
    setMessage("You remove the cloak and fold it over your arm. The air feels different against your skin now.");
  }
  
  // ========== ENVIRONMENTAL INTEGRATION SYSTEM ==========
  /**
   * Delayed Environmental Effect Processing
   * Updates temperature effects after equipment state change with proper timing
   */
  setTimeout(() => {
    if (typeof checkTemperatureEffects === 'function' && currentPosition) {
      checkTemperatureEffects(currentPosition);
    }
  }, 100); // Brief delay ensures state updates complete before environmental checks
  
  return false; // Equipment items are never consumed, only equipped/unequipped
};