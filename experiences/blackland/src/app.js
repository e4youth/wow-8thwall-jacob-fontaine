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
      src: 'assets/segments/blackland__where_you_are_v1.mp3',
      duration: 30.16,
      script: "At first the soil was so dark and so rich. Once home to indigenous people, the land became known as part of the Black Land Prairie. By the 1800s, a community of Swedish immigrants lived over here and it was called the Black Lands. Naturally, originally, the soil was so dark and rich. Eventually, the people were dark and rich too. Maybe rich in spirit, maybe rich in history,",
    },
    why_it_matters: {
      src: 'assets/segments/blackland__why_it_matters_v1.mp3',
      duration: 33.68,
      script: "maybe rich in resilience, maybe rich in wealth. In some cases, the people who established the community that would become known as the Black Land Neighborhood were rich in all of the above. Being dark and rich like the Black Land soil while actually living over here was the result of a bigger plan. The City of Austin's 1928 plan forced racial segregation in the city and if you wanted access to public resources and opportunities as a Black citizen here,",
    },
    what_is_this_place: {
      src: 'assets/segments/blackland__what_is_this_place_v1.mp3',
      duration: 36.72,
      script: "you had to live east of East Avenue, which is now known as Interstate Highway 35. Once the city officially designated where white people, where brown people, and where Black people were required to live in town, this area right here became the hub of the Black community. Black folks could legally own land and build businesses here and that's exactly what happened. Within 10 years of 1928, this became a thriving Black neighborhood and community that sustained",
    },
    key_fact: {
      src: 'assets/segments/blackland__key_fact_v1.mp3',
      duration: 35.04,
      script: "itself with business, culture, faith, and education along with other Black East Austin areas. By the 1960s, Black Land was a thriving Black neighborhood. By the 1980s, the University of Texas at Austin, that same school I fought to help get established, was threatening to demolish about half of the neighborhood to expand their college campus. UT Austin wanted to buy, to bulldoze, and to build right on top of Black Land after all that the Black community had been through",
    },
    deeper_history: {
      src: 'assets/segments/blackland__deeper_history_v1.mp3',
      duration: 35.28,
      script: "and built through. A legal concept called eminent domain could justify it, but residents formed an association and corporation to stop it. So, in the past 100 years, the Black Land neighborhood has gone from a place that formerly enslaved Africans were forced to live, to the place that the university wanted to build on top of, to a place that the community had to fight to stop the university from further erasing, to a combination of all of the above.",
    },
    wrap: {
      src: 'assets/segments/blackland__wrap_v1.mp3',
      duration: 8.4,
      script: "We carved out lives here, gardens, homes, futures. Though threatened, Black Land still thrives.",
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

