export interface StateRecord {
  id: number
  state: string
}

export interface DatabaseService {
  addRow(state: string): Promise<number>
  getRow(id: number): Promise<string | null>
  getNextRow(id: number): Promise<StateRecord | boolean | null>
  getPrevRow(id: number): Promise<StateRecord | boolean | null>
  removeRow(id: number): Promise<void>
  removeRowsAfter(id: number): Promise<void>
  removeFirstRow(): Promise<void>
  getCount(): Promise<number>
  clearAll(): Promise<void>
  getLastRow(): Promise<StateRecord | null>
}