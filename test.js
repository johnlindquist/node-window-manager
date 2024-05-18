import { windowManager } from "./dist/index.js"

async function main() {
  const windows = windowManager.getWindows()

  for (const window of windows) {
    console.log("name", window.getName())
    console.log("title", window.getTitle())
    console.log("bounds", window.getBounds())
  }

  console.log(`---`)

  // active window
  const activeWindow = windowManager.getActiveWindow()
  console.log("name", activeWindow.getName())
  console.log("title", activeWindow.getTitle())
  console.log("bounds", activeWindow.getBounds())
}

main()
