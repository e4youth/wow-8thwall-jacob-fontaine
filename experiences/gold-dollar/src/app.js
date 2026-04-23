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
      src: 'assets/segments/gold-dollar__where_you_are_v1.mp3',
      duration: 13.98,
      script: "In 1876, I founded the Gold Dollar, one of the first Black weekly newspapers in the South. I founded the Gold Dollar to educate and strengthen the Black community.",
    },
    why_it_matters: {
      src: 'assets/segments/gold-dollar__why_it_matters_v1.mp3',
      duration: 8.88,
      script: "We were still living in the shadow of enslavement and this made reading, writing, and communication crucial keys to freedom.",
    },
    what_is_this_place: {
      src: 'assets/segments/gold-dollar__what_is_this_place_v1.mp3',
      duration: 9.86,
      script: "The Gold Dollar was the first Black-owned newspaper in this capital city, known by some as the first Black newspaper west of the Mississippi.",
    },
    key_fact: {
      src: 'assets/segments/gold-dollar__key_fact_v1.mp3',
      duration: 7.86,
      script: "Between 1870 and 1900, this was among 48 Black-owned commercial newspapers in Texas.",
    },
    deeper_history: {
      src: 'assets/segments/gold-dollar__deeper_history_v1.mp3',
      duration: 5.28,
      script: "Nowadays, the Gold Dollar building is not just a former newspaper office, though.",
    },
    wrap: {
      src: 'assets/segments/gold-dollar__wrap_v1.mp3',
      duration: 5.1,
      script: "This is the last standing structure of Wheatville, a freedom colony in Central Austin.",
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

