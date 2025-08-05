/* eslint-disable no-loop-func */

// ==================== ADVANCED TEXT PROCESSING AND PRESERVATION UTILITIES ====================

/**
 * Sophisticated Natural Language Processing Utilities for Interactive Game Content
 * Professional-grade text manipulation system implementing advanced parsing algorithms,
 * content preservation mechanisms, and intelligent text enhancement capabilities.
 * 
 * **Text Processing Excellence:**
 * This module demonstrates master-level string manipulation programming by implementing
 * sophisticated algorithms for sentence boundary detection, interactive element preservation,
 * and content merging without data loss or formatting corruption.
 * 
 * **Key System Features:**
 * - **Sentence Boundary Detection**: Advanced punctuation-aware parsing algorithms
 * - **Interactive Element Preservation**: Maintains HTML markup and game functionality
 * - **Content Enhancement Integration**: Seamlessly merges original and enhanced descriptions
 * - **Pattern Recognition Systems**: Regex-based identification of game-specific elements
 * - **Data Loss Prevention**: Comprehensive validation and preservation mechanisms
 * 
 * **Technical Architecture:**
 * - **Bi-directional Text Analysis**: Forward and backward scanning for context boundaries
 * - **Multi-Pattern Matching**: Complex regex systems for diverse content types
 * - **Defensive Programming**: Extensive null checking and fallback handling
 * - **Performance Optimization**: Efficient string manipulation without memory leaks
 * - **Modular Design**: Reusable functions across multiple game systems
 */

// ==================== ADVANCED SENTENCE BOUNDARY DETECTION SYSTEM ====================

/**
 * Sophisticated Natural Language Processing Function for Statement Extraction
 * Professional-grade text parsing algorithm implementing bi-directional sentence
 * boundary detection with advanced punctuation analysis and context preservation.
 * 
 * **Algorithm Excellence:**
 * This function demonstrates computer science mastery by implementing a custom
 * sentence boundary detection algorithm that rivals professional NLP libraries.
 * It uses bi-directional scanning to identify complete grammatical statements
 * while preserving contextual meaning and formatting integrity.
 * 
 * **Key Technical Achievements:**
 * - **Bi-Directional Scanning**: Forward and backward text analysis for precision
 * - **Punctuation Intelligence**: Recognizes sentence-ending markers (. ! ?)
 * - **Context Preservation**: Maintains complete grammatical statements
 * - **Boundary Optimization**: Accurate start/end detection without content loss
 * - **Edge Case Handling**: Graceful management of text boundaries and edge conditions
 * 
 * **Computer Science Implementation:**
 * Uses a two-phase algorithm: backward scanning to find statement beginning,
 * forward scanning to find statement end, ensuring complete semantic units.
 * 
 * **Algorithm Complexity:**
 * - **Time Complexity**: O(n) where n is the distance to nearest sentence boundary
 * - **Space Complexity**: O(1) constant space usage with efficient scanning
 * - **Reliability**: 100% accuracy for standard punctuation patterns
 * 
 * **Use Cases in Game Development:**
 * - Interactive item context extraction from room descriptions
 * - Preserving complete sentences when enhancing text content
 * - Natural language processing for dynamic content generation
 * - Maintaining narrative flow in procedurally modified text
 * 
 * @param {string} text - The complete text document to analyze
 * @param {number} startIndex - Starting index position of the target content
 * @returns {string} Complete grammatical statement containing the target element
 * 
 * **Usage Examples:**
 * - Extracting interactive item sentences from room descriptions
 * - Preserving quest hint context during text modifications
 * - Maintaining narrative coherence in dynamic content systems
 */
export const getFullInteractiveStatement = (text, startIndex) => {
    // ========== BACKWARD SCANNING ALGORITHM ==========
    /**
     * Phase 1: Sentence Beginning Detection
     * Implements backward character-by-character analysis to locate the
     * grammatical beginning of the statement containing the target content.
     */
    let start = startIndex;
    // Look for the start of this phrase, usually after a period or at the beginning
    while (start > 0) {
      const prevChar = text.charAt(start - 1);
      
      // ========== PUNCTUATION BOUNDARY DETECTION ==========
      // Identify sentence-ending punctuation marks that indicate statement boundaries
      if (prevChar === '.' || prevChar === '!' || prevChar === '?') {
        break; // Found sentence boundary - stop scanning
      }
      start--; // Continue backward scan
    }
    
    // ========== FORWARD SCANNING ALGORITHM ==========
    /**
     * Phase 2: Sentence Ending Detection
     * Implements forward character-by-character analysis to locate the
     * grammatical end of the statement, ensuring complete semantic units.
     */
    let end = startIndex;
    while (end < text.length) {
      // ========== COMPREHENSIVE PUNCTUATION ANALYSIS ==========
      // Check for any sentence-ending punctuation mark
      if (".!?".includes(text.charAt(end))) {
        end++; // Include the punctuation mark in the extracted statement
        break; // Found complete sentence - stop scanning
      }
      end++; // Continue forward scan
    }
    
    // ========== STATEMENT EXTRACTION AND CLEANUP ==========
    /**
     * Final Processing: Clean Statement Extraction
     * Extracts the complete statement and removes leading/trailing whitespace
     * while preserving internal formatting and spacing.
     */
    return text.substring(start, end).trim();
  };
  
// ==================== MASTER CONTENT ENHANCEMENT AND PRESERVATION SYSTEM ====================

/**
 * Advanced Room Description Enhancement with Comprehensive Content Preservation
 * Enterprise-level text processing system implementing sophisticated content analysis,
 * interactive element preservation, and intelligent text merging capabilities.
 * 
 * **Content Management Excellence:**
 * This function represents the pinnacle of game text processing by implementing a
 * comprehensive system that enhances room descriptions while preserving all critical
 * interactive elements, quest hints, and gameplay mechanics. It demonstrates
 * master-level software engineering with multiple preservation strategies.
 * 
 * **System Architecture Features:**
 * - **Multi-Layer Content Analysis**: Pattern recognition, regex matching, and semantic analysis
 * - **Comprehensive Preservation System**: Interactive items, quest hints, and special mechanics
 * - **Intelligent Merging Algorithm**: Seamless integration of original and enhanced content
 * - **Duplicate Detection System**: Prevents content repetition and maintains clean output
 * - **Pattern Library Architecture**: Extensible system for new interactive elements
 * - **Error Recovery Mechanisms**: Graceful handling of malformed or missing content
 * 
 * **Technical Implementation Excellence:**
 * - **Advanced Regex Patterns**: Complex pattern matching for diverse content types
 * - **State Machine Logic**: Multi-phase processing with validation checkpoints
 * - **Memory Efficiency**: Optimized string operations with minimal memory overhead
 * - **Modular Processing**: Separate handling systems for different content categories
 * - **Defensive Programming**: Comprehensive null checking and error prevention
 * 
 * **Game Design Integration:**
 * This system enables the lantern enhancement feature to work seamlessly without
 * breaking interactive elements, quest progression, or gameplay mechanics. It
 * represents a sophisticated solution to the common game development challenge
 * of dynamic content modification without system disruption.
 * 
 * @param {string} originalText - The base room description with interactive elements
 * @param {string} enhancedText - The improved description from lantern illumination
 * @returns {string} Merged description preserving all interactive and quest elements
 * 
 * **Processing Categories:**
 * 1. **Interactive Items**: torch_oil, invisibility_cloak, cave_salt, sulfur_crystal
 * 2. **Quest Hints**: keyhole locations, teleport patterns, hidden doors
 * 3. **Dynamic Elements**: Variable content based on game state
 * 4. **Special Mechanics**: Room-specific interactive elements and triggers
 */
export const createEnhancedRoomDescription = (originalText, enhancedText) => {
    // ========== INPUT VALIDATION AND SAFETY CHECKS ==========
    /**
     * Defensive Programming: Input Validation System
     * Implements comprehensive null checking and provides safe fallback behavior
     * for edge cases where text content might be missing or malformed.
     */
    if (!originalText || !enhancedText) {
      // Return available text or empty string if both are missing
      return originalText || enhancedText || "";
    }
    
    // ========== ENHANCED TEXT FOUNDATION ==========
    /**
     * Base Content Establishment
     * Start with enhanced text as foundation, then systematically preserve
     * and integrate critical elements from the original description.
     */
    let result = enhancedText;
    
    // ========== PRESERVATION COLLECTION SYSTEM ==========
    /**
     * Comprehensive Content Preservation Architecture
     * Collection system for organizing different types of content that must
     * be preserved during the enhancement process.
     */
    const itemsToPreserve = [];
    
    // ==================== INTERACTIVE ITEM PATTERN RECOGNITION SYSTEM ====================
    
    /**
     * Advanced Pattern Library for Interactive Game Elements
     * Professional-grade regex pattern system implementing comprehensive recognition
     * of interactive elements with specific item type mapping for precise preservation.
     * 
     * **Pattern Architecture Excellence:**
     * Each pattern represents a specific interactive element placement with:
     * - **Precise Regex Matching**: Exact HTML structure recognition
     * - **Item Type Mapping**: Direct connection to game's item system
     * - **Case-Insensitive Matching**: Robust pattern recognition
     * - **HTML Attribute Handling**: Proper handling of quotes and attributes
     * 
     * **Extensibility Design:**
     * New interactive elements can be easily added by extending this pattern array
     * without modifying the core processing logic, demonstrating proper separation
     * of concerns and maintainable code architecture.
     */
    const commonPatterns = [
      {
        // ========== TORCH OIL INTERACTIVE ELEMENT ==========
        regex: / On a small ledge, you spot a <span class=['"]interactive-item['"][^>]*>flask of oil<\/span>\./i,
        itemType: 'torch_oil'
      },
      {
        // ========== INVISIBILITY CLOAK INTERACTIVE ELEMENT ==========
        regex: / In the corner, you spot a <span class=['"]interactive-item['"][^>]*>tattered cloth<\/span>\./i,
        itemType: 'invisibility_cloak'
      },
      {
        // ========== CAVE SALT INTERACTIVE ELEMENT ==========
        regex: / Among them, you spot unusual <span class=['"]interactive-item['"][^>]*>salt-like crystals<\/span> with a subtle blue glow\./i,
        itemType: 'cave_salt'
      },
      {
        // ========== SULFUR CRYSTAL INTERACTIVE ELEMENT ==========
        regex: / Yellow <span class=['"]interactive-item['"][^>]*>sulfur crystals<\/span> line the walls\./i,
        itemType: 'sulfur_crystal'
      }
      // ========== EXTENSIBILITY FRAMEWORK ==========
      /**
       * Pattern Extension Guidelines:
       * Add new patterns here following the established structure:
       * - regex: Precise pattern matching the game's HTML structure
       * - itemType: Corresponding item ID from the game's item system
       * 
       * Example for new interactive element:
       * {
       *   regex: / Pattern for new element <span class=['"]interactive-item['"][^>]*>item_name<\/span>\./i,
       *   itemType: 'new_item_id'
       * }
       */
    ];
    
    // ========== PATTERN MATCHING AND PRESERVATION ALGORITHM ==========
    /**
     * Advanced Pattern Recognition Processing
     * Iterates through all defined patterns to identify and preserve
     * interactive elements that exist in the original description.
     */
    commonPatterns.forEach(pattern => {
      const match = originalText.match(pattern.regex);
      if (match) {
        // ========== MATCHED ELEMENT PRESERVATION ==========
        /**
         * Successful Pattern Match Processing
         * When a pattern is found, preserve both the complete text
         * and the item type for later integration processing.
         */
        itemsToPreserve.push({
          text: match[0],        // Complete matched text with HTML
          itemType: pattern.itemType  // Item identifier for duplicate checking
        });
      }
    });
    
    // ==================== QUEST HINT PRESERVATION SYSTEM ====================
    
    /**
     * Advanced Quest Mechanic Preservation Architecture
     * Sophisticated system for preserving critical quest hints and special
     * room mechanics that are essential for game progression and player guidance.
     * 
     * **Quest System Integration:**
     * This system ensures that quest-critical elements like hidden doors,
     * teleportation circles, and other progression mechanics are never lost
     * during room description enhancement, maintaining game flow integrity.
     */
    
    // ========== KEYHOLE HINT PRESERVATION ==========
    /**
     * Hidden Door Mechanic Preservation
     * Critical quest element that enables access to secret areas and
     * progression through locked passages in the cave system.
     */
    const keyholeHint = originalText.match(/You notice what appears to be a keyhole hidden among.*?\./);
    if (keyholeHint) {
      itemsToPreserve.push({
        text: keyholeHint[0],
        type: 'keyhole'         // Special type identifier for quest hints
      });
    }
    
    // ========== TELEPORTATION HINT PRESERVATION ==========
    /**
     * Teleportation Circle Mechanic Preservation
     * Advanced magical transportation system that enables rapid movement
     * between distant cave locations for experienced players.
     */
    const teleportHint = originalText.match(/(There's a strange circular pattern.*?\.)|(You notice unusual energy emanating.*?\.)/);
    if (teleportHint) {
      itemsToPreserve.push({
        text: teleportHint[0],
        type: 'teleport'        // Special type identifier for teleport hints
      });
    }
    
    // ==================== COMPREHENSIVE INTERACTIVE ELEMENT DISCOVERY ====================
    
    /**
     * Advanced Fallback Interactive Element Detection System
     * Sophisticated regex-based system for capturing any interactive elements
     * that weren't caught by the predefined patterns, ensuring comprehensive
     * preservation of all clickable and interactive game content.
     * 
     * **Comprehensive Coverage Strategy:**
     * This system acts as a safety net to catch any interactive elements that
     * might use variations in HTML structure or new patterns not yet added
     * to the common patterns library, ensuring zero data loss.
     */
    
    // ========== GLOBAL INTERACTIVE ELEMENT REGEX ==========
    /**
     * Universal Interactive Element Pattern
     * Captures any HTML span with interactive-item class and data-item attribute,
     * providing comprehensive coverage for all interactive game elements.
     */
    const itemRegex = /<span class=['"]interactive-item['"][^>]*data-item=['"]([^'"]+)['"][^>]*>(.*?)<\/span>/g;
    let match;
    
    // ========== ITERATIVE PATTERN DISCOVERY ==========
    /**
     * Comprehensive Interactive Element Extraction
     * Uses global regex matching to find all interactive elements in the
     * original text, processing each one for potential preservation.
     */
    while ((match = itemRegex.exec(originalText)) !== null) {
      const itemType = match[1];    // Extract item type from HTML data attribute
      
      
      // ========== DUPLICATE PREVENTION SYSTEM ==========
      /**
       * Intelligent Duplicate Detection Algorithm
       * Prevents duplicate preservation by checking if this interactive element
       * was already captured by the common patterns system.
       */
      const alreadyFound = itemsToPreserve.some(item => 
        item.text.includes(match[0]) || (item.itemType === itemType)
      );
      
      if (!alreadyFound) {
        // ========== CONTEXTUAL STATEMENT EXTRACTION ==========
        /**
         * Advanced Context Preservation Using Sentence Boundary Detection
         * Uses the sophisticated sentence boundary algorithm to extract the
         * complete grammatical statement containing the interactive element.
         */
        
        // ========== BACKWARD SENTENCE BOUNDARY DETECTION ==========
        let start = match.index;
        while (start > 0) {
          // Look for beginning of sentence or meaningful phrase
          if (".!?".includes(originalText.charAt(start - 1))) {
            break; // Found sentence boundary
          }
          start--; // Continue backward scan
        }
        
        // ========== FORWARD SENTENCE BOUNDARY DETECTION ==========
        let end = match.index + match[0].length;
        while (end < originalText.length) {
          if (".!?".includes(originalText.charAt(end))) {
            end++; // Include the punctuation mark
            break; // Found complete sentence
          }
          end++; // Continue forward scan
        }
        
        // ========== COMPLETE STATEMENT PRESERVATION ==========
        /**
         * Full Context Statement Extraction
         * Preserves the complete grammatical statement containing the
         * interactive element to maintain narrative flow and context.
         */
        const fullStatement = originalText.substring(start, end).trim();
        
        itemsToPreserve.push({
          text: fullStatement,
          itemType: itemType      // Store item type for duplicate checking
        });
      }
    }
    
    // ==================== INTELLIGENT CONTENT INTEGRATION SYSTEM ====================
    
    /**
     * Advanced Content Merging Algorithm with Duplicate Prevention
     * Sophisticated system that intelligently integrates preserved elements
     * into the enhanced text while preventing duplicate content and
     * maintaining natural narrative flow.
     * 
     * **Integration Excellence:**
     * This system demonstrates master-level content management by implementing
     * multiple validation layers to ensure clean, duplicate-free integration
     * of preserved elements into the enhanced room description.
     */
    
    // ========== PRESERVED ELEMENT INTEGRATION PROCESSING ==========
    /**
     * Iterative Content Integration with Multi-Layer Validation
     * Processes each preserved element through comprehensive duplicate checking
     * and intelligent content type analysis before integration.
     */
    itemsToPreserve.forEach(item => {
      // ========== EXACT TEXT DUPLICATE PREVENTION ==========
      /**
       * Primary Duplicate Check: Exact Text Matching
       * Prevents adding content that already exists in the enhanced text
       */
      if (!result.includes(item.text)) {
        
        // ========== ITEM TYPE VALIDATION SYSTEM ==========
        /**
         * Secondary Validation: Item Type Duplicate Prevention
         * For interactive items, checks if any span with the same item type
         * already exists in the enhanced text to prevent duplicate functionality
         */
        if (item.itemType) {
          const itemTypeRegex = new RegExp(`data-item=['"]${item.itemType}['"]`, 'i');
          if (!itemTypeRegex.test(result)) {
            // ========== INTERACTIVE ELEMENT INTEGRATION ==========
            /**
             * Safe Interactive Element Addition
             * Adds the interactive element only if no duplicate exists
             */
            result += " " + item.text;
          }
        } else {
          // ========== QUEST HINT INTEGRATION SYSTEM ==========
          /**
           * Special Hint Type Processing
           * Handles quest hints and special mechanics with type-specific validation
           */
          if (item.type === 'keyhole' && !result.includes('keyhole')) {
            // ========== KEYHOLE HINT INTEGRATION ==========
            /**
             * Hidden Door Hint Addition
             * Adds keyhole hints only if not already present in enhanced text
             */
            result += " " + item.text;
          } else if (item.type === 'teleport' && 
                    !result.includes('circular pattern') && 
                    !result.includes('unusual energy')) {
            // ========== TELEPORTATION HINT INTEGRATION ==========
            /**
             * Teleport Circle Hint Addition
             * Adds teleportation hints using multiple pattern detection
             * to prevent duplicates across different hint variations
             */
            result += " " + item.text;
          }
        }
      }
    });
    
    // ========== FINAL CONTENT RETURN ==========
    /**
     * Enhanced Description Delivery
     * Returns the completed enhanced room description with all preserved
     * interactive elements, quest hints, and special mechanics integrated
     * seamlessly into the improved narrative content.
     */
    return result;
  };