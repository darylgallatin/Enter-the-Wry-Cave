// roomEmojiMap.js - Maps room descriptions to appropriate emojis

/**
 * Get an emoji representing a room based on its description or keywords
 * @param {Object} roomInfo - Room info object with text, keywords, mood, etc.
 * @returns {String} An emoji representing the room type
 */
export const getRoomEmoji = (roomInfo) => {
    if (!roomInfo || !roomInfo.text) {
      return '❓'; // Default unknown
    }
    
    const text = roomInfo.text.toLowerCase();
    const keywords = roomInfo.keywords || [];
    const mood = roomInfo.mood || '';
    const hasWater = roomInfo.hasWater || false;
    const special = roomInfo.special || '';
    
    // Check for water-related rooms first
    if (hasWater || 
        text.includes('water') || 
        text.includes('pool') || 
        text.includes('stream') || 
        text.includes('waterfall') || 
        text.includes('drip') ||
        text.includes('wade') ||
        text.includes('splash')) {
      return '💧'; // Water drop
    }
    
    // Special room types
    if (special === 'crystal' || text.includes('crystal') || text.includes('glow')) {
      return '✨'; // Sparkles
    }
    
    if (special === 'echo' || text.includes('echo') || text.includes('whisper')) {
      return '👂'; // Ear (for hearing/echo)
    }
    
    if (special === 'goblin' || text.includes('goblin') || text.includes('shrine')) {
      return '👹'; // Goblin face
    }
    
    if (special === 'trinkets' || text.includes('trinket') || text.includes('treasure') || text.includes('collection')) {
      return '🏺'; // Pottery/artifacts
    }
    
    // Room mood types
    if (mood === 'warm' || text.includes('warm') || text.includes('hot spring')) {
      return '🔥'; // Fire
    }
    
    if (mood === 'cold' || text.includes('frozen') || text.includes('ice')) {
      return '❄️'; // Snowflake
    }
    
    if (mood === 'dangerous' || text.includes('danger') || text.includes('bottomless')) {
      return '⚠️'; // Warning
    }
    
    // Room content types
    if (text.includes('rock') || text.includes('stone') || text.includes('formation')) {
      return '🪨'; // Rock
    }
    
    if (text.includes('face') || text.includes('twisted human') || text.includes('resemble human')) {
      return '😱'; // Face screaming in fear
    }
    
    if (text.includes('bone') || text.includes('skeleton')) {
      return '💀'; // Skull
    }
    
    if (text.includes('mushroom') || text.includes('fungi')) {
      return '🍄'; // Mushroom
    }
    
    if (text.includes('drawing') || text.includes('painting') || text.includes('pictograph')) {
      return '🎨'; // Artist palette
    }
    
    if (text.includes('camp') || text.includes('explorer')) {
      return '🏕️'; // Camping
    }
    
    if (text.includes('slime') || text.includes('slip')) {
      return '🧪'; // Test tube (slimy substance)
    }
    
    if (text.includes('minerals') || text.includes('glittering')) {
      return '💎'; // Gem
    }
    
    if (text.includes('bat') || text.includes('wings') || text.includes('flap')) {
      return '🦇'; // Bat
    }
    
    if (text.includes('workshop') || text.includes('tool')  || text.includes('tools'))  {
      return '🔨'; // Hammer
    }
    
    if (text.includes('nest') || text.includes('wumpus')) {
      return '🐲'; // Dragon (closest to wumpus)
    }
    
    if (text.includes('smell') || text.includes('stench') || text.includes('bathroom')) {
      return '🤢'; // Nauseated face
    }
    
    if (text.includes('sand') || text.includes('soft')) {
      return '🏜️'; // Desert
    }
    
    if (text.includes('gift') || text.includes('shop') || text.includes('souvenir')) {
      return '🎁'; // Gift
    }
    
    if (text.includes('card') || text.includes('poker') || text.includes('game')) {
      return '🃏'; // Playing card
    }
    
    if (text.includes('letter') || text.includes('writing') || text.includes('journal')) {
      return '📝'; // Note
    }
    
    if (text.includes('sulfur') || text.includes('yellow')) {
      return '☣️'; // Biohazard (sulfur smell)
    }
    
    if (text.includes('quiet') || text.includes('peaceful') || text.includes('tranquil')) {
      return '😌'; // Relieved face
    }
    
    if (text.includes('perfect') || text.includes('circular') || text.includes('intelligent')) {
      return '⭕'; // Circle
    }
    
    if (text.includes('lantern') || text.includes('mining')) {
      return '⛏️'; // Pick
    }
    
    if (text.includes('ceiling') || text.includes('stalactite')) {
      return '⬆️'; // Up arrow
    }
    
    if (text.includes('backpack') || text.includes('ration')) {
      return '🎒'; // Backpack
    }
    
    // Default for mystery/unknown rooms
    return '🔍'; // Magnifying glass
  };
  
  export default getRoomEmoji;