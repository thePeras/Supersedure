export interface IWorkspace {
  id: number
  type: 'local'
  name: string,
  icon?: string
  active: boolean
  level: string
}

export const LocalWorkspace: IWorkspace = {
  // can never exist in a real database
  id: -1,
  level: 'local',
  type: 'local',
  name: 'Local Workspace',
  icon: 'laptop',
  active: true,
}
