/**
 * Gets the full statement containing an interactive item
 * @param {string} text The full text to search in
 * @param {number} startIndex The starting index of the item
 * @returns {string} The complete statement containing the item
 */
export const getFullInteractiveStatement = (text, startIndex) => {
    // Find the beginning of the sentence or statement
    let start = startIndex;
    // Look for the start of this phrase, usually after a period or at the beginning
    while (start > 0) {
      const prevChar = text.charAt(start - 1);
      if (prevChar === '.' || prevChar === '!' || prevChar === '?') {
        break;
      }
      start--;
    }
    
    // Find the end of the sentence or statement
    let end = startIndex;
    while (end < text.length) {
      if (".!?".includes(text.charAt(end))) {
        end++; // Include the punctuation
        break;
      }
      end++;
    }
    
    return text.substring(start, end).trim();
  };
  
  /**
   * Creates an enhanced room description while preserving interactive items and hints
   * @param {string} originalText The original room description 
   * @param {string} enhancedText The enhanced description from the lantern
   * @returns {string} Combined text with preserved interactive elements
   */
  export const createEnhancedRoomDescription = (originalText, enhancedText) => {
    if (!originalText || !enhancedText) {
      return originalText || enhancedText || "";
    }
    
    // Start with the enhanced text
    let result = enhancedText;
    
    // Collection for items to preserve
    const itemsToPreserve = [];
    
    // 1. Check for special structured phrases first
    const commonPatterns = [
      {
        regex: / On a small ledge, you spot a <span class=['"]interactive-item['"][^>]*>flask of oil<\/span>\./i,
        itemType: 'torch_oil'
      },
      {
        regex: / In the corner, you spot a <span class=['"]interactive-item['"][^>]*>tattered cloth<\/span>\./i,
        itemType: 'invisibility_cloak'
      },
      {
        regex: / Among them, you spot unusual <span class=['"]interactive-item['"][^>]*>salt-like crystals<\/span> with a subtle blue glow\./i,
        itemType: 'cave_salt'
      },
      {
        regex: / Yellow <span class=['"]interactive-item['"][^>]*>sulfur crystals<\/span> line the walls\./i,
        itemType: 'sulfur_crystal'
      },
      // Add more patterns as needed based on your game's content
    ];
    
    // Check for each common pattern
    commonPatterns.forEach(pattern => {
      const match = originalText.match(pattern.regex);
      if (match) {
        itemsToPreserve.push({
          text: match[0],
          itemType: pattern.itemType
        });
      }
    });
    
    // 2. Extract key hints
    // Keyhole hint
    const keyholeHint = originalText.match(/You notice what appears to be a keyhole hidden among.*?\./);
    if (keyholeHint) {
      itemsToPreserve.push({
        text: keyholeHint[0],
        type: 'keyhole'
      });
    }
    
    // Teleport hints
    const teleportHint = originalText.match(/(There's a strange circular pattern.*?\.)|(You notice unusual energy emanating.*?\.)/);
    if (teleportHint) {
      itemsToPreserve.push({
        text: teleportHint[0],
        type: 'teleport'
      });
    }
    
    // 3. Look for any interactive items not caught by the patterns
    const itemRegex = /<span class=['"]interactive-item['"][^>]*data-item=['"]([^'"]+)['"][^>]*>(.*?)<\/span>/g;
    let match;
    
    while ((match = itemRegex.exec(originalText)) !== null) {
      const itemType = match[1];
      const itemText = match[2];
      
      // Skip if this is part of a pattern we already found
      const alreadyFound = itemsToPreserve.some(item => 
        item.text.includes(match[0]) || (item.itemType === itemType)
      );
      
      if (!alreadyFound) {
        // Get the full statement containing this item
        let start = match.index;
        while (start > 0) {
          // Look for beginning of sentence or meaningful phrase
          if (".!?".includes(originalText.charAt(start - 1))) {
            break;
          }
          start--;
        }
        
        let end = match.index + match[0].length;
        while (end < originalText.length) {
          if (".!?".includes(originalText.charAt(end))) {
            end++; // Include the punctuation
            break;
          }
          end++;
        }
        
        const fullStatement = originalText.substring(start, end).trim();
        
        itemsToPreserve.push({
          text: fullStatement,
          itemType: itemType
        });
      }
    }
    
    // 4. Add all preserved items to the enhanced text
    // But first check if they're already there
    itemsToPreserve.forEach(item => {
      // Don't add if the exact text is already there
      if (!result.includes(item.text)) {
        // For item types, check if any span with the same item type exists
        if (item.itemType) {
          const itemTypeRegex = new RegExp(`data-item=['"]${item.itemType}['"]`, 'i');
          if (!itemTypeRegex.test(result)) {
            result += " " + item.text;
          }
        } else {
          // For hint types, just check if the type of hint is present
          if (item.type === 'keyhole' && !result.includes('keyhole')) {
            result += " " + item.text;
          } else if (item.type === 'teleport' && 
                    !result.includes('circular pattern') && 
                    !result.includes('unusual energy')) {
            result += " " + item.text;
          }
        }
      }
    });
    
    return result;
  };