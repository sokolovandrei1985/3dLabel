import type { IShadow } from '@/models/fabric'

export type LineType = 'solid' | 'dashed' | 'dashdot'
type LineInfo = {
  key: string,
  title: string,
  value: number[] | null
}

export const LINE_TYPES: Record<LineType, LineInfo> = {
  solid: {
    key:'solid',
    title: 'Сплошная',
    value: null
  },
  dashed: {
    key: 'dashed',
    title: 'Пунктир',
    value: [5, 5]
  },
  dashdot: {
    key: 'dashdot',
    title: 'Штрих-пунктир',
    value: [10, 5, 2, 5]
  }
}

export const DEFAULT_SHADOW: IShadow = {
  color: 'rgba(0,0,0,1)',
  blur: 5,
  offsetX: 5,
  offsetY: 5
}

export const NEW_OBJECT_DEFAULTS = {
  rect: {
    fill: '#ffa500',
    stroke: '#000000',
    strokeWidth: 2
  },
  textbox: {
    fill: '#000000',
    text: 'Введите текст…',
    fontFamily: 'Arial',
    fontSize: 24
  }
}

export const DEFAULT_TEXTBOX_WIDTH_RATIO = 0.6

export type ChangeLayerType = 'bringForward' | 'bringToFront' | 'sendBackwards' | 'sendToBack'
export const CHANGE_LAYER_METHODS: Record<ChangeLayerType, string> = {
  bringForward: 'bringObjectForward',
  bringToFront: 'bringObjectToFront',
  sendBackwards: 'sendObjectBackwards',
  sendToBack: 'sendObjectToBack'
}