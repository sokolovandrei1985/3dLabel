// src/composables/useFitToView.ts
import { inject, provide } from 'vue'
import { Box3, Vector3, PerspectiveCamera, OrthographicCamera } from 'three'
import { useTresContext } from '@tresjs/core'
import { unref } from 'vue'

const FIT_CONTEXT_KEY = Symbol('fit-to-view')

export function provideFitToView() {
  const { scene, camera } = useTresContext()

  function fitModelToView() {
    const cam = unref(camera)
    const scn = unref(scene)
    if (!cam || !scn) return

    const box = new Box3().setFromObject(scn)
    const size = new Vector3()
    const center = new Vector3()
    box.getSize(size)
    box.getCenter(center)

    if (cam instanceof PerspectiveCamera) {
      const maxDim = Math.max(size.x, size.y, size.z)
      const fov = cam.fov * (Math.PI / 180)
      const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
      cam.position.set(center.x, center.y, center.z + cameraZ)
    } else if (cam instanceof OrthographicCamera) {
      cam.zoom = 1
      cam.position.set(center.x, center.y, center.z + 10)
    }

    cam.lookAt(center)

    if ('updateProjectionMatrix' in cam && typeof cam.updateProjectionMatrix === 'function') {
      cam.updateProjectionMatrix()
    }
  }

  provide(FIT_CONTEXT_KEY, { fitModelToView })
}

export function useFitToView() {
  const ctx = inject<{ fitModelToView: () => void }>(FIT_CONTEXT_KEY)
  if (!ctx) throw new Error('useFitToView must be used within provideFitToView context')
  return ctx
}
