export type ObjectType = 'image' | 'rect' | 'text' | 'group'

interface BaseProp {
  type: ObjectType
  left: number
  top: number
  width: number
  height: number
}

interface ShadowProp {
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

interface SingleProp {
  angle: number | null
  opacity: number | null
  shadow: ShadowProp | null
}

interface RectangleProp {
  color: string
  borderColor: string
  borderWidth: number
  borderStyle: string
  borderRadius: number
}

interface TextProp {
  text: string
  fontFamily: string
  fontSize: number
  color: string
}

export interface IGroup extends BaseProp {
  size: number
}

export interface IImage extends BaseProp, SingleProp {}

export interface IRect extends BaseProp, SingleProp, RectangleProp {}

export interface IText extends BaseProp, SingleProp, TextProp {}

// Базовый класс для общих свойств
class BaseObject implements BaseProp {
  type: ObjectType
  left: number
  top: number
  width: number
  height: number

  constructor(params: BaseProp) {
    this.type = params.type
    this.left = params.left
    this.top = params.top
    this.width = params.width
    this.height = params.height
  }
}

// Класс для объектов с эффектами
class SingleObject extends BaseObject implements SingleProp {
  angle: number | null
  opacity: number | null
  shadow: ShadowProp | null

  constructor(params: BaseProp & SingleProp) {
    super(params)
    this.angle = params.angle
    this.opacity = params.opacity
    this.shadow = params.shadow
  }
}

// Класс Group
export class Group extends BaseObject {
  size: number

  constructor(params: IGroup) {
    super(params)
    this.size = params.size
  }
}

// Класс Image
export class Image extends SingleObject implements IImage {
  constructor(params: IImage) {
    super(params)
  }
}

// Класс Rect
export class Rect extends SingleObject implements IRect {
  color: string
  borderColor: string
  borderWidth: number
  borderStyle: string
  borderRadius: number

  constructor(params: IRect) {
    super(params)
    this.color = params.color
    this.borderColor = params.borderColor
    this.borderWidth = params.borderWidth
    this.borderStyle = params.borderStyle
    this.borderRadius = params.borderRadius
  }
}

// Класс Text
export class Text extends SingleObject implements IText {
  text: string
  fontFamily: string
  fontSize: number
  color: string

  constructor(params: IText) {
    super(params)
    this.text = params.text
    this.fontFamily = params.fontFamily
    this.fontSize = params.fontSize
    this.color = params.color
  }
}

export type FabricObject = IGroup | IImage | IRect | IText | null

export class FabricObjectFactory {
  static createObject(params: any): FabricObject {
    switch (params.type) {
      case 'image':
        return new Image(params)
      case 'rect':
        return new Rect(params)
      case 'text':
        return new Text(params)
      case 'group':
        return new Group(params)
      default:
        return null
    }
  }
}