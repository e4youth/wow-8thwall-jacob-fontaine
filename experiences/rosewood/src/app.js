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

// UI hook: Rosewood quick answers (short segments).
// Each button swaps the audio src, updates caption timing, and plays.
window.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('DialogueSound')
  const captionController = document.getElementById('captionController')
  const captionText = document.getElementById('captionText')
  const buttons = Array.from(document.querySelectorAll('#quickAnswers [data-seg]'))

  if (!audio || !captionController || buttons.length === 0) return

  const SEGMENTS = {
    where_you_are: {
      src: 'assets/segments/rosewood__where-you-are_v1.mp3',
      duration: 13.7,
      script: "If you travel southbound from the intersection of 12th Street and Chicon Street toward Huston-Tillotson University, you'll make it to the bottom of a short hill, maybe without knowing how unique of a position you're actually in.",
    },
    why_it_matters: {
      src: 'assets/segments/rosewood__why-it-matters_v1.mp3',
      duration: 13.06,
      script: "These grounds hold our challenges and our triumphs, where families found homes and where we reclaimed our freedom. This is a uniquely wondrous historical site in more ways than one.",
    },
    what_is_rosewood_courts: {
      src: 'assets/segments/rosewood__rosewood-courts-what-it-is_v1.mp3',
      duration: 14.0,
      script: 'On the corner of Rosewood and Chicon, Rosewood Courts, the first public housing project for African Americans in the United States, has been home to East Austin residents since 1939.',
    },
    new_deal_and_lbj: {
      src: 'assets/segments/rosewood__new-deal-and-lbj_v1.mp3',
      duration: 12.0,
      script: "This community of homes was established as part of President Franklin D. Roosevelt's New Deal and also was lobbied for by then-Congressman Lyndon Baines Johnson, or LBJ.",
    },
    emancipation_park_and_juneteenth: {
      src: 'assets/segments/rosewood__emancipation-park-juneteenth_v1.mp3',
      duration: 20.0,
      script: 'The site of Rosewood Courts here was originally Emancipation Park, an extremely important social and recreational site where Juneteenth celebrations date all the way back to 1930. This is where Black families reunited to publicly celebrate our freedom and progress on our own terms.',
    },
    thomas_j_white_and_wrap: {
      src: 'assets/segments/rosewood__thomas-j-white-and-wrap_v1.mp3',
      duration: 23.0,
      script: "This land was originally bought by a formerly enslaved man named Thomas J. White. Once he started the Emancipation Park Association back in 1905, he bought a five-acre tract right here within two years' time. So it's fitting that this place sits at the bottom of a hill, because the stories and significance run deep.",
    },
  }

  const setButtonsEnabled = (enabled) => {
    buttons.forEach((b) => { b.disabled = !enabled })
  }

  const playSeg = async (segId) => {
    const seg = SEGMENTS[segId]
    if (!seg) return

    // Update caption controller data so caption-comp recalculates timings.
    captionController.setAttribute('captions', `script: ${seg.script}`)
    captionController.setAttribute('info', `duration: ${seg.duration}; chunkSize: 6; audioId: DialogueSound; textId: captionText`)

    // Reset UI
    if (captionText) captionText.textContent = seg.script

    // Swap audio.
    audio.pause()
    audio.currentTime = 0
    audio.src = seg.src
    audio.load()

    setButtonsEnabled(false)

    try {
      await audio.play()
    } catch (e) {
      console.warn('Audio play blocked/failed', e)
      setButtonsEnabled(true)
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const segId = btn.getAttribute('data-seg')
      playSeg(segId)
    })
  })

  audio.addEventListener('ended', () => {
    setButtonsEnabled(true)
  })
})
