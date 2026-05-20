# Week 2 Example 1: Movement and Gravity

## What This Example Demonstrates

> **Note for students:** This section is included in example files only to help you study. Do not include it in your Side Quest submissions.

This example introduces how to move a character using keyboard input, apply gravity, and detect collision with a floor.

- **Player object** — groups all player data (position, velocity, size, tuning values) into one object instead of separate variables
- **`keyIsDown()`** — checks if a key is held this frame, allowing smooth continuous movement; different from `keyPressed()` which fires once per press
- **Velocity** — instead of moving the player directly, we add to `vx` and `vy` each frame and then apply them to position, giving movement a natural feel
- **`constrain()`** — clamps a value within a min and max range; used here to cap horizontal speed
- **Friction** — multiplying velocity by a value less than 1 each frame gradually slows the player when no key is pressed
- **Gravity** — adding a constant to `vy` every frame pulls the player downward
- **Floor collision** — checks if the player has passed below the floor and snaps them back up
- **`noise()`** — returns smooth random values used to wobble the blob's edges organically
- **`map()`** — converts a value from one range to another; used here to turn noise output into a pixel offset
- **`push()` / `pop()`** — save and restore drawing settings so styles in one function don't affect others
- **`beginShape()` / `endShape()`** — draw a custom polygon by specifying each vertex individually

## Setup and Interaction Instructions

To run the sketch locally, open `index.html` in Google Chrome using Live Server.

**Controls:**

- Move left/right: Arrow Keys or A/D
- Jump: Up Arrow or W

**Opening the Chrome Console**

- **Windows:** Press `F12` or `Ctrl + Shift + J`, then click the **Console** tab
- **Mac:** Press `Cmd + Option + J`

The console will show any errors in your sketch.

## Assets

| File                      | Source                               |
| ------------------------- | ------------------------------------ |
| `assets/images/fish.png`  | Unsplash, Created by David Clode     |
| `assets/images/water.jpg` | Unsplash, Created by Cristian Palmer |

## References

[1] Davi. 2018. _gray and yellow fish._ [Unsplash](https://unsplash.com/photos/gray-and-yellow-fish-iLwQIbWxv-s). Published January 19, 2018. Accessed May 20, 2026.
[2] Cristian Palmer. 2018. _clear blue body of water_ [Unsplash](https://unsplash.com/photos/clear-blue-body-of-water-XexawgzYOBc). Published June 26, 2018. Accessed May 20, 2026.
