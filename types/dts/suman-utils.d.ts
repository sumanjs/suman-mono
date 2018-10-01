///////////////////////////

export interface MapToTargetDirResult {
  originalPath: string,
  targetPath: string
}

export interface INearestRunAndTransformRet {
  run: string,
  transform: string
  config: string
}

export interface Run {
  (paths: Array<string>, opts: IOpts, cb: Function): void
}

export interface IOpts {
  babelExec?: string,
  all?: boolean
}

export interface IMapValue {
  [key: string]: boolean,

  '@transform.sh?': boolean,
  '@run.sh?': boolean,
  '@config.json?': boolean,
  '@target?': boolean,
  '@src?': boolean
}

export interface IMap {
  [key: string]: IMapValue
}

export interface IMapCallback {
  (err: Error | null, map?: IMap): void
}
