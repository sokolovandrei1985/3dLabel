export interface StateRecord {
  id: number
  state: string
}

export interface DatabaseService {
  addState(state: string): Promise<number>
  getState(id: number): Promise<string | null>
  getNextState(id: number): Promise<string | null>
  getPrevState(id: number): Promise<string | null>
  removeState(id: number): Promise<void>
  removeStateAfter(id: number): Promise<void>
  removeFirstState(): Promise<void>
  getCount(): Promise<number>
}