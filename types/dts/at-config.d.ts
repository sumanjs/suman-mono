//////////////

// @config.json schema
export interface IAtConfig {
  comment: string,
  '@run': IAtRun,
  '@transform': IAtTransform
}


export interface IEnv {
  [key:string]: string
}

export interface IPlugin {
  comment: string,
  relativePath: string, // relative path from @config.json to @run.sh or @transform.sh
  location: string,
  value: string
}

export interface IAtRun {
  comment: string
  env: IEnv,
  plugin: IPlugin
}


export interface IAtTransform {
  comment: string
  env: IEnv,
  plugin: IPlugin
}
