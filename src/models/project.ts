import type { IAuthUser } from "./auth"

export interface IProject {
  name: string,
  author?: IAuthUser,
  lastUpdateBy?: IAuthUser,
  fabric: Object
}