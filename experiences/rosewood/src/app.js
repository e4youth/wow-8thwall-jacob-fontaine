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

// UI hook: explicit narration playback button.
// This avoids relying on tapping the ground and makes audio start a clear user gesture.
window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('playNarrationBtn')
  const audio = document.getElementById('DialogueSound')
  if (!btn || !audio) return

  const resetBtn = () => {
    btn.textContent = 'Play narration'
    btn.disabled = false
  }

  btn.addEventListener('click', async () => {
    try {
      audio.currentTime = 0
      await audio.play()
      btn.textContent = 'Playing…'
      btn.disabled = true
    } catch (e) {
      console.warn('Audio play blocked/failed', e)
      btn.textContent = 'Tap again to play'
    }
  })

  audio.addEventListener('ended', resetBtn)
})
