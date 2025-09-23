export type CameraKey = 'ortho' | 'perspective'
export interface CameraType {
  key: CameraKey
  title: string
}

export type ModelViewKey = 'front' | 'back' | 'right' | 'left' | 'top'
export interface ModelView {
  key: ModelViewKey
  title: string
}