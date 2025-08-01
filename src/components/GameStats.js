import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { getRoomEmoji } from '../data/roomEmojiMap';



const GameStats = () => {
  const { 
    history, 
    treasurePieces, 
    collectedTreasures, 
    hasMap,
    gameStatus,
    roomDescriptionMap,
    roomConnections,
    batEncounters,
    inventory
  } = useGame();

  // Add refs for the containers
  const historyContainerRef = useRef(null);
  const treasureContainerRef = useRef(null);

  const moveHistoryRef = useRef(null);

  // Track which moves have been sparkled
  const [sparkledMoves, setSparkledMoves] = useState(new Set());
  const prevHistoryLength = useRef(0);


  // 4. Optional: Add a "scroll to bottom" indicator when user scrolls up
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);


  // Check if content needs scrolling
  useEffect(() => {
    const checkScroll = () => {
      // Check history container
      const historyEl = document.querySelector('.move-history');
      if (historyEl && historyContainerRef.current) {
        const needsScroll = historyEl.scrollHeight > historyEl.clientHeight;
        historyContainerRef.current.classList.toggle('has-scroll', needsScroll);
      }

      // Check treasure list
      const treasureEl = document.querySelector('.treasure-list');
      if (treasureEl && treasureContainerRef.current) {
        const needsScroll = treasureEl.scrollHeight > treasureEl.clientHeight;
        treasureContainerRef.current.classList.toggle('has-scroll', needsScroll);
      }
    };

    // Check on mount and when content changes
    checkScroll();
    
    // Add resize listener
    window.addEventListener('resize', checkScroll);
    
    return () => window.removeEventListener('resize', checkScroll);
  }, [history, treasurePieces, collectedTreasures]);

// Check if user has scrolled up
useEffect(() => {
  const checkScroll = () => {
    if (moveHistoryRef.current) {
      const element = moveHistoryRef.current;
      const isScrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
      setShowScrollIndicator(!isScrolledToBottom && history.length > 6); // Show if not at bottom and has many moves
    }
  };
  
  const moveHistoryElement = moveHistoryRef.current;
  if (moveHistoryElement) {
    moveHistoryElement.addEventListener('scroll', checkScroll);
    return () => moveHistoryElement.removeEventListener('scroll', checkScroll);
  }
}, [history.length]);



  // Function to get the appropriate icon for each treasure type
  const getTreasureIcon = (treasureId) => {
    switch(treasureId) {
      case 'ruby':
        return '💎'; // Ruby/gem emoji
      case 'medallion':
        return '🏅'; // Medallion/medal emoji
      case 'statue':
        return '🗿'; // Statue emoji
      case 'amulet':
        return '📿'; // Amulet/necklace emoji
      default:
        return '✨'; // Generic sparkle as fallback
    }
  };

// Sparkle effect for new moves
  useEffect(() => {
    // Check if new moves were added
    if (history.length > prevHistoryLength.current) {
      // Calculate how many new moves were added
      const newMovesCount = history.length - prevHistoryLength.current;
      
      // Add the new moves to sparkled set
      const newSparkled = new Set(sparkledMoves);
      for (let i = history.length - newMovesCount; i < history.length; i++) {
        newSparkled.add(i);
      }
      setSparkledMoves(newSparkled);
      
      // Remove sparkle class after animation completes
      setTimeout(() => {
        setSparkledMoves(prev => {
          const updated = new Set(prev);
          for (let i = history.length - newMovesCount; i < history.length; i++) {
            updated.delete(i);
          }
          return updated;
        });
      }, 1500); // Match animation duration
    }
    
    prevHistoryLength.current = history.length;
  }, [history.length, sparkledMoves]);


// Auto-scroll to show new moves
useEffect(() => {
  if (history.length > 0 && moveHistoryRef.current) {
    // Small delay to ensure DOM is updated and sparkle animation starts
    const scrollTimeout = setTimeout(() => {
      const moveHistoryElement = moveHistoryRef.current;
      
      // Find the last move element
      const moves = moveHistoryElement.querySelectorAll('.move');
      const lastMove = moves[moves.length - 1];
      
      if (lastMove) {
        // Scroll the last move into view with smooth animation
        lastMove.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end',    // Align to bottom of container
          inline: 'nearest' 
        });
        
        // Alternative method if scrollIntoView doesn't work well:
        // moveHistoryElement.scrollTop = moveHistoryElement.scrollHeight;
      }
    }, 100); // Small delay to let sparkle animation begin
    
    return () => clearTimeout(scrollTimeout);
  }
}, [history.length]); // Trigger when history length changes


  // Function to get treasure class for coloring
  const getTreasureClass = (treasureId) => {
    switch(treasureId) {
      case 'ruby':
        return 'treasure-ruby';
      case 'medallion':
        return 'treasure-medallion';
      case 'statue':
        return 'treasure-statue';
      case 'amulet':
        return 'treasure-amulet';
      default:
        return '';
    }
  };

  // Function to get room emoji for a room number
  const getRoomIcon = (roomNumber) => {
    if (!roomDescriptionMap || !roomDescriptionMap[roomNumber]) {
      return ''; // No icon if no room info
    }
    
    return getRoomEmoji(roomDescriptionMap[roomNumber]);
  };

  // Function to check if there's a return path between rooms
  const canReturnToRoom = (fromRoom, toRoom) => {
    // If roomConnections data is not available, assume regular connection
    if (!roomConnections || !roomConnections[fromRoom]) {
      return true;
    }
    
    // Check if there's a connection back
    return roomConnections[fromRoom].includes(toRoom);
  };

  // Function to determine arrow type and tooltip between two rooms
  const getArrowInfo = (currentIndex) => {
    // If this is the last room or there's only one room, no arrow needed
    if (currentIndex >= history.length - 1) {
      return { symbol: '', class: '', tooltip: '' };
    }
    
    const currentRoom = history[currentIndex];
    const nextRoom = history[currentIndex + 1];
    
    // Check if this was a bat teleport
    const isBatTeleport = batEncounters && batEncounters.some(encounter => 
      encounter.fromRoom === currentRoom && encounter.toRoom === nextRoom
    );
    
    if (isBatTeleport) {
      return {
        symbol: '⟿', // Special arrow for bat teleport
        class: 'journey-arrow-bat',
        tooltip: 'Carried by bats'
      };
    }
    
    // Check if it's a one-way passage
    const isOneWay = !canReturnToRoom(nextRoom, currentRoom);
    
    if (isOneWay) {
      return {
        symbol: '⟹', // One-way arrow
        class: 'journey-arrow-no-return',
        tooltip: 'One-way passage'
      };
    }
    
    // Regular two-way connection
    return {
      symbol: '→',
      class: 'journey-arrow-normal',
      tooltip: 'Two-way passage'
    };
  };

  // Count how many gold coins the player has collected
  const goldCoinsCount = inventory.filter(item => 
    item.id === 'gold_coins' || item.originalId === 'gold_coins'
  ).length;

 const isSpecialMove = (move) => {
    // Check if this room has a treasure or is otherwise special
    const treasureRooms = treasurePieces.map(t => t.room);
    return treasureRooms.includes(move) || move > 30; // Secret rooms are special too
  };


  return (
    <div className='container stats game-stats'>
      <h3>Game Stats</h3>
      
   
      
      <div className='history-container' ref={historyContainerRef}>
  <h4>Your Journey</h4>
  {history.length > 0 ? (
    <>
      <div className='move-history' ref={moveHistoryRef}>
        {history.map((move, index) => {
          const arrowInfo = getArrowInfo(index);
          
          return (
            <React.Fragment key={index}>
              <span className={`move ${sparkledMoves.has(index) ? 'sparkle-new' : ''}`}>
                {sparkledMoves.has(index) && <span className="glitter-overlay"></span>}
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
      {/* ADD THE SCROLL INDICATOR HERE */}
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
      <p>Moves: {history.length}</p>
      
      {/* Treasure hunt status */}
      <div className='treasure-container' ref={treasureContainerRef}>
        <h4>Treasure Hunt</h4>
        {hasMap ? (
          <div>
            <p>
              <span className="map-found">📜 Ancient Map Found!</span>
              <br />
              <span>Treasures to collect: {treasurePieces.length}</span>
            </p>
            <div className="treasure-list">
              {treasurePieces.map(treasure => (
                <div 
                  key={treasure.id} 
                  className={`treasure-item ${collectedTreasures.includes(treasure.id) ? 'collected' : 'missing'}`}
                >
                  {collectedTreasures.includes(treasure.id) ? 
                    <>
                      <span className="treasure-icon">{getTreasureIcon(treasure.id)}</span>
                      <span className={`treasure-name ${getTreasureClass(treasure.id)}`}>{treasure.name}</span>
                      {/* Show room where treasure was found */}
                      <span className="treasure-location">
                        {" - Room "}{treasure.room} {getRoomIcon(treasure.room)}
                      </span>
                    </> : 
                    <>
                      <span className="treasure-icon">❓</span>
                      <span className="treasure-name">Unknown Artifact</span>
                    </>
                  }
                </div>
              ))}
            </div>
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
          <p>Legend speaks of an ancient map that reveals great treasures hidden in these caves...</p>
        )}
      </div>
    </div>
  );
};

export default GameStats;