// Cave's sarcastic messages to the player
export const getRandomCaveMessage = () => {
    // Check if wizard has been freed
  if (window.WIZARD_FREED) {
    return null; // No more cave messages
  }
  const caveMessages = [
    "Oh, you're still alive? I had 50 gold riding on you falling in a pit by now. 🎲",
    "Your spouse called. They're redecorating your room into a yoga studio. 🧘‍♀️",
    "Weather update: 100% chance of darkness with a strong possibility of teeth. 🌧️",
    "ADVERTISEMENT: Visit Throk's Gift Shop! Our t-shirts outlast most adventurers! 🛍️",
    "Fun fact: You're the 47th person to enter this room. The other 46? Let's not talk about them... 💀",
    "The cave bookies are taking bets on your demise. Pit death is 3:1, Druika is 2:1. 📊",
    "Your torch insurance company called. They're denying your claim. 🔥",
    "Breaking news: Local Druika voted 'Most Likely to Eat You' three years running! 🏆",
    "Today's horoscope: Avoid tall dark strangers. Especially hairy ones with claws. ♈",
    "Did you know? This cave has a 1-star Yelp review. Something about 'too many deaths.' ⭐",
    "Your mother sent a message: 'Are you eating enough? The Druika looks well-fed.' 🍽️",
    "SALE! Grok's Gift Shop: 20% off 'I Almost Survived' memorial plaques! 🪦",
    "Cave tip #73: That sound behind you? Probably nothing. Definitely not teeth. 😬",
    "Status update: You've walked 2,847 steps today. The Druika? Only 6. It's gaining. 👣",
    "Weather alert: Chance of survival dropping faster than cave temperature. ❄️",
    "Your life insurance company wants to discuss your 'high-risk lifestyle choices.' 📋",
    "Survey says: 9 out of 10 caves prefer their adventurers lightly seasoned. 🧂",
    "The bats have started a betting pool. You lasting another hour is 10:1 odds. 🦇",
    "PSA: The gift shop now accepts IOUs from 'probably doomed' adventurers! 💳",
    "Remember: If you die,Throk gets your stuff. It's in the fine print. 📜",
  ];
  
  return caveMessages[Math.floor(Math.random() * caveMessages.length)];
};

// You could also export specific message categories if you want
export const deathPredictions = [
  "I give you 10 more minutes. 15 if you're lucky.",
  "The smart money says you won't see tomorrow.",
  "Even the bats are making funeral arrangements.",
];

export const giftShopAds = [
  "Throk's Gift Shop: Where your gold goes when you don't!",
  "NEW at Throk's: 'My parent went to a cursed cave and all I got was this orphan status' shirts!",
  "Throk's having a sale: Buy 2 souvenirs, get a free eulogy!",
];


export const getContextualCaveMessage = (gameState) => {
  const { torchLevel, moveCounter, inventory, collectedTreasures, treasurePieces } = gameState;

   // Check if wizard has been freed
  if (window.WIZARD_FREED) {
    return null; // No more cave messages
  }
  // Check for active lantern
  const hasActiveLantern = inventory.some(item => 
    (item.originalId || item.id) === 'lantern' && item.isActive && item.fuel > 0
  );
  
  console.log("CAVE MESSAGE - Checking context:", {
    torchLevel,
    hasActiveLantern,
    moveCounter,
    hasOil: inventory.some(item => (item.originalId || item.id) === 'torch_oil'),
    treasureProgress: `${collectedTreasures.length}/${treasurePieces.length}`
  });
  
  // Torch-based messages - but consider lantern
  if (torchLevel <= 15 && !hasActiveLantern) {
    console.log("CAVE MESSAGE - Torch critically low, no lantern");
    const darkMessages = [
      "Dying in the dark? How original. The last 12 adventurers tried that too. 🕯️",
      "Pro tip: Torches work better when they're actually lit. Just saying. 💡",
      "I'd offer you a light, but I'm a cave. I don't have thumbs. 🔦",
    ];
    return darkMessages[Math.floor(Math.random() * darkMessages.length)];
  }
  
  // Special messages for torch out but lantern on
  if (torchLevel === 0 && hasActiveLantern) {
    console.log("CAVE MESSAGE - Torch out but lantern active");
    const lanternMessages = [
      "Fancy magical lantern you've got there. Compensating for something? 🏮",
      "Oh look, someone brought their night light. How precious. 🏮",
      "That glowing bauble won't save you from what's coming. But it's pretty! ✨",
    ];
    return lanternMessages[Math.floor(Math.random() * lanternMessages.length)];
  }
  
  if (torchLevel < 60 && !hasActiveLantern) {
    console.log("CAVE MESSAGE - Torch getting low");
    const lowTorchMessages = [
      "I see you're going for the 'dying in the dark' achievement. Bold choice! 🕯️",
      "Your torch is dimmer than your future. Impressive! 🕯️",
      "Running low on light? The Druika prefers its meals in the dark anyway. 🌑",
    ];
    return lowTorchMessages[Math.floor(Math.random() * lowTorchMessages.length)];
  }
  
  // Move counter messages
  if (moveCounter > 30) {
    console.log("CAVE MESSAGE - High move count (30+)");
    return "30 moves and still alive? The cave elders owe me money. 💸";
  } else if (moveCounter > 20) {
    console.log("CAVE MESSAGE - Medium move count (20+)");
    return "20 moves already? Most people don't last this long. I'm almost impressed. Almost. 🎯";
  }
  
  // Treasure progress messages
  const treasureRatio = treasurePieces.length > 0 ? collectedTreasures.length / treasurePieces.length : 0;
  if (treasureRatio > 0.5 && treasureRatio < 1) {
    console.log("CAVE MESSAGE - Treasure progress over 50%");
    return `Over halfway done with treasures? Don't get cocky. That's when they usually die. 💎`;
  }
  
  // Inventory-based messages - consider both torch oil and lantern
  const hasOil = inventory.some(item => (item.originalId || item.id) === 'torch_oil');
  if (torchLevel < 50 && !hasOil && !hasActiveLantern) {
    console.log("CAVE MESSAGE - Low torch, no oil, no lantern");
    return "No torch oil? No backup light? Living dangerously, I see. The darkness approves. 🛢️";
  }
  
  // No special context - return null to use random message
  console.log("CAVE MESSAGE - No special context found");
  return null;
};