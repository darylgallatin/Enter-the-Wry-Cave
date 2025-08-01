import { useCallback, useRef } from 'react';
import winSoundFile from '../sounds/won.wav';
import loseSoundFile from '../sounds/Jingle_Lose_00.mp3';
import exploreButtonSoundFile from '../sounds//Menu1A.wav';
import playAgainSoundFile from '../sounds//Jingle_Achievement_00.mp3';
import walkingSoundFile from '../sounds//footstep01.ogg'; // Updated walking sound
import waterWalkingSoundFile from '../sounds//Footstep_Water_01.mp3'; // Updated water walking sound
import wumpusDistantSoundFile from '../sounds/Beast Growl 3.wav'; // Distant wumpus growl
import pitWindSoundFile from '../sounds/wind.ogg'; // Wind for pit draft
import batFlapSoundFile from '../sounds//wings_flap_large.ogg'; // Bat wing flapping
import backgroundMusicFile from '../sounds//Cave theme.mp3'; // Background music
import crystalMusicFile from '../sounds//music_jewels.ogg'; // Special crystal room music
//import ghostSoundFile from './ghostbreath.flac'; // Ghost sound for echo room
import ghostSoundFile from '../sounds/DL_SILENCE_MAKE_MY_PETS.ogg';
import slipSoundFile from '../sounds//cartoon-throw.wav'; // Slip sound effect
import waterfallSoundFile from '../sounds//waterfall2.ogg'; // Waterfall/dripping sound
import bonesCrunchSoundFile from '../sounds//Crunching Bones.ogg'; // Bones crunching sound
import goblinCackleFile from '../sounds//Goblin Cackle.wav'; // Goblin cackle sound
import streamSoundFile from '../sounds/bg_water_running.wav'; // Stream running sound
import batGrabScreamFile from '../sounds//horrorghostscream.mp3'; // Horror scream for bat encounter
import trinketsMusicFile from '../sounds//Dear Diary.mp3'; // Music for trinkets room
import smellSoundFile from '../sounds//Sniffing.wav'; // Sniffing sound for wumpus bathroom
import ceilingFlapSoundFile from '../sounds/bird_flap.flac'; // Bird flap for high ceiling
import teleportSoundFile from '../sounds/teleport.ogg'; // Teleport sound for wizard
import caveEntrySoundFile from '../sounds/warp2.ogg'; // New sound for entering the cave
import whisperingSoundFile from '../sounds//whisper2.ogg'; // New sound for entering the Echo cave
import pulsingSoundFile from '../sounds//pulsingglow.ogg'; // New sound for entering the  tense low_pulsing cave


import mapFoundSoundFile from '../sounds//power_up_sound_v3.ogg'; // Sound for finding the map
import treasureFoundSoundFile from '../sounds//coin-03.wav'; // Sound for finding treasure
import autoPickupSoundFile from '../sounds//Item2A.ogg'; // Auto pickup sound
import interactivePickupSoundFile from '../sounds/133008__cosmicd__annulet-of-absorption.ogg'; // Interactive pickup sound

import ladderTrapSoundFile from '../sounds//Pit_Wihelm.ogg';
import wyrmglassSoundFile from '../sounds//wymglass.ogg';
import FlameSoundFile from '../sounds/flame.ogg';
import LanternSoundFile from '../sounds//magical_1.ogg';
import MapFragmentSoundFile from '../sounds//magical_2.ogg';
import GoldenCompassSoundFile from '../sounds//magical_6.ogg';
import SpellBookFailFile from '../sounds//spellbook_fail_sound.ogg';
import SpellBookSuccessFile from '../sounds//spellbook_success.ogg';

import TrinketTrapDeathSoundFile from '../sounds/die1.ogg';

import VictoryMusicEnding from '../sounds//destiny_formation.ogg';
import noHopeMusicFile from '../sounds//No Hope.ogg';
import cheesyLoopFile from '../sounds//cheesyloop1.ogg';

import nightcrawlerchitteringfile from  '../sounds//nightcrawler_chittering.ogg';

import plushieScreamFile  from '../sounds/442564__darsycho__monster-shriek.ogg'; 
import plushieSqueakFile  from '../sounds//squeak_toy.ogg'; 

import plushieMatingCallFile  from '../sounds//spinofaarus-mating-call.ogg'; 
import oldDoorOpeningFile  from '../sounds//old_door_opening.ogg'; 
import rockThrowFile  from '../sounds//effekt_rock_throw.ogg'; 
import rockLockedInPLaceFile  from '../sounds//big-gate-close.ogg'; 
import setVialToThrowFile  from '../sounds//vial-glass-round-cork-twist-02.ogg'; 
import playThrowingVialWhooshwFile  from '../sounds//vial_throwing_whoosh.ogg'; 
import playVialbreakingFile  from '../sounds//vial_breaking_glass.ogg'; 

import playWizardFreedFile from  '../sounds//Wizard_Freed_Speech.ogg'; 
import  playNixieTollReqiuredFile  from  '../sounds//Nixie_Toll_required.ogg'; 
import  playNixieOneGoldCoinFile  from  '../sounds//Nixie_gold_coin_required.ogg';  
import  playNixieGoldenCompassFile  from  '../sounds//Nixie_compass_alternative.ogg'; 
import  playNixieThankYouJournalFile  from  '../sounds//Nixie_Thank_you_journal.ogg'; 
import playNixieAFairTradeFile  from  '../sounds//NixieFairTradeTome.ogg';
import playShopKeepKeeperFile from  '../sounds//Orc_shopkeeper.ogg';

import Orc_shopkeeperCanvasBagFile  from  '../sounds/Orc_shopkeeperCanvasBag.ogg';
import Orc_shopkeeper_cloakFile  from  '../sounds/Orc_shopkeeper_cloak.ogg';
import Orc_shopkeeper_FlaskOilFile  from  '../sounds/Orc_shopkeeper_FlaskOil.ogg';
import Orc_shopkeeper_LanternFile  from  '../sounds/Orc_shopkeeper_Lantern.ogg';
import Orc_shopkeeperLeavingMessageFile  from  '../sounds/Orc_shopkeeperLeavingMessage.ogg';
import Orc_shopkeeper_MapFragmentFIle  from  '../sounds/Orc_shopkeeper_MapFragment.ogg';
import Orc_shopkeeperMugFile  from  '../sounds/Orc_shopkeeperMug.ogg';
import Orc_shopkeeper_RepellentFile  from  '../sounds/Orc_shopkeeper_Repellent.ogg';
import Orc_shopkeeper_T_shirtFile  from  '../sounds/Orc_shopkeeper_T_shirt.ogg';
import Orc_shopkeeperPlushieFile  from  '../sounds/Orc_shopkeeperPlushie.ogg';

import EarthquakeRumblingSoundFile  from  '../sounds/Earthquake_rumbling.ogg';
import RockWaterExplosionSoundFile  from  '../sounds/sodium_rock_Water_explosion.ogg';

import WaterNixieShriekSoundFile from  '../sounds/Nixie_shriek.ogg';

import  NixieWailingKillScreamSoundFile  from  '../sounds/NixieWailingKillScream.ogg';

import sandCreatureHissSoundFile from  '../sounds/sand_creature_hiss.ogg';
  
import sandCreatureShriekSoundFile from  '../sounds/sand_creature_shriek.ogg';

const useSounds = () => { 
  // Refs to hold looping sounds so we can stop them later
  const windLoopRef = useRef(null);
  const batFlapLoopRef = useRef(null);
  const backgroundMusicRef = useRef(null);
  const specialMusicRef = useRef(null);
  const specialMusicPlaying = useRef(false);
  const victoryMusicRef = useRef(null);
  const loseMusicRef = useRef(null); 
  const nightCrawlerSoundRef = useRef(null);
const soundsEnabled = useRef(true);


const activeLoopingSounds = useRef({
  wind: null,
  batFlap: null,
  backgroundMusic: null,
  specialMusic: null,
  victoryMusic: null ,
  nightCrawler: null  

});





const playLadderTrapSound = () => {
  const audio = new Audio(ladderTrapSoundFile);
  audio.volume = 0.7;
  audio.play().catch(error => {
    console.error('Error playing ladder trap sound:', error);
  });
};

const playWyrmglassSound = useCallback(() => {
  console.log("Playing wyrmglass sound");
  const sound = new Audio(wyrmglassSoundFile);
  sound.play()
    .then(() => console.log("Wyrmglass sound played successfully"))
    .catch(error => {
      console.error('Error playing wyrmglass sound:', error);
    });
}, []);

const playFlameSound = useCallback(() => {
  console.log("Playing playFlameSound sound");
  const sound = new Audio(FlameSoundFile);
  sound.play()
    .then(() => console.log("playFlameSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playFlameSound sound:', error);
    });
}, []);


const playLanternSound = useCallback(() => {
  console.log("Playing playLanternSound sound");
  const sound = new Audio(LanternSoundFile);
  sound.play()
    .then(() => console.log("WyrplayLanternSoundmglass sound played successfully"))
    .catch(error => {
      console.error('Error playing playLanternSound sound:', error);
    });
}, []);


const playGoldenCompassSound = useCallback(() => {
  console.log("Playing playGoldenCompassSound sound");
  const sound = new Audio(GoldenCompassSoundFile);
  sound.play()
    .then(() => console.log("playGoldenCompassSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playGoldenCompassSound sound:', error);
    });
}, []);


const playMapFragmentSound = useCallback(() => {
  console.log("Playing playMapFragmentSound sound");
  const sound = new Audio(MapFragmentSoundFile);
  sound.play()
    .then(() => console.log("playMapFragmentSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playMapFragmentSound sound:', error);
    });
}, []);

const playPlushieScreamSound = useCallback(() => {
  console.log("Playing playPlushieScreamSound sound");
  const sound = new Audio(plushieScreamFile);
  sound.play()
    .then(() => console.log("playPlushieScreamSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playPlushieScreamSound sound:', error);
    });
}, []);



const playPlushieSqueakSound = useCallback(() => {
  console.log("Playing playPlushieSqueakSound sound");
  const sound = new Audio(plushieSqueakFile);
  sound.play()
    .then(() => console.log("playPlushieSqueakSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playPlushieSqueakSound sound:', error);
    });
}, []);

const playRockThrowSound = useCallback(() => {
  console.log("Playing playRockThrowSound sound");
  const sound = new Audio(rockThrowFile);
  sound.play()
    .then(() => console.log("playRockThrowSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playRockThrowSound sound:', error);
    });
}, []);



const  playRockLockedInPLaceSound  = useCallback(() => {
  console.log("Playing playRockLockedInPLaceSound sound");
  const sound = new Audio(rockLockedInPLaceFile);
  sound.play()
    .then(() => console.log("playRockLockedInPLaceSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playRockLockedInPLaceSound sound:', error);
    });
}, []);

const playHiddenRoomRumblingSound= useCallback(() => {
  console.log("Playing playHiddenRoomRumblingSound sound");
  const sound = new Audio(EarthquakeRumblingSoundFile);
  sound.play()
    .then(() => console.log("playHiddenRoomRumblingSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playHiddenRoomRumblingSound sound:', error);
    });
}, []);

const playSodiumRockWaterExplosionSound= useCallback(() => {
  console.log("Playing playSodiumRockWaterExplosionSound sound");
  const sound = new Audio(RockWaterExplosionSoundFile);
  sound.play()
    .then(() => console.log("playSodiumRockWaterExplosionSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playSodiumRockWaterExplosionSound sound:', error);
    });
}, []);





const setVialToThrowSound    = useCallback(() => {
  console.log("Playing setVialToThrowSound sound");
  const sound = new Audio(setVialToThrowFile);
  sound.play()
    .then(() => console.log("setVialToThrowSound sound played successfully"))
    .catch(error => {
      console.error('Error playing setVialToThrowSound sound:', error);
    });
}, []);


const playThrowingVialWooshSound    = useCallback(() => {
  console.log("Playing playThrowingVialWooshSound sound");
  const sound = new Audio(playThrowingVialWhooshwFile);
  sound.play()
    .then(() => console.log("playThrowingVialWooshSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playThrowingVialWooshSound sound:', error);
    });
}, []);

const playVialbreakingSound    = useCallback(() => {
  console.log("Playing playVialbreakingSound sound");
  const sound = new Audio(playVialbreakingFile);
  sound.play()
    .then(() => console.log("playVialbreakingSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playVialbreakingSound sound:', error);
    });
}, []);



const playWizardFreedSound    = useCallback(() => {
  console.log("Playing playWizardFreedSound sound");
  const sound = new Audio(playWizardFreedFile);
  sound.play()
    .then(() => console.log("playWizardFreedSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playWizardFreedSound sound:', error);
    });
}, []);


const playNixieTollReqiuredSound    = useCallback(() => {
  console.log("Playing playNixieTollReqiuredSound sound");
  const sound = new Audio(playNixieTollReqiuredFile);
  sound.play()
    .then(() => console.log("playNixieTollReqiuredSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playNixieTollReqiuredSound sound:', error);
    });
}, []);


const playNixieOneGoldCoinSound    = useCallback(() => {
  console.log("Playing playNixieOneGoldCoinSound sound");
  const sound = new Audio(playNixieOneGoldCoinFile);
  sound.play()
    .then(() => console.log("playNixieOneGoldCoinSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playNixieOneGoldCoinSound sound:', error);
    });
}, []);

const playNixieGoldenCompassSound    = useCallback(() => {
  console.log("Playing playNixieGoldenCompassSound sound");
  const sound = new Audio(playNixieGoldenCompassFile);
  sound.play()
    .then(() => console.log("playNixieGoldenCompassSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playNixieGoldenCompassSound sound:', error);
    });
}, []);

const playNixieAFairTradeSound   = useCallback(() => {
  console.log("Playing playNixieAFairTrade sound");
  const sound = new Audio(playNixieAFairTradeFile);
  sound.play()
    .then(() => console.log("playNixieAFairTrade sound played successfully"))
    .catch(error => {
      console.error('Error playing playNixieAFairTrade sound:', error);
    });
}, []);



const playNixieThankYouJournalSound    = useCallback(() => {
  console.log("Playing playNixieThankYouJournalSound sound");
  const sound = new Audio(playNixieThankYouJournalFile);
  sound.play()
    .then(() => console.log("playNixieThankYouJournalSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playNixieThankYouJournalSound sound:', error);
    });
}, []);



const  playNixieWailingKillScream  = useCallback(() => {
  console.log("Playing playNixieWailingKillScream sound");
  const sound = new Audio(NixieWailingKillScreamSoundFile);
  sound.play()
    .then(() => console.log("playNixieWailingKillScream sound played successfully"))
    .catch(error => {
      console.error('Error playing playNixieWailingKillScream sound:', error);
    });
}, []);

const playWaterNixieShriekSound    = useCallback(() => {
  console.log("Playing playWaterNixieShriekSound sound");
  const sound = new Audio(WaterNixieShriekSoundFile);
  sound.play()
    .then(() => console.log("playWaterNixieShriekSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playWaterNixieShriekSound sound:', error);
    });
}, []);


const playSandCreatureHissSound    = useCallback(() => {
  console.log("Playing playDruikaHissSound sound");
  const sound = new Audio(sandCreatureHissSoundFile);
  sound.play()
    .then(() => console.log("playDruikaHissSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playDruikaHissSound sound:', error);
    });
}, []);


const playSandCreatureShriekSound    = useCallback(() => {
  console.log("Playing playDruikaHissSound sound");
  const sound = new Audio(sandCreatureShriekSoundFile);
  sound.play()
    .then(() => console.log("playSandCreatureShriekSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playSandCreatureShriekSound sound:', error);
    });
}, []);

const playShopKeeperFileSound    = useCallback(() => {
  console.log("Playing playShopKeeperFileSound sound");
  const sound = new Audio(playShopKeepKeeperFile);
  sound.play()
    .then(() => console.log("playShopKeeperFileSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playShopKeeperFileSound sound:', error);
    });
}, []);

const playShopKeeperRepellentSound    = useCallback(() => {
  console.log("Playing playShopKeeperFileRepellentSound sound");
  const sound = new Audio(Orc_shopkeeper_RepellentFile);
  sound.play()
    .then(() => console.log("playShopKeeperFileRepellentSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playShopKeeperFileRepellentSound sound:', error);
    });
}, []);



const playShopKeeperLanternSound    = useCallback(() => {
  console.log("Playing playShopKeeperFileLanternSound sound");
  const sound = new Audio(Orc_shopkeeper_LanternFile);
  sound.play()
    .then(() => console.log("playShopKeeperFileLanternSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playShopKeeperFileLanternSound sound:', error);
    });
}, []);


const playShopKeeperMapFragmentSound    = useCallback(() => {
  console.log("Playing playShopKeeperFileMapFragmentSound sound");
  const sound = new Audio(Orc_shopkeeper_MapFragmentFIle);
  sound.play()
    .then(() => console.log("playShopKeeperFileMapFragmentSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playShopKeeperFileMapFragmentSound sound:', error);
    });
}, []);

const playShopKeeperFlaskOilSound    = useCallback(() => {
  console.log("Playing playShopKeeperFlaskOilSound sound");
  const sound = new Audio(Orc_shopkeeper_FlaskOilFile);
  sound.play()
    .then(() => console.log("playShopKeeperFlaskOilSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playShopKeeperFlaskOilSound sound:', error);
    });
}, []);


const playShopKeeperCloakSound    = useCallback(() => {
  console.log("Playing playShopKeeperCloakSound sound");
  const sound = new Audio(Orc_shopkeeper_cloakFile);
  sound.play()
    .then(() => console.log("playShopKeeperCloakSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playShopKeeperCloakSound sound:', error);
    });
}, []);

const playShopKeeperTShirtSound    = useCallback(() => {
  console.log("Playing playShopKeeperTShirtSound sound");
  const sound = new Audio(Orc_shopkeeper_T_shirtFile);
  sound.play()
    .then(() => console.log("playShopKeeperTShirtSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playShopKeeperTShirtSound sound:', error);
    });
}, []);

const playShopKeeperMugSound    = useCallback(() => {
  console.log("Playing playShopKeeperMugSound sound");
  const sound = new Audio(Orc_shopkeeperMugFile);
  sound.play()
    .then(() => console.log("playShopKeeperMugSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playShopKeeperMugSound sound:', error);
    });
}, []);

const playShopKeeperCanvasBagSound    = useCallback(() => {
  console.log("Playing playShopKeeperCanvasBagSound sound");
  const sound = new Audio(Orc_shopkeeperCanvasBagFile);
  sound.play()
    .then(() => console.log("playShopKeeperCanvasBagSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playShopKeeperCanvasBagSound sound:', error);
    });
}, []);





const playShopKeeperPlushieSound    = useCallback(() => {
  console.log("Playing playShopKeeperPlushieSound sound");
  const sound = new Audio(Orc_shopkeeperPlushieFile);
  sound.play()
    .then(() => console.log("playShopKeeperPlushieSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playShopKeeperPlushieSound sound:', error);
    });
}, []);



const playShopKeeperLeavingSound    = useCallback(() => {
  console.log("Playing playShopKeeperLeavingSound sound");
  const sound = new Audio(Orc_shopkeeperLeavingMessageFile);
  sound.play()
    .then(() => console.log("playShopKeeperLeavingSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playShopKeeperLeavingSound sound:', error);
    });
}, []);



const playPlushieMatingCallSound = useCallback(() => {
  console.log("Playing playPlushieMatingCallSound sound");
  const sound = new Audio(plushieMatingCallFile);
  sound.play()
    .then(() => console.log("playPlushieMatingCallSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playPlushieMatingCallSound sound:', error);
    });
}, []);


const playOldDoorOpeningSound = useCallback(() => {
  console.log("Playing playOldDoorOpeningSound sound");
  const sound = new Audio(oldDoorOpeningFile);
  sound.play()
    .then(() => console.log("playOldDoorOpeningSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playOldDoorOpeningSound sound:', error);
    });
}, []);


const playVictoryMusicEnding = useCallback((shouldPlay = true) => {
  // If we're already playing and should still play, do nothing
  if (victoryMusicRef.current && shouldPlay) {
    console.log("Victory music already playing - not starting again");
    return;
  }
  
  // ALWAYS allow stopping, regardless of soundsEnabled state
  if (!shouldPlay && victoryMusicRef.current) {
    console.log("Stopping victory music");
    victoryMusicRef.current.pause();
    victoryMusicRef.current.currentTime = 0;
    victoryMusicRef.current = null;
    activeLoopingSounds.current.victoryMusic = null;
    return;
  }
  
  // Don't start if sounds are disabled
  if (!soundsEnabled.current && shouldPlay) {
    console.log("Sounds are disabled - not playing victory music");
    return;
  }
  
  // Start playing victory music
  if (shouldPlay && !victoryMusicRef.current) {
    console.log("Playing victory music");
    const sound = new Audio(VictoryMusicEnding);
    sound.volume = 0.6;
    sound.loop = true;
    
    sound.play()
      .then(() => {
        console.log("Victory music playing successfully");
        victoryMusicRef.current = sound;
        activeLoopingSounds.current.victoryMusic = sound;
      })
      .catch(error => {
        console.error('Error playing victory music:', error);
        victoryMusicRef.current = null;
      });
  }
}, []);

const playLoseMusicEnding = useCallback((shouldPlay = true) => {
  // If we're already playing and should still play, do nothing
  if (loseMusicRef.current && shouldPlay) {
    console.log("Lose music already playing - not starting again");
    return;
  }
  
  // If we should stop playing
  if (!shouldPlay && loseMusicRef.current) {
    console.log("Stopping lose music");
    loseMusicRef.current.pause();
    loseMusicRef.current.currentTime = 0;
    loseMusicRef.current = null;
    activeLoopingSounds.current.loseMusic = null;
    return;
  }
  
  // Don't start lose music if it's already off and we're turning it off
  if (!shouldPlay && !loseMusicRef.current) {
    return;
  }
  
  // Start playing lose music
  if (shouldPlay && !loseMusicRef.current) {
    console.log("Playing lose music");
    const sound = new Audio(noHopeMusicFile);
    sound.volume = 0.5; // Slightly lower volume for somber mood
    sound.loop = true;
    
    sound.play()
      .then(() => {
        console.log("Lose music playing successfully");
        loseMusicRef.current = sound;
        activeLoopingSounds.current.loseMusic = sound; // Track in active sounds
      })
      .catch(error => {
        console.error('Error playing lose music:', error);
        loseMusicRef.current = null; // Clear ref on error
      });
  }
}, []);


// Create the night crawler sound functions
const playNightCrawlerSound = useCallback((volume = 0.3) => {
  // Don't play if sounds are disabled
  if (!soundsEnabled.current) {
    console.log("Sounds are disabled - not playing night crawler sound");
    return;
  }
  
  // If already playing, just adjust volume
  if (nightCrawlerSoundRef.current) {
    console.log(`Adjusting night crawler sound volume to ${volume}`);
    nightCrawlerSoundRef.current.volume = volume;
    return;
  }
  
  console.log(`Playing night crawler chittering sound at volume ${volume}`);
  const sound = new Audio(nightcrawlerchitteringfile);
  sound.volume = volume;
  sound.loop = true; // Loop the chittering
  
  sound.play()
    .then(() => {
      console.log("Night crawler sound playing successfully");
      nightCrawlerSoundRef.current = sound;
      activeLoopingSounds.current.nightCrawler = sound;
    })
    .catch(error => {
      console.error('Error playing night crawler sound:', error);
      nightCrawlerSoundRef.current = null;
    });
}, []);

const stopNightCrawlerSound = useCallback(() => {
  if (nightCrawlerSoundRef.current) {
    console.log("Stopping night crawler sound");
    nightCrawlerSoundRef.current.pause();
    nightCrawlerSoundRef.current.currentTime = 0;
    nightCrawlerSoundRef.current = null;
    activeLoopingSounds.current.nightCrawler = null;
  }
}, []);





const playSpellBookFailSound = useCallback(() => {
  console.log("Playing SpellBookFailFile sound");
  const sound = new Audio(SpellBookFailFile);
  sound.play()
    .then(() => console.log("SpellBookFailFile sound played successfully"))
    .catch(error => {
      console.error('Error playing SpellBookFailFile sound:', error);
    });
}, []);


const playSpellBookSuccessSound = useCallback(() => {
  console.log("Playing SpellBookSuccessFile sound");
  const sound = new Audio(SpellBookSuccessFile);
  sound.play()
    .then(() => console.log("SpellBookSuccessFile sound played successfully"))
    .catch(error => {
      console.error('Error playing SpellBookSuccessFile sound:', error);
    });
}, []);




// Play auto pickup sound (for items picked up automatically)
const playAutoPickupSound = useCallback(() => {
  console.log("Playing auto pickup sound");
  const sound = new Audio(autoPickupSoundFile);
  sound.volume = 0.9; // Adjust volume as needed
  sound.play()
    .then(() => console.log("Auto pickup sound played successfully"))
    .catch(error => {
      console.error('Error playing auto pickup sound:', error);
    });
}, []);

// Play interactive pickup sound (for items clicked on)
const playInteractivePickupSound = useCallback(() => {
  console.log("Playing interactive pickup sound");
  const sound = new Audio(interactivePickupSoundFile);
  sound.volume = 1; // Adjust volume as needed
  sound.play()
    .then(() => console.log("Interactive pickup sound played successfully"))
    .catch(error => {
      console.error('Error playing interactive pickup sound:', error);
    });
}, []);

// Play exasperated trinnkettrap death scream
const playTrinketTrapDeathSound = useCallback(() => {
  console.log("Playing playTrinketTrapDeathSound sound");
  const sound = new Audio(TrinketTrapDeathSoundFile);
  sound.volume = 1; // Adjust volume as needed
  sound.play()
    .then(() => console.log("playTrinketTrapDeathSound sound played successfully"))
    .catch(error => {
      console.error('Error playing playTrinketTrapDeathSound sound:', error);
    });
}, []);




const stopAllLoopingSounds = useCallback((except = []) => {
  console.log("Stopping all looping sounds except:", except);
  
  // Stop wind if not in exception list
  if (!except.includes('wind') && activeLoopingSounds.current.wind) {
    console.log("Stopping wind sound");
    activeLoopingSounds.current.wind.pause();
    activeLoopingSounds.current.wind = null;
    windLoopRef.current = null;
  }
  
  // Stop bat flapping if not in exception list
  if (!except.includes('batFlap') && activeLoopingSounds.current.batFlap) {
    console.log("Stopping bat flap sound");
    activeLoopingSounds.current.batFlap.pause();
    activeLoopingSounds.current.batFlap = null;
    batFlapLoopRef.current = null;
  }
  
  // Stop special music if not in exception list
  if (!except.includes('specialMusic') && activeLoopingSounds.current.specialMusic) {
    console.log("Stopping special music");
    activeLoopingSounds.current.specialMusic.pause();
    activeLoopingSounds.current.specialMusic.currentTime = 0;
    activeLoopingSounds.current.specialMusic = null;
    specialMusicRef.current = null;
    specialMusicPlaying.current = false;
  }
  
  // Stop background music if not in exception list
  if (!except.includes('backgroundMusic') && activeLoopingSounds.current.backgroundMusic) {
    console.log("Stopping background music");
    activeLoopingSounds.current.backgroundMusic.pause();
    activeLoopingSounds.current.backgroundMusic.currentTime = 0;
    activeLoopingSounds.current.backgroundMusic = null;
    backgroundMusicRef.current = null;
  }
}, []);

  // Play cave entry sound
  const playCaveEntrySound = useCallback(() => {
    console.log("Playing cave entry sound");
    const sound = new Audio(caveEntrySoundFile);
    
    // Set a slightly higher volume for this important sound
    sound.volume = 0.7;
    
    // Return a promise that resolves when the sound finishes playing
    return new Promise((resolve, reject) => {
      sound.onended = () => {
        console.log("Cave entry sound finished");
        resolve();
      };
      
      sound.onerror = (error) => {
        console.error('Error playing cave entry sound:', error);
        reject(error);
      };
      
      sound.play().catch(error => {
        console.error('Error playing cave entry sound:', error);
        reject(error);
      });
    });
  }, []);

  // Play map found sound
  const playMapFoundSound = useCallback(() => {
    console.log("Playing map found sound");
    const sound = new Audio(mapFoundSoundFile);
    sound.play()
      .then(() => console.log("Map found sound played successfully"))
      .catch(error => {
        console.error('Error playing map found sound:', error);
      });
  }, []);

  // Play treasure found sound
  const playTreasureFoundSound = useCallback(() => {
    console.log("Playing treasure found sound");
    const sound = new Audio(treasureFoundSoundFile);
    sound.play()
      .then(() => console.log("Treasure found sound played successfully"))
      .catch(error => {
        console.error('Error playing treasure found sound:', error);
      });
  }, []);
  
  // Play win sound
  const playWinSound = useCallback(() => {
    console.log("Playing win sound");
    const sound = new Audio(winSoundFile);
    sound.play()
      .then(() => console.log("Win sound played successfully"))
      .catch(error => {
        console.error('Error playing win sound:', error);
      });
       return sound; //  Return the audio object
  }, []);

  // Play smell/sniffing sound
  const playSmellSound = useCallback(() => {
    console.log("Playing sniffing sound");
    const sound = new Audio(smellSoundFile);
    sound.play()
      .then(() => console.log("Sniffing sound played successfully"))
      .catch(error => {
        console.error('Error playing sniffing sound:', error);
      });
  }, []);

  const playCeilingFlapSound = useCallback(() => {
    console.log("Playing ceiling flap sound");
    const sound = new Audio(ceilingFlapSoundFile);
    sound.play()
      .then(() => console.log("Ceiling flap sound played successfully"))
      .catch(error => {
        console.error('Error playing ceiling flap sound:', error);
      });
  }, []);

  // Play teleport sound
  const playTeleportSound = useCallback(() => {
    console.log("Playing teleport sound");
    const sound = new Audio(teleportSoundFile);
    sound.play()
      .then(() => console.log("Teleport sound played successfully"))
      .catch(error => {
        console.error('Error playing teleport sound:', error);
      });
  }, []);

  // Play lose jingle
 const playLoseSound = useCallback(() => {
  console.log("Playing lose sound");
  const sound = new Audio(loseSoundFile);
  sound.play()
    .then(() => console.log("Lose sound played successfully"))
    .catch(error => {
      console.error('Error playing lose sound:', error);
    });
  return sound; // Return the audio object
}, []);



  // Play explore button sound
  const playExploreSound = useCallback(() => {
    console.log("Playing explore button sound");
    const sound = new Audio(exploreButtonSoundFile);
    sound.play()
      .then(() => console.log("Explore sound played successfully"))
      .catch(error => {
        console.error('Error playing explore sound:', error);
      });
  }, []);
  
  // Play play-again button sound
  const playPlayAgainSound = useCallback(() => {
    console.log("Playing play-again sound");
    const sound = new Audio(playAgainSoundFile);
    sound.play()
      .then(() => console.log("Play-again sound played successfully"))
      .catch(error => {
        console.error('Error playing play-again sound:', error);
      });
  }, []);
  
  // Play walking sounds (repeating for duration)
  const playWalkingSound = useCallback((isWaterRoom = false) => {
    console.log(`Playing ${isWaterRoom ? 'water ' : ''}walking sound`);
    
    // Choose the right sound file based on whether this is a water room
    const soundFile = isWaterRoom ? waterWalkingSoundFile : walkingSoundFile;
    
    // Create a sequence of walking sounds (playing 3 times)
    const playSequence = (count = 0, maxCount = 3) => {
      if (count >= maxCount) return;
      
      const walkSound = new Audio(soundFile);
      
      // When this sound ends, play the next one
      walkSound.addEventListener('ended', () => {
        playSequence(count + 1, maxCount);
      });
      
      walkSound.play().catch(error => {
        console.error('Error playing walking sound:', error);
      });
    };
    
    // Start the sequence
    playSequence();
  }, []);
  

// Play whispering sound for echo room
const playWhisperingSound = useCallback(() => {
  console.log("Playing whispering sound");
  const sound = new Audio(whisperingSoundFile);
   sound.volume = 0.2;
  sound.play()
    .then(() => console.log("Whispering sound played successfully"))
    .catch(error => {
      console.error('Error playing whispering sound:', error);
    });
}, []);

// Play pulsing sound (continuous loop)



  // Play distant wumpus growl sound
  const playDistantWumpusSound = useCallback(() => {
    console.log("Playing distant wumpus growl");
    const sound = new Audio(wumpusDistantSoundFile);
    sound.play()
      .then(() => console.log("Distant wumpus sound played successfully"))
      .catch(error => {
        console.error('Error playing distant wumpus sound:', error);
      });
  }, []);
  
  // Play slip sound effect
  const playSlipSound = useCallback(() => {
    console.log("Playing slip sound");
    const sound = new Audio(slipSoundFile);
    sound.play()
      .then(() => console.log("Slip sound played successfully"))
      .catch(error => {
        console.error('Error playing slip sound:', error);
      });
  }, []);
  
  // Play waterfall/dripping sound effect
  const playWaterfallSound = useCallback(() => {
    console.log("Playing waterfall sound");
    const sound = new Audio(waterfallSoundFile);
    sound.play()
      .then(() => console.log("Waterfall sound played successfully"))
      .catch(error => {
        console.error('Error playing waterfall sound:', error);
      });
  }, []);
  
  // Play bones crunching sound effect
  const playBonesCrunchSound = useCallback(() => {
    console.log("Playing bones crunching sound");
    const sound = new Audio(bonesCrunchSoundFile);
    sound.play()
      .then(() => console.log("Bones sound played successfully"))
      .catch(error => {
        console.error('Error playing bones sound:', error);
      });
  }, []);
  
  // Play goblin cackle sound effect
  const playGoblinCackleSound = useCallback(() => {
    console.log("Playing goblin cackle sound");
    const sound = new Audio(goblinCackleFile);
    sound.play()
      .then(() => console.log("Goblin cackle sound played successfully"))
      .catch(error => {
        console.error('Error playing goblin cackle sound:', error);
      });
  }, []);
  
  // Play bat grab scream sound effect
  const playBatGrabScreamSound = useCallback(() => {
    console.log("Playing bat grab horror scream");
    const sound = new Audio(batGrabScreamFile);
    sound.play()
      .then(() => console.log("Bat grab scream played successfully"))
      .catch(error => {
        console.error('Error playing bat grab scream:', error);
      });
  }, []);
  
  // Play a room-specific sound effect
  const playRoomSound = useCallback((soundType) => {
    if (!soundType) return;
    
    switch (soundType) {
      case 'slip':
        playSlipSound();
        break;
      case 'waterfall':
        // Don't play the one-shot waterfall sound here
        // It will be handled by playSpecialRoomMusic
        break;
      case 'bones':
        playBonesCrunchSound();
        break;
      case 'goblin':
        playGoblinCackleSound();
        break;
      case 'smell':
        playSmellSound();
        break;
      case 'ceiling_flap':
        playCeilingFlapSound();
        break;
   
     case 'echo':  // Add this for whispering sound
      playWhisperingSound();
      break;



    default:
        console.log(`Unknown room sound type: ${soundType}`);
    }
  }, [playSlipSound, playBonesCrunchSound, playGoblinCackleSound, playSmellSound, playCeilingFlapSound,  playWhisperingSound]);
  
  
  // Play/stop wind sound for pit draft (looping)
  const playPitWindSound = useCallback((shouldPlay = true) => {
    // If we're already playing and should still play, do nothing
    if (windLoopRef.current && shouldPlay) return;
    
    // If we should stop playing
    if (!shouldPlay && windLoopRef.current) {
      console.log("Stopping pit wind sound");
      windLoopRef.current.pause();
      windLoopRef.current = null;
      return;
    }
    
    // Start playing wind sound
    if (shouldPlay) {
      console.log("Playing pit wind sound");
      const sound = new Audio(pitWindSoundFile);
      sound.volume = 0.1; // Reduce volume as requested
      sound.loop = true;
      
      sound.play()
        .then(() => console.log("Pit wind sound playing successfully"))
        .catch(error => {
          console.error('Error playing pit wind sound:', error);
        });
      
      windLoopRef.current = sound;
    }
  }, []);
  
  // Play/stop bat flapping sound (looping)
  const playBatFlapSound = useCallback((shouldPlay = true) => {
    // If we're already playing and should still play, do nothing
    if (batFlapLoopRef.current && shouldPlay) return;
    
    // If we should stop playing
    if (!shouldPlay && batFlapLoopRef.current) {
      console.log("Stopping bat flapping sound");
      batFlapLoopRef.current.pause();
      batFlapLoopRef.current = null;
      return;
    }
    
    // Start playing bat flapping sound
    if (shouldPlay) {
      console.log("Playing bat flapping sound");
      const sound = new Audio(batFlapSoundFile);
      sound.loop = true;
      
      sound.play()
        .then(() => console.log("Bat flapping sound playing successfully"))
        .catch(error => {
          console.error('Error playing bat flapping sound:', error);
        });
      
      batFlapLoopRef.current = sound;
    }
  }, []);
  
  // Play/stop background music (looping)
  const playBackgroundMusic = useCallback((shouldPlay = true) => {
  // If we're already playing and should still play, do nothing

    // Don't play if sounds are disabled
  if (!soundsEnabled.current && shouldPlay) {
    console.log("Sounds are disabled - not playing background music");
    return;
  }
  // ADD THIS NEW SECTION HERE - If starting background music, ensure special music is stopped
  
  
  // If we're already playing and should still play, do nothing
  if (backgroundMusicRef.current && shouldPlay) {
    console.log("Background music already playing - not starting again");
    return;
  }
  
  // If we should stop playing
  if (!shouldPlay) {
    console.log("Stopping background music - force stop");
    // More aggressive stopping
    if (backgroundMusicRef.current) {
      try {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.currentTime = 0;
        // Set src to empty to force unload
        backgroundMusicRef.current.src = '';
        backgroundMusicRef.current.load();
      } catch (error) {
        console.error("Error stopping background music:", error);
      }
      backgroundMusicRef.current = null;
      activeLoopingSounds.current.backgroundMusic = null;
    }
    return;
  }
  
  // Don't start background music if special music is playing
  // (This check remains but now we've already force-stopped it above)
  if (shouldPlay && specialMusicPlaying.current) {
    console.log("Special music is playing - not starting background music");
    return;
  }
  
  // Start playing background music
  if (shouldPlay && !backgroundMusicRef.current) {
    console.log("Playing background music");
    const sound = new Audio(backgroundMusicFile);
    sound.volume = 0.5; // Set to half volume so it doesn't overpower effects
    sound.loop = true;
    
    sound.play()
      .then(() => {
        console.log("Background music playing successfully");
        backgroundMusicRef.current = sound;
        activeLoopingSounds.current.backgroundMusic = sound; // Track in active sounds
      })
      .catch(error => {
        console.error('Error playing background music:', error);
        backgroundMusicRef.current = null; // Clear ref on error
      });
  }
}, []);


  // Play special room music (crystal cave, waterfall, stream, etc.)
  // Updated playSpecialRoomMusic function to handle leaving special rooms better
const playSpecialRoomMusic = useCallback((type) => {
  // Define the room types that have actual looping music
    // Don't play if sounds are disabled
  if (!soundsEnabled.current) {
    console.log("Sounds are disabled - not playing special room music");
    return;
  }
  const musicRoomTypes = ['crystal', 'waterfall', 'trinkets','low_pulsing','gift'];
  
  // If we're stopping special music (type is null/undefined)
  if (!type) {
    console.log("Stopping special room music");

      // Stop BOTH refs to be sure
    if (specialMusicRef.current) {
      specialMusicRef.current.pause();
      specialMusicRef.current.currentTime = 0;
      specialMusicRef.current = null;
    }
    if (activeLoopingSounds.current.specialMusic) {
      activeLoopingSounds.current.specialMusic.pause();
      activeLoopingSounds.current.specialMusic.currentTime = 0;
      activeLoopingSounds.current.specialMusic = null;
      specialMusicRef.current = null;
    }
    specialMusicPlaying.current = false;
    return;
  }
  
  // For sound effects that aren't continuous music, don't stop background music
  if (!musicRoomTypes.includes(type)) {
    // Non-music room types just play their sound effect and keep background music
    if (type === 'echo') {
      console.log("Playing ghost echo sound");
      const sound = new Audio(ghostSoundFile);
      sound.play()
        .then(() => console.log("Ghost echo sound played successfully"))
        .catch(error => console.error("Error playing ghost echo sound:", error));
    } else if (type === 'stream') {
      console.log("Playing stream running sound");
      const sound = new Audio(streamSoundFile);
      sound.play()
        .then(() => console.log("Stream sound played successfully"))
        .catch(error => console.error("Error playing stream sound:", error));
    } else {
      // Any other room types just use background music
      console.log(`Room type '${type}' has no special music - using background music`);
    }
    
    // Make sure background music is playing for these rooms
    specialMusicPlaying.current = false;
    playBackgroundMusic();
    return;
  }
  
  // From here on, we're handling actual music rooms (crystal, waterfall, trinkets)
  
  // IMPORTANT: Stop background music but keep environmental sounds (wind/bat)
  if (activeLoopingSounds.current.backgroundMusic) {
    console.log("Pausing background music for special room");
    activeLoopingSounds.current.backgroundMusic.pause();
    activeLoopingSounds.current.backgroundMusic.currentTime = 0;
    activeLoopingSounds.current.backgroundMusic = null;
    backgroundMusicRef.current = null;
  }
  
  // Stop any currently playing special music
  if (activeLoopingSounds.current.specialMusic) {
    console.log("Stopping previous special music before starting new one");
    activeLoopingSounds.current.specialMusic.pause();
    activeLoopingSounds.current.specialMusic.currentTime = 0;
    activeLoopingSounds.current.specialMusic = null;
    specialMusicRef.current = null;
  }
  
  // Set flag BEFORE playing
  specialMusicPlaying.current = true;
  
  // Choose the right music based on the room type
  let musicFile;
  let volume = 0.5;
  
  if (type === 'crystal') {
    console.log("Playing crystal room music");
    musicFile = crystalMusicFile;
  } else if (type === 'waterfall') {
    console.log("Playing waterfall ambient music");
    musicFile = waterfallSoundFile;
    volume = 0.7; // Make waterfall a bit louder as it's more subtle
  } else if (type === 'trinkets') {
    console.log("Playing trinkets room music");
    musicFile = trinketsMusicFile;
    volume = 0.6; // Adjust volume for trinkets music
  } else if (type === 'low_pulsing') {  // Add this case
    console.log("Playing low pulsing sound");
    musicFile = pulsingSoundFile;
    volume = 0.7;
  }
  else if (type === 'gift') {  // ADD THIS
  console.log("Playing gift shop cheesy music");
  musicFile = cheesyLoopFile;
  volume = 0.6; // Adjust volume as needed
}
  
  // Play the selected music
  const sound = new Audio(musicFile);
  sound.volume = volume;
  sound.loop = true;
  
  sound.play()
    .then(() => {
      console.log(`Special room music (${type}) playing successfully`);
      specialMusicPlaying.current = true; // Ensure flag is set
      
      // CRITICAL: Store in activeLoopingSounds so it can be stopped later
      activeLoopingSounds.current.specialMusic = sound;
      specialMusicRef.current = sound;
    })
    .catch(error => {
      console.error(`Error playing special room music (${type}):`, error);
      // If special music fails, restart background music
      specialMusicPlaying.current = false;
      playBackgroundMusic();
    });
}, [playBackgroundMusic]);

  
  // Resume background music (after a special room)
 // Updated resumeBackgroundMusic function for smoother transitions
const resumeBackgroundMusic = useCallback(() => {
  // Stop any special music first and clear the flag
  if (specialMusicRef.current) {
    specialMusicRef.current.pause();
    specialMusicRef.current.currentTime = 0;
    specialMusicRef.current = null;
    specialMusicPlaying.current = false;
  }
  
  // Make sure we don't have any background music playing already
  if (backgroundMusicRef.current) {
    backgroundMusicRef.current.pause();
    backgroundMusicRef.current.currentTime = 0;
    backgroundMusicRef.current = null;
  }
  
  // Short delay to ensure clean transition
  setTimeout(() => {
    playBackgroundMusic();
  }, 100);
}, [playBackgroundMusic]);
  
  // Clean up any playing sounds (call when component unmounts)
  const cleanupSounds = useCallback(() => {
    if (windLoopRef.current) {
      windLoopRef.current.pause();
      windLoopRef.current = null;
    }
    
    if (batFlapLoopRef.current) {
      batFlapLoopRef.current.pause();
      batFlapLoopRef.current = null;
    }
    
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current = null;
    }
    
    if (specialMusicRef.current) {
      specialMusicRef.current.pause();
      specialMusicRef.current = null;
    }

      // ADD THIS - Stop victory music
  if (victoryMusicRef.current) {
    victoryMusicRef.current.pause();
    victoryMusicRef.current = null;
  }
    
  // Stop lose music
  if (loseMusicRef.current) {
    loseMusicRef.current.pause();
    loseMusicRef.current.currentTime = 0;
    loseMusicRef.current = null;


  }
  if (nightCrawlerSoundRef.current) {
    nightCrawlerSoundRef.current.pause();
    nightCrawlerSoundRef.current = null;
  }

  }, []);
  
const disableAllSounds = useCallback(() => {
  console.log("Disabling all sound playback");
  soundsEnabled.current = false;
  
  // Manually stop all sounds instead of calling cleanupSounds
  console.log("Stopping all active sounds");
  
  // Stop all looping sounds
  if (windLoopRef.current) {
    windLoopRef.current.pause();
    windLoopRef.current = null;
  }
  
  if (batFlapLoopRef.current) {
    batFlapLoopRef.current.pause();
    batFlapLoopRef.current = null;
  }
  
  if (backgroundMusicRef.current) {
    backgroundMusicRef.current.pause();
    backgroundMusicRef.current = null;
  }
  
  if (specialMusicRef.current) {
    specialMusicRef.current.pause();
    specialMusicRef.current = null;
  }
  
  if (victoryMusicRef.current) {
    console.log("disableAllSounds: Stopping victory music");
    victoryMusicRef.current.pause();
    victoryMusicRef.current.src = '';
    victoryMusicRef.current.load();
    victoryMusicRef.current = null;
  }
  
  if (loseMusicRef.current) {
    loseMusicRef.current.pause();
    loseMusicRef.current = null;
  }
  
  // Clear the activeLoopingSounds ref
  activeLoopingSounds.current = {
    wind: null,
    batFlap: null,
    backgroundMusic: null,
    specialMusic: null,
    victoryMusic: null,
    loseMusic: null,
    nightCrawler: null
  };
}, []); // No dependencies needed

const enableAllSounds = useCallback(() => {
  console.log("Enabling sound playback");
  soundsEnabled.current = true;
}, []); // No dependencies needed

  return {
    playWinSound,
    playWumpusSound: () => {}, // Placeholder, handled directly in GameContext
    playPitSound: () => {},    // Placeholder, handled directly in GameContext
    playLoseSound,
    playExploreSound,
    playPlayAgainSound,
    playWalkingSound,
    playDistantWumpusSound,
    playPitWindSound,    // Takes boolean parameter to start/stop
    playBatFlapSound,    // Takes boolean parameter to start/stop
    playBackgroundMusic, // Takes boolean parameter to start/stop
    playSpecialRoomMusic, // Takes room type parameter ('crystal', 'echo', 'waterfall', 'stream')
    resumeBackgroundMusic, // Resumes background music after special room
    playRoomSound,       // Plays room-specific sound effects
    playSlipSound,
    playWaterfallSound,
    playBonesCrunchSound,
    playGoblinCackleSound,
    playBatGrabScreamSound, // For bat encounter 
    cleanupSounds,
    playSmellSound,
    playCeilingFlapSound,
    playTeleportSound,
    playMapFoundSound,      // Make sure these are included
    playTreasureFoundSound, // Make sure these are included
    playCaveEntrySound,      // New function for cave entry sound
    playWhisperingSound,  // Add this
     
    stopAllLoopingSounds,
      playAutoPickupSound,        // Add this
  playInteractivePickupSound,  // Add this
  playLadderTrapSound,
  playWyrmglassSound,
  playFlameSound,
 playLanternSound,
  playSpellBookFailSound,
  playSpellBookSuccessSound,
  playTrinketTrapDeathSound,
  playVictoryMusicEnding,

  playLoseMusicEnding,
  disableAllSounds,
  enableAllSounds,
    playNightCrawlerSound,
  stopNightCrawlerSound,
  playGoldenCompassSound,
  playMapFragmentSound,
  playPlushieScreamSound,
  playPlushieSqueakSound,
  playPlushieMatingCallSound,
  playOldDoorOpeningSound,
  playRockThrowSound,
  playRockLockedInPLaceSound,
  setVialToThrowSound,
  playThrowingVialWooshSound,
  playVialbreakingSound,
  playWizardFreedSound,
  playNixieTollReqiuredSound,
  playNixieOneGoldCoinSound,
  playNixieGoldenCompassSound,
  playNixieThankYouJournalSound,
  playNixieAFairTradeSound,
  playShopKeeperFileSound,
  playShopKeeperRepellentSound,
  playShopKeeperLanternSound,
  playShopKeeperMapFragmentSound,
  playShopKeeperFlaskOilSound,
  playShopKeeperCloakSound,
  playShopKeeperTShirtSound,
  playShopKeeperMugSound,
  playShopKeeperCanvasBagSound,
  playShopKeeperPlushieSound,
  playShopKeeperLeavingSound,
  playHiddenRoomRumblingSound,
  playSodiumRockWaterExplosionSound,
  playWaterNixieShriekSound,
  playNixieWailingKillScream,
  playSandCreatureHissSound,
  playSandCreatureShriekSound
  };
};

export default useSounds;