import { Window } from "./classes/window"
import { EventEmitter } from "events"
import { Monitor } from "./classes/monitor"
import { EmptyMonitor } from "./classes/empty-monitor"
import bindings from "bindings"

const addon = bindings("addon.node")

let interval: any = null

let registeredEvents: string[] = []

class WindowManager extends EventEmitter {
  constructor() {
    super()

    let lastId: number

    if (!addon) return

    this.on("newListener", event => {
      if (event === "window-activated") {
        lastId = addon.getActiveWindow()
      }

      if (registeredEvents.indexOf(event) !== -1) return

      if (event === "window-activated") {
        interval = setInterval(async () => {
          const win = addon.getActiveWindow()

          if (lastId !== win) {
            lastId = win
            this.emit("window-activated", new Window(win))
          }
        }, 50)
      } else {
        return
      }

      registeredEvents.push(event)
    })

    this.on("removeListener", event => {
      if (this.listenerCount(event) > 0) return

      if (event === "window-activated") {
        clearInterval(interval)
      }

      registeredEvents = registeredEvents.filter(x => x !== event)
    })
  }

  requestAccessibility = () => {
    if (!addon || !addon.requestAccessibility) return true
    return addon.requestAccessibility()
  }

  getActiveWindow = () => {
    if (!addon) return
    return new Window(addon.getActiveWindow())
  }

  getWindows = (): Window[] => {
    if (!addon || !addon.getWindows) return []
    return addon
      .getWindows()
      .map((win: any) => new Window(win))
      .filter((x: Window) => x.isWindow())
  }

  getMonitors = (): Monitor[] => {
    if (!addon || !addon.getMonitors) return []
    return addon.getMonitors().map((mon: any) => new Monitor(mon))
  }

  getPrimaryMonitor = (): Monitor | EmptyMonitor => {
    if (process.platform === "win32") {
      return this.getMonitors().find(x => x.isPrimary)
    } else {
      return new EmptyMonitor()
    }
  }

  createProcess = (path: string, cmd = ""): number => {
    if (!addon || !addon.createProcess) return
    return addon.createProcess(path, cmd)
  }

  hideInstantly = (handle: Buffer) => {
    if (!addon || !addon.hideInstantly) return
    let handleNumber = handle.readUInt32LE(0)
    return addon.hideInstantly(handleNumber)
  }

  forceWindowPaint = (handle: Buffer) => {
    if (!addon || !addon.forceWindowPaint) return
    let handleNumber = handle.readUInt32LE(0)
    return addon.forceWindowPaint(handleNumber)
  }

  setWindowAsPopup = (handle: Buffer) => {
    if (!addon || !addon.setWindowAsPopup) return
    let handleNumber = handle.readUInt32LE(0)
    return addon.setWindowAsPopup(handleNumber)
  }

  setWindowAsPopupWithRoundedCorners = (handle: Buffer) => {
    if (!addon || !addon.setWindowAsPopup) return
    let handleNumber = handle.readUInt32LE(0)
    return addon.setWindowAsPopupWithRoundedCorners(handleNumber)
  }

  showInstantly = (handle: Buffer) => {
    if (!addon || !addon.showInstantly) return
    let handleNumber = handle.readUInt32LE(0)
    return addon.showInstantly(handleNumber)
  }
}

const windowManager = new WindowManager()

export { windowManager, Window, addon }
