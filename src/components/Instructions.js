// ==================== INSTRUCTIONS COMPONENT ====================
/**
 * Instructions.js - Collapsible game instructions and tutorial interface
 * 
 * This component provides essential gameplay information through a clean,
 * collapsible interface that helps players understand game mechanics without
 * cluttering the main game interface. It implements a toggle-based design
 * that allows players to access help when needed while maintaining a
 * streamlined experience during active gameplay.
 * 
 * Key Features:
 * - **Collapsible Design**: Toggle-based expansion/collapse for space efficiency
 * - **Comprehensive Coverage**: Complete game mechanics explanation
 * - **Visual Hierarchy**: Organized sections with clear headings and lists
 * - **Interactive Toggle**: Click-to-expand functionality with visual indicators
 * - **Player Guidance**: Essential information for successful gameplay
 * 
 * Design Philosophy:
 * - **Accessibility**: Help available but not intrusive
 * - **Clarity**: Clear, concise explanations of complex mechanics
 * - **Discoverability**: Important warnings and hints highlighted
 * - **User Control**: Players choose when to view instructions
 */
import React, { useState } from 'react';  

// ==================== INSTRUCTIONS COMPONENT DEFINITION ====================
/**
 * Main Instructions functional component
 * 
 * This component creates a self-contained help system that provides players
 * with all necessary information to understand and enjoy the game. It uses
 * a simple state management system to control visibility and creates an
 * organized, hierarchical presentation of game information.
 */
const Instructions = () => {
  
  // ==================== EXPANSION STATE MANAGEMENT ====================
  /**
   * Simple boolean state for controlling instructions visibility
   * 
   * This state variable controls the expanded/collapsed state of the
   * instructions content, providing a clean toggle interface that
   * allows players to access help when needed without permanent
   * screen real estate consumption.
   * 
   * State Features:
   * - **Default Collapsed**: Starts minimized to avoid interface clutter
   * - **Toggle Control**: Simple boolean flip for expand/collapse
   * - **CSS Integration**: State drives CSS classes for smooth transitions
   * - **User Preference**: Remembers state during session (not persistent)
   */
  const [expanded, setExpanded] = useState(false);

  // ==================== MAIN COMPONENT RENDER ====================
  /**
   * Complete instructions interface with organized game information
   * 
   * This render creates a comprehensive help system that covers all
   * essential game mechanics, objectives, and warnings in a clear,
   * hierarchical structure that's easy for players to digest.
   */
  return (
    <div className='container instructions game-instructions'>
      
      {/* ==================== INTERACTIVE HEADER SECTION ==================== 
       * 
       * Clickable header that serves as both title and toggle control,
       * providing clear visual feedback about the component's interactive nature.
       * 
       * Header Features:
       * - **Full-Width Clickable**: Entire header area is interactive
       * - **Visual Toggle Button**: Clear + / - indicator for expand/collapse state
       * - **Accessibility**: Large click target for easy interaction
       * - **State Reflection**: Button symbol reflects current state
       */}
      <div className="instructions-header" onClick={() => setExpanded(!expanded)}>
        <h3>How to Play</h3>
        <button className="toggle-btn">{expanded ? '−' : '+'}</button>
      </div>
      
      {/* ==================== COLLAPSIBLE CONTENT SECTION ==================== 
       * 
       * Main instructions content with conditional CSS classes for smooth
       * expand/collapse animations and comprehensive game information.
       * 
       * Content Organization:
       * - **Introduction**: Brief game context and setting
       * - **Movement Section**: Navigation mechanics and controls
       * - **Hints & Warnings**: Environmental cues and danger signals
       * - **Objectives**: Win conditions and special warnings
       */}
      <div className={`instructions-content ${expanded ? 'expanded' : ''}`}>
        
        {/* ========== GAME INTRODUCTION ========== 
         * 
         * Brief contextual introduction that sets player expectations
         * and establishes the game's atmosphere and premise.
         */}
        <p className="instructions-intro">
          You're exploring a maze-like cave system filled with mystery, danger, excitement and ancient treasures.
        </p>
        
        {/* ========== MOVEMENT MECHANICS SECTION ========== 
         * 
         * Comprehensive explanation of navigation systems and player controls,
         * covering both button-based and text-based input methods.
         * 
         * Movement Features Explained:
         * - **Room Connections**: 3-room connectivity pattern
         * - **Button Navigation**: Visual button interface for movement
         * - **Text Input**: Alternative keyboard-based navigation
         * - **Interface Flexibility**: Multiple input methods for user preference
         */}
        <h4>Movement</h4>
        <ul>
          <li>Each room connects to 3 others through tunnels.</li>
          <li>Click one of the brownish connecting room buttons to explore.</li>
          <li>Or type in a room number and hit "Explore."</li>
        </ul>
        
        {/* ========== ENVIRONMENTAL CUES SECTION ========== 
         * 
         * Critical gameplay information about environmental warnings and hints
         * that help players detect nearby dangers and opportunities.
         * 
         * Perception System Coverage:
         * - **Druika Detection**: Smell-based warning for main threat
         * - **Pit Awareness**: Draft sensation for environmental hazards
         * - **Bat Proximity**: Audio cue for creature encounters
         * - **Clue Sensitivity**: Emphasis on attention to detail
         * - **Exit Indication**: Fresh air signal for goal proximity
         */}
        <h4>Hints & Warnings</h4>
        <ul>
          <li>If you're one room away from the <strong>Druika</strong>, you'll smell it (and wish you hadn't).</li>
          <li>Near a pit? You'll feel a draft.</li>
          <li>Close to the bat? You'll hear flapping.</li>
          <li>Watch for subtle clues or you'll miss it!!!</li>
          <li>Near the exit? You'll feel fresh air.</li>
           <li>The input field can be used for either 
            selecting a room number  or an item number</li>
        </ul>
        
        {/* ========== OBJECTIVES AND WIN CONDITIONS SECTION ========== 
         * 
         * Clear explanation of player goals and special gameplay warnings
         * that affect strategy and long-term gameplay decisions.
         * 
         * Objective Components:
         * - **Treasure Map**: Primary collection requirement
         * - **All Treasures**: Complete collection necessity
         * - **Exit Strategy**: Win condition with treasure requirement
         * - **Behavioral Warning**: Special mechanic caution
         * 
         * Strategic Information:
         * - **Win Requirements**: Clear success criteria
         * - **Collection Goals**: Specific item requirements
         * - **Behavioral Consequences**: Warning about repetitive movement
         * - **Special CSS Class**: Highlighted warning for important mechanics
         */}
        <h4>Objectives</h4>
        <ul>
          <li>Collect the treasure map and all treasures.</li>
          <li>Find the exit with all treasures to save the village!</li>
          <li className="wizard-warning">Beware: Going back and forth between two rooms repeatedly may attract unwanted attention...</li>
        </ul>
      </div>
    </div>
  );
};

export default Instructions;