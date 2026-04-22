export const animationComponent = {
  schema: {
    lipSyncClip: {type: 'string', default: ''},
    audioId: {type: 'string', default: ''},
  },

  init() {
    this.previousClip = null
    this.action = null
    this.lipAction = null
    this.mixer = null
    this.clips = []
    this.availableClipNames = []
    this.isAudioPlaying = false
    this.idleClip = 'NeutIdle'
    this.shouldHoldPlay = false
    this.holdPlayed = false
    const ground = document.getElementById('ground')
    this.building = document.getElementById('buildingEntity')
    this._onFinish = this.onAnimationFinished.bind(this)

    this.el.addEventListener('model-loaded', () => {
      this.setupAnimations()
    })

    ground.addEventListener('click', (event) => {
      this.setupAudio()
    })
  },

  setupAnimations() {
    const model = this.el.getObject3D('mesh')
    // const lectureClipIndex = 1
    if (!model) return

    this.mixer = new THREE.AnimationMixer(model)
    this.clips = model.animations || []

    // filter out lipsync anim out of avail clips
    this.availableClipNames = this.clips
      .filter(c => !c.name.includes('LipSync') && !c.name.includes('Hold') && !c.name.includes('Idle'))
      .map(c => c.name)

    // console.log('Available clips:', this.availableClipNames)

    // Grab audio element directly from DOM
    this.audioEl = document.getElementById(this.data.audioId)

    // console.log('this.data.lipSyncClip:', this.data.lipSyncClip)
    // Setup lip sync clip
    if (this.data.lipSyncClip) {
      const lipClip = THREE.AnimationClip.findByName(this.clips, this.data.lipSyncClip)
      if (lipClip) {
        this.lipAction = this.mixer.clipAction(lipClip)
        this.lipAction.setLoop(THREE.LoopOnce, 0)  // play once
        this.lipAction.clampWhenFinished = true
      }
    }

    this.mixer.addEventListener('finished', this._onFinish)
  },

  setupAudio() {
    if (this.audioEl.paused && this.audioEl.currentTime === 0) {
      // console.log('Audio is stopped (at the beginning).')
      this.audioEl.play()
      this.onAudioPlay()
    } else if (this.audioEl.paused && this.audioEl.currentTime > 0) {
      // RESET EVERYTHING
      this.audioEl.currentTime = 0
      this.audioEl.play()
      this.onAudioPlay()
    }
  },

  playClip(clip) {
    if (!clip || !this.mixer) return

    // if (this.previousClip?.name === clip.name) return

    const newAction = this.mixer.clipAction(clip)
    newAction.reset()
    newAction.setLoop(THREE.LoopRepeat, 2)
    newAction.clampWhenFinished = true

    if (this.action) {
      newAction.crossFadeFrom(this.action, 0.3, false)
    }

    if (this.shouldHoldPlay) {
      newAction.setEffectiveTimeScale(0.5)
    }

    newAction.play()
    this.previousClip = clip
    this.action = newAction

    console.log('Playing animation clip:', clip.name)
  },

  playRandomClip() {
    if (!this.mixer || this.availableClipNames.length === 0) return

    let nextClip
    do {
      const randomName = this.availableClipNames[Math.floor(Math.random() * this.availableClipNames.length)]
      nextClip = this.shouldHoldPlay ? THREE.AnimationClip.findByName(this.clips, 'Hold') : THREE.AnimationClip.findByName(this.clips, randomName)
    } while (nextClip && nextClip.name === this.previousClip?.name)  // stops while loop once condition false

    this.playClip(nextClip)
  },

  showBuilding() {
    if (this.building) {
      this.building.setAttribute('visible', 'true')
    }
  },

  hideBuilding() {
    if (this.building) {
      this.building.setAttribute('visible', 'false')
    }
  },

  startLipAnimation() {
    if (this.lipAction && !this.lipAction.isRunning()) {
      this.lipAction.reset().play()
    }
  },

  stopLipAnimation() {
    if (this.lipAction) {
      this.lipAction.stop()
    }
  },

  onAudioPlay() {
    this.isAudioPlaying = true
    this.startLipAnimation()
    this.playRandomClip()  // <--- start first random body anim immediately
    // Fire a custom A-Frame event from this entity
    this.el.emit('audio-play', {entityId: 'jacobEntity'}, true)  // 3rd arg is bubble
    // console.log('[anim] Dispatched audio-play event')
  },

  onAudioPause() {
    this.isAudioPlaying = false
    this.stopLipAnimation()
    if (this.action) this.action.paused = true
  },

  onAudioEnded() {
    this.isAudioPlaying = false
    this.stopLipAnimation()

    // play neutral idle pose instead of leaving jacob into t-pose
    const lastAction = this.mixer.clipAction(this.idleClip)
    lastAction.reset()
    lastAction.setLoop(THREE.LoopRepeat, Infinity)

    // Fade out current body animation
    if (this.action) {
      lastAction.crossFadeFrom(this.action, 0.5, false)
    }

    lastAction.play()
    this.action = lastAction

    if (this.previousClip) {
      this.previousClip = null
    }

    this.mixer.removeEventListener('finished', this._onFinish)
  },

  onAnimationFinished(e) {
    if (!this.isAudioPlaying) return  // Don't continue if audio has ended

    const finishedClipName = e.action.getClip().name
    if (finishedClipName === this.previousClip?.name) {
      console.log('[anim] finished:', finishedClipName)
      setTimeout(() => this.playRandomClip(), 300)
    }
  },

  tick(time, delta) {
    if (this.mixer) {
      this.mixer.update(delta / 1000)
    }

    // Poll audio state every frame
    if (this.audioEl) {
      if (this.isAudioPlaying && this.audioEl.ended) {
        // console.log('[tick] Audio ended, stopping animations')
        this.onAudioEnded()
      } else if (!this.isAudioPlaying && !this.audioEl.paused && !this.audioEl.ended) {
        this.onAudioPlay()
      }
    }

    // if (this.el.handTracker && this.building) {
    //   const worldPos = new THREE.Vector3()
    //   this.handTracker.getWorldPosition(worldPos)
    //   this.building.object3D.position.copy(worldPos)

    //   // Make the building always face the active camera this.building.object3D.rotation.set(0, 0, 0)

    //   const {camera} = this.el.sceneEl
    //   this.building.object3D.lookAt(camera.position)
    // }

    // Cue Hold + building at 1:29 |  this.audioEl.currentTime >= 89 93.2 || 96 99.5
    if (this.isAudioPlaying && ((this.audioEl.currentTime >= 3 && this.audioEl.currentTime <= 7.2) || (this.audioEl.currentTime >= 10 && this.audioEl.currentTime <= 13.5))) {
      if (!this.holdPlayed) {
        // console.log('Forcing Hold animation')
        const holdClip = THREE.AnimationClip.findByName(this.clips, 'Hold')
        if (holdClip) this.playClip(holdClip)  // PLAY ONCE TO DO
        this.shouldHoldPlay = true
        this.holdPlayed = true  // ensure only plays once
        this.showBuilding()
      } else {
        this.showBuilding()
      }
    } else {
      this.hideBuilding()
      this.shouldHoldPlay = false
    }
  },

  remove() {
    if (this.mixer) {
      this.mixer.stopAllAction()
      this.mixer.removeEventListener('finished', this._onFinish)
    }
  },
}
