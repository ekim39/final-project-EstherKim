# Proposal - Minesweeper (Esther Kim)

**Rules:**

I'm thinking about recreating the minesweeper game. The rules are the same as regular minesweeper where the player has to figure out where all the bombs are on the board. When a player clicks on an empty space, all the tiles around it will be revealed until the tiles are number tiles. When a player clicks on a number tile, only that tile will be uncovered. When a player clicks on a bomb, the game will be over. The numbers indicate how many bombs are in the adjacent 8 squares. The game will end when only the bomb tiles are left covered, which is when the number of unopened tiles equals the number of bombs. The player will be able to place down flags so that the tile becomes unclickable, marking a bomb.

**Additional Functionality:**

There will be different levels of difficulty, which is controlled by how many squares there are on the board and the number of bombs present on the board. There will be preset difficulties (easy, medium, and hard), as well as a custom difficulty where the player can set the size and number of bombs. There will be a timer that keeps track of how long the player has spent on the current game. I would also like to have a scoreboard type feature so that players can keep track of their high scores (lowest times) in each difficulty. I would like players to be able to see other players scores and compare how their high score is compared to the top 3 scores. There can be a simple log in function so that players can look at their past scores associated with their username.

**Key Technologies/Libraries**
- React
- Bootstrap

Currently, I plan on using React and Bootstrap. I have some experience with Bootstrap, but I haven't worked with React, so I hope to use both to create this game on a single page, the game at the top of the page, scoreboards at the bottom, and a simple login form.
