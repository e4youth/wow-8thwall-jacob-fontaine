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
    const ground = document.getElementById('ground')

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

    console.log('Available clips:', this.availableClipNames)

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

    // if (!this.audioEl) {
    //   console.error('Audio element not found with id:', this.data.audioId)
    //   return
    // }

    // const dialogueEntity = document.getElementById('dialogueEntity')
    // console.log('dialogueEntity', dialogueEntity)
    // dialogueEntity.addEventListener('sound-loaded', () => {
    //   console.log('A-Frame sound PLAY fired!')
    //   this.onAudioPlay()
    // })

    // dialogueEntity.addEventListener('sound-ended', () => {
    //   console.log('A-Frame sound ENDED fired!')
    //   this.onAudioEnded()
    // })

    // // Hook audio events
    // console.log('this.data.audioId:', this.data.audioId)
    // if (this.data.audioId) {
    //   const audioEl = document.getElementById(this.data.audioId)

    //   console.log(audioEl, audioEl.constructor.name)

    //   if (audioEl) {
    //     audioEl.addEventListener('play', () => console.log('Play fired!'))

    //     // audioEl.addEventListener('play', () => this.onAudioPlay())
    //     audioEl.addEventListener('playing', () => this.onAudioPlay())

    //     audioEl.addEventListener('pause', () => this.onAudioPause())
    //     audioEl.addEventListener('ended', () => this.onAudioEnded())
    //     console.log('firing audio events ready')
    //   }
    // }

    this.mixer.addEventListener('finished', this._onFinish)
  },

  setupAudio() {
    if (this.audioEl.paused && this.audioEl.currentTime === 0) {
      // console.log('Audio is stopped (at the beginning).')
      this.audioEl.play()
      this.onAudioPlay()
    } else if (this.audioEl.paused && this.audioEl.currentTime > 0) {
      // console.log('Audio is paused.')
      this.audioEl.currentTime = 0
      this.audioEl.play()
      this.onAudioPlay()
    }

    // else if (this.audioEl.ended) {
    //   console.log('Audio has finished playing.')
    // } else {
    //   console.log('Audio is currently playing.')
    // }
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

    newAction.play()
    this.previousClip = clip
    this.action = newAction

    // console.log('Playing animation clip:', clip.name)
  },

  playRandomClip() {
    if (!this.mixer || this.availableClipNames.length === 0) return

    let nextClip
    do {
      const randomName = this.availableClipNames[Math.floor(Math.random() * this.availableClipNames.length)]
      nextClip = THREE.AnimationClip.findByName(this.clips, randomName)
    } while (nextClip && nextClip.name === this.previousClip?.name)  // stops while loop once condition false

    this.playClip(nextClip)
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
  },

  remove() {
    if (this.mixer) {
      this.mixer.stopAllAction()
      this.mixer.removeEventListener('finished', this._onFinish)
    }
  },
}
