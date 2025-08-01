const treasureClues = () => {
    // Create direct matches between room descriptions and clues
    return {
      // Updated to match new whimsical descriptions
      "You enter a small, damp chamber where glittering minerals wink at you like the eyes of a thousand tiny critics. Among them, you spot unusual <span class='interactive-item' data-item='cave_salt'>salt-like crystals</span> with a subtle blue glow—nature's nightlight, apparently.": {
        ruby: "The ruby glows brightly among glittering minerals that wink like tiny critics.",
        medallion: "The medallion is half-buried among minerals that sparkle with judgmental gleams.",
        statue: "The jade figurine sits atop a shelf of glittering minerals, unimpressed by their sparkle.",
        amulet: "The crystal amulet blends with the winking minerals, playing hide-and-seek."
      },
      "A narrow passage opens to a room where strange mushrooms dangle from the ceiling like nature's chandelier—if nature had questionable taste and a fondness for the macabre.": {
        ruby: "The ruby pulses rhythmically near mushrooms that dangle like macabre chandeliers.",
        medallion: "The medallion dangles among strange mushrooms competing for worst décor.",
        statue: "The jade figurine is nestled between ceiling mushrooms with questionable taste.",
        amulet: "The crystal amulet hangs near mushrooms that would make any decorator weep."
      },
      "You find yourself in a cavern decorated with ancient cave drawings depicting strange creatures engaged in what appears to be either ritual sacrifice or an aggressive game of charades.": {
        ruby: "The ruby was placed near cave drawings of creatures playing deadly charades.",
        medallion: "The medallion appears in ancient drawings, possibly as a game prize.",
        statue: "The jade figurine stands before cave art depicting history's worst party games.",
        amulet: "The crystal amulet illuminates drawings of what might be charades gone wrong."
      },
      "The room is littered with bones arranged in a pattern that suggests either ritualistic purpose or someone with too much time and a morbid sense of interior decorating.": {
        ruby: "The ruby rests atop bones arranged by history's most disturbed decorator.",
        medallion: "The medallion hangs from a skeletal finger in the macabre décor.",
        statue: "The jade figurine sits among bones like a grim interior design statement.",
        amulet: "The crystal amulet is clutched by bony fingers with excellent taste in jewelry."
      },
      "You discover a chamber containing the remains of a previous explorer's camp. Their fate is unknown, though the claw marks on the tent suggest they didn't leave a forwarding address.": {
        ruby: "The ruby lies forgotten in a camp whose owner forgot to leave a forwarding address.",
        medallion: "The medallion was left at a campsite decorated with involuntary claw art.",
        statue: "The jade figurine sits beside a tent with aggressive ventilation holes.",
        amulet: "The crystal amulet hangs from a tent pole in a permanently vacated camp."
      },
      "Water drips from stalactites with the rhythm of a metronome, creating nature's most monotonous symphony in this quiet chamber.": {
        ruby: "The ruby gleams beneath nature's most boring water symphony.",
        medallion: "The medallion catches droplets from the world's dullest concert.",
        statue: "The jade figurine endures water dripping with metronomic tedium.",
        amulet: "The crystal amulet hangs where water performs its monotonous opus."
      },
      "The walls sport dark, root-like tendrils that are petrified yet warm to the touch—like fossilized spaghetti left too long in a supernatural microwave. Something vast once passed through here, probably looking for the bathroom.": {
        ruby: "The ruby sits among tendrils of supernatural spaghetti gone wrong.",
        medallion: "The medallion hangs from petrified roots still warm from cosmic microwaving.",
        statue: "The jade figurine stands among fossilized tendrils left by something seeking facilities.",
        amulet: "The crystal amulet dangles between roots that suggest a creature with poor timing."
      },
      "The walls of this chamber are unusually warm to the touch. Either there's geothermal activity, or the cave has a fever. You're not sure which is worse.": {
        ruby: "The ruby pulses with heat in a chamber running a geological fever.",
        medallion: "The medallion feels warm in this cave's feverish embrace.",
        statue: "The jade figurine seems unbothered by the cave's temperature tantrum.",
        amulet: "The crystal amulet glows in sympathy with the feverish walls."
      },
      "You find a <span class='interactive-item' data-item='lantern'>rusty lantern</span> and mining equipment scattered about like a yard sale nobody bothered to clean up. The miners never returned, probably found better jobs with dental benefits.": {
        ruby: "The ruby sits beside equipment from history's saddest yard sale.",
        medallion: "The medallion hangs near mining tools abandoned for better benefits.",
        statue: "The jade figurine watches over equipment left by career-minded miners.",
        amulet: "The crystal amulet reflects light from a lantern whose owner found better work."
      },
      "This chamber has an oddly perfect circular shape, as if carved by intelligent hands with an obsessive-compulsive need for geometry and too much time underground.": {
        ruby: "The ruby sits centered in a room carved by a geometric perfectionist.",
        medallion: "The medallion adorns walls shaped by someone with OCD and time to spare.",
        statue: "The jade figurine stands in a circle made by history's most pedantic sculptor.",
        amulet: "The crystal amulet hangs in a chamber that screams 'perfectionist was here'."
      },
      "You discover crude writing on the wall: 'Beware!' followed by a tally of 17 marks. Either seventeen people failed to heed the warning, or one person was really bad at taking hints.": {
        ruby: "The ruby rests beneath warnings ignored by seventeen optimists or one slow learner.",
        medallion: "The medallion hangs under tally marks counting poor life choices.",
        statue: "The jade figurine sits before a wall chronicling stubbornness or stupidity.",
        amulet: "The crystal amulet dangles near evidence of natural selection at work."
      },
      "The ceiling soars so high your light barely reaches it, like nature's cathedral if nature worshipped darkness and things with wings. Something flutters up there, probably updating its FaceCavewall status about the new visitor.": {
        ruby: "The ruby glows beneath a ceiling where creatures post about visitors.",
        medallion: "The medallion reflects light in nature's social media cathedral.",
        statue: "The jade figurine gazes up at residents too busy tweeting to attack.",
        amulet: "The crystal amulet catches light beneath the cave's status-updating inhabitants."
      },
      "You find a backpack containing half-eaten rations (someone wasn't a stress eater) and a map that simply says 'RUN!' in what appears to be blood, ketchup, or very dramatic red ink.": {
        ruby: "The ruby was hidden with rations by someone who wasn't stress-eating.",
        medallion: "The medallion was tucked beside a map written in dramatic red... something.",
        statue: "The jade figurine was wrapped by someone who chose fleeing over snacking.",
        amulet: "The crystal amulet dangles from a pack whose owner had priorities."
      },
      "This chamber is filled with unusual crystals that glow with their own inner light, like nature's mood lighting set permanently to 'ominous with a chance of doom.'": {
        ruby: "The ruby's glow complements nature's pessimistic mood lighting.",
        medallion: "The medallion is nested among crystals stuck on 'doom' setting.",
        statue: "The jade figurine stands among crystals broadcasting bad vibes.",
        amulet: "The crystal amulet blends with formations set to 'ominous ambiance'."
      },
      "You step into a passage with ankle-deep water that's surprisingly warm. Each step creates splashes that echo like sarcastic applause in the darkness.": {
        ruby: "The ruby sits in water that applauds your poor life choices sarcastically.",
        medallion: "The medallion lies in water offering mocking ovations.",
        statue: "The jade figurine stands in water that slow-claps your every step.",
        amulet: "The crystal amulet hangs above water giving ironic standing ovations."
      },
      "A shallow underground stream cuts through this cavern, flowing from an unknown source with the determination of a river late for an important appointment.": {
        ruby: "The ruby rests in a stream rushing to an important water meeting.",
        medallion: "The medallion glints in a stream with pressing aquatic business.",
        statue: "The jade figurine stands in water that's clearly double-booked.",
        amulet: "The crystal amulet dangles above a stream checking its watch."
      },
      "You slip on something and nearly fall. The floor is covered in slime that has the consistency of regret and smells like broken promises.": {
        ruby: "The ruby glows through slime textured like life's disappointments.",
        medallion: "The medallion is stuck in what regret feels like in physical form.",
        statue: "The jade figurine sits in slime that embodies broken promises.",
        amulet: "The crystal amulet hangs above a floor coated in liquified bad decisions."
      },
      "You step into what must be a wumpus bathroom. The smell is... educational, teaching you new ways your nose can be offended.": {
        ruby: "The ruby pulses in a bathroom offering olfactory education.",
        medallion: "The medallion hangs where noses learn new forms of suffering.",
        statue: "The jade figurine stands defiantly against nasal assault.",
        amulet: "The crystal amulet remains pristine despite the aromatic offense."
      },
      "There's a small shrine here decorated with offerings of shiny rocks and what might be bottle caps. Cave goblins apparently have the aesthetic sense of magpies with poor taste.": {
        ruby: "The ruby rests atop a shrine decorated by tasteless magpie-goblins.",
        medallion: "The medallion hangs from a shrine to bad taste and shiny things.",
        statue: "The jade figurine stands among offerings chosen by aesthetically challenged goblins.",
        amulet: "The crystal amulet was offered by goblins with magpie sensibilities."
      },
      "You find a table with cards and chips scattered about. Even cave dwellers enjoy poker night, though the stakes appear to involve teeth and possibly souls.": {
        ruby: "The ruby serves as a chip in a game where teeth are currency.",
        medallion: "The medallion sits beside stakes involving dental work and damnation.",
        statue: "The jade figurine watches over poker where souls are small blinds.",
        amulet: "The crystal amulet hangs above a game with existential stakes."
      },
      "This chamber has a perfect echo. You whisper 'hello' and it returns as 'RUN AWAY!'... wait, that's not an echo. That's either advice or the cave has developed a sense of humor.": {
        ruby: "The ruby pulses with echoes offering unsolicited life advice.",
        medallion: "The medallion vibrates with the cave's sarcastic acoustics.",
        statue: "The jade figurine seems amused by the chamber's dark humor.",
        amulet: "The crystal amulet resonates with echoes that have opinions."
      },
      "You find a cave painting depicting a stick figure being carried off by a giant bat. How prophetic. The artist clearly had both talent and trauma.": {
        ruby: "The ruby rests beneath art depicting someone's traumatic prophecy.",
        medallion: "The medallion hangs beside a painting born of talent and terror.",
        statue: "The jade figurine stands before prophetic art therapy gone dark.",
        amulet: "The crystal amulet illuminates history's most traumatized artist's work."
      },
      "A pool of clear water covers most of the floor, creating nature's most inconvenient wading pool. Your footsteps create ripples that seem to spell out 'turn back' in aquatic morse code.": {
        ruby: "The ruby glows in water sending rippled warnings in liquid morse.",
        medallion: "The medallion creates ripples spelling aquatic doom prophecies.",
        statue: "The jade figurine stands in nature's most passive-aggressive pool.",
        amulet: "The crystal amulet reflects warnings written in water language."
      },
      "This part of the cave has flooded with cold water that soaks through your boots with the determination of a debt collector.": {
        ruby: "The ruby glows beneath water as persistent as unpaid bills.",
        medallion: "The medallion lies in floodwater with debt collector determination.",
        statue: "The jade figurine stands in water that pursues like financial obligations.",
        amulet: "The crystal amulet hangs above water as relentless as creditors."
      },
      "This room contains strange rock formations that look suspiciously like furniture. Either nature has been watching too much HGTV, or someone had WAY too much time to arrange rocks.": {
        ruby: "The ruby sits on rocks arranged by nature's interior designer.",
        medallion: "The medallion hangs from stone furniture inspired by too much HGTV.",
        statue: "The jade figurine rests on formations suggesting geological boredom.",
        amulet: "The crystal amulet dangles from what happens when rocks watch design shows."
      },
      "You discover a pile of shiny trinkets in the corner—someone's been collecting lost items like a kleptomaniac crow with organizational skills.": {
        ruby: "The ruby hides among trinkets collected by an organized crow-person.",
        medallion: "The medallion is the crown jewel of a kleptomaniac's collection.",
        statue: "The jade figurine stands among items curated by a compulsive collector.",
        amulet: "The crystal amulet blends with shinies hoarded by a methodical magpie."
      },
      "The floor here is covered in soft sand that swirls mysteriously from the center, almost comfortable enough for a nap... if you ignore the ominous swirling and your impending doom.": {
        ruby: "The ruby is buried in sand offering comfort with a side of doom.",
        medallion: "The medallion lies in sand that's cozy yet somehow threatening.",
        statue: "The jade figurine stands in sand perfect for naps, nightmares included.",
        amulet: "The crystal amulet rests on sand that promises rest and unrest equally."
      },
      "You find what looks like a cave gift shop complete with 'I survived the Ancient One's Caves' t-shirts (now half off, like your chances of survival)!": {
        ruby: "The ruby is marked down like your survival odds in this gift shop.",
        medallion: "The medallion hangs with souvenirs mocking your life expectancy.",
        statue: "The jade figurine stands among t-shirts for optimistic cave survivors.",
        amulet: "The crystal amulet is displayed with items for the overly confident."
      },
      "A frozen section where delicate ice formations hang from the ceiling like nature's chandelier, if nature shopped at the discount store and had a thing for sharp objects.": {
        ruby: "The ruby's warmth melts discount chandelier ice formations.",
        medallion: "The medallion freezes among nature's budget sharp décor.",
        statue: "The jade figurine shivers beneath ice from nature's clearance aisle.",
        amulet: "The crystal amulet mimics the discount ice chandelier aesthetic."
      },
      "Luminescent fungi crawl across the walls like nature's screensaver, providing an eerie blue-green glow that would be pretty if it wasn't so obviously plotting something.": {
        ruby: "The ruby's glow complements fungi running nature's evil screensaver.",
        medallion: "The medallion hangs among fungi clearly plotting luminous schemes.",
        statue: "The jade figurine watches fungi crawl with obvious malicious intent.",
        amulet: "The crystal amulet refracts light from conspiratorial fungi."
      },
      "This chamber contains a small, tranquil pool reflecting the ceiling like a perfect mirror, assuming mirrors could judge you silently.": {
        ruby: "The ruby's glow doubles in a pool that reflects and judges.",
        medallion: "The medallion's reflection comes with silent aquatic criticism.",
        statue: "The jade figurine stands beside water offering liquid judgment.",
        amulet: "The crystal amulet hangs above a mirror that has opinions."
      },
      "The unmistakable scent of sulfur fills this chamber like nature's worst aromatherapy session. Yellow <span class='interactive-item' data-item='sulfur_crystal'>sulfur crystals</span> line the walls like evil butterscotch.": {
        ruby: "The ruby glows beside crystals of hellish butterscotch.",
        medallion: "The medallion hangs in nature's failed aromatherapy chamber.",
        statue: "The jade figurine stands among evil candy crystal formations.",
        amulet: "The crystal amulet's clarity mocks the sulfurous butterscotch walls."
      },
      // Default fallback remains the same
      "default": {
        ruby: "The ruby waits in a mysterious chamber of the cave.",
        medallion: "The medallion lies hidden in the shadows of a cavern.",
        statue: "The jade figurine rests in an unexplored section of the cave.",
        amulet: "The crystal amulet hangs in a secluded chamber of the cave system."
      }
    };
  };

  /**
 * Get all treasure clue mappings
 * @returns {Function} Function that returns mapping from room descriptions to treasure clues
 */
export const createDirectMatchClues = () => {
  return treasureClues;
};

export default treasureClues;