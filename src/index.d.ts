/// <reference types="node" />
import { Window } from "./classes/window";
import { EventEmitter } from "events";
import { Monitor } from "./classes/monitor";
import { EmptyMonitor } from "./classes/empty-monitor";
declare let addon: any;
declare class WindowManager extends EventEmitter {
    constructor();
    requestAccessibility: () => any;
    getActiveWindow: () => Window;
    getWindows: () => Window[];
    getMonitors: () => Monitor[];
    getPrimaryMonitor: () => Monitor | EmptyMonitor;
    createProcess: (path: string, cmd?: string) => number;
}
declare const windowManager: WindowManager;
export { windowManager, Window, addon };
