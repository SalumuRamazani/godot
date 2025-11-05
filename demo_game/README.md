# Space Shooter Demo Game

A simple 2D space shooter game created with Godot Engine.

## How to Play

### Controls
- **A / Left Arrow**: Move left
- **D / Right Arrow**: Move right
- **Space**: Shoot
- **R**: Restart after game over

### Objective
- Destroy enemies by shooting them before they reach you
- Avoid colliding with enemies
- Survive as long as possible and get the highest score
- Each destroyed enemy gives you 10 points
- The game gets progressively harder as enemies spawn faster

## Opening in Godot

1. Open Godot Engine (version 4.3 or later)
2. Click "Import" or "Scan" for projects
3. Navigate to the `demo_game` folder
4. Select the `project.godot` file
5. Click "Import & Edit"
6. Press F5 or click the "Play" button to run the game

## Game Features

- Player spaceship with shooting capability
- Enemy spawning system with increasing difficulty
- Collision detection
- Score tracking
- Game over screen with restart option
- Simple but engaging gameplay

## Project Structure

```
demo_game/
├── scenes/
│   ├── main.tscn       # Main game scene
│   ├── player.tscn     # Player spaceship
│   ├── enemy.tscn      # Enemy spaceship
│   └── bullet.tscn     # Player bullet
├── scripts/
│   ├── game_manager.gd # Main game logic
│   ├── player.gd       # Player controls
│   ├── enemy.gd        # Enemy behavior
│   └── bullet.gd       # Bullet behavior
├── assets/             # (Empty - for future assets)
├── project.godot       # Godot project file
└── README.md           # This file
```

## Future Enhancements

Ideas for extending this game:
- Add sound effects and music
- Create sprite graphics instead of colored rectangles
- Add power-ups (shield, rapid fire, etc.)
- Include different enemy types
- Add explosion animations
- Implement a high score system
- Add multiple levels or waves

Enjoy the game!
