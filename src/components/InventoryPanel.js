// ==================== INVENTORY PANEL COMPONENT ====================
/**
 * InventoryPanel.js - Advanced inventory management with contextual item glowing
 * 
 * This sophisticated component manages the player's inventory display with intelligent
 * contextual feedback systems. It provides real-time visual cues when items become
 * relevant to the current environment, creating an intuitive and immersive inventory
 * experience that guides players toward appropriate item usage.
 * 
 * Key Features:
 * - **Contextual Item Glowing**: Items glow when relevant to current location
 * - **Torch Status Monitoring**: Real-time torch fuel and darkness tracking
 * - **Lantern Fuel Management**: Active/inactive states with fuel level display
 * - **Special Item Animations**: Dynamic visual effects for item usage
 * - **Multi-Item State Management**: Complex item state tracking and display
 * 
 * Advanced Systems:
 * - **Location-Based Item Reactions**: Items respond to environmental triggers
 * - **Event-Driven Animations**: Global events trigger specific item effects
 * - **Timed Animation Management**: Sophisticated timeout handling for visual effects
 * - **Cross-Component Communication**: Inventory reacts to game world events
 */
import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import '../styles/InventoryStyles.css';

// ==================== INVENTORY PANEL COMPONENT DEFINITION ====================
/**
 * Main InventoryPanel functional component
 * 
 * Manages comprehensive inventory display with advanced contextual feedback systems.
 * Integrates multiple state management systems for torch monitoring, item glowing,
 * and dynamic visual effects based on player location and game events.
 */
const InventoryPanel = () => {
  
  // ========== GAME CONTEXT INTEGRATION ==========
  /**
   * Comprehensive game state extraction for inventory management
   * 
   * This destructuring operation pulls in all necessary game state and functions
   * required for sophisticated inventory display and item interaction management.
   */
  const { 
    inventory,                  // Player's current inventory array
    torchLevel,                 // Current torch fuel level (0-100)
    darknessCounter,            // Counter for darkness progression
    MAX_DARKNESS,               // Maximum darkness threshold before death
    handleUseItem,              // Function to use inventory items
    gameStatus,                 // Current game state (playing/won/lost)
    currentPosition,            // Player's current room number
    roomDescriptionMap,         // Map of all room descriptions and properties
    specialRooms,               // Special room configurations and states
    positions                   // Game entity positions (wumpus, pits, exit, etc.)
  } = useGame();

  // ==================== ITEM GLOWING STATE MANAGEMENT ====================
  /**
   * Sophisticated item glowing state system with individual item tracking
   * 
   * Each special item has its own glowing state and timeout management to provide
   * contextual visual feedback when items become relevant to the current environment.
   * The system uses refs for timeout management to prevent memory leaks and ensure
   * proper cleanup of animation effects.
   */
  
  // === RUSTY KEY GLOWING SYSTEM ===
  const [keyGlowing, setKeyGlowing] = useState(false);          // Key glow state
  const glowTimeoutRef = useRef(null);                          // Key glow timeout reference

  // === CRYSTAL ORB GLOWING SYSTEM ===
  const [orbGlowing, setOrbGlowing] = useState(false);          // Orb glow state
  const orbGlowTimeoutRef = useRef(null);                       // Orb glow timeout reference

  // === WYRMGLASS GLOWING SYSTEM ===
  const [wyrmglassGlowing, setWyrmglassGlowing] = useState(false);  // Wyrmglass glow state
  const wyrmglassGlowTimeoutRef = useRef(null);                     // Wyrmglass glow timeout reference

  // === SAND CREATURE PROTECTION GLOWING ===
  const [sandProtectionGlowing, setSandProtectionGlowing] = useState(false);  // Sand protection glow
  const sandProtectionTimeoutRef = useRef(null);                              // Sand protection timeout

  // ==================== RUSTY KEY CONTEXTUAL GLOWING SYSTEM ====================
  /**
   * Intelligent rusty key glowing based on hidden door proximity
   * 
   * This effect monitors the player's location and inventory to determine when
   * the rusty key should glow, providing visual feedback when the player is in
   * a room with a hidden door that can be unlocked with the key.
   * 
   * Glowing Triggers:
   * - **Hidden Door Detection**: Uses roomDescriptionMap.hasHiddenDoor property
   * - **Key Possession**: Checks inventory for rusty_key (with originalId fallback)
   * - **Location Relevance**: Only glows when both conditions are met
   * 
   * Animation Management:
   * - **Timed Glowing**: 6-second glow duration (3 pulses × 2 seconds each)
   * - **Timeout Cleanup**: Proper timeout management prevents memory leaks
   * - **State Synchronization**: Immediate response to location/inventory changes
   * 
   * Technical Features:
   * - **Timeout Safety**: Clears existing timeouts before setting new ones
   * - **Conditional Activation**: Only activates when both key and door are present
   * - **Cleanup Function**: Comprehensive cleanup on component unmount
   * 
   * @effects Updates keyGlowing state based on location and inventory
   */
  useEffect(() => {
    // ========== HIDDEN DOOR DETECTION ==========
    // Check if player is in a room with hidden door
    const isInRoomWithDoor = roomDescriptionMap[currentPosition]?.hasHiddenDoor;
    
    // ========== KEY POSSESSION VALIDATION ==========
    // Check if player has rusty key (with flexible ID matching)
    const hasRustyKey = inventory.some(item => 
      (item.originalId || item.id) === 'rusty_key'
    );

    // ========== TIMEOUT CLEANUP ==========
    // First clear any existing timeout to prevent conflicts
    if (glowTimeoutRef.current) {
      clearTimeout(glowTimeoutRef.current);
      glowTimeoutRef.current = null;
    }
    
    // ========== CONDITIONAL GLOWING ACTIVATION ==========
    // If in the right room with the key, start the glowing effect
    if (isInRoomWithDoor && hasRustyKey) {
      setKeyGlowing(true);
      
      // ========== TIMED GLOW DURATION ==========
      // Set a timeout to turn off the glow after the animation finishes
      // 2 seconds per pulse × 3 pulses = 6 seconds total
      glowTimeoutRef.current = setTimeout(() => {
        setKeyGlowing(false);
      }, 6000);
    } else {
      setKeyGlowing(false);
    }
    
    // ========== CLEANUP FUNCTION ==========
    return () => {
      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current);
      }
    };
  }, [currentPosition, inventory, roomDescriptionMap]);
  
  // ==================== CRYSTAL ORB CONTEXTUAL GLOWING SYSTEM ====================
  /**
   * Advanced crystal orb glowing based on teleportation room detection
   * 
   * This effect provides visual feedback when the crystal orb becomes relevant,
   * specifically when the player is in a room with teleportation capabilities.
   * The orb glows to indicate its teleportation functionality is available.
   * 
   * Glowing Triggers:
   * - **Teleport Room Detection**: Uses specialRooms.hasTeleport property
   * - **Orb Possession**: Checks inventory for crystal_orb item
   * - **Location Relevance**: Glows only when teleportation is possible
   * 
   * Animation Management:
   * - **6-Second Duration**: Consistent with other item glowing systems
   * - **Timeout Management**: Proper cleanup prevents animation conflicts
   * - **State Responsiveness**: Immediate updates on location/inventory changes
   * 
   * Technical Implementation:
   * - **Flexible Item Detection**: Handles both originalId and regular id
   * - **Conditional Logic**: Only activates when both orb and teleport room present
   * - **Memory Safety**: Comprehensive timeout cleanup on effect changes
   * 
   * @effects Updates orbGlowing state based on teleport room presence and orb possession
   */
  useEffect(() => {
    // ========== TELEPORT ROOM DETECTION ==========
    // Check if player is in a room with teleport capabilities
    const isInRoomWithTeleport = specialRooms[currentPosition]?.hasTeleport;
    
    // ========== ORB POSSESSION VALIDATION ==========
    // Check if player has crystal orb
    const hasCrystalOrb = inventory.some(item => 
      (item.originalId || item.id) === 'crystal_orb'
    );
    
    // ========== TIMEOUT CLEANUP ==========
    // First clear any existing timeout
    if (orbGlowTimeoutRef.current) {
      clearTimeout(orbGlowTimeoutRef.current);
      orbGlowTimeoutRef.current = null;
    }
    
    // ========== CONDITIONAL GLOWING ACTIVATION ==========
    // If in the right room with the orb, start the glowing effect
    if (isInRoomWithTeleport && hasCrystalOrb) {
      setOrbGlowing(true);
      
      // ========== TIMED GLOW DURATION ==========
      // Set a timeout to turn off the glow after the animation finishes
      orbGlowTimeoutRef.current = setTimeout(() => {
        setOrbGlowing(false);
      }, 6000);
    } else {
      setOrbGlowing(false);
    }
    
    // ========== CLEANUP FUNCTION ==========
    return () => {
      if (orbGlowTimeoutRef.current) {
        clearTimeout(orbGlowTimeoutRef.current);
      }
    };
  }, [currentPosition, inventory, specialRooms]);

  // ==================== SAND CREATURE PROTECTION EVENT SYSTEM ====================
  /**
   * Event-driven orb protection animation for sand creature encounters
   * 
   * This effect responds to global 'orb_protection_activated' events to trigger
   * special glowing effects when the crystal orb provides protection against
   * sand creatures. It demonstrates sophisticated cross-component communication
   * through custom events.
   * 
   * Event Integration:
   * - **Global Event Listening**: Responds to window-level custom events
   * - **Event Detail Processing**: Extracts duration and room type from event data
   * - **Protection Visualization**: Provides visual feedback for orb protection
   * - **Timed Effects**: Duration-based glow effects with automatic cleanup
   * 
   * Technical Features:
   * - **Event Listener Management**: Proper registration and cleanup of listeners
   * - **Timeout Coordination**: Integrates with existing timeout management
   * - **Event Detail Validation**: Safe extraction of event payload data
   * - **Memory Management**: Comprehensive cleanup on component unmount
   * 
   * @effects Responds to orb_protection_activated events with visual feedback
   */
  useEffect(() => {
    // ========== EVENT HANDLER DEFINITION ==========
    const handleOrbProtection = (event) => {
      if (event.detail.roomType === 'sand_creature') {
        // ========== TIMEOUT CLEANUP ==========
        // Clear any existing timeout
        if (sandProtectionTimeoutRef.current) {
          clearTimeout(sandProtectionTimeoutRef.current);
        }
        
        // ========== PROTECTION GLOW ACTIVATION ==========
        // Start glowing to indicate protection is active
        setSandProtectionGlowing(true);
        
        // ========== DURATION-BASED CLEANUP ==========
        // Stop glowing after specified duration
        sandProtectionTimeoutRef.current = setTimeout(() => {
          setSandProtectionGlowing(false);
        }, event.detail.duration || 6000);
      }
    };
    
    // ========== EVENT LISTENER REGISTRATION ==========
    window.addEventListener('orb_protection_activated', handleOrbProtection);
    
    // ========== CLEANUP FUNCTION ==========
    return () => {
      window.removeEventListener('orb_protection_activated', handleOrbProtection);
      if (sandProtectionTimeoutRef.current) {
        clearTimeout(sandProtectionTimeoutRef.current);
      }
    };
  }, []);

  // ==================== WYRMGLASS CONTEXTUAL GLOWING SYSTEM ====================
  /**
   * Sophisticated wyrmglass glowing based on multiple environmental triggers
   * 
   * This is the most complex item glowing system, responding to multiple different
   * environmental conditions where the wyrmglass becomes relevant. It demonstrates
   * advanced location detection with both property-based and text-based fallbacks.
   * 
   * Glowing Triggers:
   * - **Exit Room**: Glows when player reaches the game exit
   * - **Sand Creature Rooms**: Indicates wyrmglass relevance for sand encounters
   * - **Water Spirit Rooms**: Shows wyrmglass utility for nixie interactions
   * - **Fallback Detection**: Text-based detection as backup for property-based
   * 
   * Detection Methods:
   * - **Primary**: Uses specialRooms properties and positions data
   * - **Fallback**: Text analysis of room descriptions for additional coverage
   * - **Multi-Condition Logic**: Multiple triggers can activate glowing
   * - **Debug Logging**: Comprehensive logging for development and troubleshooting
   * 
   * Technical Features:
   * - **Multi-Source Detection**: Combines property-based and text-based detection
   * - **Comprehensive Dependencies**: Includes all relevant state in dependency array
   * - **Fallback Systems**: Ensures detection works even with incomplete data
   * - **Debug Integration**: Detailed console logging for each trigger condition
   * 
   * @effects Updates wyrmglassGlowing state based on multiple environmental conditions
   */
  useEffect(() => {
    // ========== WYRMGLASS POSSESSION VALIDATION ==========
    // Check if player has wyrmglass
    const hasWyrmglass = inventory.some(item => 
      (item.originalId || item.id) === 'wyrmglass'
    );
    
    if (!hasWyrmglass) {
      setWyrmglassGlowing(false);
      return;
    }
    
    // ========== MULTI-CONDITION GLOW DETECTION ==========
    // Check special conditions for wyrmglass glow
    let shouldGlow = false;
    
    // === CONDITION 1: EXIT ROOM DETECTION ===
    if (positions && currentPosition === positions.exitPosition) {
      console.log("Wyrmglass glowing: In exit room");
      shouldGlow = true;
    }
    
    // === CONDITION 2: SAND CREATURE ROOM DETECTION ===
    const isInSandRoom = specialRooms[currentPosition]?.hasSandCreature;
    if (isInSandRoom) {
      console.log("Wyrmglass glowing: In sand creature room");
      shouldGlow = true;
    }
    
    // === CONDITION 3: WATER SPRITE (NIXIE) ROOM DETECTION ===
    const isInNixieRoom = specialRooms[currentPosition]?.hasWaterSpirit;
    if (isInNixieRoom) {
      console.log("Wyrmglass glowing: In water sprite room");
      shouldGlow = true;
    }
    
    // ========== FALLBACK TEXT-BASED DETECTION ==========
    // Alternative text-based checks as fallback
    if (!shouldGlow) {
      const roomText = roomDescriptionMap[currentPosition]?.text || "";
      const roomDescLower = roomText.toLowerCase();
      
      // === FALLBACK: SAND ROOM TEXT DETECTION ===
      if (roomDescLower.includes("soft sand") && 
          roomDescLower.includes("invites you to dig")) {
        console.log("Wyrmglass glowing: Sand room detected by text");
        shouldGlow = true;
      }
      
      // === FALLBACK: WATER SPRITE ROOM TEXT DETECTION ===
      if (roomDescLower.includes("tranquil pool") && 
          roomDescLower.includes("mirror")) {
        console.log("Wyrmglass glowing: Water sprite room detected by text");
        shouldGlow = true;
      }
    }
    
    // ========== TIMEOUT CLEANUP ==========
    // Clear any existing timeout
    if (wyrmglassGlowTimeoutRef.current) {
      clearTimeout(wyrmglassGlowTimeoutRef.current);
      wyrmglassGlowTimeoutRef.current = null;
    }
    
    // ========== GLOW STATE MANAGEMENT ==========
    // Set glow state based on detection results
    if (shouldGlow) {
      setWyrmglassGlowing(true);
      
      // ========== TIMED GLOW DURATION ==========
      // Set timeout to turn off glow after animation
      wyrmglassGlowTimeoutRef.current = setTimeout(() => {
        setWyrmglassGlowing(false);
      }, 6000);
    } else {
      setWyrmglassGlowing(false);
    }
    
    // ========== CLEANUP FUNCTION ==========
    return () => {
      if (wyrmglassGlowTimeoutRef.current) {
        clearTimeout(wyrmglassGlowTimeoutRef.current);
      }
    };
  }, [currentPosition, inventory, roomDescriptionMap, specialRooms, positions]);

  // ==================== LANTERN STATUS RENDERING UTILITY ====================
  /**
   * Advanced lantern status display with fuel level visualization
   * 
   * This utility function creates a comprehensive lantern status display that
   * shows both the active/inactive state and the current fuel level with
   * visual progress bar representation.
   * 
   * Status Components:
   * - **Active State Indicator**: Shows "On" or "Off" with appropriate styling
   * - **Fuel Level Bar**: Visual progress bar showing fuel percentage
   * - **Percentage Calculation**: Converts fuel level to percentage for display
   * - **Dynamic Styling**: CSS classes respond to active/inactive states
   * 
   * Technical Features:
   * - **Percentage Calculation**: Math.floor for clean percentage display
   * - **Max Fuel Fallback**: Defaults to 10 if maxFuel not specified
   * - **Dynamic Bar Width**: CSS width property reflects current fuel level
   * - **State-Based Styling**: Different CSS classes for active/inactive states
   * 
   * @param {Object} item - Lantern item object with fuel and state properties
   * @returns {JSX.Element} Rendered lantern status component
   */
  const renderLanternStatus = (item) => {
    const isActive = item.isActive;
    const fuelLevel = item.fuel;
    const maxFuel = item.maxFuel || 10; // Assuming 10 is max fuel
    const fuelPercentage = Math.floor((fuelLevel / maxFuel) * 100);
    
    return (
      <div className="lantern-info">
        <span className={`lantern-status ${isActive ? 'active' : 'inactive'}`}>
          {isActive ? 'On' : 'Off'}
        </span>
        <div className="fuel-bar-container">
          <div 
            className="fuel-bar" 
            style={{width: `${fuelPercentage}%`}}
          ></div>
        </div>
      </div>
    );
  };

  // ==================== TORCH LEVEL CSS CLASS GENERATOR ====================
  /**
   * Dynamic CSS class generator for torch flame level visualization
   * 
   * This utility function maps torch fuel levels to appropriate CSS classes
   * for visual representation of torch status, providing immediate visual
   * feedback about the player's light source condition.
   * 
   * Torch Level Mapping:
   * - **level-good**: Torch level > 50% (healthy flame)
   * - **level-warning**: Torch level 16-50% (warning state)
   * - **level-danger**: Torch level ≤ 15% (critical state)
   * 
   * @returns {string} CSS class name for current torch level
   */
  const getTorchClass = () => {
    if (torchLevel > 50) return 'level-good';
    if (torchLevel > 15) return 'level-warning';
    return 'level-danger';
  };
  
  // ==================== TORCH STATUS MESSAGE GENERATOR ====================
  /**
   * Comprehensive torch status message generator with color coding
   * 
   * This function provides detailed status information about the torch including
   * descriptive text and color coding to communicate the urgency of the torch
   * situation to the player.
   * 
   * Status Levels:
   * - **Bright** (>70%): Normal color, healthy torch
   * - **Burning** (40-70%): Normal color, good condition
   * - **Flickering** (10-40%): Warning color, declining condition
   * - **Dying** (1-10%): Danger color, critical condition
   * - **Out** (0%): Danger color, torch extinguished
   * - **Pitch Black/Lost**: Final countdown states
   * 
   * Technical Features:
   * - **Color Coding**: Returns color property for CSS styling
   * - **Message Text**: Descriptive status for player feedback
   * - **Countdown Integration**: Shows remaining moves when torch is out
   * - **Progressive Urgency**: Status escalates appropriately with fuel level
   * 
   * @returns {Object} Status object with color and message properties
   */
  const getTorchStatus = () => {
    if (torchLevel > 70) return { color: 'normal', message: 'Bright' };
    if (torchLevel > 40) return { color: 'normal', message: 'Burning' };
    if (torchLevel > 10) return { color: 'warning', message: 'Flickering' };
    if (torchLevel > 0) return { color: 'danger', message: 'Dying' };
    
    const remaining = MAX_DARKNESS - darknessCounter;
    if (remaining > 3) return { color: 'danger', message: 'Out' };
    if (remaining > 1) return { color: 'danger', message: 'Pitch Black' };
    return { color: 'danger', message: 'Lost' };
  };
  
  const torchStatus = getTorchStatus();

  // ==================== MAIN COMPONENT RENDER ====================
  /**
   * Primary component render with sophisticated inventory display
   * 
   * This render method creates a comprehensive inventory interface with
   * dynamic item styling, contextual glowing effects, and interactive
   * elements that respond to game state and player location.
   */
  return (
    <div className='container inventory'>
      <h3>Inventory</h3>
      
      {/* ==================== TORCH STATUS DISPLAY ==================== 
       * 
       * Comprehensive torch monitoring system with visual fuel level display
       * and dynamic status messaging based on current torch condition.
       */}
      <div className="torch-container">
        <div className="torch-info">
          <span className="item-icon">🔥</span>
          <span className="item-name">Torch</span>
        </div>
        <div className="torch-level-container">
          <div className="torch-level">
            <div 
              className={`torch-level-fill ${getTorchClass()}`} 
              style={{width: `${torchLevel}%`}}
            ></div>
          </div>
          <div className={`torch-status status-${torchStatus.color}`}>
            {torchStatus.message}
            {torchLevel === 0 && ` (${MAX_DARKNESS - darknessCounter} moves left)`}
          </div>
        </div>
      </div>
      
      {/* ==================== INVENTORY ITEMS DISPLAY ==================== 
       * 
       * Dynamic inventory grid with sophisticated item state management,
       * contextual glowing effects, and interactive use functionality.
       */}
      {inventory.length > 0 ? (
        <div className="inventory-items">
          {inventory.map(item => {
            // ========== ITEM TYPE AND STATE DETECTION ==========
            const itemType = item.originalId || item.id;
            const isKey = itemType === 'rusty_key';
            const isOrb = itemType === 'crystal_orb';
            const isKeyGlowing = isKey && keyGlowing;
            const isOrbGlowing = isOrb && (orbGlowing || sandProtectionGlowing);
            const isWyrmglass = itemType === 'wyrmglass';
            const isWyrmglassGlowing = isWyrmglass && wyrmglassGlowing;
            const isLantern = itemType === 'lantern';
            const isLanternActive = isLantern && item.isActive;
            const isSouvenir = item.isSouvenir || false;
            const isCursed = item.isCursed || false;
            const isDisabled = item.isDisabled || false;
            
            return (
              // ========== DYNAMIC ITEM CONTAINER ==========
              <div
                key={item.id}
                className={`inventory-item ${isKeyGlowing ? 'key-glowing' : ''} ${isOrbGlowing ? 'orb-glowing' : ''} ${isWyrmglassGlowing ? 'wyrmglass-glowing' : ''} ${isLanternActive ? 'lantern-active' : ''} ${isSouvenir ? 'souvenir-item' : ''} ${isCursed ? 'cursed-item' : ''} ${isDisabled ? 'disabled-item' : ''}`}
                data-description={item.description}
              >
                {/* ========== ITEM DETAILS SECTION ========== */}
                <div className="item-details">
                  {/* Dynamic item icon with glow effects */}
                  <span className={`item-icon ${isKeyGlowing ? 'pulse-glow' : ''} ${isOrbGlowing ? 'pulse-orb' : ''} ${isWyrmglassGlowing ? 'pulse-wyrmglass' : ''} ${isLanternActive ? 'lantern-active' : ''}`}>
                    {item.icon}
                  </span>
                  
                  {/* Item name with special styling for coins */}
                  <span className={`item-name ${itemType === 'gold_coins' ? 'coin-name' : ''}`}>
                    {item.name}
                  </span>
                  
                  {/* Conditional lantern status display */}
                  {itemType === 'lantern' && renderLanternStatus(item)}
                </div>
                
                {/* ==================== ITEM USE BUTTON ==================== 
                 * 
                 * Interactive use button with sophisticated visual effects and
                 * special animation handling for different item types.
                 */}
                {item.canUse && gameStatus === 'playing' && (
                  <button 
                    className={`use-item-btn ${isKeyGlowing ? 'use-key-btn-glow' : ''} ${isOrbGlowing ? 'use-orb-btn-glow' : ''} ${isWyrmglassGlowing ? 'use-wyrmglass-btn-glow' : ''} ${isLanternActive ? 'use-lantern-btn-active' : ''}`}
                    onClick={(event) => {
                      // ========== SPECIAL ORB TELEPORTATION ANIMATION ==========
                      // Add teleporting sparkle to orb ICON (not button)
                      if (itemType === 'crystal_orb' && (specialRooms[currentPosition]?.hasTeleport || currentPosition === 32)) {
                        // Find the orb icon within this inventory item
                        const itemContainer = event.currentTarget.closest('.inventory-item');
                        const orbIcon = itemContainer?.querySelector('.item-icon');
                        
                        if (orbIcon) {
                          // ========== SPARKLE EFFECT CREATION ==========
                          // Add sparkle effect to the icon
                          orbIcon.classList.add('orb-teleporting');
                          
                          // Create sparkle wrapper for extra effects
                          const sparkleWrapper = document.createElement('div');
                          sparkleWrapper.className = 'orb-sparkle-wrapper';
                          orbIcon.appendChild(sparkleWrapper);
                          
                          // Create magic ring effect
                          const magicRing = document.createElement('div');
                          magicRing.className = 'magic-ring';
                          orbIcon.appendChild(magicRing);
                          
                          // ========== ANIMATION CLEANUP ==========
                          // Remove effects after animation completes
                          setTimeout(() => {
                            orbIcon.classList.remove('orb-teleporting');
                            sparkleWrapper.remove();
                            magicRing.remove();
                          }, 1500);
                        }
                      }
                      
                      // ========== ITEM USE EXECUTION ==========
                      handleUseItem(item.id);
                    }}
                    title={item.description}
                  >
                    Use
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // ========== EMPTY INVENTORY DISPLAY ==========
        <p className="empty-inventory">No items</p>
      )}
    </div>
  );
};

export default InventoryPanel;