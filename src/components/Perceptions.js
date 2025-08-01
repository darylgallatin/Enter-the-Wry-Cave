import React from 'react';

const Perceptions = ({ perceptions, gameStatus }) => {
  if (perceptions.length === 0 || gameStatus !== 'playing') {
    return null;
  }

  return (
    <div className='perceptions'>
      {perceptions.map((perception, index) => {
        // Check if this is the fungi pulsing perception
        const isFungiPerception = perception.includes('glowing fungi seem to pulse');
        
        // Check if this is a water droplet perception
        const isWaterPerception = perception.includes('droplets') && 
                                 (perception.includes('melody') || 
                                  perception.includes('patter'));
        
        // Apply the appropriate class based on perception type
        let perceptionClass = 'perception';
        if (isFungiPerception) {
          perceptionClass += ' fungi-perception';
        } else if (isWaterPerception) {
          perceptionClass += ' water-perception';
        }
        
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