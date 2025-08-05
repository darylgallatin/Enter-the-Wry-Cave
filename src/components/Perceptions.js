// ==================== PERCEPTIONS COMPONENT ==================== 
/**
 * Perceptions.js - Environmental awareness and atmospheric feedback system
 * 
 * This component serves as the player's sensory interface to the game world,
 * displaying environmental cues, danger warnings, and atmospheric details
 * that enhance immersion and provide critical gameplay information. It acts
 * as the bridge between the game's environmental systems and the player's
 * awareness, creating a rich sensory experience.
 * 
 * Key Features:
 * - **Environmental Cues**: Displays smell, sound, and visual perceptions
 * - **Danger Detection**: Warns players about nearby hazards and creatures
 * - **Atmospheric Enhancement**: Provides immersive environmental details
 * - **Specialized Styling**: Different CSS classes for different perception types
 * - **Conditional Display**: Only shows during active gameplay
 * 
 * Perception Categories:
 * - **Proximity Warnings**: Wumpus smell, pit drafts, bat sounds
 * - **Environmental Details**: Room-specific atmospheric descriptions
 * - **Special Effects**: Fungi pulsing, water sounds, magical phenomena
 * - **Interactive Cues**: Hints about interactive elements and opportunities
 * 
 * Design Philosophy:
 * - **Immersive Feedback**: Rich sensory descriptions enhance atmosphere
 * - **Strategic Information**: Critical survival cues for player decision-making
 * - **Visual Differentiation**: Specialized styling for different perception types
 * - **Clean Presentation**: Organized, scannable format for quick reference
 */
import React from 'react';

// ==================== PERCEPTIONS COMPONENT DEFINITION ====================
/**
 * Main Perceptions functional component with intelligent perception categorization
 * 
 * This component processes an array of perception strings and presents them
 * with appropriate styling and categorization. It provides both functional
 * information display and enhanced visual feedback through specialized CSS
 * classes for different types of environmental perceptions.
 * 
 * @param {string[]} perceptions - Array of perception text strings to display
 * @param {string} gameStatus - Current game state (playing/won/lost)
 */
const Perceptions = ({ perceptions, gameStatus }) => {
  
  // ==================== EARLY RETURN CONDITIONS ====================
  /**
   * Intelligent display conditions for optimal user experience
   * 
   * This early return logic ensures that perceptions only display when
   * they're relevant and meaningful to the player, preventing clutter
   * and maintaining focus during non-gameplay states.
   * 
   * Hide Conditions:
   * - **No Perceptions**: Empty perceptions array (nothing to display)
   * - **Non-Playing State**: Game not in active playing state
   * - **Clean Interface**: Prevents distracting information during game end
   * 
   * Benefits:
   * - **Focused Experience**: Only shows relevant information
   * - **Clean Transitions**: No lingering perceptions after game ends
   * - **Performance**: Avoids unnecessary rendering when not needed
   * - **User Focus**: Maintains attention on appropriate game elements
   */
  if (perceptions.length === 0 || gameStatus !== 'playing') {
    return null;
  }

  // ==================== MAIN COMPONENT RENDER ====================
  /**
   * Dynamic perception display with intelligent categorization and styling
   * 
   * This render method creates a sophisticated perception display system
   * that automatically categorizes different types of environmental cues
   * and applies appropriate visual styling to enhance player understanding
   * and create atmospheric immersion.
   */
  return (
    <div className='perceptions'>
      {perceptions.map((perception, index) => {
        
        // ========== FUNGI PERCEPTION DETECTION ==========
        /**
         * Specialized detection for fungi-related environmental cues
         * 
         * This detection system identifies perceptions related to the fungi
         * creature encounters, allowing for specialized visual styling that
         * can enhance the atmospheric presentation of these unique environmental
         * elements and provide visual differentiation for this specific threat.
         * 
         * Detection Method:
         * - **Text Analysis**: Searches for specific fungi-related keywords
         * - **Pulsing Behavior**: Focuses on the distinctive pulsing visual effect
         * - **Creature Identification**: Specifically identifies fungi creature cues
         * 
         * Visual Benefits:
         * - **Threat Recognition**: Helps players identify fungi-specific dangers
         * - **Atmospheric Enhancement**: Special styling for organic/biological themes
         * - **Visual Differentiation**: Distinguishes fungi cues from other perceptions
         */
        const isFungiPerception = perception.includes('glowing fungi seem to pulse');
        
        // ========== WATER PERCEPTION DETECTION ==========
        /**
         * Advanced detection for water-related environmental perceptions
         * 
         * This sophisticated detection system identifies various water-related
         * environmental cues by analyzing multiple keywords and patterns that
         * indicate aquatic or water-themed environmental elements.
         * 
         * Detection Criteria:
         * - **Primary Indicator**: Must contain "droplets" as base water element
         * - **Secondary Indicators**: Must also contain either "melody" or "patter"
         * - **Multi-Pattern Matching**: Catches various water-related descriptions
         * - **Atmospheric Context**: Identifies both functional and atmospheric water cues
         * 
         * Water Perception Types:
         * - **Musical Water**: "droplets" + "melody" (atmospheric/magical water)
         * - **Natural Water**: "droplets" + "patter" (natural water sounds)
         * - **Environmental Audio**: Water-based atmospheric enhancement
         * 
         * Visual Enhancement:
         * - **Aquatic Theming**: Special CSS styling for water-related perceptions
         * - **Atmospheric Immersion**: Enhanced visual presentation for water environments
         * - **Environmental Recognition**: Helps players identify water-themed areas
         */
        const isWaterPerception = perception.includes('droplets') &&
                                 (perception.includes('melody') ||
                                  perception.includes('patter'));
        
        // ========== DYNAMIC CSS CLASS ASSIGNMENT ==========
        /**
         * Intelligent CSS class system for perception-specific styling
         * 
         * This system automatically assigns appropriate CSS classes based on
         * the content and type of each perception, enabling specialized visual
         * styling that enhances both functionality and atmospheric immersion.
         * 
         * Class Assignment Logic:
         * - **Base Class**: All perceptions get 'perception' class for common styling
         * - **Fungi Enhancement**: Fungi perceptions get additional 'fungi-perception' class
         * - **Water Enhancement**: Water perceptions get additional 'water-perception' class
         * - **Fallback Safety**: Unmatched perceptions use only base class
         * 
         * Styling Benefits:
         * - **Visual Differentiation**: Different perception types get unique styling
         * - **Thematic Consistency**: CSS classes can match environmental themes
         * - **Enhanced Readability**: Visual cues help players categorize information
         * - **Atmospheric Immersion**: Specialized styling enhances game atmosphere
         */
        let perceptionClass = 'perception';
        if (isFungiPerception) {
          perceptionClass += ' fungi-perception';
        } else if (isWaterPerception) {
          perceptionClass += ' water-perception';
        }
        
        // ========== INDIVIDUAL PERCEPTION RENDER ==========
        /**
         * Individual perception element with dynamic styling and content
         * 
         * Each perception is rendered as a paragraph element with automatically
         * assigned CSS classes that enable specialized styling based on the
         * perception's content and environmental context.
         * 
         * Element Features:
         * - **Unique Keys**: Index-based keys for React list rendering
         * - **Dynamic Classes**: Automatically assigned based on content analysis
         * - **Content Preservation**: Original perception text displayed unchanged
         * - **Styling Integration**: CSS classes enable specialized visual effects
         * 
         * Accessibility Features:
         * - **Semantic HTML**: Proper paragraph elements for screen readers
         * - **Clear Content**: Unmodified text preserves original meaning
         * - **Visual Hierarchy**: CSS classes can provide visual organization
         * - **Scannable Format**: Paragraph format enables easy scanning
         */
        return (
          <p
            key={index}
            className={perceptionClass}
          >
            {perception}
          </p>
        );
      })}
    </div>
  );
};

export default Perceptions;