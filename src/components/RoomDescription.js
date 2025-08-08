
// ==================== ROOM DESCRIPTION COMPONENT ====================
/**
 * RoomDescription.js - Advanced interactive room display and item management system -The content generation engine
 * 
 * This sophisticated component serves as the primary interface for room exploration,
 * handling dynamic content display, interactive element management, item collection
 * mechanics, and complex state synchronization. It transforms static room descriptions
 * into rich, interactive experiences with clickable elements, visual effects, and
 * real-time content updates.
 * 
 * Core Responsibilities:
 * - **Interactive Element Management**: Handles clickable items, treasure discovery
 * - **Dynamic Content Updates**: Real-time room description modifications
 * - **Item Collection System**: Complex item gathering and inventory integration
 * - **Visual Enhancement**: Lantern effects, atmospheric improvements
 * - **State Synchronization**: Coordinates with global game state systems
 * - **Special Item Handling**: Advanced logic for complex items (invisibility cloak)
 * 
 * Advanced Features:
 * - **Invisibility Cloak System**: Sophisticated equipped/unequipped state management
 * - **Enhanced Room Display**: Lantern-based visual improvements
 * - **Interactive HTML Processing**: Click handlers for embedded interactive elements
 * - **Collection Tracking**: Prevents duplicate item collection
 * - **Cross-Component Communication**: Integrates with multiple game systems
 * 
 * Technical Architecture:
 * - **Complex State Management**: Multiple refs and state variables for robust control
 * - **Event-Driven Updates**: Responds to inventory changes and room transitions
 * - **DOM Manipulation**: Direct HTML modification for interactive elements
 * - **Global State Integration**: Coordinates with window-level game state
 */

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import useSounds from '../hooks/useSounds';

// ==================== ROOM DESCRIPTION COMPONENT DEFINITION ====================
/**
 * Main RoomDescription functional component with comprehensive prop interface
 * 
 * @param {string} description - Base room description text to display and enhance
 */
const RoomDescription = ({ description }) => {
  
  // ==================== GAME CONTEXT INTEGRATION ====================
  /**
   * Comprehensive game state and function extraction for room interaction management
   * 
   * This extensive destructuring operation pulls in all necessary game state,
   * functions, and configuration data required for sophisticated room display
   * and interaction management. The breadth of dependencies reflects the
   * component's central role in game interaction systems.
   * 
   * State Categories:
   * - **Inventory Management**: addItemToInventory, setInventory, inventory
   * - **Room State**: roomDescriptionMap, currentPosition, setRoomDescription
   * - **Content Management**: updateRoomDescriptionAfterCollection, setMessage
   * - **Item Configuration**: itemTypes for item behavior definitions
   * - **Enhancement Systems**: createEnhancedRoomDescription for lantern effects
   * - **Special Mechanics**: handleTrapTrigger for dangerous interactions
   * - **Game Flow Control**: setGameStatus, setDeathCause for critical events
   * - **Visual Effects**: setShowWinVideo, setShowLadderExtendScene for scenes
   * - **Data Systems**: treasurePieces, collectedTreasures, positions for game data
   */
  const { 
    addItemToInventory,                    // Function to add items to player inventory
    updateRoomDescriptionAfterCollection,  // Function to update room after item collection
    currentPosition,                       // Player's current room number
    roomDescriptionMap,                    // Complete room description mapping
    inventory,                             // Player's current inventory state
    itemTypes,                             // Item type definitions and behaviors
    setMessage,                            // Function to update game messages
    createEnhancedRoomDescription,         // Function for lantern-enhanced descriptions
    setInventory,                          // Direct inventory state setter
    handleTrapTrigger,                     // Function for trap activation handling
    specialRooms,                          // Special room configurations
    positions,                             // Game entity positions (wumpus, pits, etc.)
    collectedTreasures,                    // Array of collected treasure IDs
    treasurePieces,                        // Treasure piece configurations
    setGameStatus,                         // Game status control function
    setDeathCause,                         // Death cause setter for game over scenarios
    gameStatus,                            // Current game status
    setShowWinVideo,                       // Victory video display controller
    setShowLadderExtendScene,              // Ladder extension scene controller
    setShowWinMessage,                     // Win message display controller
    setRoomDescription                     // Room description state setter
  } = useGame();
  
  // ==================== COMPONENT STATE MANAGEMENT ====================
  /**
   * Local component state for managing display and interaction behavior
   * 
   * These state variables handle the component's internal display logic,
   * user interactions, and temporary states that don't need to persist
   * at the global game level.
   */
  
  // === DISPLAY STATE ===
  const [displayDescription, setDisplayDescription] = useState(description);  // Local description state
  const [lanternActive, setLanternActive] = useState(false);                  // Lantern activation state
  
  // ==================== REFERENCE MANAGEMENT ====================
  /**
   * Comprehensive ref system for DOM manipulation and state tracking
   * 
   * These refs provide direct access to DOM elements for interactive
   * functionality and maintain persistent references that don't trigger
   * re-renders when updated. They're essential for the component's
   * advanced DOM manipulation and state tracking capabilities.
   */
  
  // === TRACKING REFS ===
  const collectedItemsRef = useRef([]);        // Tracks items collected from current room
  const processingRef = useRef(false);         // Prevents infinite loops in processing
  
  // === DOM ELEMENT REFS ===
  const mineralsContainerRef = useRef(null);   // Reference to minerals display container
  const waterContainerRef = useRef(null);      // Reference to water effects container
  const containerRef = useRef(null);           // Main container reference for DOM access
  
  // ==================== AUDIO INTEGRATION ====================
  /**
   * Sound system integration for interactive feedback
   * 
   * Extracts specific sound functions from the custom sounds hook to provide
   * audio feedback for room interactions and special events.
   */
  const { playLadderTrapSound } = useSounds();

  // ==================== INVISIBILITY CLOAK STATUS ANALYZER ====================
  /**
   * Advanced invisibility cloak state management system
   * 
   * This sophisticated function handles the complex state tracking for the
   * invisibility cloak item, which has multiple states (collected, equipped,
   * unequipped) and can exist in both inventory and room descriptions. It
   * demonstrates advanced item state management with global state integration.
   * 
   * Cloak State Complexity:
   * - **Global State Priority**: Checks window.GLOBAL_CLOAK_STATE first
   * - **Inventory Analysis**: Searches inventory for cloak items
   * - **Room Content Detection**: Analyzes room text for cloak presence
   * - **Collection Tracking**: Monitors whether cloak was collected from current room
   * - **Equipment Status**: Tracks equipped vs unequipped states
   * 
   * State Management Features:
   * - **Global State Integration**: Prioritizes window-level state when available
   * - **Fallback Logic**: Uses local analysis when global state unavailable
   * - **Multi-Source Validation**: Cross-references multiple data sources
   * - **Debug Logging**: Comprehensive state reporting for development
   * 
   * Technical Features:
   * - **Flexible Item ID Support**: Handles both originalId and regular id
   * - **Room Text Analysis**: String-based detection for cloak presence
   * - **Collection History**: Tracks collection status from room metadata
   * - **Equipment Detection**: Analyzes equipped property for usage state
   * 
   * @returns {Object} Comprehensive cloak status with multiple boolean flags
   */
  const checkCloakStatus = () => {
    // ========== GLOBAL STATE PRIORITY CHECK ==========
    // First check global state if available (highest priority)
    if (window.GLOBAL_CLOAK_STATE !== undefined) {
      const globalEquipped = window.GLOBAL_CLOAK_STATE;
      console.log(`RoomDescription: Using global cloak state: ${globalEquipped}`);
      
      return { 
        hasCloak: true,
        cloakEquipped: globalEquipped,
        containsCloak: false, // Not relevant when using global state
        cloakCollected: false // Not relevant when using global state
      };
    }
    
    // ========== LOCAL STATE ANALYSIS FALLBACK ==========
    // Fall back to comprehensive local analysis if global state not available
    
    // === INVENTORY CLOAK DETECTION ===
    const cloakItem = inventory.find(item => 
      (item.originalId || item.id) === 'invisibility_cloak'
    );
    
    const hasCloak = !!cloakItem;
    const cloakEquipped = hasCloak && cloakItem.equipped === true;
    
    // === ROOM CONTENT ANALYSIS ===
    // Check if the current room description contains the cloak
    const roomInfo = roomDescriptionMap[currentPosition];
    const originalText = roomInfo?.text || '';
    const containsCloak = originalText.includes('tattered cloth');
    
    // === COLLECTION HISTORY CHECK ===
    // Check if the cloak has been collected from this room
    const collectedItems = roomInfo?.collectedItems || [];
    const cloakCollected = collectedItems.includes('invisibility_cloak');
    
    // ========== DEBUG LOGGING ==========
    console.log(`Cloak status check - In inventory: ${hasCloak}, Equipped: ${cloakEquipped}, In room: ${containsCloak}, Collected: ${cloakCollected}`);
    
    return { 
      hasCloak, 
      cloakEquipped, 
      containsCloak, 
      cloakCollected 
    };
  };

  // ==================== CLOAK STATE DEBUGGING UTILITY ====================
  /**
   * Comprehensive cloak state debugging and analysis tool
   * 
   * This debugging function provides detailed analysis of the invisibility cloak's
   * current state across all game systems, helping developers understand the
   * complex state interactions and troubleshoot cloak-related issues.
   * 
   * Debug Information Provided:
   * - **Room-Specific Status**: Current room cloak state analysis
   * - **Inventory Analysis**: Detailed inventory cloak item inspection
   * - **DOM Verification**: Real-time DOM content validation
   * - **State Cross-Reference**: Comparison of multiple state sources
   * 
   * Debugging Features:
   * - **Comprehensive Logging**: Detailed console output for all cloak states
   * - **Inventory Enumeration**: Lists all cloak items with full properties
   * - **DOM Content Verification**: Checks actual rendered content
   * - **Timing-Aware Analysis**: Uses setTimeout for post-render DOM checks
   * 
   * Development Benefits:
   * - **State Transparency**: Makes complex cloak state visible to developers
   * - **Issue Diagnosis**: Helps identify state synchronization problems
   * - **Real-Time Validation**: Provides immediate feedback on state changes
   * - **Cross-System Verification**: Validates consistency across game systems
   * 
   * @effects Logs comprehensive cloak state information to console
   */
  const debugCloakState = () => {
    const { hasCloak, cloakEquipped, containsCloak, cloakCollected } = checkCloakStatus();
    
    // ========== COMPREHENSIVE STATE LOGGING ==========
    console.log("=== CLOAK STATE DEBUG ===");
    console.log(`Room ${currentPosition}:`);
    console.log(`- Cloak in inventory: ${hasCloak}`);
    console.log(`- Cloak equipped: ${cloakEquipped}`);
    console.log(`- Cloak in room text: ${containsCloak}`);
    console.log(`- Cloak collected: ${cloakCollected}`);
    
    // ========== INVENTORY DETAILED ANALYSIS ==========
    // Find all cloak items in inventory for detailed inspection
    const cloakItems = inventory.filter(item => 
      (item.originalId || item.id) === 'invisibility_cloak'
    );
    
    if (cloakItems.length > 0) {
      console.log(`Found ${cloakItems.length} cloak items in inventory:`);
      cloakItems.forEach((item, index) => {
        console.log(`  Cloak ${index + 1}:`, item);
      });
    } else {
      console.log("No cloak found in inventory");
    }
    
    // ========== DOM CONTENT VERIFICATION ==========
    // Check room description DOM for real-time content validation
    setTimeout(() => {
      const container = containerRef.current;
      if (container) {
        const hasCloakInDOM = container.innerHTML.includes('tattered cloth');
        console.log(`- Cloak visible in DOM: ${hasCloakInDOM}`);
      }
      console.log("=========================");
    }, 100);
  };

// ==================== CLOAK STATE CHANGE EVENT LISTENERS ====================
/**
 * Advanced dual event listener system for comprehensive cloak state management
 * 
 * This sophisticated system employs two independent event handlers to ensure
 * complete coverage of cloak state changes throughout the application. The
 * dual-handler architecture provides fault tolerance and comprehensive debugging
 * while handling different aspects of cloak state synchronization.
 * 
 * Features:
 * - **Redundant Coverage**: Two handlers ensure no cloak events are missed
 * - **Different Responsibilities**: One focuses on re-rendering, other on validation
 * - **Cross-Component Communication**: Responds to events from anywhere in app
 * - **Comprehensive Debugging**: Complete logging coverage from both perspectives
 * - **Memory Management**: Proper cleanup with event listener removal
 */

// === EVENT HANDLER #1: DESCRIPTION RE-RENDER SYSTEM ===
/**
 * Primary cloak event handler focused on forcing component re-renders
 * 
 * This handler responds to cloak state changes by triggering a component
 * re-render and activating debug logging. It uses a clever state update
 * technique to force re-rendering even when content doesn't change.
 * 
 * @listens cloak_state_change - Custom window event for cloak state updates
 * @effects setDisplayDescription, debugCloakState
 */
useEffect(() => {
  // Define the event handler function
  const handleCloakStateChange = (event) => {
    console.log("RoomDescription: Detected cloak state change event", event.detail);
    
    // Force re-render by calling state update function
    setDisplayDescription(prev => {
      // This will cause a re-render even if the content doesn't change
      return prev;
    });
    
    // Debug the cloak state
    debugCloakState();
  };
  
  // Register the event listener
  window.addEventListener('cloak_state_change', handleCloakStateChange);
  
  // Clean up function to remove the listener when component unmounts
  return () => {
    window.removeEventListener('cloak_state_change', handleCloakStateChange);
  };
}, [debugCloakState]); // Depends on debugCloakState function

// === EVENT HANDLER #2: CLOAK STATUS VALIDATION SYSTEM ===
/**
 * Secondary cloak event handler focused on state verification and validation
 * 
 * This handler complements the first by immediately checking cloak status
 * when events occur and providing comprehensive logging of the results.
 * It operates independently to provide fault tolerance.
 * 
 * @listens cloak_state_change - Custom window event for cloak state updates
 * @effects debugCloakState
 */
useEffect(() => {
  // Define the event handler
  const handleCloakStateChange = (event) => {
    console.log("RoomDescription: Received cloak_state_change event", event.detail);
    
    // Force a check of cloak status
    const cloakState = checkCloakStatus();
    console.log("RoomDescription: Updated cloak state after event:", cloakState);
    
    // If needed, force a re-render by updating a local state
    debugCloakState();
  };
  
  // Add event listener
  window.addEventListener('cloak_state_change', handleCloakStateChange);
  
  // Cleanup
  return () => {
    window.removeEventListener('cloak_state_change', handleCloakStateChange);
  };
}, []); // Empty dependency array - runs once on mount

// ==================== LANTERN STATUS & INVENTORY TRACKING SYSTEM ====================
/**
 * Real-time inventory analysis and lantern activation tracking system
 * 
 * This sophisticated effect monitors the player's inventory for active lanterns
 * and manages collection state when transitioning between rooms. It employs
 * flexible ID matching to handle various item identification patterns and
 * provides efficient real-time updates.
 * 
 * Features:
 * - **Flexible ID Matching**: Handles both `originalId` and `id` properties
 * - **Active State Validation**: Only counts lanterns that are actually equipped
 * - **Room Transition Logic**: Automatically resets collection tracking
 * - **Performance Optimization**: Uses `some()` for efficient array searching
 * - **Memory Management**: Uses refs for collection tracking to avoid re-renders
 * 
 * @param {Array} inventory - Player's current inventory items
 * @param {string} currentPosition - Current room position identifier
 * @effects setLanternActive, collectedItemsRef.current
 */
useEffect(() => {
  // Detect if player has an active/equipped lantern in inventory
  const hasActiveLantern = inventory.some(item => 
    (item.originalId || item.id) === 'lantern' && item.isActive
  );
  
  // Update local lantern activation state
  setLanternActive(hasActiveLantern);
  
  // Reset collected items tracking when room changes
  // This prevents duplicate collection and ensures clean state per room
  if (currentPosition) {
    collectedItemsRef.current = [];
  }
  
}, [inventory, currentPosition]);

// ==================== ADVANCED DOM MANIPULATION: CLOAK VISIBILITY SYSTEM ====================
/**
 * Master-level DOM manipulation system for invisibility cloak visibility management
 * 
 * This incredibly sophisticated effect handles the complex task of ensuring the
 * invisibility cloak appears in room descriptions when it should be present but
 * isn't visible in the rendered DOM. It employs a multi-phase validation pipeline,
 * advanced regex parsing, and direct DOM manipulation with state synchronization.
 * 
 * Technical Architecture:
 * - **Multi-Phase Validation Pipeline**: 6-step validation process
 * - **Advanced Regex Pattern Matching**: Complex HTML parsing with interactive elements
 * - **Timing-Aware DOM Manipulation**: 100ms delay for render completion
 * - **State-DOM Bidirectional Synchronization**: Keeps React state and DOM in sync
 * - **Error Prevention & Recovery**: Comprehensive null checks and graceful degradation
 * - **Performance Optimization**: Early returns and minimal DOM queries
 * 
 * Validation Pipeline:
 * 1. Input validation (displayDescription, currentPosition)
 * 2. Room analysis (roomDescriptionMap lookup)
 * 3. Content analysis (original text cloak detection)
 * 4. Collection status (cloak collection verification)
 * 5. DOM verification (rendered content inspection)
 * 6. Repair logic (direct DOM content injection)
 * 
 * @param {string} displayDescription - Current room description being displayed
 * @param {string} currentPosition - Current room position identifier
 * @param {Object} roomDescriptionMap - Room metadata and configuration mapping
 * @effects DOM manipulation, setDisplayDescription
 */
useEffect(() => {
  // This effect will run after the component renders
  // It checks if the cloak should be visible but isn't
  
  // === PHASE 1: INPUT VALIDATION ===
  if (!displayDescription || !currentPosition) return;
  
  // === PHASE 2: ROOM ANALYSIS ===
  // Check if we're in a room that should have the cloak
  const roomInfo = roomDescriptionMap[currentPosition];
  
  if (!roomInfo) return;
  
  // === PHASE 3: CONTENT ANALYSIS ===
  // Check if the original text contains the cloak
  const originalText = roomInfo.text || '';
  const containsCloak = originalText.includes('tattered cloth');
  
  // === PHASE 4: COLLECTION STATUS ===
  // Check if the cloak has been collected
  const collectedItems = roomInfo.collectedItems || [];
  const cloakCollected = collectedItems.includes('invisibility_cloak');
  
  console.log(`Cloak checks - Should have cloak: ${containsCloak}, Collected: ${cloakCollected}`);
  
  // === PHASE 5 & 6: DOM VERIFICATION & REPAIR LOGIC ===
  // If we should have the cloak but it's not displayed, fix it
  if (containsCloak && !cloakCollected) {
    // Wait for the DOM to be updated
    setTimeout(() => {
      // Get the room description container
      const container = containerRef.current;
      if (!container) return;
      
      // Check if the rendered content already has the cloak
      const hasVisibleCloak = container.innerHTML.includes('tattered cloth');
      
      console.log(`DOM check - Cloak visible: ${hasVisibleCloak}`);
      
      // If the cloak is not visible in the DOM, add it
      if (!hasVisibleCloak) {
        console.log("Cloak missing from DOM, adding it directly");
        
        // Extract the cloak text from the original description using advanced regex
        const cloakRegex = / In the corner, you spot a <span class=['"]interactive-item['"][^>]*>tattered cloth<\/span>(\. Looks like someone['"]s musty old cloak, it['"]s made out of some odd material)?\.?/;
        const cloakMatch = originalText.match(cloakRegex);
        
        if (cloakMatch) {
          // Get the paragraph element that contains the room description
          const descriptionParagraph = container.querySelector('p');
          
          if (descriptionParagraph) {
            // Create a temporary div to hold the HTML content
            const tempDiv = document.createElement('div');
            
            // Set the innerHTML to the cloak HTML
            tempDiv.innerHTML = cloakMatch[0];
            
            // Get the actual content to append
            const cloakContent = tempDiv.innerHTML;
            
            // Append the cloak HTML directly to the paragraph
            descriptionParagraph.innerHTML += cloakContent;
            
            console.log("Cloak added to DOM directly");
            
            // Update the display description in state to match the DOM
            // This helps keep things in sync for future updates
            setDisplayDescription(prev => {
              if (!prev.includes('tattered cloth')) {
                return prev + cloakMatch[0];
              }
              return prev;
            });
          }
        }
      }
    }, 100); // Short delay to ensure DOM has updated
  }
}, [displayDescription, currentPosition, roomDescriptionMap]);

// ==================== ENHANCED ROOM DESCRIPTION SYSTEM ====================
/**
 * Priority-based room description management with sophisticated processing control
 * 
 * This advanced effect manages room description updates with a hierarchical priority
 * system that handles permanent room state changes, lantern enhancements, and
 * fallback descriptions. It employs race condition prevention and comprehensive
 * error handling to ensure reliable description updates.
 * 
 * Priority Hierarchy:
 * 1. **HIGHEST**: Pool Disturbed State (permanent room changes)
 * 2. **SECONDARY**: Enhanced Lantern Descriptions (visual improvements)
 * 3. **DEFAULT**: Base Description (fallback system)
 * 
 * Technical Features:
 * - **Race Condition Prevention**: Uses processingRef to prevent overlapping updates
 * - **Timeout-Based Processing**: 50ms delay for state stabilization
 * - **Error Safety**: Try-finally blocks ensure processing flag reset
 * - **Cleanup Management**: Proper timeout clearing on unmount
 * - **Early Exit Logic**: Prevents unnecessary processing for permanent states
 * - **Debug Logging**: Detailed logging for each decision branch
 * 
 * @param {string} description - Base room description text
 * @param {boolean} lanternActive - Whether player has an active lantern
 * @param {string} currentPosition - Current room position identifier
 * @param {Object} roomDescriptionMap - Room metadata and enhancement data
 * @effects setDisplayDescription
 */
useEffect(() => {
  // Skip if we're in the middle of processing (race condition prevention)
  if (processingRef.current) return;
  processingRef.current = true;

  const timeoutId = setTimeout(() => {
    try {
      let newDescription = description;
      const roomInfo = roomDescriptionMap[currentPosition];
      
      // === HIGHEST PRIORITY: Pool Disturbed State ===
      // CRITICAL: Check if pool is disturbed FIRST
      // Pool disturbance creates permanent, irreversible room changes
      if (roomInfo?.poolDisturbed && roomInfo?.textAfterCollection) {
        console.log("Pool is disturbed - using permanent disturbed description");
        newDescription = roomInfo.textAfterCollection;
        setDisplayDescription(newDescription);
        return; // Exit early - don't process enhanced text
      }
      
      // === SECONDARY PRIORITY: Enhanced Lantern Descriptions ===
      // Apply lantern enhancements only if pool is not disturbed
      if (lanternActive && roomInfo?.enhancedText && !roomInfo?.poolDisturbed) {
        console.log("RoomDescription component using enhanced text");
        
        newDescription = createEnhancedRoomDescription(
          roomInfo.text || description,
          roomInfo.enhancedText
        );
      }
      
      // === DEFAULT: Update the displayed description ===
      console.log("Setting display description to:", newDescription);
      setDisplayDescription(newDescription);
    } finally {
      // Always reset processing flag, even if errors occur
      processingRef.current = false;
    }
  }, 50); // Short delay for state stabilization

  // Cleanup function for proper timeout management
  return () => {
    clearTimeout(timeoutId);
    processingRef.current = false;
  };
}, [description, lanternActive, currentPosition, roomDescriptionMap]);

// ==================== ROOM TYPE CLASSIFICATION SYSTEM ====================
/**
 * Multi-criteria room type detection and classification system
 * 
 * This sophisticated system analyzes the current room description to identify
 * specific room types based on keyword patterns and environmental cues. It
 * uses compound conditions for accurate identification and supports both
 * base and enhanced room descriptions.
 * 
 * Features:
 * - **Multi-Criteria Detection**: Requires multiple keywords for accuracy
 * - **Fallback Logic**: OR conditions provide alternative detection methods
 * - **Enhanced Text Compatible**: Works with lantern-enhanced descriptions
 * - **Interactive Element Detection**: Identifies rooms with clickable content
 * - **Dynamic Content Analysis**: Uses current displayDescription state
 * - **Boolean Flag System**: Simple true/false flags for conditional rendering
 * 
 * Room Type Catalog:
 * - 🍄 Luminescent Fungus Rooms: Magical glowing environments
 * - 💎 Minerals Rooms: Treasure-filled chambers with sparkling gems
 * - 💧 Water Drip Rooms: Atmospheric caves with musical water sounds
 * - ☠️ Sulfur Rooms: Dangerous chambers with toxic gases
 * - 🌊 Stream Rooms: Underground waterways with rushing water
 * - 🔮 Crystal Rooms: Mystical chambers with magical crystals
 * - 🌿 Tendrils Rooms: Overgrown areas with supernatural vegetation
 */

// Check room types based on the displayDescription (not the original description)
const isLuminescentRoom = displayDescription?.includes('Luminescent fungi') && 
                          displayDescription?.includes('eerie blue-green glow');

const isMineralsRoom = displayDescription?.includes('glittering minerals') && 
                       displayDescription?.includes('thousand tiny');
                      
const isWaterDripRoom = displayDescription?.includes('Water drips from stalactites') || 
                        (displayDescription?.includes('droplets') && 
                        displayDescription?.includes('melody'));

const isSulfurRoom = displayDescription?.includes('sulfur fills this chamber')

const isStreamRoom = displayDescription?.includes('shallow underground stream') && 
                     displayDescription?.includes('late for an important appointment');

const isCrystalRoom = displayDescription?.includes('unusual crystals') && 
                      (displayDescription?.includes('ominous with a chance of doom') ||
                      displayDescription?.includes('sparkles with unusual crystals'));

const isTendrilsRoom = displayDescription?.includes('root-like tendrils') && 
                       displayDescription?.includes('supernatural microwave');

// Check if room has interactive items for click handler attachment
const hasInteractiveItem = displayDescription?.includes('interactive-item');

// ==================== ENHANCED CLOAK VISIBILITY SYSTEM (ALTERNATIVE APPROACH) ====================
/**
 * Alternative advanced cloak visibility management with event-driven architecture
 * 
 * This sophisticated alternative approach to cloak visibility management employs
 * the centralized checkCloakStatus function for authoritative state validation
 * and includes custom event dispatching for cross-component communication.
 * 
 * Key Improvements Over Previous Version:
 * - **Centralized State Validation**: Uses checkCloakStatus() for authoritative cloak state
 * - **Event-Driven Communication**: Dispatches custom events for system-wide coordination
 * - **Simplified Logic Flow**: Cleaner conditional structure with focused responsibilities
 * - **Enhanced Debugging**: Improved logging with function-based state checking
 * - **Cross-System Integration**: Custom events enable better component coordination
 * 
 * Technical Features:
 * - **Function-Based Validation**: Leverages checkCloakStatus for consistent state checking
 * - **Custom Event System**: Creates item_visibility_fixed events for system communication
 * - **DOM-State Synchronization**: Maintains consistency between DOM and React state
 * - **Advanced Regex Processing**: Complex HTML pattern matching for precise element extraction
 * - **Container Safety**: Comprehensive null checking for DOM element access
 * 
 * @param {string} displayDescription - Current room description being displayed
 * @param {string} currentPosition - Current room position identifier
 * @param {Object} roomDescriptionMap - Room metadata and configuration mapping
 * @effects DOM manipulation, setDisplayDescription, custom event dispatch
 */
useEffect(() => {
  // This effect will run after the component renders
  // It checks if the cloak should be visible but isn't
  
  // === INPUT VALIDATION ===
  if (!displayDescription || !currentPosition) return;
  
  // === CENTRALIZED CLOAK STATUS VALIDATION ===
  // Use the new function to check cloak status
  const { containsCloak, cloakCollected } = checkCloakStatus();
  
  // === CONDITIONAL PROCESSING LOGIC ===
  // Only proceed if cloak should be there but hasn't been collected
  if (containsCloak && !cloakCollected) {
    // === TIMING-AWARE DOM MANIPULATION ===
    // Delay to ensure the DOM has updated
    setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      
      // === DOM CONTENT VERIFICATION ===
      // Check if the rendered content already has the cloak
      const hasVisibleCloak = container.innerHTML.includes('tattered cloth');
      
      console.log(`DOM check - Cloak visible: ${hasVisibleCloak}`);
      
      // === DOM REPAIR LOGIC ===
      if (!hasVisibleCloak) {
        console.log("Cloak missing from DOM, adding it directly");
        
        // === ROOM DATA EXTRACTION ===
        // Get room info for original text
        const roomInfo = roomDescriptionMap[currentPosition];
        if (!roomInfo || !roomInfo.text) return;
        
        const originalText = roomInfo.text;
        
        // === ADVANCED REGEX PATTERN MATCHING ===
        // Extract the cloak text using sophisticated HTML parsing
        const cloakRegex = / In the corner, you spot a <span class=['"]interactive-item['"][^>]*>tattered cloth<\/span>(\. Looks like someone['"]s musty old cloak, it['"]s made out of some odd material)?\.?/;
        const cloakMatch = originalText.match(cloakRegex);
        
        if (cloakMatch) {
          // === DOM ELEMENT DISCOVERY ===
          const descriptionParagraph = container.querySelector('p');
          
          if (descriptionParagraph) {
            // === SAFE HTML CONTENT INJECTION ===
            // Create and append the cloak content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cloakMatch[0];
            const cloakContent = tempDiv.innerHTML;
            
            // Direct DOM manipulation for immediate visibility
            descriptionParagraph.innerHTML += cloakContent;
            
            // === STATE-DOM SYNCHRONIZATION ===
            // IMPORTANT: Also update the state to keep in sync
            setDisplayDescription(prev => {
              if (!prev.includes('tattered cloth')) {
                // Create a new string with the cloak appended
                return prev + cloakMatch[0];
              }
              return prev;
            });
            
            // === CROSS-COMPONENT COMMUNICATION ===
            // Dispatch a custom event to notify context that we've modified the DOM
            const event = new CustomEvent('item_visibility_fixed', {
              detail: { itemId: 'invisibility_cloak', visible: true }
            });
            window.dispatchEvent(event);
          }
        }
      }
    }, 100); // Timing delay for DOM update completion
  }
}, [displayDescription, currentPosition, roomDescriptionMap]);

// ==================== HTML CONTENT DETECTION SYSTEM ====================
/**
 * Intelligent HTML content analysis for interactive element detection
 * 
 * This sophisticated detection system analyzes the current room description
 * to determine if it contains HTML markup indicating interactive elements.
 * It uses multiple pattern recognition techniques to identify various HTML
 * structures that might contain clickable game elements.
 * 
 * Detection Patterns:
 * - **Span Element Detection**: Identifies opening '<span' tags
 * - **Closing Tag Recognition**: Finds closing '</span>' tags  
 * - **Class Attribute Presence**: Detects 'class=' attribute usage
 * 
 * Use Cases:
 * - **Conditional Rendering**: Determines if interactive handlers should be attached
 * - **Performance Optimization**: Avoids unnecessary event listener setup
 * - **Content Type Classification**: Distinguishes between static and interactive descriptions
 * - **Debug Information**: Provides insight into content structure for troubleshooting
 * 
 * Technical Features:
 * - **Multi-Pattern Analysis**: Uses three distinct detection methods for reliability
 * - **Boolean Flag Output**: Simple true/false result for easy conditional usage
 * - **Optional Chaining Safety**: Handles undefined displayDescription gracefully
 * - **Performance Efficient**: Simple string operations with minimal overhead
 * 
 * @returns {boolean} hasHTMLContent - True if description contains HTML markup
 */
const hasHTMLContent = displayDescription?.includes('<span') ||
                      displayDescription?.includes('</span>') ||
                      displayDescription?.includes('class=');
// ==================== COMPREHENSIVE INTERACTIVE CLICK HANDLER useEffect ====================
/**
 * Master interactive element management useEffect with sophisticated click handling
 * 
 * This comprehensive useEffect serves as the central hub for all interactive element
 * management within room descriptions. It handles game state validation, creates
 * the unified click handler, manages container selection, and provides proper
 * event listener lifecycle management.
 * 
 * @param {string} gameStatus - Current game status (won/lost/playing)
 * @param {boolean} hasInteractiveItem - Whether current room has interactive elements
 * @param {boolean} isMineralsRoom - Whether current room is a minerals room type
 * @param {boolean} isWaterDripRoom - Whether current room is a water drip room type
 * @effects Event listener attachment, item collection processing, game state updates
 */
useEffect(() => {
  // === GAME STATE PROTECTION SYSTEM ===
  // Don't allow interactions if game is over
  if (gameStatus === 'lost' || gameStatus === 'won') {
    console.log("Game is over - ignoring interactive item clicks");
    return;
  }

  // === DUPLICATE PREVENTION SYSTEM ===
  // Local variable to prevent duplicate item collection
  let isCollecting = false;
    
  /**
   * Comprehensive unified click handler for all interactive room elements
   * 
   * @param {Event} e - DOM click event from user interaction
   * @effects Game state changes, inventory updates, UI transitions, audio playback
   */
  const unifiedClickHandler = (e) => {
    if (isCollecting || processingRef.current) return;
    
    console.log("Click detected in room description:", e.target);
    
    const interactiveElem = e.target.closest('.interactive-item') || 
                           (e.target.classList && e.target.classList.contains('interactive-item') ? e.target : null);
    
    if (!interactiveElem) {
      console.log("No interactive element found in click");
      return;
    }
    
    const itemId = interactiveElem.getAttribute('data-item');
    console.log(`Interactive item detected: ${itemId}`);
    
    // ==================== SPECIAL CASE #1: LADDER VICTORY SYSTEM ====================
    if (itemId === 'ladder') {
      console.log("Player clicked on the ladder!");
      
      // Check if we're in the exit room
      if (currentPosition !== positions.exitPosition) {
        console.log("Not in exit room, ignoring ladder interaction");
        return;
      }
      
      // Check if player has all treasures
      if (collectedTreasures.length < treasurePieces.length) {
        setMessage("You start to climb the ladder, but a magical force pushes you back. A voice echoes: 'Not until you have found all the treasures!'");
        return;
      }
      
      // Check if ladder has been extended with wyrmglass
      if (!specialRooms[currentPosition]?.ladderExtended) {
        // TRAP! The ladder breaks
        setGameStatus('lost');
        setDeathCause('ladder_trap');
        setMessage("You eagerly grab the rickety ladder and start climbing. Halfway up, the ancient wood gives way with a sickening CRACK! You plummet downward, but instead of hitting the cave floor, you fall through a hidden pit that opens beneath you. As you tumble into the darkness, you realize the ladder was a trap for the overconfident. Game over!");
        
        // Play the death sound
        playLadderTrapSound();
        
        return;
      }
      
      // SUCCESS! Player wins
      const ladderVideo = document.querySelector('.ladder-video-background');
      if (ladderVideo) {
        ladderVideo.pause();
        ladderVideo.src = '';
        ladderVideo.load();
      }

      setShowLadderExtendScene(false);

      // Update room description immediately when ladder is clicked
      setRoomDescription("The Wyrmglass starts pulsating more! It tears free from your grasp and rockets upward, shattering through the ceiling with a brilliant explosion of light and widening the hole much more. Chunks of rock and ancient dust rain down as daylight floods the chamber.\nEach rung now glowing with ethereal light, extending upward toward the newly opened passage. You can't wait to get back home. \nYou hippity hop up the ladder");

      // Small delay to ensure cleanup
      setTimeout(() => {
        setShowWinVideo(true);
        setGameStatus('won');
        setShowWinMessage(false); // Reset message visibility
        
        // This message will show AFTER the video ends
        setMessage("You've escaped the ancient cave with all the treasures to save the village...\n wait... what is this?\n\n\nWHAT DID YOU DO!?\n\n\n\nWhat's wrong with the trees?\nWhy is the sky differerent!\n\nYou thought this would be easy didnt you?\n\n~ To Be Continued ~");
      }, 100);

      return; // Exit early - don't process as a collectible item
    }
    
    // ==================== SPECIAL CASE #2: TRAP DETECTION SYSTEM ====================
    if (itemId === 'shiny_trinkets') {
      console.log("TRAP TRIGGERED: Player clicked on shiny trinkets!");
      
      if (handleTrapTrigger) {
        handleTrapTrigger(
          'trinket_trap',
          "As you reach for the golden bauble, the floor suddenly gives way beneath you! A massive trapdoor swings open, and tentacles shoot up from the darkness below. The last thing you see is rows of teeth in a gaping maw as something ancient and hungry swallows you whole. Perhaps not everything that glitters is gold... Game over!"
        );
      }
      
      interactiveElem.style.display = 'none';
      updateRoomDescriptionAfterCollection(itemId);
      
      setTimeout(() => {
        isCollecting = false;
        processingRef.current = false;
      }, 500);
      
      return; // Exit early - don't process as normal item
    }

    // ==================== SPECIAL CASE #3: POOL ITEMS MANAGEMENT SYSTEM ====================
    if (itemId === 'fools_gold' || itemId === 'utility_knife' || itemId === 'tarnished_bracelet') {
      console.log(`Player grabbed pool item: ${itemId}`);
      
      // Prevent processing if already collecting
      if (isCollecting || processingRef.current) return;
      
      isCollecting = true;
      processingRef.current = true;
      e.stopPropagation();
      
      // Add to collected items
      if (!collectedItemsRef.current.includes(itemId)) {
        collectedItemsRef.current.push(itemId);
      }
      
      // Add the item to inventory
      addItemToInventory(itemId);
       
      // Get item info for initial message
      const itemInfo = itemTypes[itemId];
      if (itemInfo) {
        console.log('Found item info:', itemInfo);
        setMessage(`You picked up the ${itemInfo.name}!`);
      }
      
      // Hide ALL pool items immediately
      const allPoolItems = document.querySelectorAll('.underwater-treasure');
      allPoolItems.forEach(el => {
        el.style.display = 'none';
      });
      
      // Update the room description (this will trigger the disturbed state)
      updateRoomDescriptionAfterCollection(itemId);
      
      // Force update the display after a short delay
      setTimeout(() => {
        const disturbedText = lanternActive ? 
          "The once-clear pool now churns with agitation. Whatever dwells in the depths has been disturbed, and the water has turned murky and threatening." :
          "A pool of dark, churning water covers most of the floor. The surface ripples with unseen movement below.";
        
        setDisplayDescription(disturbedText);
        
        isCollecting = false;
        processingRef.current = false;
      }, 100);
      
      return;
    }

    // ==================== GENERIC ITEM COLLECTION SYSTEM ====================
    if (itemId) {
      isCollecting = true;
      processingRef.current = true;
      e.stopPropagation();
      
      console.log(`Collecting item: ${itemId} via unified handler`);
      
      // Add to collected items array
      if (!collectedItemsRef.current.includes(itemId)) {
        collectedItemsRef.current.push(itemId);
      }
      
      // ==================== SPECIAL CASE #4: SINGLE GOLD COIN STACKING SYSTEM ====================
      if (itemId === 'single_gold_coin') {
        console.log("Special handling for single gold coin");
        
        // Check if player already has gold coins
        const existingGoldCoins = inventory.find(item => 
          (item.originalId || item.id) === 'gold_coins'
        );
        
        if (existingGoldCoins) {
          // Add 1 to existing gold coins count
          setInventory(prev => prev.map(item => {
            if ((item.originalId || item.id) === 'gold_coins') {
              const currentValue = typeof item.value === 'number' ? item.value : 1;
              const newValue = currentValue + 1;
              
              return {
                ...item,
                value: newValue,
                name: `Ancient Wyrm Coins (${newValue})`
              };
            }
            return item;
          }));
          
          setMessage(`You found a single Ancient Wyrm Coin! You add it to your collection.`);
        } else {
          // Create a new gold coin item with value 1
          const newCoin = {
            id: 'gold_coins_' + Date.now(),
            originalId: 'gold_coins', // NOT 'single_gold_coin'
            name: 'Ancient Wyrm Coin',
            icon: '💰',
            description: 'A single ancient gold coin, worn but still valuable.',
            value: 1,
            canInspect: true,
            canUse: false
          };
          
          setInventory(prev => [...prev, newCoin]);
          setMessage(`You found an Ancient Wyrm Coin!`);
        }
        
        // Update the room description to remove the coin text
        updateRoomDescriptionAfterCollection('single_gold_coin');
        
        // Hide the element immediately
        interactiveElem.style.display = 'none';
        
        setTimeout(() => {
          isCollecting = false;
          processingRef.current = false;
        }, 500);
        
        return; // Exit early - don't do normal item addition
      }
      
      // === NORMAL ITEM HANDLING ===
      // Intelligent article selection for grammatically correct messages
      const getArticle = (word) => {
        if (!word) return 'a';
        const firstLetter = word.charAt(0).toLowerCase();
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        return vowels.includes(firstLetter) ? 'an' : 'a';
      };

      addItemToInventory(itemId);
      
      // Get the item info for the message with safer access
      if (itemTypes && itemTypes[itemId]) {
        const itemInfo = itemTypes[itemId];
        console.log('Found item info:', itemInfo);
        // Set message to show the item description when collected
        const article = getArticle(itemTypes[itemId].name);
        setMessage(`\nYou picked up ${article} ${itemTypes[itemId].name}!\n ${itemTypes[itemId].description}`);
      } else {
        console.log(`Item ${itemId} not found in itemTypes`);
        // Fallback message if item type is not found
        setMessage(`You picked up the ${itemId.replace(/_/g, ' ')}.`);
      }
      
      // Update the room description state
      updateRoomDescriptionAfterCollection(itemId);
          
      // IMPORTANT: Also update the local displayDescription state
      setDisplayDescription(prev => {
        let updatedDesc = prev;
        
        // Remove item based on its type
        switch(itemId) {
          case 'spellbook':
            // Complete patterns to remove entire spellbook sentence
            const spellbookPatterns = [
              / Your lantern's light reveals an <span class=['"]interactive-item['"][^>]*>ancient spellbook<\/span> tucked underneath the backpack, its leather cover embossed with strange protective symbols\./g,
              / Your lantern's light reveals an ancient spellbook tucked underneath the backpack, its leather cover embossed with strange protective symbols\./g,
              /<span class=['"]interactive-item['"][^>]*data-item=['"]spellbook['"][^>]*>.*?<\/span>/g,
              / tucked underneath the backpack, its leather cover embossed with strange protective symbols\./g
            ];
            
            // Apply each pattern to ensure complete removal
            spellbookPatterns.forEach(pattern => {
              updatedDesc = updatedDesc.replace(pattern, '');
            });
            break;

          case 'invisibility_cloak':
            // Apply all patterns to ensure complete removal
            const cloakPatterns = [
              / In the corner, you spot a <span class=['"]interactive-item['"][^>]*>tattered cloth<\/span>\. Looks like someone['"]s musty old cloak, it['"]s made out of some odd material\./g,
              / In the corner, you spot a <span class=['"]interactive-item['"][^>]*>tattered cloth<\/span>\./g,
              / In the corner, you spot a tattered cloth\. Looks like someone['"]s musty old cloak, it['"]s made out of some odd material\./g,
              / In the corner, you spot a tattered cloth\./g,
              /<span class=['"]interactive-item['"][^>]*data-item=['"]invisibility_cloak['"][^>]*>.*?<\/span>/g
            ];
            
            // Apply each pattern
            cloakPatterns.forEach(pattern => {
              updatedDesc = updatedDesc.replace(pattern, '');
            });
            break;
            
          default:
            // Generic default - do nothing
            break;
        }
        
        return updatedDesc;
      });
      
      // Hide the element immediately
      interactiveElem.style.display = 'none';
      
      setTimeout(() => {
        isCollecting = false;
        processingRef.current = false;
      }, 500);
    }
  };

  // ==================== CONTAINER SELECTION & EVENT LISTENER MANAGEMENT ====================
  // Determine which container to use based on room type
  const activeContainer = isMineralsRoom ? mineralsContainerRef.current : 
                         isWaterDripRoom ? waterContainerRef.current : 
                         containerRef.current;
  
  // Event listener attachment
  if (activeContainer && hasInteractiveItem) {
    console.log(`Adding click handler to ${isMineralsRoom ? 'minerals' : isWaterDripRoom ? 'water' : 'standard'} container`);
    activeContainer.addEventListener('click', unifiedClickHandler);
  }
  
  // Cleanup function for proper event listener removal
  return () => {
    if (activeContainer) {
      activeContainer.removeEventListener('click', unifiedClickHandler);
    }
  };
}, [
  currentPosition,
  displayDescription,
  hasInteractiveItem,
  isMineralsRoom,
  isWaterDripRoom,
  addItemToInventory,
  updateRoomDescriptionAfterCollection,
  itemTypes,
  setMessage,
  positions,
  collectedTreasures,
  treasurePieces,
  setGameStatus,
  setDeathCause,
  specialRooms
]);
  // ==================== COMPREHENSIVE VISUAL EFFECTS useEffect ====================
/**
 * Advanced room-specific visual enhancement system with dynamic particle generation
 * 
 * This sophisticated useEffect creates immersive atmospheric effects for different
 * room types through programmatic DOM manipulation, CSS custom properties, and
 * complex animation systems. Each room type has unique visual characteristics
 * that enhance the player's immersion and provide visual feedback about the
 * environment they're exploring.
 * 
 * Room Enhancement Types:
 * - **Minerals Room**: Glittering particle effects with randomized timing
 * - **Water Drip Room**: Realistic water drops with ripple animations
 * - **Sulfur Room**: Toxic vapor wisps and crystalline bubble effects
 * - **Stream Room**: Rushing water splashes with dynamic speed lines
 * - **Crystal Room**: Floating particles with lantern-responsive gold sparkles
 * - **Tendrils Room**: Complex pulsing biological effects with ghost footprints
 * 
 * Technical Features:
 * - **Dynamic Particle Generation**: Programmatic creation of visual elements
 * - **CSS Custom Properties**: Runtime injection of animation variables
 * - **Mathematical Positioning**: Algorithmic placement for natural distribution
 * - **Cleanup Management**: Proper memory management with element removal
 * - **Container Validation**: Safe DOM manipulation with existence checking
 * - **Performance Optimization**: Efficient particle limits and cleanup cycles
 * 
 * @param {boolean} isMineralsRoom - Whether current room is minerals type
 * @param {boolean} isWaterDripRoom - Whether current room is water drip type
 * @param {boolean} isSulfurRoom - Whether current room is sulfur type
 * @param {boolean} isStreamRoom - Whether current room is stream type
 * @param {boolean} isCrystalRoom - Whether current room is crystal type
 * @param {boolean} isTendrilsRoom - Whether current room is tendrils type
 * @param {string} displayDescription - Current room description for triggering updates
 * @param {boolean} lanternActive - Lantern status for enhanced crystal room effects
 * @effects Dynamic DOM manipulation, particle creation, animation management
 */
useEffect(() => {
  // ==================== MINERALS ROOM GLITTER EFFECT SYSTEM ====================
  /**
   * Sophisticated glitter particle system for treasure-filled mineral chambers
   * 
   * Creates 30 randomized glitter particles with individual timing, positioning,
   * scaling, and opacity animations to simulate sparkling gems and minerals
   * catching light throughout the chamber.
   * 
   * Features:
   * - **30 Particle Limit**: Optimal performance balance
   * - **Randomized Positioning**: Full container coverage (0-100%)
   * - **Variable Timing**: 0-3 second delays for natural sparkle patterns
   * - **Dynamic Duration**: 1-4 second animation cycles
   * - **Scale Variation**: 1-2x size multipliers for depth effect
   * - **Opacity Range**: 0.5-1.0 alpha for realistic light interaction
   * 
   * @effects DOM particle creation, CSS custom property injection
   */
  if (isMineralsRoom && mineralsContainerRef.current) {
    const container = mineralsContainerRef.current;
    
    // === CLEANUP EXISTING PARTICLES ===
    // Clear any existing glitter particles to prevent accumulation
    const existingGlitter = container.querySelectorAll('.glitter');
    existingGlitter.forEach(el => el.remove());
    
    // === PARTICLE GENERATION SYSTEM ===
    // Create 30 glitter particles with randomized properties
    for (let i = 0; i < 30; i++) {
      const glitter = document.createElement('div');
      glitter.className = 'glitter';
      
      // === RANDOMIZED POSITIONING ===
      // Random position across full container area
      glitter.style.left = `${Math.random() * 100}%`;
      glitter.style.top = `${Math.random() * 100}%`;
      
      // === ANIMATION TIMING INJECTION ===
      // Random timing for natural sparkle patterns
      glitter.style.setProperty('--glitter-delay', `${Math.random() * 3}s`);
      glitter.style.setProperty('--glitter-duration', `${1 + Math.random() * 3}s`);
      
      // === VISUAL VARIATION SYSTEM ===
      // Random size and brightness for depth and realism
      glitter.style.setProperty('--glitter-scale', `${1 + Math.random()}`);
      glitter.style.setProperty('--glitter-opacity', `${0.5 + Math.random() * 0.5}`);
      
      container.appendChild(glitter);
    }
    
    // === CLEANUP FUNCTION ===
    // Memory management for component unmount
    return () => {
      const glitters = container.querySelectorAll('.glitter');
      glitters.forEach(el => el.remove());
    };
  }

  // ==================== WATER DRIP ROOM ATMOSPHERIC SYSTEM ====================
  /**
   * Realistic water drop and ripple effect system for cave atmospherics
   * 
   * Creates 10 synchronized water drops with corresponding ripple effects,
   * simulating natural cave water dripping with realistic physics and timing.
   * 
   * Features:
   * - **10 Drop Limit**: Performance-optimized particle count
   * - **Synchronized Ripples**: Each drop creates corresponding ground ripple
   * - **Horizontal Distribution**: 5-95% positioning to stay within viewport
   * - **Variable Timing**: 0-4 second delays for natural drip patterns
   * - **Physics Duration**: 2-5 second fall times for realistic gravity
   * - **Ripple Coordination**: Matched timing between drops and ground effects
   * 
   * @effects DOM particle creation, synchronized animation systems
   */
  if (isWaterDripRoom && waterContainerRef.current) {
    const container = waterContainerRef.current;
    
    // === CLEANUP EXISTING EFFECTS ===
    // Clear any existing water drops and ripples
    const existingDrops = container.querySelectorAll('.water-drop, .water-ripple');
    existingDrops.forEach(el => el.remove());
    
    // === WATER DROP GENERATION SYSTEM ===
    // Create 10 water drops at random positions with ripple effects
    for (let i = 0; i < 10; i++) {
      // === DROP CREATION ===
      // Create the falling water drop element
      const drop = document.createElement('div');
      drop.className = 'water-drop';
      
      // === HORIZONTAL POSITIONING ===
      // Random horizontal position with viewport padding
      const xPos = 5 + Math.random() * 90; // 5-95% to keep it within view
      drop.style.left = `${xPos}%`;
      
      // === ANIMATION TIMING ===
      // Random timing for each drop to create natural patterns
      drop.style.setProperty('--drip-delay', `${Math.random() * 4}s`);
      drop.style.setProperty('--drip-duration', `${2 + Math.random() * 3}s`);
      
      container.appendChild(drop);
      
      // === SYNCHRONIZED RIPPLE CREATION ===
      // Create the ground ripple effect at same horizontal position
      const ripple = document.createElement('div');
      ripple.className = 'water-ripple';
      ripple.style.left = `${xPos}%`;
      ripple.style.width = '20px';
      ripple.style.height = '20px';
      ripple.style.setProperty('--ripple-delay', `${Math.random() * 4}s`);
      
      container.appendChild(ripple);
    }
    
    // === CLEANUP FUNCTION ===
    return () => {
      const drops = container.querySelectorAll('.water-drop, .water-ripple');
      drops.forEach(el => el.remove());
    };
  }
  
  // ==================== SULFUR ROOM TOXIC ATMOSPHERE SYSTEM ====================
  /**
   * Complex toxic gas visualization with vapor wisps and crystalline bubbles
   * 
   * Creates atmospheric effects simulating dangerous sulfur gas chambers with
   * rising vapor wisps and wall-mounted crystal formations releasing gas bubbles.
   * 
   * Features:
   * - **8 Vapor Wisps**: Rising gas effects from chamber floor
   * - **15 Crystal Bubbles**: Wall-mounted gas emission points
   * - **Drift Variation**: -20 to +40px horizontal vapor movement
   * - **Wall Positioning**: 20% left/right wall bubble placement
   * - **Layered Timing**: Complex delay systems for natural gas flow
   * - **Toxic Ambiance**: Visual representation of dangerous atmosphere
   * 
   * @effects DOM particle creation, toxic atmosphere visualization
   */
  if (isSulfurRoom && containerRef.current) {
    const container = containerRef.current;
    
    // === CLEANUP EXISTING EFFECTS ===
    // Clear any existing sulfur vapor and bubble effects
    const existingEffects = container.querySelectorAll('.sulfur-vapor, .sulfur-bubble');
    existingEffects.forEach(el => el.remove());
    
    // === VAPOR WISP GENERATION ===
    // Create vapor wisps rising from the chamber floor
    for (let i = 0; i < 8; i++) {
      const vapor = document.createElement('div');
      vapor.className = 'sulfur-vapor';
      
      // === FLOOR POSITIONING ===
      // Random position along the bottom edge
      vapor.style.left = `${Math.random() * 100}%`;
      
      // === VAPOR ANIMATION PROPERTIES ===
      // Random timing and horizontal drift for natural gas movement
      vapor.style.setProperty('--vapor-delay', `${Math.random() * 6}s`);
      vapor.style.setProperty('--vapor-duration', `${5 + Math.random() * 3}s`);
      vapor.style.setProperty('--vapor-drift', `${-20 + Math.random() * 40}px`);
      
      container.appendChild(vapor);
    }
    
    // === CRYSTAL BUBBLE GENERATION ===
    // Create bubble effects near crystalline formations on walls
    for (let i = 0; i < 15; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'sulfur-bubble';
      
      // === WALL POSITIONING ALGORITHM ===
      // Position bubbles along left and right walls
      if (Math.random() > 0.5) {
        bubble.style.left = `${Math.random() * 20}%`; // Left wall
      } else {
        bubble.style.left = `${80 + Math.random() * 20}%`; // Right wall
      }
      bubble.style.top = `${20 + Math.random() * 60}%`;
      
      // === BUBBLE TIMING ===
      // Random bubble emission timing
      bubble.style.setProperty('--bubble-delay', `${Math.random() * 4}s`);
      bubble.style.setProperty('--bubble-duration', `${1.5 + Math.random() * 1}s`);
      
      container.appendChild(bubble);
    }
    
    // === CLEANUP FUNCTION ===
    return () => {
      const effects = container.querySelectorAll('.sulfur-vapor, .sulfur-bubble');
      effects.forEach(el => el.remove());
    };
  }

  // ==================== STREAM ROOM RUSHING WATER SYSTEM ====================
  /**
   * Dynamic rushing water effects with splashes and speed visualization
   * 
   * Creates energetic water effects simulating a fast-flowing underground stream
   * with splash particles and speed lines for motion visualization.
   * 
   * Features:
   * - **20 Water Splashes**: Dynamic splash effects along stream
   * - **5 Speed Lines**: Motion blur visualization for rushing water
   * - **Bottom Positioning**: 10% from bottom for stream placement
   * - **Rapid Timing**: 0.8-1.2 second splash cycles for energy
   * - **Variable Speed Lines**: 30-70% width variation for natural flow
   * - **Motion Emphasis**: Visual representation of water velocity
   * 
   * @effects DOM particle creation, motion visualization effects
   */
  if (isStreamRoom && containerRef.current) {
    const container = containerRef.current;
    
    // === CLEANUP EXISTING EFFECTS ===
    // Clear existing water splash and speed line effects
    const existingEffects = container.querySelectorAll('.water-splash, .speed-line');
    existingEffects.forEach(el => el.remove());
    
    // === SPLASH EFFECT GENERATION ===
    // Create splash effects along the underground stream
    for (let i = 0; i < 20; i++) {
      const splash = document.createElement('div');
      splash.className = 'water-splash';
      
      // === STREAM POSITIONING ===
      // Position splashes along the stream bottom
      splash.style.bottom = '10%';
      splash.style.left = `${Math.random() * 100}%`;
      
      // === SPLASH TIMING ===
      // Random timing for energetic splash patterns
      splash.style.setProperty('--splash-delay', `${Math.random() * 2}s`);
      splash.style.setProperty('--splash-duration', `${0.8 + Math.random() * 0.4}s`);
      
      container.appendChild(splash);
    }
    
    // === SPEED LINE GENERATION ===
    // Create speed lines for motion blur effect
    for (let i = 0; i < 5; i++) {
      const line = document.createElement('div');
      line.className = 'speed-line';
      
      // === MOTION LINE POSITIONING ===
      // Random vertical position in lower stream area
      line.style.bottom = `${5 + Math.random() * 25}%`;
      line.style.width = `${30 + Math.random() * 40}%`;
      
      // === MOTION TIMING ===
      // Random timing for dynamic speed visualization
      line.style.setProperty('--line-delay', `${Math.random() * 1.5}s`);
      line.style.setProperty('--line-duration', `${1 + Math.random() * 0.5}s`);
      
      container.appendChild(line);
    }
    
    // === CLEANUP FUNCTION ===
    return () => {
      const effects = container.querySelectorAll('.water-splash, .speed-line');
      effects.forEach(el => el.remove());
    };
  }

  // ==================== CRYSTAL ROOM MYSTICAL ENHANCEMENT SYSTEM ====================
  /**
   * Advanced crystal chamber effects with lantern-responsive gold enhancements
   * 
   * Creates mystical floating particles with conditional gold sparkle overlays
   * that activate when the player's lantern reveals hidden golden veins in
   * the crystal formations.
   * 
   * Features:
   * - **15 Floating Particles**: Base mystical atmosphere effects
   * - **Lantern-Responsive**: 25 additional gold sparkles when lantern active
   * - **Wall Vein Positioning**: Gold sparkles along diagonal crystal veins
   * - **Extended Duration**: 6-10 second particle cycles for mystical feel
   * - **Enhanced Discovery**: Visual reward for lantern exploration
   * - **Atmospheric Depth**: Layered effects creating rich environment
   * 
   * @effects DOM particle creation, lantern-responsive enhancement system
   */
  if (isCrystalRoom && containerRef.current) {
    const container = containerRef.current;
    
    // === CLEANUP EXISTING EFFECTS ===
    // Clear existing crystal particles and gold sparkles
    const existingEffects = container.querySelectorAll('.crystal-particle, .gold-sparkle');
    existingEffects.forEach(el => el.remove());
    
    // === BASE PARTICLE GENERATION ===
    // Create floating mystical particles for base atmosphere
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'crystal-particle';
      
      // === HORIZONTAL POSITIONING ===
      // Random horizontal position across chamber
      particle.style.left = `${Math.random() * 100}%`;
      
      // === MYSTICAL TIMING ===
      // Extended timing for mystical floating effect
      particle.style.setProperty('--particle-delay', `${Math.random() * 8}s`);
      particle.style.setProperty('--particle-duration', `${6 + Math.random() * 4}s`);
      particle.style.setProperty('--particle-drift', `${-30 + Math.random() * 60}px`);
      
      container.appendChild(particle);
    }
    
    // === LANTERN-RESPONSIVE GOLD ENHANCEMENT ===
    // If lantern is active, add enhanced gold sparkle effects
    if (lanternActive) {
      for (let i = 0; i < 25; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'gold-sparkle';
        
        // === VEIN POSITIONING ALGORITHM ===
        // Position along "veins" (diagonal lines across walls)
        const isLeftWall = Math.random() > 0.5;
        if (isLeftWall) {
          sparkle.style.left = `${Math.random() * 15}%`;
        } else {
          sparkle.style.right = `${Math.random() * 15}%`;
        }
        sparkle.style.top = `${Math.random() * 100}%`;
        
        // === SPARKLE TIMING ===
        // Rapid sparkle cycles for gold discovery excitement
        sparkle.style.setProperty('--sparkle-delay', `${Math.random() * 3}s`);
        sparkle.style.setProperty('--sparkle-duration', `${2 + Math.random() * 2}s`);
        
        container.appendChild(sparkle);
      }
    }
    
    // === CLEANUP FUNCTION ===
    return () => {
      const effects = container.querySelectorAll('.crystal-particle, .gold-sparkle');
      effects.forEach(el => el.remove());
    };
  }

  // ==================== TENDRILS ROOM COMPLEX BIOLOGICAL SYSTEM ====================
  /**
   * Sophisticated biological horror effects with pulsing veins and supernatural elements
   * 
   * Creates the most complex visual system with pulsing biological veins, energy waves,
   * floating particles, and ghostly footprint trails to simulate a living, supernatural
   * chamber with otherworldly presence.
   * 
   * Features:
   * - **6 Pulsing Veins**: Biological wall formations with staggered timing
   * - **3 Pulse Waves**: Energy emanations from tendril connection points
   * - **20 Floating Particles**: Ambient supernatural particle effects
   * - **8 Ghost Footprints**: Spectral trail suggesting invisible presence
   * - **Complex Positioning**: Mathematical algorithms for natural biological placement
   * - **Layered Animation**: Multiple synchronized effect systems
   * 
   * @effects DOM particle creation, complex biological visualization system
   */
  if (isTendrilsRoom && containerRef.current) {
    const container = containerRef.current;
    
    // === CLEANUP EXISTING EFFECTS ===
    // Clear existing tendril effects
    const existingEffects = container.querySelectorAll('.tendril-vein, .pulse-wave, .pulse-particle, .ghost-footprint');
    existingEffects.forEach(el => el.remove());
    
    // === BIOLOGICAL VEIN POSITIONING SYSTEM ===
    // Pre-calculated vein positions for natural biological wall coverage
    const veinPositions = [
      { left: '5%', top: '10%', height: '60%', angle: 5 },
      { left: '15%', top: '20%', height: '70%', angle: -10 },
      { right: '10%', top: '15%', height: '65%', angle: 8 },
      { right: '20%', top: '5%', height: '80%', angle: -5 },
      { left: '25%', top: '30%', height: '50%', angle: 15 },
      { right: '30%', top: '25%', height: '55%', angle: -12 }
    ];
    
    // === VEIN GENERATION SYSTEM ===
    // Create pulsing biological veins on chamber walls
    veinPositions.forEach((pos, index) => {
      const vein = document.createElement('div');
      vein.className = 'tendril-vein';
      
      // === PRECISE POSITIONING ===
      // Set calculated position and rotation
      if (pos.left) vein.style.left = pos.left;
      if (pos.right) vein.style.right = pos.right;
      vein.style.top = pos.top;
      vein.style.height = pos.height;
      vein.style.transform = `rotate(${pos.angle}deg)`;
      
      // === STAGGERED PULSE TIMING ===
      // Stagger the pulse timing for organic rhythm
      vein.style.setProperty('--vein-delay', `${index * 0.3}s`);
      
      container.appendChild(vein);
    });
    
    // === ENERGY WAVE GENERATION ===
    // Create pulse waves from random tendril connection points
    for (let i = 0; i < 3; i++) {
      const wave = document.createElement('div');
      wave.className = 'pulse-wave';
      
      // === WAVE ORIGIN POSITIONING ===
      // Position at random energy emanation points
      wave.style.left = `${20 + Math.random() * 60}%`;
      wave.style.top = `${20 + Math.random() * 60}%`;
      
      // === WAVE TIMING ===
      // Stagger wave timing for layered energy effects
      wave.style.setProperty('--wave-delay', `${i * 1.3}s`);
      
      container.appendChild(wave);
    }
    
    // === FLOATING PARTICLE SYSTEM ===
    // Create ambient supernatural particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'pulse-particle';
      
      // === RANDOM POSITIONING ===
      // Random position across entire chamber
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // === PARTICLE MOVEMENT ===
      // Random push direction for supernatural drift
      particle.style.setProperty('--push-x', `${-20 + Math.random() * 40}px`);
      particle.style.setProperty('--push-y', `${-10 + Math.random() * 20}px`);
      particle.style.setProperty('--particle-delay', `${Math.random() * 8}s`);
      
      container.appendChild(particle);
    }
    
    // === GHOST FOOTPRINT TRAIL SYSTEM ===
    // Create spectral footprint path suggesting invisible presence
    const footstepPath = [];
    for (let i = 0; i < 8; i++) {
      footstepPath.push({
        x: 10 + (i * 10),
        angle: -30 + (i * 5),
        delay: i * 0.5
      });
    }
    
    // === FOOTPRINT GENERATION ===
    footstepPath.forEach((step, index) => {
      const footprint = document.createElement('div');
      footprint.className = 'ghost-footprint';
      
      // === TRAIL POSITIONING ===
      // Sequential positioning along calculated path
      footprint.style.left = `${step.x}%`;
      footprint.style.setProperty('--foot-angle', `${step.angle}deg`);
      footprint.style.setProperty('--foot-delay', `${step.delay}s`);
      footprint.style.setProperty('--foot-duration', '8s');
      
      container.appendChild(footprint);
    });
    
    // === CLEANUP FUNCTION ===
    return () => {
      const effects = container.querySelectorAll('.tendril-vein, .pulse-wave, .pulse-particle, .ghost-footprint');
      effects.forEach(el => el.remove());
    };
  }

}, [isMineralsRoom, isWaterDripRoom, isSulfurRoom, isStreamRoom, isCrystalRoom, isTendrilsRoom, displayDescription, lanternActive]);


// ==================== RENDERING SECTION ====================
/**
 * Sophisticated conditional rendering system with room-specific JSX structures
 * 
 * This advanced rendering section provides specialized JSX output for each room type,
 * implementing unique visual containers, CSS overlays, and styling systems that
 * enhance the atmospheric experience. Each room type receives custom treatment
 * with specialized containers, background effects, and text styling.
 * 
 * Rendering Architecture:
 * - **Hierarchical Conditionals**: Seven distinct room types with fallback
 * - **Container Reference Management**: Dynamic ref assignment for effect systems
 * - **Safe HTML Rendering**: Conditional dangerouslySetInnerHTML usage
 * - **CSS Integration**: Room-specific classes with conditional enhancements
 * - **Performance Optimization**: Early returns and efficient conditional logic
 * 
 * Room-Specific Features:
 * - **Water Drip**: Overlay effects with specialized water container
 * - **Minerals**: Background minerals with glitter-compatible structure
 * - **Luminescent**: Glow text styling for magical fungi atmosphere
 * - **Sulfur**: Heat shimmer and toxic overlay for dangerous environment
 * - **Stream**: Flowing water background with motion-enhanced text
 * - **Crystal**: Lantern-responsive styling with mystical pulse effects
 * - **Tendrils**: Warmth overlay for supernatural biological presence
 * 
 * @returns {JSX.Element|null} Room-specific JSX structure or null if no description
 */

// === DESCRIPTION PREPARATION ===
// Prepare final description for rendering
let finalDescription = displayDescription;

// === NULL SAFETY CHECK ===
// Early return if no description available
if (!displayDescription) return null;

// ==================== CONTAINER REFERENCE MANAGEMENT SYSTEM ====================
/**
 * Dynamic container reference assignment based on room type
 * 
 * This system ensures that specialized room types use their corresponding
 * container references for proper integration with the visual effects system.
 * Default rooms use the standard container while special rooms get their
 * specialized containers for enhanced effect attachment.
 * 
 * Container Mapping:
 * - **Minerals Room**: mineralsContainerRef for glitter particle attachment
 * - **Water Drip Room**: waterContainerRef for water drop effect integration
 * - **Default Rooms**: containerRef for standard interactive element handling
 * 
 * @effects Container reference assignment for effect system integration
 */


// ==================== ROOM-SPECIFIC RENDERING CONDITIONALS ====================

// === WATER DRIP ROOM SPECIALIZED RENDERING ===
/**
 * Water drip room with atmospheric water overlay and specialized container
 * 
 * Features:
 * - **Water Overlay**: CSS overlay for atmospheric water effects
 * - **Specialized Container**: waterContainerRef for water drop integration
 * - **Water-Specific Text Styling**: Custom CSS class for aquatic atmosphere
 * - **Safe HTML Rendering**: Conditional dangerouslySetInnerHTML for interactive content
 * 
 * @returns {JSX.Element} Water drip room JSX structure
 */
if (isWaterDripRoom) {
  return (
    <div className="room-description water-drip-container" ref={waterContainerRef}>
      <div className="water-overlay"></div>
      {hasHTMLContent ? (
        <p className="water-text" dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
      ) : (
        <p className="water-text">{finalDescription}</p>
      )}
    </div>
  );
}

// === MINERALS ROOM SPECIALIZED RENDERING ===
/**
 * Minerals room with background minerals and glitter-compatible container
 * 
 * Features:
 * - **Minerals Background**: CSS background for sparkling mineral atmosphere
 * - **Specialized Container**: mineralsContainerRef for glitter particle integration
 * - **Minerals-Specific Text Styling**: Custom CSS class for treasure chamber feel
 * - **Safe HTML Rendering**: Conditional dangerouslySetInnerHTML for interactive content
 * 
 * @returns {JSX.Element} Minerals room JSX structure
 */
if (isMineralsRoom) {
  return (
    <div className="room-description minerals-container" ref={mineralsContainerRef}>
      <div className="minerals-background"></div>
      {hasHTMLContent ? (
        <p className="minerals-text" dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
      ) : (
        <p className="minerals-text">{finalDescription}</p>
      )}
    </div>
  );
}

// === LUMINESCENT ROOM SPECIALIZED RENDERING ===
/**
 * Luminescent fungi room with magical glow text styling
 * 
 * Features:
 * - **Standard Container**: Uses containerRef for basic interactive elements
 * - **Luminescent Text Styling**: Custom CSS class for magical glow effects
 * - **Fungi Atmosphere**: Specialized styling for bioluminescent environment
 * - **Safe HTML Rendering**: Conditional dangerouslySetInnerHTML for interactive content
 * 
 * @returns {JSX.Element} Luminescent room JSX structure
 */
if (isLuminescentRoom) {
  return (
    <div className="room-description" ref={containerRef}>
      {hasHTMLContent ? (
        <p className="luminescent-text" dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
      ) : (
        <p className="luminescent-text">{finalDescription}</p>
      )}
    </div>
  );
}

// === SULFUR ROOM SPECIALIZED RENDERING ===
/**
 * Sulfur room with heat shimmer and toxic overlay effects
 * 
 * Features:
 * - **Heat Shimmer Effect**: CSS animation for temperature distortion
 * - **Sulfur Overlay**: Toxic gas visual overlay for dangerous atmosphere
 * - **Sulfur-Specific Container**: Custom CSS class for toxic environment
 * - **Sulfur Text Styling**: Custom CSS class emphasizing danger and toxicity
 * - **Safe HTML Rendering**: Conditional dangerouslySetInnerHTML for interactive content
 * 
 * @returns {JSX.Element} Sulfur room JSX structure
 */
if (isSulfurRoom) {
  return (
    <div className="room-description sulfur-room-container" ref={containerRef}>
      <div className="heat-shimmer"></div>
      <div className="sulfur-overlay"></div>
      {hasHTMLContent ? (
        <p className="sulfur-text" dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
      ) : (
        <p className="sulfur-text">{finalDescription}</p>
      )}
    </div>
  );
}

// === STREAM ROOM SPECIALIZED RENDERING ===
/**
 * Stream room with flowing water background and motion-enhanced text
 * 
 * Features:
 * - **Stream Flow Background**: CSS animation for flowing water movement
 * - **Stream-Specific Container**: Custom CSS class for rushing water environment
 * - **Stream Text Styling**: Custom CSS class emphasizing water movement and energy
 * - **Safe HTML Rendering**: Conditional dangerouslySetInnerHTML for interactive content
 * 
 * @returns {JSX.Element} Stream room JSX structure
 */
if (isStreamRoom) {
  return (
    <div className="room-description stream-room-container" ref={containerRef}>
      <div className="stream-flow"></div>
      {hasHTMLContent ? (
        <p className="stream-text" dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
      ) : (
        <p className="stream-text">{finalDescription}</p>
      )}
    </div>
  );
}

// === CRYSTAL ROOM SPECIALIZED RENDERING ===
/**
 * Crystal room with lantern-responsive styling and mystical pulse effects
 * 
 * Features:
 * - **Lantern-Responsive Styling**: Conditional CSS class based on lantern status
 * - **Crystal Pulse Effect**: CSS animation for mystical crystal energy
 * - **Crystal-Specific Container**: Custom CSS class for magical crystal environment
 * - **Crystal Text Styling**: Custom CSS class emphasizing mystical properties
 * - **Dynamic Enhancement**: Visual changes based on player equipment state
 * - **Safe HTML Rendering**: Conditional dangerouslySetInnerHTML for interactive content
 * 
 * @returns {JSX.Element} Crystal room JSX structure with conditional lantern enhancement
 */
if (isCrystalRoom) {
  return (
    <div className={`room-description crystal-room-container ${lanternActive ? 'lantern-active' : ''}`} ref={containerRef}>
      <div className="crystal-pulse"></div>
      {hasHTMLContent ? (
        <p className="crystal-text" dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
      ) : (
        <p className="crystal-text">{finalDescription}</p>
      )}
    </div>
  );
}

// === TENDRILS ROOM SPECIALIZED RENDERING ===
/**
 * Tendrils room with warmth overlay for supernatural biological atmosphere
 * 
 * Features:
 * - **Warmth Overlay**: CSS overlay for supernatural temperature effects
 * - **Tendrils-Specific Container**: Custom CSS class for biological horror environment
 * - **Tendrils Text Styling**: Custom CSS class emphasizing organic and supernatural elements
 * - **Biological Atmosphere**: Specialized styling for living, breathing environment
 * - **Safe HTML Rendering**: Conditional dangerouslySetInnerHTML for interactive content
 * 
 * @returns {JSX.Element} Tendrils room JSX structure
 */
if (isTendrilsRoom) {
  return (
    <div className="room-description tendrils-room-container" ref={containerRef}>
      <div className="warmth-overlay"></div>
      {hasHTMLContent ? (
        <p className="tendrils-text" dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
      ) : (
        <p className="tendrils-text">{finalDescription}</p>
      )}
    </div>
  );
}

// ==================== DEFAULT FALLBACK RENDERING ====================
/**
 * Default rendering fallback for standard rooms without specialized effects
 * 
 * This fallback system ensures that all rooms receive proper rendering even
 * if they don't match any of the specialized room types. It provides clean,
 * functional display with standard container and interactive element support.
 * 
 * Features:
 * - **Standard Container**: Uses containerRef for basic interactive elements
 * - **Clean Presentation**: Minimal styling for clear text display
 * - **Interactive Support**: Full support for clickable elements and HTML content
 * - **Safe HTML Rendering**: Conditional dangerouslySetInnerHTML for interactive content
 * - **Universal Compatibility**: Works with any room type not specifically handled
 * 
 * @returns {JSX.Element} Default room JSX structure
 */
return (
  <div className="room-description" ref={containerRef}>
    {hasHTMLContent ? (
      <p dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
    ) : (
      <p>{finalDescription}</p>
    )}
  </div>
);

}; // End of RoomDescription component

// ==================== COMPONENT EXPORT ====================
/**
 * Export the RoomDescription component as default export
 * 
 * This component represents a sophisticated room description system with:
 * - **Advanced State Management**: Complex invisibility cloak tracking
 * - **Interactive Element Handling**: Comprehensive click management
 * - **Visual Effects Integration**: Dynamic particle and animation systems
 * - **Conditional Rendering**: Room-specific JSX structures
 * - **Performance Optimization**: Efficient re-rendering and cleanup
 * - **Game Integration**: Deep coordination with game state and inventory
 * 
 * @component RoomDescription
 * @param {string} description - Base room description text to display and enhance
 * @returns {JSX.Element|null} Sophisticated room display with interactive elements
 */
export default RoomDescription;