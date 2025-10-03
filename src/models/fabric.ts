export type ObjectType = 'image' | 'rect' | 'textbox' | 'group'

interface BaseProp {
  type: ObjectType
  left: number
  top: number
  width: number
  height: number
}

export interface IShadow {
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

interface SingleProp {
  angle: number | null
  opacity: number | null
  shadow: IShadow | null
}

interface RectangleProp {
  fill: string
  stroke: string
  strokeWidth: number
  strokeStyle: string | number[] | null
  strokeRadius: number
}

interface TextProp {
  text: string
  fontFamily: string
  fontSize: number
  fill: string
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
  shadow: IShadow | null

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
  fill: string
  stroke: string
  strokeWidth: number
  strokeStyle: string | number[] | null
  strokeRadius: number

  constructor(params: IRect) {
    super(params)
    this.fill = params.fill
    this.stroke = params.stroke
    this.strokeWidth = params.strokeWidth
    this.strokeStyle = params.strokeStyle
    this.strokeRadius = params.strokeRadius
  }
}

// Класс Text
export class Text extends SingleObject implements IText {
  text: string
  fontFamily: string
  fontSize: number
  fill: string

  constructor(params: IText) {
    super(params)
    this.text = params.text
    this.fontFamily = params.fontFamily
    this.fontSize = params.fontSize
    this.fill = params.fill
  }
}

export type FabricObject = Partial<IGroup> & Partial<IImage> & Partial<IRect> & Partial<IText> | null

export class FabricObjectFactory {
  static createObject(params: any): FabricObject {
    switch (params.type) {
      case 'image':
        return new Image(params)
      case 'rect':
        return new Rect(params)
      case 'textbox':
        return new Text(params)
      case 'group':
        return new Group(params)
      default:
        return null
    }
  }
}