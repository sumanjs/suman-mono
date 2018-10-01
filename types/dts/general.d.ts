//////////////////////

import Timer = NodeJS.Timer;


export interface IAssertObj {
  num: number
}

export interface ITimerObj {
  timer: Timer
}


export type EVCb<T, E = any> = (err: E, val?: T) => void;
