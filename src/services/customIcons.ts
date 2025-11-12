import { h } from 'vue'
import type { Component } from 'vue'
import toFrontSvg from '@/assets/toFront.svg?raw'
import toBackSvg from '@/assets/toBack.svg?raw'
import pasteSvg from '@/assets/paste.svg?raw'

const createIconComponent = (svgString: string): Component => ({
  render() {
    return h('span', {
      innerHTML: svgString,
      style: {
        display: 'inline-flex',
        alignItems: 'center'
      }
    })
  }
})

export const toFront = createIconComponent(toFrontSvg)
export const toBack = createIconComponent(toBackSvg)
export const paste = createIconComponent(pasteSvg)