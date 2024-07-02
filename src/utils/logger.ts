import chalk from "chalk";
import logUpdate from "log-update";

type LoggerStatus = 'info' | 'warn' | 'error' | 'success' | 'start' | 'done'

export function logger(status: LoggerStatus, message: string) {
    let chalkFn = chalk

    switch (status) {
        case 'info':
            chalkFn = chalkFn.bgBlueBright
            break;
        case 'error':
            chalkFn = chalkFn.red
            break;
        case 'warn':
            chalkFn = chalkFn.bgYellowBright
            break;
        case 'success':
            chalkFn = chalkFn.green
            break;
        case 'start':
            chalkFn = chalkFn.yellow
            break;
        case 'done':
            chalkFn = chalkFn.blue
            break;
        default:
            chalkFn = chalkFn
            break;
    }


    logUpdate(chalkFn(message));
}