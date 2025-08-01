import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import '../styles/InventoryStyles.css';

const InventoryPanel = () => {
  const { 
    inventory, 
    torchLevel,  // Changed from canteenLevel
    darknessCounter,  // Changed from thirstCounter
    MAX_DARKNESS,  // Changed from MAX_THIRST
    handleUseItem,
    gameStatus,
    currentPosition,
    roomDescriptionMap,
    specialRooms,
    positions
  } = useGame();

  // Key glowing state and timeout
  const [keyGlowing, setKeyGlowing] = useState(false);
  const glowTimeoutRef = useRef(null);

  // Orb glowing state and timeout
  const [orbGlowing, setOrbGlowing] = useState(false);
  const orbGlowTimeoutRef = useRef(null);

   // Wyrmglass glowing state and timeout
  const [wyrmglassGlowing, setWyrmglassGlowing] = useState(false);
  const wyrmglassGlowTimeoutRef = useRef(null);

  // Add state for sand creature protection glow
  const [sandProtectionGlowing, setSandProtectionGlowing] = useState(false);
  const sandProtectionTimeoutRef = useRef(null);
  
  // Check if the key should glow
  useEffect(() => {
    // Check if player is in a room with hidden door
    const isInRoomWithDoor = roomDescriptionMap[currentPosition]?.hasHiddenDoor;
    
    // Check if player has rusty key
    const hasRustyKey = inventory.some(item => 
      (item.originalId || item.id) === 'rusty_key'
    );

    // First clear any existing timeout
    if (glowTimeoutRef.current) {
      clearTimeout(glowTimeoutRef.current);
      glowTimeoutRef.current = null;
    }
    
    // If in the right room with the key, start the glowing effect
    if (isInRoomWithDoor && hasRustyKey) {
      setKeyGlowing(true);
      
      // Set a timeout to turn off the glow after the animation finishes
      // 2 seconds per pulse × 3 pulses = 6 seconds total
      glowTimeoutRef.current = setTimeout(() => {
        setKeyGlowing(false);
      }, 6000);
    } else {
      setKeyGlowing(false);
    }
    
    // Cleanup function
    return () => {
      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current);
      }
    };
  }, [currentPosition, inventory, roomDescriptionMap]);
  
  // Check if the orb should glow
  useEffect(() => {
    // Check if player is in a room with teleport
    const isInRoomWithTeleport = specialRooms[currentPosition]?.hasTeleport;
    
    // Check if player has crystal orb
    const hasCrystalOrb = inventory.some(item => 
      (item.originalId || item.id) === 'crystal_orb'
    );
    
    // First clear any existing timeout
    if (orbGlowTimeoutRef.current) {
      clearTimeout(orbGlowTimeoutRef.current);
      orbGlowTimeoutRef.current = null;
    }
    
    // If in the right room with the orb, start the glowing effect
    if (isInRoomWithTeleport && hasCrystalOrb) {
      setOrbGlowing(true);
      
      // Set a timeout to turn off the glow after the animation finishes
      orbGlowTimeoutRef.current = setTimeout(() => {
        setOrbGlowing(false);
      }, 6000);
    } else {
      setOrbGlowing(false);
    }
    
    
    // Cleanup function
    return () => {
      if (orbGlowTimeoutRef.current) {
        clearTimeout(orbGlowTimeoutRef.current);
      }
    };
  }, [currentPosition, inventory, specialRooms]);



useEffect(() => {
  const handleOrbProtection = (event) => {
    if (event.detail.roomType === 'sand_creature') {
      // Clear any existing timeout
      if (sandProtectionTimeoutRef.current) {
        clearTimeout(sandProtectionTimeoutRef.current);
      }
      
      // Start glowing
      setSandProtectionGlowing(true);
      
      // Stop glowing after duration
      sandProtectionTimeoutRef.current = setTimeout(() => {
        setSandProtectionGlowing(false);
      }, event.detail.duration || 6000);
    }
  };
  
  window.addEventListener('orb_protection_activated', handleOrbProtection);
  
  return () => {
    window.removeEventListener('orb_protection_activated', handleOrbProtection);
    if (sandProtectionTimeoutRef.current) {
      clearTimeout(sandProtectionTimeoutRef.current);
    }
  };
}, []);



  // Check if the wyrmglass should glow
   useEffect(() => {
    // Check if player has wyrmglass
    const hasWyrmglass = inventory.some(item => 
      (item.originalId || item.id) === 'wyrmglass'
    );
    
    if (!hasWyrmglass) {
      setWyrmglassGlowing(false);
      return;
    }
    
    // Check special conditions for wyrmglass glow
    let shouldGlow = false;
    
    // 1. Check if in exit room (use positions.exitPosition)
    if (positions && currentPosition === positions.exitPosition) {
      console.log("Wyrmglass glowing: In exit room");
      shouldGlow = true;
    }
    
    // 2. Check if in sand creature room using specialRooms
    const isInSandRoom = specialRooms[currentPosition]?.hasSandCreature;
    if (isInSandRoom) {
      console.log("Wyrmglass glowing: In sand creature room");
      shouldGlow = true;
    }
    
    // 3. Check if in water sprite (Nixie) room using specialRooms
    const isInNixieRoom = specialRooms[currentPosition]?.hasWaterSpirit;
    if (isInNixieRoom) {
      console.log("Wyrmglass glowing: In water sprite room");
      shouldGlow = true;
    }
    
    // Alternative text-based checks as fallback
    if (!shouldGlow) {
      const roomText = roomDescriptionMap[currentPosition]?.text || "";
      const roomDescLower = roomText.toLowerCase();
      
      // Fallback check for sand room
      if (roomDescLower.includes("soft sand") && 
          roomDescLower.includes("invites you to dig")) {
        console.log("Wyrmglass glowing: Sand room detected by text");
        shouldGlow = true;
      }
      
      // Fallback check for water sprite room
      if (roomDescLower.includes("tranquil pool") && 
          roomDescLower.includes("mirror")) {
        console.log("Wyrmglass glowing: Water sprite room detected by text");
        shouldGlow = true;
      }
    }
    
    // Clear any existing timeout
    if (wyrmglassGlowTimeoutRef.current) {
      clearTimeout(wyrmglassGlowTimeoutRef.current);
      wyrmglassGlowTimeoutRef.current = null;
    }
    
    // Set glow state
    if (shouldGlow) {
      setWyrmglassGlowing(true);
      
      // Set timeout to turn off glow after animation
      wyrmglassGlowTimeoutRef.current = setTimeout(() => {
        setWyrmglassGlowing(false);
      }, 6000);
    } else {
      setWyrmglassGlowing(false);
    }
    
    // Cleanup
    return () => {
      if (wyrmglassGlowTimeoutRef.current) {
        clearTimeout(wyrmglassGlowTimeoutRef.current);
      }
    };
  }, [currentPosition, inventory, roomDescriptionMap, specialRooms, positions]); // Added all dependencies

  
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



  // Determine torch flame level
  const getTorchClass = () => {
    if (torchLevel > 50) return 'level-good';
    if (torchLevel > 15) return 'level-warning';
    return 'level-danger';
  };
  
  // Get torch status message
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

  return (
    <div className='container inventory'>
      <h3>Inventory</h3>
      
     {/* Torch status */}
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
      
      {/* Inventory items */}
      {inventory.length > 0 ? (
        <div className="inventory-items">
          {inventory.map(item => {
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
           <div
                key={item.id}
              className={`inventory-item ${isKeyGlowing ? 'key-glowing' : ''} ${isOrbGlowing ? 'orb-glowing' : ''} ${isWyrmglassGlowing ? 'wyrmglass-glowing' : ''} ${isLanternActive ? 'lantern-active' : ''} ${isSouvenir ? 'souvenir-item' : ''} ${isCursed ? 'cursed-item' : ''} ${isDisabled ? 'disabled-item' : ''}`}
              data-description={item.description}
              >
                  <div className="item-details">
                   <span className={`item-icon ${isKeyGlowing ? 'pulse-glow' : ''} ${isOrbGlowing ? 'pulse-orb' : ''} ${isWyrmglassGlowing ? 'pulse-wyrmglass' : ''} ${isLanternActive ? 'lantern-active' : ''}`}>

                    {item.icon}
                    </span>
                   <span className={`item-name ${itemType === 'gold_coins' ? 'coin-name' : ''}`}>
    {item.name}
  </span>
                    
                    {/* ADD THE LANTERN STATUS RIGHT HERE */}
                    {itemType === 'lantern' && renderLanternStatus(item)}
                    
                 {/*      {isKeyGlowing && (
                      <span className="key-hint"> (The key seems to react to something in this room)</span>
                    )} */}
                 {/*   {isOrbGlowing && (
                      <span className="orb-hint"> (The orb begins to glow brightly in this location)</span>
                    )} */}
                 
                  </div>
                  {item.canUse && gameStatus === 'playing' && (
                    <button 
                          className={`use-item-btn ${isKeyGlowing ? 'use-key-btn-glow' : ''} ${isOrbGlowing ? 'use-orb-btn-glow' : ''} ${isWyrmglassGlowing ? 'use-wyrmglass-btn-glow' : ''} ${isLanternActive ? 'use-lantern-btn-active' : ''}`}
                 onClick={(event) => {
                        // Add teleporting sparkle to orb ICON (not button)
                        if (itemType === 'crystal_orb' && (specialRooms[currentPosition]?.hasTeleport || currentPosition === 32)) {
                          // Find the orb icon within this inventory item
                          const itemContainer = event.currentTarget.closest('.inventory-item');
                          const orbIcon = itemContainer?.querySelector('.item-icon');
                          
                          if (orbIcon) {
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
                            
                            // Remove effects after animation
                            setTimeout(() => {
                              orbIcon.classList.remove('orb-teleporting');
                              sparkleWrapper.remove();
                              magicRing.remove();
                            }, 1500);
                          }
                        }
                        
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
        <p className="empty-inventory">No items</p>
      )}
    </div>
  );
};

export default InventoryPanel;