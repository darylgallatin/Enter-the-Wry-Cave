import React, { useState } from 'react';

const Instructions = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className='container instructions game-instructions'>
      <div className="instructions-header" onClick={() => setExpanded(!expanded)}>
        <h3>How to Play</h3>
        <button className="toggle-btn">{expanded ? '−' : '+'}</button>
      </div>
      
      <div className={`instructions-content ${expanded ? 'expanded' : ''}`}>
        <p className="instructions-intro">
          You're exploring a maze-like cave system filled with mystery, danger, excitement and ancient treasures. 
        </p>

        <h4>Movement</h4>
        <ul>
          <li>Each room connects to 3 others through tunnels.</li>
          <li>Click one of the brownish connecting room buttons to explore.</li>
          <li>Or type in a room number and hit “Explore.”</li>
        </ul>

        <h4>Hints & Warnings</h4>
        <ul>
          <li>If you're one room away from the <strong>Druika</strong>, you'll smell it (and wish you hadn’t).</li>
          <li>Near a pit? You’ll feel a draft.</li>
          <li>Close to the bat? You’ll hear flapping.</li>
          <li>Watch for subtle clues or you'll miss it!!!</li>
          <li>Near the exit? You’ll feel fresh air.</li>
        </ul>

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
