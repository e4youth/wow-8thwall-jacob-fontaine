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
      src: 'assets/segments/huston-tillotson__where_you_are_v1.mp3',
      duration: 32.32,
      script: "Welcome to the Houston-Tillotson University. But first, let's take a step back. In 1881 and 82, history says that I, Mr. Jacob Fontaine, emerged as the leading Black advocate for the establishment of the University of Texas at Austin. And yes, it worked out. So I can assume you've heard of UT Austin by now. But a good decade or so before UT got started, back in the 1870s, Austin's first institution of higher learning was established.",
    },
    why_it_matters: {
      src: 'assets/segments/huston-tillotson__why_it_matters_v1.mp3',
      duration: 34.4,
      script: "It began with the American Missionary Society of Congregational Churches chartering Tillotson Collegiate and Normal Institute in 1875, opening its doors to students in 1881. By the end of the first year, there were about 100 students attending. From the beginning, enrollment here was considered a prestigious distinction. And so, most of 200 years ago, the story begins of this institution that remains a pillar in the Black community. It's the modern-day Houston-Tillotson University.",
    },
    what_is_this_place: {
      src: 'assets/segments/huston-tillotson__what_is_this_place_v1.mp3',
      duration: 32.56,
      script: "With the annual Martin Luther King Day festival, and also countless other community events, something beautiful is always happening on this campus. Most consistently, you will see young people being professionally trained as they come of age while making long-lasting relationships here. It all started with an emphasis on moral and religious instruction. See, schools could not be racially mixed in the late 1800s because it was against the law. So, like the two schools that merged to form this university,",
    },
    key_fact: {
      src: 'assets/segments/huston-tillotson__key_fact_v1.mp3',
      duration: 35.92,
      script: "this campus was founded as a school specifically for Black students. Now known as one of 100 or so Historically Black Colleges and Universities, or HBCUs, Houston-Tillotson remains a small college campus with many academic majors as well as a graduate school. In 1952, Samuel Houston College and Tillotson College merged to form Houston-Tillotson College, affectionately known today as HT. In 2005, this campus officially became Houston-Tillotson",
    },
    deeper_history: {
      src: 'assets/segments/huston-tillotson__deeper_history_v1.mp3',
      duration: 30.64,
      script: "University. This is the Blue Bonnet Hill area, once known as the Negro District and now known as the Sixth Square Black Cultural District. This higher learning institution still serves mostly Black students, but is no longer limited by legal racial exclusion. One amazing fact about HT is that the Jackie Robinson, yes Jackie Robinson, used to be the basketball coach and even an instructor here before he played for the Brooklyn Dodgers. The president of HT at that time, Carl",
    },
    wrap: {
      src: 'assets/segments/huston-tillotson__wrap_v1.mp3',
      duration: 29.12,
      script: "Downs, was like a father figure to Robinson. Another fact, Austin's oldest institution of higher learning here, the only Historically Black College and University in Austin, has been added to the National Register of Historic Places as a historic district. They said we couldn't learn, so we made our own institutions, places that powered our progress. Some of these places still visibly exist here in Austin, Texas.",
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

