// ==================== FADE-IN PARAGRAPHS ANIMATION COMPONENT ====================
/**
 * FadeInParagraphs.js - Advanced sequential text animation with user controls
 * 
 * This sophisticated animation component creates engaging narrative experiences
 * through timed, sequential text reveals. It provides smooth fade-in animations
 * with vertical translation effects, user skip functionality, and flexible
 * timing controls for optimal storytelling pacing.
 * 
 * Key Features:
 * - **Sequential Animation**: Paragraphs appear one by one with configurable timing
 * - **Smooth Transitions**: Combined opacity and transform animations
 * - **User Skip Control**: Click-to-skip functionality for impatient users
 * - **Flexible Configuration**: Customizable animation duration and delays
 * - **Warning Text Support**: Special handling for concluding warning messages
 * - **Progress Indication**: Visual cues for skip availability
 * 
 * Animation Techniques:
 * - **Opacity Transitions**: Smooth fade-in from transparent to opaque
 * - **Vertical Translation**: Subtle upward movement (translateY) for dynamic feel
 * - **Eased Timing**: Different easing functions for opacity vs transform
 * - **State-Driven Styling**: CSS properties controlled by React state
 * 
 * User Experience Design:
 * - **Immediate Start**: First paragraph appears instantly to avoid delay
 * - **Comfortable Pacing**: Default 600ms delays provide good reading rhythm
 * - **Skip Accessibility**: Large click area and clear skip indication
 * - **Visual Feedback**: Cursor pointer indicates interactive area
 */
import React, { useEffect, useState } from 'react';

// ==================== FADE-IN PARAGRAPHS COMPONENT DEFINITION ====================
/**
 * Main FadeInParagraphs functional component with comprehensive prop interface
 * 
 * @param {string[]} paragraphs - Array of paragraph text strings to animate
 * @param {number} fadeDuration - Duration of fade-in animation in milliseconds (default: 800)
 * @param {number} paragraphDelay - Delay between paragraph reveals in milliseconds (default: 600)
 * @param {string} warningText - Optional warning text to display after all paragraphs
 */
const FadeInParagraphs = ({ paragraphs, fadeDuration = 800, paragraphDelay = 600, warningText }) => {
  
  // ==================== ANIMATION STATE MANAGEMENT ====================
  /**
   * Sophisticated state system for controlling sequential animation progression
   * 
   * This state management system orchestrates the complex timing and progression
   * of the sequential animation, tracking both the current animation state and
   * user interaction override capabilities.
   */
  
  // ========== TOTAL CONTENT CALCULATION ==========
  /**
   * Dynamic calculation of total content items to animate
   * 
   * Calculates the total number of items (paragraphs + optional warning text)
   * that need to be animated, providing the endpoint for the animation sequence.
   * 
   * Calculation Logic:
   * - **Base Count**: paragraphs.length provides the main content count
   * - **Warning Addition**: Adds 1 if warningText exists
   * - **Dynamic Adaptation**: Automatically adjusts to content changes
   * - **Animation Endpoint**: Defines when animation sequence is complete
   */
  const totalParagraphs = paragraphs.length + (warningText ? 1 : 0);
  
  // ========== ANIMATION PROGRESSION STATE ==========
  /**
   * Core animation state variables for controlling reveal progression
   * 
   * These state variables work together to manage the sophisticated timing
   * and user interaction capabilities of the animation system.
   */
  const [visibleCount, setVisibleCount] = useState(0);     // Number of currently visible paragraphs
  const [skipped, setSkipped] = useState(false);           // Flag indicating user has skipped animation

  // ==================== SEQUENTIAL ANIMATION EFFECT ====================
  /**
   * Master animation controller with intelligent timing and skip handling
   * 
   * This effect orchestrates the entire animation sequence, managing both
   * automatic progression and user-initiated skipping. It implements
   * sophisticated timing logic to create engaging narrative pacing.
   * 
   * Animation Phases:
   * 1. **Immediate Start**: First paragraph appears instantly (no delay)
   * 2. **Sequential Progression**: Subsequent paragraphs appear with delays
   * 3. **Completion Detection**: Stops when all content is visible
   * 4. **Skip Override**: User interaction can bypass timing
   * 
   * Technical Features:
   * - **Zero-Delay Start**: Immediate first paragraph prevents perceived lag
   * - **Timer Management**: Proper setTimeout cleanup prevents memory leaks
   * - **Skip Integration**: skipped flag immediately stops automatic progression
   * - **State Synchronization**: visibleCount drives all animation states
   * 
   * Timing Logic:
   * - **First Paragraph**: Appears immediately (visibleCount 0 → 1)
   * - **Subsequent Paragraphs**: Use paragraphDelay for pacing
   * - **Completion**: Stops when visibleCount reaches totalParagraphs
   * - **User Override**: Skip functionality bypasses all timers
   * 
   * Performance Considerations:
   * - **Efficient Cleanup**: Timer cleanup prevents memory leaks
   * - **Conditional Execution**: Only runs when animation should progress
   * - **State Minimization**: Minimal state updates for smooth performance
   * - **Early Returns**: Efficient logic flow with appropriate early exits
   */
  useEffect(() => {
    // ========== IMMEDIATE START LOGIC ==========
    // Start showing the first paragraph immediately to avoid perceived delay
    if (visibleCount === 0) {
      setVisibleCount(1);
      return;
    }
    
    // ========== SEQUENTIAL PROGRESSION LOGIC ==========
    // Sequentially reveal all paragraphs + warning with timing delays
    if (visibleCount < totalParagraphs && !skipped) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, paragraphDelay);
      
      // ========== CLEANUP FUNCTION ==========
      return () => clearTimeout(timer);
    }
  }, [visibleCount, totalParagraphs, paragraphDelay, skipped]);

  // ==================== USER SKIP FUNCTIONALITY ====================
  /**
   * Instant animation skip handler for user convenience
   * 
   * This function provides immediate animation completion when users want
   * to skip the timed sequence and see all content instantly. It demonstrates
   * excellent user experience design by respecting user agency.
   * 
   * Skip Features:
   * - **Immediate Completion**: Sets visibleCount to maximum instantly
   * - **Skip Flag**: Sets skipped flag to prevent further automatic progression
   * - **User Agency**: Respects user preference for faster content consumption
   * - **State Synchronization**: Ensures all content becomes visible immediately
   * 
   * UX Benefits:
   * - **Accessibility**: Accommodates users with different reading preferences
   * - **Efficiency**: Allows quick content consumption for returning users
   * - **Control**: Gives users control over their experience pacing
   * - **Responsiveness**: Immediate response to user interaction
   */
  const handleSkip = () => {
    setSkipped(true);
    setVisibleCount(totalParagraphs);
  };

  // ==================== MAIN COMPONENT RENDER ====================
  /**
   * Sophisticated render method with dynamic styling and user interaction
   * 
   * This render creates a fully interactive animation container with
   * state-driven styling that responds to animation progression and
   * provides clear user feedback and control options.
   */
  return (
    // ========== INTERACTIVE CONTAINER ==========
    /**
     * Main container with click-to-skip functionality
     * 
     * The container serves as both the animation viewport and the interaction
     * area for skip functionality, with appropriate cursor styling to indicate
     * interactivity to users.
     * 
     * Container Features:
     * - **Full-Area Click**: Entire container is clickable for easy skipping
     * - **Cursor Indication**: Pointer cursor indicates interactivity
     * - **Event Delegation**: Single event handler for entire animation area
     * - **Accessibility**: Large click target for easy user interaction
     */
    <div onClick={handleSkip} style={{ cursor: 'pointer' }}>
      
      {/* ==================== MAIN PARAGRAPH ANIMATION ==================== 
       * 
       * Dynamic paragraph rendering with sophisticated state-driven styling
       * that creates smooth, engaging animation effects for each text element.
       */}
      {paragraphs.map((para, i) => (
        <p
          key={i}
          style={{
            // ========== OPACITY ANIMATION ==========
            // Smooth fade-in effect based on visibility state
            opacity: i < visibleCount ? 1 : 0,
            
            // ========== TRANSFORM ANIMATION ==========
            // Subtle vertical translation for dynamic movement
            transform: i < visibleCount ? 'translateY(0)' : 'translateY(20px)',
            
            // ========== TRANSITION CONFIGURATION ==========
            // Sophisticated easing with different functions for different properties
            transition: `opacity ${fadeDuration}ms ease-in, transform ${fadeDuration}ms ease-out`,
          }}
        >
          {para}
        </p>
      ))}
      
      {/* ==================== CONDITIONAL WARNING TEXT ==================== 
       * 
       * Special handling for optional warning text with distinct styling
       * and animation timing that appears after all main paragraphs.
       */}
      {warningText && (
        <p
          className="intro-warning"
          style={{
            // ========== WARNING-SPECIFIC VISIBILITY LOGIC ==========
            // Warning appears only after all main paragraphs are visible
            opacity: visibleCount > paragraphs.length ? 1 : 0,
            transform: visibleCount > paragraphs.length ? 'translateY(0)' : 'translateY(20px)',
            
            // ========== CONSISTENT ANIMATION TIMING ==========
            // Uses same transition configuration as main paragraphs
            transition: `opacity ${fadeDuration}ms ease-in, transform ${fadeDuration}ms ease-out`,
          }}
        >
          {warningText}
        </p>
      )}
      
      {/* ==================== SKIP INSTRUCTION DISPLAY ==================== 
       * 
       * Conditional skip instruction that appears while animation is in progress
       * to inform users about the skip functionality availability.
       */}
      {visibleCount < totalParagraphs && (
        <p style={{ 
          textAlign: 'center', 
          fontStyle: 'italic', 
          color: '#aaa', 
          marginTop: '20px' 
        }}>
          (Click to skip)
        </p>
      )}
    </div>
  );
};

export default FadeInParagraphs;