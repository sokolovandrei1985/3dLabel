export type ObjectType = 'pic' | 'rect' | 'text' | 'multi'

interface General {
  type: ObjectType
  left: number
  top: number
  width: number
  height: number
  opacity?: number | null
}

interface Shadow {
  size: number,
  blur: number,
  offsetX: number,
  offsetY: number
}

interface Rectangle {
  fillColor: string,
  borderColor: string,
  borderWidth: number,
  borderStyle: string,
  borderRadius: number
}

interface Text {
  text: string,
  fontFamily: string,
  fontSize: number,
  textColor: string
}

export interface ActiveObject extends General {
  shadow: Shadow | null
  rectangle: Rectangle | null
  text: Text | null
}