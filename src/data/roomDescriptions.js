// Updated room descriptions with whimsical dark humor
const roomDescriptions = [
   {
    text: "You enter a small, damp chamber where glittering minerals wink at you like the eyes of a thousand tiny critics. Among them, you spot unusual <span class='interactive-item' data-item='cave_salt'>salt-like crystals</span> with a subtle blue glow—nature's nightlight, apparently.",
    textAfterCollection: "You enter a small, damp chamber where glittering minerals continue their eternal staring contest with the darkness. Where you pried loose the glowing salt, a small hole remains.",
    mood: "calm",
    hasWater: false,
    special: null,
    sound: null,
    perception: "That looks like the salt I sometimes saw back in one of the elders home. They claimed it warded off evil spirits, though it never seemed to work on tax collectors.",
    hasInteractiveItem: true,
    interactiveItem: "cave_salt",
    keywords: ["minerals", "glittering", "damp"]
  },
  {
    text: "A narrow passage opens to a room where strange mushrooms dangle from the ceiling like nature's chandelier—if nature had questionable taste and a fondness for the macabre.",
    mood: "mysterious",
    hasWater: false,
    special: null,
    sound: null,
    perception: "Those mushrooms look like the same ones back home. The ones Granny used to say would either cure what ails you or ensure you'd never ail again.",
    keywords: ["mushrooms", "ceiling", "passage"]
  },
  {
    text: "You find yourself in a cavern decorated with ancient cave drawings depicting strange creatures engaged in what appears to be either ritual sacrifice or an aggressive game of charades.",
    enhancedText: "You find yourself in a cavern with ancient cave drawings depicting strange creatures in disturbing detail. Your lantern illuminates previously hidden artwork—the creatures are shown hunting humans in organized packs with the efficiency of a well-run bureaucracy. Symbols around their heads might represent telepathic abilities, or possibly just very fancy hats. One painting shows a ceremonial offering that looks suspiciously like a potluck dinner gone horribly wrong.",
    mood: "ancient",
    hasWater: false,
    special: null,
    sound: null,
    keywords: ["ancient", "drawings", "creatures"]
  },
  {
    text: "The room is littered with bones arranged in a pattern that suggests either ritualistic purpose or someone with too much time and a morbid sense of interior decorating. \nThe bones crunch as you try to step over them, but youre cave stepping skills leave a lot to be desired.\n",
    enhancedText: "The room is littered with bones in disturbing arrangements. Your lantern reveals gruesome details: tooth marks on human femurs (someone wasn't a vegetarian), deliberately arranged skulls forming a circle (cave art or dinner party seating?), and what appears to be a primitive altar made of larger bones—apparently even monsters need furniture. Fresh scratches in the stone suggest something still visits regularly, probably to rearrange the décor.",
    mood: "dangerous",
    hasWater: false,
    special: null,
    sound: "bones",
    perception: "The bones crunch under your feet with the musical quality of an orchestra warming up in hell. Some appear to be from animals, others... had dental work.",
    keywords: ["bones", "eating", "dangerous"]
  },
  {
    text: "You discover a chamber containing the remains of a previous explorer's camp. Their fate is unknown, though the claw marks on the tent suggest they didn't leave a forwarding address.",
    mood: "eerie",
    hasWater: false,
    special: null,
    sound: null,
    perception: "You see multiple dark stains frozen in time on the ground, arranged in what could either be signs of a great struggle or the world's most violent interpretive dance.",
    keywords: ["camp", "explorer", "remains"]
  },
  {
    text: "Water drips from stalactites with the rhythm of a metronome, creating nature's most monotonous symphony in this quiet chamber.",
    mood: "peaceful",
    hasWater: false,
    special: "waterfall",
    sound: "waterfall",
    perception: "You see the beginnings of stalagmites rising from the floor like Earth's slowest construction project, though some appear broken—apparently even rocks have bad days.",
    keywords: ["drip", "stalactites", "peaceful"]
  },
  {
    text: "The walls sport dark, root-like tendrils that are petrified yet warm to the touch—like fossilized spaghetti left too long in a supernatural microwave. Something vast once passed through here, probably looking for the bathroom.",
    mood: "tense",
    hasWater: false,
    special: "low_pulsing",
    perception: "A petrified coldness grips you while a low pulsating sound emanates from everywhere and nowhere, like the universe's worst case of indigestion. \n\nYou sense just out of eye site ghost like footprints appearing and disappearing out of sight",
    sound: null,
    keywords: ["roots", "warm", "druika", "tendrils", "echo"]
  },
  {
    text: "The walls of this chamber are unusually warm to the touch. Either there's geothermal activity, or the cave has a fever. You're not sure which is worse.",
    mood: "warm",
    hasWater: false,
    special: null,
    sound: null,
    keywords: ["warm", "walls", "touch"]
  },
  {
    text: "You find a <span class='interactive-item' data-item='lantern'>rusty lantern</span> and mining equipment scattered about like a yard sale nobody bothered to clean up. The miners never returned, probably found better jobs with dental benefits.",
    textAfterCollection: "You find mining equipment scattered about like breadcrumbs leading nowhere. The miners never returned, but their tools remain—world's saddest memorial.",
    mood: "abandoned",
    hasWater: false,
    special: null,
    sound: null,
    keywords: ["lantern", "mining", "equipment"],
    hasInteractiveItem: true,
    interactiveItem: "lantern",
    isLanternRoom: true
  },
  {
    text: "This chamber has an oddly perfect circular shape, as if carved by intelligent hands with an obsessive-compulsive need for geometry and too much time underground.",
    mood: "artificial",
    hasWater: false,
    special: null,
    sound: null,
    keywords: ["circular", "perfect", "carved"]
  },
  {
    text: "You discover crude writing on the wall: 'Beware!' followed by a tally of 17 marks. Either seventeen people failed to heed the warning, or one person was really bad at taking hints.",
    mood: "warning",
    hasWater: false,
    special: null,
    sound: null,
    keywords: ["writing", "warning", "tally"]
  },
  {
    text: "The ceiling soars so high your light barely reaches it, like nature's cathedral if nature worshipped darkness and things with wings. Something flutters up there, probably updating its Facebook status about the new visitor.",
    enhancedText: "The ceiling towers impossibly high, but your lantern penetrates the darkness to reveal vast stalactites hanging like nature's guillotines. Between them, you spot giant bat nests constructed from twigs and what appears to be the remains of 'I Survived The Cave' t-shirts—apparently, they didn't.",
    mood: "vast",
    hasWater: false,
    special: null,
    sound: "ceiling_flap",
    perception: "The sound of massive wings beating above makes you wonder if bats ever get performance anxiety. Better hope whatever's up there has stage fright.",
    keywords: ["ceiling", "high", "fluttering"]
  },
    {
      //text: "You find a backpack containing half-eaten rations (someone wasn't a stress eater) and a map that simply says 'RUN!' in what appears to be blood, ketchup, or very dramatic red ink.",
      text: "You find a backpack with half-eaten rations(someone wasn't a stress eater). Inside is a map that simply says 'RUN!' in what appears to be blood, ketchup, or very dramatic red ink.",
    //  text: "You find a backpack with half-eaten rations. Inside is a map that simply says 'RUN!'",
      mood: "frightening",
      hasWater: false,
      special: null,
      sound: null,
      keywords: ["backpack", "rations", "map"]
    },
  {
    text: "This chamber is filled with unusual crystals that glow with their own inner light, like nature's mood lighting set permanently to 'ominous with a chance of doom.'",
    enhancedText: "This chamber sparkles with unusual crystals glowing from within. Your lantern reveals hidden veins of what might be gold (retirement fund!) threading through the walls, and strange glyphs carved into crystal bases that probably say 'Do Not Touch' in an extinct language.",
    mood: "magical",
    hasWater: false,
    special: "crystal",
    sound: null,
    keywords: ["crystals", "glow", "magical"]
  },
  {
    text: "You step into a passage with ankle-deep water that's surprisingly warm. Each step creates splashes that echo like sarcastic applause in the darkness.",
    mood: "watery",
    hasWater: true,
    special: null,
    sound: null,
    keywords: ["water", "ankle-deep", "splashes"]
  },
  {
    text: "A shallow underground stream cuts through this cavern, flowing from an unknown source with the determination of a river late for an important appointment.",
    mood: "watery",
    hasWater: true,
    special: "stream",
    sound: null,
    keywords: ["stream", "flowing", "underground"]
  },
  {
    text: "You slip on something and nearly fall. The floor is covered in slime that has the consistency of regret and smells like broken promises.",
    mood: "gross",
    hasWater: false,
    special: null,
    sound: "slip",
    keywords: ["slime", "slip", "floor"]
  },
 {
  text: "You've discovered nature's worst-kept secret - the communal cave latrine. Various creatures have left their calling cards here, creating an olfactory museum of bad decisions.",
  mood: "humorous",
  hasWater: false,
  special: null,
  sound: "smell",
  perception: "The bouquet of aromas teaches you smells have flavors, and they're all terrible. Your nose files for workers' compensation.",
  keywords: ["smell", "latrine", "stench"]
},
  {
    text: "There's a small shrine here decorated with offerings of shiny rocks and what might be bottle caps. Cave goblins apparently have the aesthetic sense of magpies with poor taste.",
    mood: "curious",
    hasWater: false,
    special: "goblin",
    sound: "goblin",
    perception: "High-pitched cackles echo around you like a comedy club for the vertically challenged. The goblins seem to find your presence hilarious.",
    keywords: ["shrine", "offerings", "goblin"]
  },
  {
    text: "You find a table with cards and chips scattered about. Even cave dwellers enjoy poker night, though the stakes appear to involve teeth and possibly souls.",
    mood: "humorous",
    hasWater: false,
    special: null,
    sound: null,
    keywords: ["cards", "poker", "table"]
  },
{
     text: "Massive crystal columns stretch from floor to ceiling, refracting your light in dazzling patterns.",
    mood: "magical",
    hasWater: false,
    special: "crystal",
    sound: null,
    perception: "The crystals seem to sing faintly when you pass near, resonating with an otherworldly hum.",
    keywords: ["crystal-columns", "refracting", "dazzling"]
  },
  {
    text: "This chamber has a perfect echo. You whisper 'hello' and it returns as 'SILENCE! I'll Make you my pet!'... wait, that's not an echo. That's either advice or the cave has developed a weird sense of humor.",
    enhancedText: "This chamber has perfect acoustics for all the wrong reasons. Your lantern reveals walls carved with spiral patterns that amplify and distort sound like a demonic karaoke machine. In certain spots, you hear whispers offering unsolicited life advice and lottery numbers that are definitely wrong.",
    mood: "unsettling",
    hasWater: false,
    special: "echo",
    sound: "echo",
    keywords: ["echo", "whisper", "unsettling"]
  },
  {
    text: "You find a cave painting depicting a stick figure being carried off by a giant bat. How prophetic. The artist clearly had both talent and trauma.",
    mood: "ominous",
    hasWater: false,
    special: null,
    sound: null,
    keywords: ["painting", "bat", "stick-figure"]
  },
{
  text: "A pool of clear water covers most of the floor, creating nature's most inconvenient wading pool. Your footsteps create ripples that seem to spell out 'turn back' in aquatic morse code.",
  enhancedText: "A deceptively clear pool covers the floor. Your lantern penetrates to reveal surprising depths—at least twenty feet—littered with artifacts: <span class='interactive-item underwater-treasure' data-item='fools_gold'>glittering coins</span> (score!), <span class='interactive-item underwater-treasure' data-item='utility_knife'>ornate weapons</span> (concerning!), and <span class='interactive-item underwater-treasure' data-item='tarnished_bracelet'>exotic jewelry</span> (fancy!). Something moves in the depths, probably the world's most antisocial fish or a very wet ghost.",
  enhancedTextAfterDisturbance: "The once-clear pool now churns with agitation. Whatever dwells in the depths has been disturbed, and the water has turned murky and threatening.",
  mood: "watery",
  hasWater: true,
  special: null,
  sound: null,
  keywords: ["pool", "ripples", "clear-water"],
  hasPoolTreasures: true
},
  {
    text: "This part of the cave has flooded with cold water that soaks through your boots with the determination of a debt collector.",
    mood: "cold",
    hasWater: true,
    special: null,
    sound: null,
    keywords: ["flooded", "cold-water", "cold", "wade"]
  },
  {
    text: "This room contains strange rock formations that look suspiciously like furniture. Either nature has been watching too much HGTV, or someone had WAY too much time to arrange rocks.",
    mood: "quirky",
    hasWater: false,
    special: null,
    sound: null,
    keywords: ["furniture", "formations", "decor"]
  },
{
  text: "You discover a pile of shiny trinkets in the corner—someone's been collecting lost items like a kleptomaniac crow with organizational skills. Among them, a particularly <span class='interactive-item trinket-trap' data-item='shiny_trinkets'>enticing white golden bauble</span> catches your eye.",
  mood: "interesting",
  hasWater: false,
  special: "trinkets",
  sound: null,
  keywords: ["trinkets", "shiny", "collection"]
},
  {
    text: "The floor here is covered in soft sand that swirls mysteriously from the center, almost comfortable enough for a nap... if you ignore the ominous swirling and your impending doom.",
    mood: "tempting",
    hasWater: false,
    special: 'sand_creature',
    sound: null,
    keywords: ["sand", "soft", "comfortable"]
  },
  {
    text: "You find what looks like a cave gift shop complete with 'I survived the Ancient One's Caves' t-shirts (now half off, like your chances of survival)!",
    mood: "humorous",
    hasWater: false,
    special: 'gift',
    sound: null,
     perception: "UGH, very cheesy music of some horrible type is coming from the walls!\n\rThis being has no musical taste!",
    keywords: ["gift-shop", "t-shirts", "humorous"]
  },
  {
    text: "A frozen section where delicate ice formations hang from the ceiling like nature's chandelier, if nature shopped at the discount store and had a thing for sharp objects.",
    mood: "cold",
    hasWater: false,
    special: null,
    sound: null,
    perception: "Your breath forms clouds that seem to spell out 'BAD IDEA' before dissipating. The cold has a sense of humor, apparently.",
    keywords: ["ice", "frozen", "cold"]
  },
  {
    text: "Luminescent fungi crawl across the walls like nature's screensaver, providing an eerie blue-green glow that would be pretty if it wasn't so obviously plotting something.",
    enhancedText: "The crawling luminescent fungi create patterns your lantern reveals as disturbingly deliberate—either an ancient map or the universe's worst attempt at abstract art. A small opening in the wall at the pattern's center looks just suspicious enough to be interesting.",
    mood: "otherworldly",
    hasWater: false,
    special: "fungi_creature",
    sound: null,
    perception: "The glowing fungi pulse in rhythm like a visible heartbeat. The tingling on your skin suggests either magic or you're developing an allergy to adventure.",
    keywords: ["fungi", "luminescent", "glow"]
  },
   { 
    text: "This chamber contains a small, tranquil pool reflecting the ceiling like a perfect mirror, assuming mirrors could judge you silently. \nA cool but errie  biolumenessance glow emanates from the walls and even the pool",
    mood: "peaceful",
    hasWater: true,
    special: "water_spirit",
    sound: null,
    perception: "You sense something watching with the patience of a cat at a mouse hole, but wetter and probably more demanding.",
    keywords: ["tranquil", "mirror", "reflection"]
  },
  {
   text: "The unmistakable scent of sulfur fills this chamber like nature's worst aromatherapy session. Yellow <span class='interactive-item' data-item='sulfur_crystal'>sulfur crystals</span> line the walls like evil butterscotch.",
  enhancedText: "The sulfur stench intensifies as your lantern illuminates yellow  <span class='interactive-item' data-item='sulfur_crystal'>sulfur crystals</span> line the walls like evil butterscotch.  A corner reveals particularly large crystals that seem to glow with malice, and old mining cart tracks in the floor suggest someone once thought harvesting hell's candy was a good career move.",
  textAfterCollection:" The unmistakable scent of sulfur permeates this chamber like nature's worst aromatherapy session. The walls where you removed the crystals still emit a faint odor that brings tears to the eyes.",
  mood: "acrid",
  hasWater: false,
  special: null,
  sound: null,
  perception: "Your eyes water slightly from the mineral vapors rising from cracks in the floor.",
  keywords: ["sulfur", "yellow", "scent"],
  hasInteractiveItem: true,
  interactiveItem: "sulfur_crystal"
},
];

/**
 * Get a random room description
 * @returns {Object} Contains text, mood, hasWater, special and sound properties
 */
export const getRandomRoomDescription = () => {
  const randomIndex = Math.floor(Math.random() * roomDescriptions.length);
  return roomDescriptions[randomIndex];
};


/**
 * Get safe fallback descriptions for shifting rooms
 * @returns {Array} Safe room descriptions with no special effects
 */
export const getShiftingRoomFallbacks = () => [
  {
    text: "A chamber  where the walls seem to hum with a tune you can't quite place. Occasionally, you swear you hear someone humming along, slightly off-key.",
    mood: "mysterious",
    hasWater: false,
    special: null,
    sound: null,
    perception: "The humming sounds almost like... someone trying to remember a spell?"
  },
  {
    text: "The rocks here are arranged in what looks suspiciously like furniture. There's even a stone 'chair' with a cushion-shaped depression, as if someone spent centuries sitting here thinking.",
    mood: "whimsical",
    hasWater: false,
    special: null,
    sound: null,
    perception: "You notice a small circular pattern etched into the 'chair' arm - it matches something you've seen before..."
  },
  {
    text: "Crystalline formations on the ceiling spell out 'HELP ME' in a flowery script. Below it, someone has carved 'OR DON'T, I'M NOT YOUR BOSS' in much angrier lettering.",
    mood: "mysterious",
    hasWater: false,
    special: "echo",
    sound: null,
    perception: "The conflicting messages suggest someone with a complicated relationship with visitors."
  },
  {
    text: "This room contains what appears to be a failed attempt at cave art - stick figures that might be dancing or possibly having seizures. A note scratched below reads: 'Art was never my strong suit - W'",
    mood: "humorous",
    hasWater: false,
    special: null,
    sound: null,
    perception: "The 'W' signature appears in several places, always followed by self-deprecating comments."
  },
  {
    text: "Strange symbols cover one wall, possibly a magical formula or someone's grocery list written in an extinct language. Halfway through, it switches to 'MILK, EGGS, EYE OF NEWT, BREAD'",
    mood: "whimsical",
    hasWater: false,
    special: null,
    sound: null,
    perception: "Someone was clearly having trouble separating their work and personal life."
  },
  {
    text: "A perfectly circular depression in the floor suggests something orb-shaped once rested here. Above it, barely visible text reads: 'When energy meets crystal, paths reveal themselves to the desperate.'",
    mood: "mysterious",
    hasWater: false,
    special: null,
    sound: null,
    perception: "This seems like a riddle about using something round in a place of power..."
  },
  {
    text: "The walls are covered in tally marks grouped in sets of five. They stop at 10,847. A final note says: 'Stopped counting. Realized I AM the cave now. This is fine. Everything is fine.'",
    mood: "unsettling",
    hasWater: false,
    special: null,
    sound: null,
    perception: "Whoever was counting seemed to have an existential crisis around day 10,847."
  },
  {
    text: "This chamber has been converted into what looks like a makeshift laboratory. Beakers carved from stone hold crystallized residues. A journal entry is etched into the wall: 'Day ??? - Still seeking the Stone of Unbinding. May have accidentally bound myself instead. Whoops.'",
    mood: "mysterious",
    hasWater: false,
    special: null,
    sound: null,
    perception: "Among the carved formulas, you notice repeated references to 'placing the mundane within the arcane.'"
  },
  {
    text: "Someone has carved an elaborate complaint box into the wall. Recent entries include: 'Wumpus snores too loud', 'Bats have no concept of personal space', and 'WOULD IT KILL YOU PEOPLE TO WIPE YOUR FEET?'",
    mood: "humorous",
    hasWater: false,
    special: null,
    sound: null,
    perception: "The handwriting on all complaints appears to be the same..."
  },
  {
    text: "A small shrine dedicated to 'The God of Lost Things' sits in the corner. Offerings include single socks, pen caps, and a note saying 'My sanity - if found, please return to the wizard trapped in the cave consciousness.'",
    mood: "whimsical",
    hasWater: false,
    special: null,
    sound: null,
    perception: "Well, that's surprisingly direct about the wizard situation."
  }
];




/**
 * Get CSS properties based on the mood of the room
 * @param {string} mood The mood of the room
 * @returns {Object} CSS properties to apply
 */
export const getMoodStyles = (mood) => {
  const moodStyles = {
    calm: {
      background: 'linear-gradient(135deg, #7474BF, #348AC7)',
      transition: 'background 1.5s ease'
    },
    mysterious: {
      background: 'linear-gradient(135deg, #4A00E0, #8E2DE2)',
      transition: 'background 1.5s ease'
    },
    ancient: {
      background: 'linear-gradient(135deg, #8B4513, #A0522D)',
      transition: 'background 1.5s ease'
    },
    dangerous: {
      background: 'linear-gradient(135deg, #CB356B, #BD3F32)',
      transition: 'background 1.5s ease'
    },
    eerie: {
      background: 'linear-gradient(135deg, #3A1C71, #D76D77)',
      transition: 'background 1.5s ease'
    },
    peaceful: {
      background: 'linear-gradient(135deg, #2193b0, #6dd5ed)',
      transition: 'background 1.5s ease'
    },
    tense: {
      background: 'linear-gradient(135deg, #FF416C, #FF4B2B)',
      transition: 'background 1.5s ease'
    },
    warm: {
      background: 'linear-gradient(135deg, #f12711, #f5af19)',
      transition: 'background 1.5s ease'
    },
    abandoned: {
      background: 'linear-gradient(135deg, #485563, #29323c)',
      transition: 'background 1.5s ease'
    },
    artificial: {
      background: 'linear-gradient(135deg, #334d50, #cbcaa5)',
      transition: 'background 1.5s ease'
    },
    warning: {
      background: 'linear-gradient(135deg, #FF512F, #DD2476)',
      transition: 'background 1.5s ease'
    },
    vast: {
      background: 'linear-gradient(135deg, #0F2027, #203A43, #2C5364)',
      transition: 'background 1.5s ease'
    },
    frightening: {
      background: 'linear-gradient(135deg, #200122, #6f0000)',
      transition: 'background 1.5s ease'
    },
    magical: {
      background: 'linear-gradient(135deg, #5B247A, #1BCEDF)',
      transition: 'background 1.5s ease'
    },
    watery: {
      background: 'linear-gradient(135deg, #1A2980, #26D0CE)',
      transition: 'background 1.5s ease'
    },
    gross: {
      background: 'linear-gradient(135deg, #3CA55C, #B5AC49)',
      transition: 'background 1.5s ease'
    },
    humorous: {
      background: 'linear-gradient(135deg, #FFAFBD, #ffc3a0)',
      transition: 'background 1.5s ease'
    },
    curious: {
      background: 'linear-gradient(135deg, #9CECFB, #65C7F7, #0052D4)',
      transition: 'background 1.5s ease'
    },
    unsettling: {
      background: 'linear-gradient(135deg, #5614B0, #DBD65C)',
      transition: 'background 1.5s ease'
    },
    ominous: {
      background: 'linear-gradient(135deg, #141E30, #243B55)',
      transition: 'background 1.5s ease'
    },
    quirky: {
      background: 'linear-gradient(135deg, #42275a, #734b6d)',
      transition: 'background 1.5s ease'
    },
    interesting: {
      background: 'linear-gradient(135deg, #004FF9, #FFF94C)',
      transition: 'background 1.5s ease'
    },
    tempting: {
      background: 'linear-gradient(135deg, #F7971E, #FFD200)',
      transition: 'background 1.5s ease'
    }
  };

  // Add wizard style
  moodStyles.wizard = {
    background: 'linear-gradient(135deg, #6A0DAD, #9370DB)',
    transition: 'background 1.5s ease',
    animation: 'pulse-magic 2s infinite'
  };
  
  return moodStyles[mood] || moodStyles.mysterious;
};

/**
 * Get all room descriptions without randomization
 * @returns {Array} All room descriptions
 */

export const getAllRoomDescriptions = () => {
  return roomDescriptions;
};


export default roomDescriptions;