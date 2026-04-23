// Copyright (c) 2022 8th Wall, Inc.
//
// app.js is the main entry point for your 8th Wall app. Code here will execute after head.html
// is loaded, and before body.html is loaded.

import './index.css'

// Register custom A-Frame components in app.js before the scene in body.html has loaded.
import {tapPlaceComponent} from './tap-place'
AFRAME.registerComponent('tap-place', tapPlaceComponent)

import {animationComponent} from './anim-controller.js'
AFRAME.registerComponent('anim-controller', animationComponent)
AFRAME.registerComponent('clips', animationComponent)

import {captionComponent} from './caption-comp.js'
AFRAME.registerComponent('caption-comp', captionComponent)

AFRAME.registerComponent('captions', captionComponent)
AFRAME.registerComponent('info', {
  schema: {
    duration: {type: 'number'},
    chunkSize: {type: 'int', default: 6},
    audioId: {type: 'string'},
    textId: {type: 'string'},
  },
})

// window.addEventListener('DOMContentLoaded', () => {
//   const captionEntity = document.getElementById('captionController');

//   captionEntity.setAttribute('caption-sync', {
//     script: 'Hello, young explorers! ...',
//     duration: 50,
//     chunkSize: 5,
//     audioId: 'trexSound',
//     textId: 'captionText',
//   });
// });

// window.addEventListener('load', () => {
//   const captionEntity = document.getElementById('captionController')
//   const fullScript = 'Hello, young explorers!! Look at where we are zooming today—Electric Drive! This amazing street in Austin is a hub for green transportation. Just like T-Rex, my friend here loves to move and groove, Electric Drive is all about keeping our city moving in a cleaner, greener way. From e-bikes and electric scooters to charging stations for electric cars, this place is Austin\'s own high-tech playground for eco-friendly transportation! T-Rex here loves to zip around on their e-bike, showing us all that you don\’t need to rely on fossil fuels to get around. By choosing electric transportation, we\’re helping reduce pollution and protect our beautiful planet. So, next time you think about getting somewhere, remember Electric Drive and how you can be part of the green movement. Ready to ride with T-Rex and explore the future of transportation? Let\’s roll towards a cleaner, brighter tomorrow!'

//   captionEntity.setAttribute('caption-sync', {
//     script: fullScript,
//     duration: 50,
//     chunkSize: 5,
//     audioId: 'trexSound',
//     textId: 'captionText',
//   })
// })

// UI hook: Quick answers (short segments).
window.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('DialogueSound')
  const captionController = document.getElementById('captionController')
  const captionText = document.getElementById('captionText')
  const buttons = Array.from(document.querySelectorAll('#quickAnswers [data-seg]'))
  if (!audio || !captionController || buttons.length === 0) return

  const SEGMENTS = {
    where_you_are: {
      src: 'assets/segments/rogers-washington-holy-cross__where_you_are_v1.mp3',
      duration: 27.02,
      script: "The Rogers Washington Holy Cross Historic District is a place where faith and family created strength. Churches, hospitals, schools, proof of our own foundations. This area is a timeless stamp of black professionalism in the form of an elegant middle-class neighborhood that emerged from the late 1940s to the 50s and 60s when most of the homes here were built.",
    },
    why_it_matters: {
      src: 'assets/segments/rogers-washington-holy-cross__why_it_matters_v1.mp3',
      duration: 28.28,
      script: "Historic mid-century American architecture accompanies a rich and remarkable history here. On September 3, 2020, Austin City Council voted to historically designate the Rogers Washington Holy Cross District. This is the eighth locally designated historic district and the first for a mostly African American neighborhood. So much East Austin and black history has been erased that somebody has to tell it.",
    },
    what_is_this_place: {
      src: 'assets/segments/rogers-washington-holy-cross__what_is_this_place_v1.mp3',
      duration: 27.88,
      script: "If you don't hear it, let alone see it, sometimes it's like it never existed. Well, this historical district was developed as a shining light of what is possible. Yes, there was segregation and racism and white middle-class people were moving out of town to the suburbs. And yes, the black professionals in this community provided for themselves by using what they had and building what they needed right here.",
    },
    key_fact: {
      src: 'assets/segments/rogers-washington-holy-cross__key_fact_v1.mp3',
      duration: 26.72,
      script: "World War II was over, but the style from that day and time remains evident here. Many of the houses were designed by John Chase himself. Mr. Chase was the first African American graduate of the University of Texas School of Architecture and he was the first black architect ever licensed in the state. Many of Austin's brightest black stars put their heads and hearts together to make this",
    },
    deeper_history: {
      src: 'assets/segments/rogers-washington-holy-cross__deeper_history_v1.mp3',
      duration: 28.0,
      script: "area a reality. The chancellor of Houston Tillotson University lived here. The first ombudsman of UT Austin lived here. The principal of nearby Keeling Junior High lived here. The Kirk family, as in the postal workers, pilots, and eventually mayors and presidential cabinet members, the Kirk family lived here too. City council members lived here and a Tuskegee airman lived here.",
    },
    wrap: {
      src: 'assets/segments/rogers-washington-holy-cross__wrap_v1.mp3',
      duration: 5.56,
      script: "Some of the earliest graduates of desegregated UT Austin lived here as well.",
    },
  }

  const setButtonsEnabled = (enabled) => { buttons.forEach((b) => { b.disabled = !enabled }) }

  const playSeg = async (segId) => {
    const seg = SEGMENTS[segId]
    if (!seg) return
    captionController.setAttribute('captions', `script: ${seg.script}`)
    captionController.setAttribute('info', `duration: ${seg.duration}; chunkSize: 6; audioId: DialogueSound; textId: captionText`)
    if (captionText) captionText.textContent = seg.script
    audio.pause()
    audio.currentTime = 0
    audio.src = seg.src
    audio.load()
    setButtonsEnabled(false)
    try { await audio.play() } catch (e) { console.warn('Audio play blocked/failed', e); setButtonsEnabled(true) }
  }

  buttons.forEach((btn) => { btn.addEventListener('click', () => playSeg(btn.getAttribute('data-seg'))) })
  audio.addEventListener('ended', () => setButtonsEnabled(true))
})

