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
