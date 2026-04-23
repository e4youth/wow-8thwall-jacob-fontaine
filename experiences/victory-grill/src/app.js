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
      src: 'assets/segments/victory-grill__where_you_are_v1.mp3',
      duration: 20.64,
      script: "Closed doors couldn't stop us. We opened our own stages, filled with rhythm, soul, and hope. The East 11th Street Corridor was once the social hub of Austin's black community, yet nowadays it is hard to recognize what used to be here. The Victory Grill was a live music venue and restaurant",
    },
    why_it_matters: {
      src: 'assets/segments/victory-grill__why_it_matters_v1.mp3',
      duration: 19.0,
      script: "on the Chitlin Circuit, where big-time artists from all over the country performed at black-owned institutions throughout the Jim Crow era. Founded at the close of World War II in 1945 by Johnny Holmes, himself a black veteran, this gave the community and the returning soldiers",
    },
    what_is_this_place: {
      src: 'assets/segments/victory-grill__what_is_this_place_v1.mp3',
      duration: 19.96,
      script: "a place to unwind and to socialize. It hosted Hall of Fame talent like B.B. King, James Brown, Ike and Tina Turner, Billie Holiday, Chuck Berry, and Etta James, not to mention all the folks you haven't even heard of. The Victory Grill attracted all kinds of people",
    },
    key_fact: {
      src: 'assets/segments/victory-grill__key_fact_v1.mp3',
      duration: 18.38,
      script: "from all over Central Texas, as soldiers, college students, even white locals, and more showed up. Now known as Victory East, this venue is still open and still thriving, but of course this came with plenty of challenges.",
    },
    deeper_history: {
      src: 'assets/segments/victory-grill__deeper_history_v1.mp3',
      duration: 20.66,
      script: "There was a fire in 1988, and gentrification has in many ways left the 11th Street Corridor unrecognizable, but thanks to a friend of the original owner named R.V. Adams and some other gracious people like Eva Lindsey, the venue, the Victory Grill, and its legacy",
    },
    wrap: {
      src: 'assets/segments/victory-grill__wrap_v1.mp3',
      duration: 9.24,
      script: "are intact on Austin's east side. The Victory Grill was added to the National Register of Historic Places in 1998.",
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

