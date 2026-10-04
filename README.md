[README.md](https://github.com/user-attachments/files/33031474/README.md)
# Snake & Ladder Game

A colorful, responsive browser version of the classic Snake and Ladder board game. Play with 2-4 players, choose from themed maps, customize the visual theme, and race to tile 100.

## Features

- Supports 2, 3, or 4 local players
- Seven maps, including a random-map option
- Four visual themes: Lavender Dream, Warm Sunrise, Midnight Arcade, and Forest Glow
- Animated dice rolls and player movement
- Snakes and ladders rendered dynamically on the board
- Pause, restart, new-game, and play-again controls
- Optional sound effects with adjustable volume
- Responsive layout for desktop and mobile screens
- No build tools, frameworks, or backend required

## How to play

1. Select **Play Game**.
2. Choose the number of players, map, theme, volume, and sound settings.
3. Select **Start Adventure**.
4. Take turns rolling the dice.
5. Land on a ladder to climb up or a snake to slide down.
6. The first player to reach tile 100 wins. An exact roll is required.

## Run locally

This is a static web project. Clone the repository and open `index.html` in a browser, or serve the folder with a local development server.

```bash
git clone https://github.com/<your-username>/<your-repository>.git
cd "Snake and Ladder Game"
```

Then open `index.html` directly, or use the VS Code Live Server extension.

## Project structure

```text
Snake and Ladder Game/
|- index.html       # Game screens and interface
|- script.js        # Game state, board logic, turns, audio, and controls
|- styles.css       # Main layout and game styling
`- extras.css       # Home screen, setup screen, themes, and responsive additions
```

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Web Audio API for sound effects
- Google Fonts: Baloo 2 and Nunito

## Deploy with GitHub Pages

1. Push the project to a GitHub repository.
2. Open **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the branch containing the project and the folder containing `index.html`.
5. Save and open the generated Pages URL.

If the game is kept in a subfolder of a larger repository, select that folder as the Pages source or move the game files to the repository root.

## License

Add a license that matches how you want others to use the project. The MIT License is a common choice for open-source projects.
