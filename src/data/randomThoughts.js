// Random thoughts to occasionally replace "All seems quiet here"

const randomThoughts = [
    // Humorous thoughts
    "Did I leave the medieval ironing board on?",
    "My torch tax return is definitely overdue now.",
    "I wonder if 'Druika' is its first name or last name?",
    "Did that drunk village elder mention anything about cave bats?",
    "I should have packed more snacks for this adventure.",
    "If I get out alive, I'm definitely asking for a raise.",
    "Next time I'll hire a Druika exterminator and stay home.",
    "Why do magical artifacts always end up in horrifying caves?",
    "I bet the Druika doesn't have to deal with dungeon dampness affecting its joints.",
    "That tavern job is looking pretty good right about now.",
    
    // Cave musings
    "The silence here feels almost... deliberate.",
    "I've lost track of time in this endless darkness.",
    "These cave formations must be at least older than my mother-in-law. Thousands of years old",
    "The air feels different in this part of the cave.",
    "Something about the echo in here feels unnatural.",
    "It's strangely peaceful when nothing is trying to eat me.",
    "The weight of the mountain above is almost palpable.",
    "The shadows seem to move differently in this chamber.",
    "My torch casts such strange patterns on these walls.",
    "I've never seen stone formations quite like these before.",
    "I'd pay good money if this insane cave would stop talking.",
    "When did that horrible wierd music emanating from the cave walls begin?",
    "To whom do I complain too about the service in this cave",
    // Character background thoughts
    "My mother always said my curiosity would lead me to strange places.",
    "I promised my sister I'd be back for the harvest festival.",
    "The village elder's warnings echo in my mind.",
    "Maybe father was right about me needing a 'real job'.",
    "I wonder if they're still looking for me back at the village.",
    "Will anyone remember my name if I don't return?",
    "I miss the smell of fresh bread from the village bakery.",
    "I should have said goodbye to Elric before I left.",
    "The artifact better be worth all this trouble.",
    "I hope someone fed my cat while I'm gone.",
    

    // Druika thoughts
   "What does a Druika eat when adventurers aren't available? 🍕 Cave pizza?",
"I wonder how old the Druika really is... probably still gets carded at the gift shop 🎂",
"Does the Druika have a family somewhere? Sunday dinners must be awkward 👨‍👩‍👧‍👦",
"Maybe the Druika is just misunderstood and needs a hug 🤗 (from very far away)",
"What if the Druika is also searching for the treasures? 💰 We could split them 70-30... I get 70",
"The Druika must know these caves better than anyone. Probably has a favorite coffee spot ☕",
"Are there baby Druika somewhere? Do they play peek-a-boo? 👶 Actually, let's not find out",
"Perhaps the Druika was human once, before switching to an all-mushroom diet 🍄",
"I wonder if anyone has ever befriended a Druika. BFF bracelets and everything? 👯‍♂️",
"What if I'm not hunting the Druika... but we're in an elaborate game of hide-and-seek? 🙈",
"Does the Druika have hobbies? Knitting? Sudoku? Interpretive dance? 💃",
"The Druika probably has strong opinions about pineapple on pizza 🍍",
"I bet the Druika gives terrible Yelp reviews: 'Adventurer was stringy, 2 stars' ⭐",
"Maybe the Druika just wants someone to play board games with 🎲",
"Plot twist: What if the Druika is writing thoughts about ME right now? 📝",
    
    // Village and curse thoughts
    "Will finding the treasures truly lift the village's curse?",
    "How many have tried this quest before me?",
    "The drought back home will only worsen if I fail.",
    "The elder's daughter looked so hopeful when I volunteered.",
    "The village needs those artifacts more than ever now.",
    "I can still hear the children coughing from the curse's effects.",
    "That odd merchant warned me about the cave's illusions.",
    "The ancient books mentioned something about the moon's alignment.",
    "Grandfather used to tell stories about these caves.",
    "The village hasn't seen rain in almost a year now."
  ];
  
  // Function to get a random thought or the default quiet message
  const getQuietMessage = () => {
    // 50% chance to show a random thought, 50% to show default message
    if (Math.random() < 0.5) {
      // Return default message
      return 'All seems quiet here.';
    }
    
    // Get a random thought
    const randomIndex = Math.floor(Math.random() * randomThoughts.length);
    const thought = randomThoughts[randomIndex];
    
    // Return both the default message and the random thought with varied endings
const endings = [
  "but what do I know? I'm just talking to myself in a cave that also talks .",
  "...or maybe that's just the echo of my sanity leaving.",
  "though the silence here has a suspicious quality to it.",
  "but my torch keeps flickering like it disagrees.",
  "assuming those aren't teeth I hear chattering in the darkness.",
  "...why did I just hear something giggle?",
  "at least that's what I keep telling myself.",
  "famous last words, probably.",
  "* nervously checks over shoulder *",
  "...wait, did that shadow just move?",
  "I should really stop thinking out loud.",
  "(note to self: stop narrating my own doom)",
  "...the cave seems to be listening though.",
  "but my paranoia and I respectfully disagree.",
  "...aaand now I've jinxed it.",
  "* whistles nervously in the dark *",
  "totally not suspicious at all. Nope.",
  "...why do I feel like I'm being watched? 👀",
  "I'm sure everything is PERFECTLY FINE.",
  "...did I mention I have trust issues with silence?",
];

// Pick a random ending
const randomEnding = endings[Math.floor(Math.random() * endings.length)];
return `${thought}, ${randomEnding}`;
  };
  
  export default getQuietMessage;