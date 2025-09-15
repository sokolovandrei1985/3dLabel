import type { CameraType, ModelView } from '@/types/camera'

export const CamTypes: CameraType[] = [
  { key: 'ortho', title: 'Ортографическая' },
  { key: 'perspective', title: 'Перспективная' }
]

export const ModelViews: ModelView[] = [
  { key: 'front', title: 'Спереди' },
  { key: 'back', title: 'Сзади' },
  { key: 'right', title: 'Справа' },
  { key: 'left', title: 'Слева' },
  { key: 'top', title: 'Сверху' }
]