// Enhanced gold coin description and lore for the game
// For the main bag of gold coins (10 coins)
export const goldCoinDescription = {
  name: "Ancient Wyrm Coins",
  description: "These gold coins appear to be from a lost civilization. Each bears the image of a serpentine dragon coiled around a mountain peak on one side and strange angular runes on the reverse. Unlike the simple stamped copper and silver coins used in the village, these are intricately carved pure gold and haven't been seen in centuries.",
  lore: "Local legends speak of the Serpent Kings who ruled these mountains before recorded history. Their coins were said to grant protection from cave creatures and safe passage through the deepest tunnels. Village elders claim the Wumpus itself was once the guardian of the Serpent Kings' treasury, becoming corrupted after centuries of isolation.",
  inspectionText: "You examine the coins more closely. The dragon-like creature has intricate scale patterns and piercing eyes that seem to follow you as you tilt the coin. The runes on the reverse form a circular pattern that village scholars have never been able to translate. The metal is surprisingly warm to the touch."
};

// For the single coin found in canvas bag
export const singleGoldCoinDescription = {
  name: "Ancient Wyrm Coin",
  description: "A single gold coin of ancient origin. Unlike the copper and silver currency used in the countryside, this coin is pure gold with the image of a coiled serpent on the obverse and mysterious runes on the reverse.",
  lore: "This appears to be one of the legendary Serpent King coins. According to village myth, these coins once served as talismans against cave spirits and would glow faintly in the presence of danger.",
  inspectionText: "The coin is remarkably heavy for its size, suggesting it's made of pure gold. The serpent design is worn but still clearly visible, its eyes seemingly fixed on you as you rotate the coin. The runes on the back form a spiral pattern that seems to subtly shift in the torchlight."
};

// When showing gold coins in the gift shop
export const shopkeeperGoldCoinDialogue = [
    // Coin-focused lines
    "The shopkeeper’s eyes widen at your Ancient Wyrm Coins. 'Those haven’t surfaced since the age of the Rooted Kings… back when Druika still listened from beneath the stone.'",
  
    "'Those coins you’re flashing around,' the orc goblin mutters, scratching something that might be a scar or just mold, 'were once left to keep Druika dreaming. Too many in one pocket? That’s a loud noise to something that eats quiet.'",
  
    "The shopkeeper snorts. 'Those coins were part of a pact, y'know — clink the gold, seal the silence. Then someone forgot. And Druika... didn’t. Their head is too big to forget'",
  
    "'My cousin’s cousin swore those coins glow blue near bone piles. Said it meant Druika passed by. Course, he also licked cave frogs recreationally. and created epic nonsensical poetry'",
  
    "'Might wanna spend those quick. Druika counts things. Especially shiny things.  Especially if you’re still breathing. Also it cheats.'",
  
    // Lore-only lines
    "'Druika doesn’t walk. That’s the mistake people make. It spreads wide . Like mold, but louder.'",
  
    "'They etched runes in the rock to keep Druika bound. Don’t know if it worked. Still hear scratching some nights.'",
  
    "The orc goblin sniffs the air. 'Smells like someone stirred up the old hunger. Either that or the mushroom stew’s gone sentient again.'",
  
    // Mixed or quirky item references
    "'Ah, the cuddley monster plushie! Squeeze it if you must, but don’t blame me when something hairy starts looking for hugs… with teeth.'",
  
  //  "The shopkeeper eyes the Null Orb and frowns. 'That thing hums like my third ex. Don’t trust it, and don’t drop it near mirrors.'",
  
    // On foot traffic
    "'Not many folks come through here. Goblins, maybe. Night critters with teeth. A couple adventurers now and then. Mostly I just sell weird junk to whatever's still twitching and then collect it back from their bodies .'",
  
    "'One guy came in, bought five torches, a cursed mug, and walked into the cave singing. Never saw him again. Left his sandwich, though.'"
  ];

// Random shopkeeper dialogue about coins
export const getRandomCoinDialogue = () => {
  return shopkeeperGoldCoinDialogue[Math.floor(Math.random() * shopkeeperGoldCoinDialogue.length)];
};