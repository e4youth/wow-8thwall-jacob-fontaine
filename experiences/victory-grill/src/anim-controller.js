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
    this.idleAction = null
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

    // Start idle immediately (always-on motion)
    this.startIdleAnimation()

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

  pickIdleClip() {
    if (!this.clips || this.clips.length === 0) return null

    // Prefer exact configured idle clip.
    let clip = THREE.AnimationClip.findByName(this.clips, this.idleClip)
    if (clip) return clip

    // Fallback: any clip with "Idle" in the name.
    clip = this.clips.find(c => /idle/i.test(c.name))
    if (clip) return clip

    // Fallback: any non-lipsync clip.
    clip = this.clips.find(c => !/lipsync/i.test(c.name))
    return clip || null
  },

  startIdleAnimation() {
    if (!this.mixer) return
    const idleClip = this.pickIdleClip()
    if (!idleClip) return

    const action = this.mixer.clipAction(idleClip)
    action.reset()
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.play()
    this.idleAction = action
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

    // Pause idle while we play body motion clips.
    if (this.idleAction) this.idleAction.paused = true

    this.playRandomClip()  // start first random body anim immediately

    // Fire a custom A-Frame event from this entity
    this.el.emit('audio-play', {entityId: 'dialogueEntity'}, true)  // 3rd arg is bubble
  },

  onAudioPause() {
    this.isAudioPlaying = false
    this.stopLipAnimation()
    if (this.action) this.action.paused = true
    if (this.idleAction) this.idleAction.paused = false
  },

  onAudioEnded() {
    this.isAudioPlaying = false
    this.stopLipAnimation()

    // Return to idle loop.
    if (this.action) {
      this.action.stop()
    }

    if (this.idleAction) {
      this.idleAction.reset()
      this.idleAction.paused = false
      this.idleAction.play()
      this.action = this.idleAction
    } else {
      // As a fallback, attempt to (re)start idle.
      this.startIdleAnimation()
      this.action = this.idleAction || null
    }

    if (this.previousClip) {
      this.previousClip = null
    }

    // Keep the mixer listener; it is harmless when not playing.
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
