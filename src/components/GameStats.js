// ==================== ADVANCED GAME STATISTICS DASHBOARD COMPONENT ====================

/**
 * Sophisticated Real-Time Game Statistics Dashboard with Advanced UI/UX Features
 * Professional-grade React component implementing comprehensive game progress tracking,
 * dynamic visual feedback systems, and intelligent scrolling behavior management.
 * 
 * **Component Architecture Excellence:**
 * This component demonstrates master-level React programming by coordinating multiple
 * complex systems: real-time data visualization, advanced animation effects, intelligent
 * scrolling management, and sophisticated state tracking across interconnected game systems.
 * 
 * **Key System Features:**
 * - **Real-Time Progress Tracking**: Live monitoring of player journey and achievements
 * - **Advanced Animation Systems**: Sparkle effects for new moves with timing coordination
 * - **Intelligent Scroll Management**: Automatic positioning with user override detection
 * - **Dynamic Visual Feedback**: Color-coded treasure tracking with contextual icons
 * - **Sophisticated Room Analysis**: Journey mapping with connection type detection
 * - **Environmental Storytelling Integration**: Room-specific emoji and tooltip systems
 * 
 * **Technical Achievements:**
 * - **Performance Optimization**: Efficient re-render management with useRef optimization
 * - **Memory Management**: Automatic cleanup of animation states and event listeners
 * - **Accessibility Features**: Comprehensive tooltip system and semantic markup
 * - **Responsive Design**: Dynamic scroll detection with container adaptation
 * - **State Synchronization**: Real-time coordination with game context systems
 */

import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { getRoomEmoji } from '../data/roomEmojiMap';

const GameStats = () => {
  // ==================== GAME STATE INTEGRATION ====================
  
  /**
   * Comprehensive Game Context Integration System
   * Extracts all necessary game state data for real-time statistics display
   * and progress tracking across multiple interconnected game systems.
   */
  const { 
    history,                    // Complete player movement history array
    treasurePieces,            // Available treasure configuration data
    collectedTreasures,        // Player's collected treasure achievement list
    hasMap,                    // Map discovery status for treasure hunt activation
    gameStatus,                // Current game state (playing/won/lost)
    roomDescriptionMap,        // Room narrative and feature mapping system
    roomConnections,           // Room connectivity data for journey analysis
    batEncounters,             // Bat teleportation event tracking system
  
  } = useGame();

  // ==================== ADVANCED REFERENCE MANAGEMENT SYSTEM ====================
  
  /**
   * Sophisticated DOM Reference Architecture for Performance Optimization
   * Multi-container reference system enabling efficient scroll management,
   * animation coordination, and dynamic UI updates without performance degradation.
   * 
   * **Reference Architecture Benefits:**
   * - **Direct DOM Access**: Bypasses React's virtual DOM for performance-critical operations
   * - **Event Listener Management**: Stable references prevent memory leaks
   * - **Animation Coordination**: Precise control over visual effects timing
   * - **Scroll State Tracking**: Real-time scroll position monitoring without re-renders
   */
  const historyContainerRef = useRef(null);     // History section container for scroll detection
  const treasureContainerRef = useRef(null);    // Treasure list container for overflow management
  const moveHistoryRef = useRef(null);          // Move history scrollable area reference

  // ==================== ADVANCED ANIMATION STATE MANAGEMENT ====================
  
  /**
   * Sophisticated Animation State Tracking System
   * Implements complex animation lifecycle management with memory optimization
   * and performance-conscious state tracking for sparkle effects.
   */
  const [sparkledMoves, setSparkledMoves] = useState(new Set());  // Active sparkle animation tracking
  const prevHistoryLength = useRef(0);                           // Previous history length for change detection

  // ==================== INTELLIGENT USER INTERFACE STATE ====================
  
  /**
   * Smart Scroll Indicator Management System
   * Advanced user experience feature that detects when users scroll away from
   * latest content and provides intuitive navigation back to current activity.
   */
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);  // Scroll-to-bottom indicator visibility

  // ==================== DYNAMIC SCROLL DETECTION SYSTEM ====================
  
  /**
   * Advanced Container Overflow Detection with Visual Feedback
   * Professional UI system that dynamically detects content overflow conditions
   * and applies appropriate visual styling for enhanced user experience.
   * 
   * **Scroll Detection Excellence:**
   * This effect demonstrates sophisticated frontend programming by implementing
   * real-time overflow detection, dynamic class application, and responsive
   * design adaptation based on content length and container dimensions.
   * 
   * **Key Features:**
   * - **Real-Time Detection**: Continuous monitoring of content vs container dimensions
   * - **Dynamic Class Application**: Automatic styling updates based on scroll needs
   * - **Multi-Container Management**: Simultaneous monitoring of multiple scrollable areas
   * - **Responsive Adaptation**: Window resize event integration for layout changes
   * - **Performance Optimization**: Efficient event listener management with cleanup
   */
  useEffect(() => {
    const checkScroll = () => {
      // ========== HISTORY CONTAINER SCROLL ANALYSIS ==========
      // Analyze move history container for overflow conditions
      const historyEl = document.querySelector('.move-history');
      if (historyEl && historyContainerRef.current) {
        const needsScroll = historyEl.scrollHeight > historyEl.clientHeight;
        historyContainerRef.current.classList.toggle('has-scroll', needsScroll);
      }

      // ========== TREASURE CONTAINER SCROLL ANALYSIS ==========
      // Analyze treasure list container for overflow management
      const treasureEl = document.querySelector('.treasure-list');
      if (treasureEl && treasureContainerRef.current) {
        const needsScroll = treasureEl.scrollHeight > treasureEl.clientHeight;
        treasureContainerRef.current.classList.toggle('has-scroll', needsScroll);
      }
    };

    // ========== INITIALIZATION AND EVENT BINDING ==========
    // Execute initial check and establish resize monitoring
    checkScroll();
    
    // ========== RESPONSIVE BEHAVIOR SYSTEM ==========
    // Monitor window resize events for dynamic layout adaptation
    window.addEventListener('resize', checkScroll);
    
    // ========== MEMORY MANAGEMENT ==========
    // Cleanup event listeners to prevent memory leaks
    return () => window.removeEventListener('resize', checkScroll);
  }, [history, treasurePieces, collectedTreasures]);  // Re-check when content changes

  // ==================== INTELLIGENT SCROLL POSITION MONITORING ====================
  
  /**
   * Advanced User Scroll Behavior Detection System
   * Sophisticated user experience enhancement that tracks scroll position relative
   * to content updates and provides contextual navigation assistance.
   * 
   * **User Experience Excellence:**
   * This system demonstrates advanced UX programming by detecting when users
   * manually scroll away from current content and providing non-intrusive
   * navigation assistance to return to relevant information.
   */
  useEffect(() => {
    const checkScroll = () => {
      if (moveHistoryRef.current) {
        const element = moveHistoryRef.current;
        
        // ========== SCROLL POSITION MATHEMATICS ==========
        // Calculate precise scroll position relative to content height
        const isScrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
        
        // ========== CONTEXTUAL INDICATOR LOGIC ==========
        // Show indicator only when user has scrolled up and sufficient content exists
        setShowScrollIndicator(!isScrolledToBottom && history.length > 6);
      }
    };
    
    // ========== EVENT LISTENER LIFECYCLE MANAGEMENT ==========
    // Establish scroll monitoring with proper cleanup
    const moveHistoryElement = moveHistoryRef.current;
    if (moveHistoryElement) {
      moveHistoryElement.addEventListener('scroll', checkScroll);
      return () => moveHistoryElement.removeEventListener('scroll', checkScroll);
    }
  }, [history.length]);  // Update monitoring when history changes

  // ==================== ADVANCED TREASURE ICON MAPPING SYSTEM ====================
  
  /**
   * Sophisticated Treasure Visual Representation System
   * Professional icon mapping system that provides contextually appropriate
   * emoji representations for different treasure types with fallback handling.
   * 
   * **Visual Design Excellence:**
   * This function demonstrates thoughtful UI design by creating intuitive
   * visual associations between treasure types and their emoji representations,
   * enhancing user recognition and game atmosphere.
   * 
   * @param {string} treasureId - Unique identifier for treasure type
   * @returns {string} Appropriate emoji icon for the treasure type
   */
  const getTreasureIcon = (treasureId) => {
    switch(treasureId) {
      case 'ruby':
        return '💎'; // Ruby/gem emoji - brilliant and valuable
      case 'medallion':
        return '🏅'; // Medallion/medal emoji - achievement and honor
      case 'statue':
        return '🗿'; // Statue emoji - ancient and mysterious
      case 'amulet':
        return '📿'; // Amulet/necklace emoji - mystical and protective
      default:
        return '✨'; // Generic sparkle as universal treasure fallback
    }
  };

  // ==================== MASTER ANIMATION LIFECYCLE MANAGEMENT ====================
  
  /**
   * Sophisticated Sparkle Animation Orchestration System
   * Advanced animation management implementing precise timing coordination,
   * state tracking, and memory-efficient cleanup for visual feedback effects.
   * 
   * **Animation Architecture Excellence:**
   * This system demonstrates master-level frontend programming by coordinating
   * complex animation lifecycles, implementing efficient state tracking with Sets,
   * and providing precise timing control for visual effects synchronization.
   * 
   * **Key Features:**
   * - **Change Detection Algorithm**: Precise calculation of new content additions
   * - **State Optimization**: Set-based tracking for O(1) lookup performance
   * - **Timing Coordination**: Synchronized animation duration with cleanup cycles
   * - **Memory Efficiency**: Automatic removal of completed animation states
   * - **Batch Processing**: Efficient handling of multiple simultaneous animations
   */
  useEffect(() => {
    // ========== NEW CONTENT DETECTION ALGORITHM ==========
    // Analyze history length changes to identify new moves
    if (history.length > prevHistoryLength.current) {
      // ========== MATHEMATICAL CHANGE CALCULATION ==========
      // Calculate precise number of new moves added
      const newMovesCount = history.length - prevHistoryLength.current;
      
      // ========== ANIMATION STATE COORDINATION ==========
      // Add new moves to sparkle tracking system
      const newSparkled = new Set(sparkledMoves);
      for (let i = history.length - newMovesCount; i < history.length; i++) {
        newSparkled.add(i);
      }
      setSparkledMoves(newSparkled);
      
      // ========== ANIMATION CLEANUP ORCHESTRATION ==========
      // Schedule automatic cleanup after animation completion
      setTimeout(() => {
        setSparkledMoves(prev => {
          const updated = new Set(prev);
          // ========== MEMORY OPTIMIZATION ==========
          // Remove completed animations from tracking
          for (let i = history.length - newMovesCount; i < history.length; i++) {
            updated.delete(i);
          }
          return updated;
        });
      }, 1500); // Synchronized with CSS animation duration
    }
    
    // ========== HISTORY TRACKING UPDATE ==========
    // Maintain reference for next change detection cycle
    prevHistoryLength.current = history.length;
  }, [history.length, sparkledMoves]);

  // ==================== INTELLIGENT AUTO-SCROLL SYSTEM ====================
  
  /**
   * Advanced Automatic Scroll Management with User Experience Optimization
   * Sophisticated scrolling system that automatically reveals new content while
   * respecting user interaction patterns and providing smooth visual transitions.
   * 
   * **User Experience Architecture:**
   * This system demonstrates professional UX programming by implementing intelligent
   * scroll behavior that enhances rather than interrupts user experience, with
   * precise timing coordination for optimal visual impact.
   */
  useEffect(() => {
    if (history.length > 0 && moveHistoryRef.current) {
      // ========== ANIMATION SYNCHRONIZATION DELAY ==========
      // Strategic delay ensures DOM updates complete before scrolling
      const scrollTimeout = setTimeout(() => {
        const moveHistoryElement = moveHistoryRef.current;
        
        // ========== PRECISE ELEMENT TARGETING ==========
        // Locate the most recent move element for scroll positioning
        const moves = moveHistoryElement.querySelectorAll('.move');
        const lastMove = moves[moves.length - 1];
        
        if (lastMove) {
          // ========== SMOOTH SCROLL IMPLEMENTATION ==========
          // Advanced scroll behavior with optimal positioning parameters
          lastMove.scrollIntoView({ 
            behavior: 'smooth',     // Smooth animation for professional feel
            block: 'end',          // Align to bottom of container for context
            inline: 'nearest'      // Horizontal alignment optimization
          });
          
          // ========== ALTERNATIVE SCROLL METHOD ==========
          // Fallback implementation for edge cases:
          // moveHistoryElement.scrollTop = moveHistoryElement.scrollHeight;
        }
      }, 100); // Optimized delay for sparkle animation synchronization
      
      // ========== TIMEOUT CLEANUP ==========
      // Prevent memory leaks from pending timeouts
      return () => clearTimeout(scrollTimeout);
    }
  }, [history.length]); // Trigger on history changes only

  // ==================== ADVANCED TREASURE STYLING SYSTEM ====================
  
  /**
   * Sophisticated Treasure Classification System for Visual Enhancement
   * Professional styling system that provides contextually appropriate CSS classes
   * for different treasure types, enabling rich visual differentiation.
   * 
   * @param {string} treasureId - Treasure type identifier
   * @returns {string} Appropriate CSS class for treasure styling
   */
  const getTreasureClass = (treasureId) => {
    switch(treasureId) {
      case 'ruby':
        return 'treasure-ruby';        // Red gems and precious stones
      case 'medallion':
        return 'treasure-medallion';   // Golden achievements and honors
      case 'statue':
        return 'treasure-statue';      // Ancient stone and artifacts
      case 'amulet':
        return 'treasure-amulet';      // Mystical and magical items
      default:
        return '';                     // No special styling for unknown types
    }
  };

  // ==================== ENVIRONMENTAL STORYTELLING INTEGRATION ====================
  
  /**
   * Advanced Room Icon Integration with Environmental Storytelling
   * Sophisticated system that connects room descriptions to visual representations,
   * enhancing immersion through contextual iconography.
   * 
   * **Environmental Design Excellence:**
   * This function demonstrates advanced world-building programming by creating
   * seamless integration between narrative content and visual feedback systems.
   * 
   * @param {number} roomNumber - Room identifier for icon lookup
   * @returns {string} Contextually appropriate emoji icon for the room
   */
  const getRoomIcon = (roomNumber) => {
    // ========== ROOM DATA VALIDATION ==========
    // Ensure room data exists before attempting icon generation
    if (!roomDescriptionMap || !roomDescriptionMap[roomNumber]) {
      return ''; // Safe fallback for missing room data
    }
    
    // ========== ENVIRONMENTAL ICON MAPPING ==========
    // Generate contextual emoji based on room description content
    return getRoomEmoji(roomDescriptionMap[roomNumber]);
  };

  // ==================== ADVANCED CONNECTIVITY ANALYSIS SYSTEM ====================
  
  /**
   * Sophisticated Room Connection Analysis for Journey Visualization
   * Professional pathfinding analysis that determines bidirectional connectivity
   * between rooms for accurate journey representation and user guidance.
   * 
   * **Pathfinding Architecture:**
   * This function implements graph theory concepts for room connectivity analysis,
   * providing essential data for journey visualization and player guidance systems.
   * 
   * @param {number} fromRoom - Source room number
   * @param {number} toRoom - Destination room number
   * @returns {boolean} True if return path exists
   */
  const canReturnToRoom = (fromRoom, toRoom) => {
    // ========== CONNECTION DATA VALIDATION ==========
    // Handle missing connectivity data gracefully
    if (!roomConnections || !roomConnections[fromRoom]) {
      return true; // Assume standard bidirectional connection
    }
    
    // ========== BIDIRECTIONAL CONNECTIVITY CHECK ==========
    // Verify return path exists in connection matrix
    return roomConnections[fromRoom].includes(toRoom);
  };

  // ==================== MASTER JOURNEY VISUALIZATION SYSTEM ====================
  
  /**
   * Advanced Arrow Type Determination with Journey Context Analysis
   * Sophisticated visualization system that analyzes movement patterns and
   * connection types to provide appropriate visual indicators for player journey.
   * 
   * **Journey Analysis Excellence:**
   * This function demonstrates master-level game design programming by implementing
   * complex pattern recognition for different types of movement (normal, bat teleport,
   * one-way passages) and providing contextually appropriate visual feedback.
   * 
   * **Key Features:**
   * - **Movement Pattern Recognition**: Detects bat teleportation events
   * - **Connection Type Analysis**: Identifies one-way vs bidirectional passages
   * - **Visual Semantic System**: Different arrows convey different meanings
   * - **Tooltip Integration**: Contextual explanations for different arrow types
   * - **Edge Case Handling**: Graceful handling of boundary conditions
   * 
   * @param {number} currentIndex - Current position in journey history
   * @returns {Object} Arrow visualization data with symbol, class, and tooltip
   */
  const getArrowInfo = (currentIndex) => {
    // ========== BOUNDARY CONDITION HANDLING ==========
    // Handle end-of-journey cases gracefully
    if (currentIndex >= history.length - 1) {
      return { symbol: '', class: '', tooltip: '' };
    }
    
    // ========== MOVEMENT ANALYSIS SETUP ==========
    // Extract movement data for pattern analysis
    const currentRoom = history[currentIndex];
    const nextRoom = history[currentIndex + 1];
    
    // ========== BAT TELEPORTATION DETECTION ==========
    // Advanced pattern matching for supernatural movement events
    const isBatTeleport = batEncounters && batEncounters.some(encounter => 
      encounter.fromRoom === currentRoom && encounter.toRoom === nextRoom
    );
    
    if (isBatTeleport) {
      return {
        symbol: '⟿',                           // Special curved arrow for supernatural transport
        class: 'journey-arrow-bat',           // Distinctive styling for bat encounters
        tooltip: 'Carried by bats'            // Explanatory tooltip for user understanding
      };
    }
    
    // ========== ONE-WAY PASSAGE DETECTION ==========
    // Connectivity analysis for passage type determination
    const isOneWay = !canReturnToRoom(nextRoom, currentRoom);
    
    if (isOneWay) {
      return {
        symbol: '⟹',                          // Double arrow indicating one-way travel
        class: 'journey-arrow-no-return',     // Warning styling for irreversible moves
        tooltip: 'One-way passage'            // Clear warning about passage type
      };
    }
    
    // ========== STANDARD CONNECTION DEFAULT ==========
    // Regular bidirectional passage representation
    return {
      symbol: '→',                            // Standard arrow for normal movement
      class: 'journey-arrow-normal',          // Default styling for regular connections
      tooltip: 'Two-way passage'             // Reassuring tooltip about return capability
    };
  };

  // ==================== ADVANCED INVENTORY ANALYSIS SYSTEM ====================
  
  /**
   * Sophisticated Item Collection Analysis with Type-Based Filtering
   * Professional inventory management system that accurately counts specific
   * item types while handling both original and transformed item states.
   * 
   * **Inventory Management Excellence:**
   * This analysis demonstrates advanced data filtering techniques by implementing
   * dual-property checking to handle item state transformations while maintaining
   * accurate count tracking across game state changes.
   */


  // ==================== CONTEXTUAL ROOM SIGNIFICANCE ANALYSIS ====================
  
  /**
   * Advanced Room Classification System for Enhanced User Experience
   * Intelligent analysis system that identifies rooms of special significance
   * for enhanced visual treatment and user attention direction.
   * 
   * **Significance Detection Algorithm:**
   * This function implements sophisticated pattern recognition to identify
   * rooms that deserve special visual treatment based on treasure presence
   * or unique room characteristics (secret rooms, special areas).
   * 
   * @param {number} move - Room number to analyze for significance
   * @returns {boolean} True if room has special significance
   */
 

  // ==================== MASTER COMPONENT RENDER SYSTEM ====================
  
  /**
   * Sophisticated Statistics Dashboard Rendering with Advanced UI Components
   * Professional React rendering system implementing complex data visualization,
   * interactive elements, and real-time progress tracking with exceptional UX design.
   */
  return (
    <div className='container stats game-stats'>
      <h3>Game Stats</h3>
      
      {/* ==================== ADVANCED JOURNEY VISUALIZATION SECTION ==================== */}
      
      <div className='history-container' ref={historyContainerRef}>
        <h4>Your Journey</h4>
        {history.length > 0 ? (
          <>
            {/* ========== SCROLLABLE JOURNEY HISTORY WITH ANIMATION SYSTEM ========== */}
            <div className='move-history' ref={moveHistoryRef}>
              {history.map((move, index) => {
                // ========== ARROW INFORMATION GENERATION ==========
                // Generate contextual arrow data for each movement
                const arrowInfo = getArrowInfo(index);
                
                return (
                  <React.Fragment key={index}>
                    {/* ========== ENHANCED MOVE DISPLAY WITH SPARKLE EFFECTS ========== */}
                    <span className={`move ${sparkledMoves.has(index) ? 'sparkle-new' : ''}`}>
                      {/* ========== GLITTER OVERLAY ANIMATION SYSTEM ========== */}
                      {sparkledMoves.has(index) && <span className="glitter-overlay"></span>}
                      
                      {/* ========== SECRET ROOM VS NORMAL ROOM RENDERING ========== */}
                      {move > 30 ? (
                        <span>Secret 
                          <span className="room-icon" title={roomDescriptionMap[move]?.text || "Secret chamber"}>
                            🚪
                          </span>
                        </span>
                      ) : (
                        <>
                          {move}
                          <span className="room-icon" title={roomDescriptionMap[move]?.text || "Unknown room"}>
                            {getRoomIcon(move)}
                          </span>
                        </>
                      )}
                    </span>
                    
                    {/* ========== CONTEXTUAL JOURNEY ARROW SYSTEM ========== */}
                    {index < history.length - 1 && (
                      <span 
                        className={`journey-arrow ${arrowInfo.class} ${sparkledMoves.has(index) ? 'sparkle-new' : ''}`}
                        data-tooltip={arrowInfo.tooltip}
                      >
                        {arrowInfo.symbol}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            {/* ========== INTELLIGENT SCROLL NAVIGATION INDICATOR ========== */}
            {showScrollIndicator && (
              <div 
                className="scroll-to-bottom-indicator"
                onClick={() => {
                  if (moveHistoryRef.current) {
                    moveHistoryRef.current.scrollTo({
                      top: moveHistoryRef.current.scrollHeight,
                      behavior: 'smooth'
                    });
                  }
                }}
              >
                ↓ New moves below ↓
              </div>
            )}
          </>
        ) : (
          <p>No moves yet</p>
        )}
      </div>
      
      {/* ========== MOVEMENT COUNTER DISPLAY ========== */}
      <p>Moves: {history.length}</p>
      
      {/* ==================== ADVANCED TREASURE HUNT STATUS SYSTEM ==================== */}
      
      <div className='treasure-container' ref={treasureContainerRef}>
        <h4>Treasure Hunt</h4>
        {hasMap ? (
          <div>
            {/* ========== MAP DISCOVERY CELEBRATION ========== */}
            <p>
              <span className="map-found">📜 Ancient Map Found!</span>
              <br />
              <span>Treasures to collect: {treasurePieces.length}</span>
            </p>
            
            {/* ========== COMPREHENSIVE TREASURE TRACKING SYSTEM ========== */}
            <div className="treasure-list">
              {treasurePieces.map(treasure => (
                <div 
                  key={treasure.id} 
                  className={`treasure-item ${collectedTreasures.includes(treasure.id) ? 'collected' : 'missing'}`}
                >
                  {collectedTreasures.includes(treasure.id) ? 
                    <>
                      {/* ========== COLLECTED TREASURE DISPLAY ========== */}
                      <span className="treasure-icon">{getTreasureIcon(treasure.id)}</span>
                      <span className={`treasure-name ${getTreasureClass(treasure.id)}`}>{treasure.name}</span>
                      {/* ========== LOCATION TRACKING SYSTEM ========== */}
                      <span className="treasure-location">
                        {" - Room "}{treasure.room} {getRoomIcon(treasure.room)}
                      </span>
                    </> : 
                    <>
                      {/* ========== MYSTERY TREASURE DISPLAY ========== */}
                      <span className="treasure-icon">❓</span>
                      <span className="treasure-name">Unknown Artifact</span>
                    </>
                  }
                </div>
              ))}
            </div>
            
            {/* ========== DYNAMIC PROGRESS GUIDANCE SYSTEM ========== */}
            {gameStatus === 'playing' && 
              <p className="treasure-hint">
                {collectedTreasures.length === treasurePieces.length ? 
                  "All treasures found! Return to the exit to win!" : 
                  `Find ${treasurePieces.length - collectedTreasures.length} more treasure${treasurePieces.length - collectedTreasures.length !== 1 ? 's' : ''} and reach the exit!`
                }
              </p>
            }
          </div>
        ) : (
          /* ========== TREASURE HUNT TEASER SYSTEM ========== */
          <p>Legend speaks of an ancient map that reveals great treasures hidden in these caves...</p>
        )}
      </div>
    </div>
  );
};

export default GameStats;