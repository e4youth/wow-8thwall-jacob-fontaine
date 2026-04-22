export const tapPlaceComponent = {
  schema: {
    min: {default: 6},
    max: {default: 10},
  },
  init() {
    const ground = document.getElementById('ground')
    this.prompt = document.getElementById('promptText')
    this.handTracker = new THREE.Object3D()

    // initialize bird position offsets
    // const birdYOffset = 10
    // const birdZOffset = 8
    // const birdXOffset = 2

    // initialize cam and posiion for making models face cam
    const camera = document.getElementById('camera')
    const cameraWorldPos = new THREE.Vector3()
    camera.object3D.getWorldPosition(cameraWorldPos)

    // set models scale size
    const birdScale = 4
    const objScale = 5  // 66 is about human size
    let hasClicked = false

    ground.addEventListener('click', (event) => {
      if (!hasClicked) {
        // prevent users from populating more
        hasClicked = true

        // Dismiss the prompt text.
        this.prompt.style.display = 'none'

        // Create new entity for the new object
        const newElementBuilding = document.createElement('a-entity')
        const newElementObj = document.createElement('a-entity')
        // const objModel = document.getElementById('jacobModel')

        // The raycaster gives a location of the touch in the scene
        const touchPoint = event.detail.intersection.point

        // Clone the touchPoint so we don't mutate it for the Trex
        // const birdPosition = {...touchPoint}
        // birdPosition.y += birdYOffset
        // birdPosition.z += birdZOffset
        // birdPosition.x += birdXOffset

        // newElementBird.setAttribute('position', birdPosition)
        newElementObj.setAttribute('position', touchPoint)

        // Gold dollar build set LOCATION
        // const model = this.el.getObject3D('mesh')
        // if (model) {
        //   const hand = model.getObjectByName('mixamorigRightHand')
        //   if (hand) {
        //     hand.add(building.object3D)
        //     building.object3D.position.set(0, 0.1, 0)  // adjust placement in hand
        //     console.log('Building attached to hand')
        //   } else {
        //     this.el.appendChild(building)
        //     building.setAttribute('position', '0 1 0')
        //     console.warn('Hand bone not found, spawned near Jacob')
        //   }
        // }

        // const randomYRotation = Math.random() * 360
        // direction from object to camera
        const dx = cameraWorldPos.x - touchPoint.x
        const dz = cameraWorldPos.z - touchPoint.z
        const angle = Math.atan2(dx, dz) * (180 / Math.PI)

        // newElementBird.setAttribute('rotation', `0 ${angle} 0`)
        // newElementBuilding.setAttribute('rotation', `0 ${angle} 0`)
        newElementObj.setAttribute('rotation', `0 ${angle} 0`)

        // const randomScale = Math.floor(Math.random() * (Math.floor(this.data.max) - Math.ceil(this.data.min)) + Math.ceil(this.data.min))

        // newElementBird.setAttribute('visible', 'false')
        // newElementBird.setAttribute('scale', '0.0001 0.0001 0.0001')
        newElementBuilding.setAttribute('scale', '.02 .02 .02')
        newElementBuilding.setAttribute('visible', 'false')
        newElementObj.setAttribute('scale', '0.0001 0.0001 0.0001')
        newElementObj.setAttribute('visible', 'false')

        // doesn't allow object to have shadow casted
        // newElementBird.setAttribute('shadow', {
        //   receive: false,
        // })

        // newElementBird.setAttribute('gltf-model', '#birdModel')
        // newElementBird.setAttribute('animation-mixer', '')
        newElementBuilding.setAttribute('id', 'buildingEntity')
        newElementBuilding.setAttribute('gltf-model', '#buildingModel')
        newElementObj.setAttribute('id', 'jacobEntity')
        newElementObj.setAttribute('gltf-model', '#jacobModel')
        // newElementObj.setAttribute('animation-mixer', '')
        newElementObj.setAttribute('anim-controller', 'lipSyncClip: Jacob Fontaine-LipSyncAction; audioId: DialogueSound')
        newElementObj.setAttribute('sound', {
          src: '#DialogueSound',
          autoplay: false,
          positional: false,
          volume: 5,
        })

        this.el.sceneEl.appendChild(newElementBuilding)
        this.el.sceneEl.appendChild(newElementObj)

        // newElementBird.addEventListener('model-loaded', () => {
        // // Once the model is loaded, we are ready to show it popping in using an animation
        //   newElementBird.setAttribute('visible', 'true')
        //   newElementBird.setAttribute('animation', {
        //     property: 'scale',
        //     to: `${birdScale} ${birdScale} ${birdScale}`,
        //     easing: 'easeOutElastic',
        //     dur: 800,
        //   })
        // })

        newElementObj.addEventListener('model-loaded', () => {
        // Once the model is loaded, we are ready to show it popping in using an animation
          newElementObj.setAttribute('visible', 'true')
          newElementObj.setAttribute('animation', {
            property: 'scale',
            to: `${objScale} ${objScale} ${objScale}`,
            easing: 'easeOutElastic',
            dur: 800,
          })
          newElementObj.setAttribute('sound', {

          })

          const jacobModel = newElementObj.getObject3D('mesh')
          const buildingMesh = newElementBuilding.object3D

          if (jacobModel) {
            const hand = jacobModel.getObjectByName('mixamorigRightHand')
            if (hand) {
              // Attach tracker for position only
              hand.add(this.handTracker)
              this.handTracker.position.set(0, 10, 10)

              // Add building as child
              this.handTracker.add(buildingMesh)

              // Cancel out parent’s rotation each frame
              this.el.sceneEl.addEventListener('tick', () => {
                const {cam} = this.el.sceneEl
                buildingMesh.lookAt(cam.position)
                buildingMesh.rotateX(Math.PI / 2)
              })

              console.log('✅ Building attached to Jacob’s right hand')

              // Make building pop in after attach
              newElementBuilding.setAttribute('visible', 'true')
              newElementBuilding.setAttribute('animation', {
                property: 'scale',
                to: '5 5 5',  // or your objScale
                easing: 'easeOutElastic',
                dur: 800,
              })
            } else {
              console.warn('⚠️ Hand bone not found, spawning building near Jacob instead')
              newElementBuilding.setAttribute('position', '0 1 0')
              newElementBuilding.setAttribute('visible', 'true')
            }
          }
        })

        newElementObj.dispatchEvent(new CustomEvent('obj-added', {bubbles: true}))
      }
    })
  },
}
