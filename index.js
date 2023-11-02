var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/classes/monitor.ts
import { release } from "os";
var getMonitorInfo = (id) => {
  if (!addon || !addon.getMonitorInfo)
    return;
  return addon.getMonitorInfo(id);
};
var Monitor = class {
  id;
  constructor(id) {
    this.id = id;
  }
  getBounds() {
    return getMonitorInfo(this.id).bounds;
  }
  getWorkArea() {
    return getMonitorInfo(this.id).workArea;
  }
  isPrimary() {
    return getMonitorInfo(this.id).isPrimary;
  }
  getScaleFactor() {
    if (!addon || !addon.getMonitorScaleFactor)
      return;
    const numbers = release().split(".").map((d) => parseInt(d, 10));
    if (numbers[0] > 8 || numbers[0] === 8 && numbers[1] >= 1) {
      return addon.getMonitorScaleFactor(this.id);
    }
    return 1;
  }
  isValid() {
    return addon && addon.getMonitorInfo;
  }
};

// src/classes/empty-monitor.ts
var EmptyMonitor = class {
  getBounds() {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  getWorkArea() {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  isPrimary() {
    return false;
  }
  getScaleFactor() {
    return 1;
  }
  isValid() {
    return false;
  }
};

// src/classes/window.ts
var Window = class _Window {
  id;
  processId;
  path;
  constructor(id) {
    if (!addon)
      return;
    this.id = id;
    const { processId, path } = addon.initWindow(id);
    this.processId = processId;
    this.path = path;
  }
  getBounds() {
    if (!addon)
      return;
    const bounds = addon.getWindowBounds(this.id);
    if (process.platform === "win32") {
      const sf = this.getMonitor().getScaleFactor();
      bounds.x = Math.floor(bounds.x / sf);
      bounds.y = Math.floor(bounds.y / sf);
      bounds.width = Math.floor(bounds.width / sf);
      bounds.height = Math.floor(bounds.height / sf);
    }
    return bounds;
  }
  setBounds(bounds) {
    if (!addon)
      return;
    const newBounds = { ...this.getBounds(), ...bounds };
    if (process.platform === "win32") {
      const sf = this.getMonitor().getScaleFactor();
      newBounds.x = Math.floor(newBounds.x * sf);
      newBounds.y = Math.floor(newBounds.y * sf);
      newBounds.width = Math.floor(newBounds.width * sf);
      newBounds.height = Math.floor(newBounds.height * sf);
      addon.setWindowBounds(this.id, newBounds);
    } else if (process.platform === "darwin") {
      addon.setWindowBounds(this.id, newBounds);
    }
  }
  getTitle() {
    if (!addon)
      return;
    return addon.getWindowTitle(this.id);
  }
  getMonitor() {
    if (!addon || !addon.getMonitorFromWindow)
      return new EmptyMonitor();
    return new Monitor(addon.getMonitorFromWindow(this.id));
  }
  show() {
    if (!addon || !addon.showWindow)
      return;
    addon.showWindow(this.id, "show");
  }
  hide() {
    if (!addon || !addon.showWindow)
      return;
    addon.showWindow(this.id, "hide");
  }
  minimize() {
    if (!addon)
      return;
    if (process.platform === "win32") {
      addon.showWindow(this.id, "minimize");
    } else if (process.platform === "darwin") {
      addon.setWindowMinimized(this.id, true);
    }
  }
  restore() {
    if (!addon)
      return;
    if (process.platform === "win32") {
      addon.showWindow(this.id, "restore");
    } else if (process.platform === "darwin") {
      addon.setWindowMinimized(this.id, false);
    }
  }
  maximize() {
    if (!addon)
      return;
    if (process.platform === "win32") {
      addon.showWindow(this.id, "maximize");
    } else if (process.platform === "darwin") {
      addon.setWindowMaximized(this.id);
    }
  }
  bringToTop() {
    if (!addon)
      return;
    if (process.platform === "darwin") {
      addon.bringWindowToTop(this.id, this.processId);
    } else {
      addon.bringWindowToTop(this.id);
    }
  }
  redraw() {
    if (!addon || !addon.redrawWindow)
      return;
    addon.redrawWindow(this.id);
  }
  isWindow() {
    if (!addon)
      return;
    if (process.platform === "win32") {
      return this.path && this.path !== "" && addon.isWindow(this.id);
    } else if (process.platform === "darwin") {
      return this.path && this.path !== "" && !!addon.initWindow(this.id);
    }
  }
  isVisible() {
    if (!addon || !addon.isWindowVisible)
      return true;
    return addon.isWindowVisible(this.id);
  }
  toggleTransparency(toggle) {
    if (!addon || !addon.toggleWindowTransparency)
      return;
    addon.toggleWindowTransparency(this.id, toggle);
  }
  setOpacity(opacity) {
    if (!addon || !addon.setWindowOpacity)
      return;
    addon.setWindowOpacity(this.id, opacity);
  }
  getOpacity() {
    if (!addon || !addon.getWindowOpacity)
      return 1;
    return addon.getWindowOpacity(this.id);
  }
  setParent(window) {
    if (!addon || !addon.setWindowParent)
      return;
    let handle = window;
    if (window instanceof _Window) {
      handle = window.id;
    } else if (!window) {
      handle = 0;
    }
    addon.setWindowParent(this.id, handle);
  }
  getOwner() {
    if (!addon || !addon.getWindowOwner)
      return;
    return new _Window(addon.getWindowOwner(this.id));
  }
};

// src/index.ts
import { EventEmitter } from "events";
import { platform } from "os";
import { resolve } from "path";
var addon;
if (platform() === "win32" || platform() === "darwin") {
  const ADDON_PATH = process.env.NODE_ENV != "dev" ? "Release" : "Debug";
  addon = __require("node-gyp-build")(resolve(__dirname, ".."));
}
var interval = null;
var registeredEvents = [];
var WindowManager = class extends EventEmitter {
  constructor() {
    super();
    let lastId;
    if (!addon)
      return;
    this.on("newListener", (event) => {
      if (event === "window-activated") {
        lastId = addon.getActiveWindow();
      }
      if (registeredEvents.indexOf(event) !== -1)
        return;
      if (event === "window-activated") {
        interval = setInterval(async () => {
          const win = addon.getActiveWindow();
          if (lastId !== win) {
            lastId = win;
            this.emit("window-activated", new Window(win));
          }
        }, 50);
      } else {
        return;
      }
      registeredEvents.push(event);
    });
    this.on("removeListener", (event) => {
      if (this.listenerCount(event) > 0)
        return;
      if (event === "window-activated") {
        clearInterval(interval);
      }
      registeredEvents = registeredEvents.filter((x) => x !== event);
    });
  }
  requestAccessibility = () => {
    if (!addon || !addon.requestAccessibility)
      return true;
    return addon.requestAccessibility();
  };
  getActiveWindow = () => {
    if (!addon)
      return;
    return new Window(addon.getActiveWindow());
  };
  getWindows = () => {
    if (!addon || !addon.getWindows)
      return [];
    return addon.getWindows().map((win) => new Window(win)).filter((x) => x.isWindow());
  };
  getMonitors = () => {
    if (!addon || !addon.getMonitors)
      return [];
    return addon.getMonitors().map((mon) => new Monitor(mon));
  };
  getPrimaryMonitor = () => {
    if (process.platform === "win32") {
      return this.getMonitors().find((x) => x.isPrimary);
    } else {
      return new EmptyMonitor();
    }
  };
  createProcess = (path, cmd = "") => {
    if (!addon || !addon.createProcess)
      return;
    return addon.createProcess(path, cmd);
  };
};
var windowManager = new WindowManager();
export {
  Window,
  addon,
  windowManager
};
