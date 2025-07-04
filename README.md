# Final Project: Minesweeper (Esther Kim)

Render: https://final-project-estherkim.onrender.com

## Description
I recreated the game minesweeper using the game on google as reference (https://g.co/kgs/A6ZeS5o). The player can generate the board and then click any one of the tiles to start the game. If the player hits a mine, the game is over. If the player successfully uncovers all tiles except the ones with mines, then they win. The player can place down flags on the tiles with mines to mark them, which will prevent them from uncovering the tile with a flag on it.

There are three preset levels of difficulity: easy, medium and hard. There is a fourth mode where the player can change the width, height, and number of mines on the board to create a custom difficulty. There is a timer that keeps track of how long the player took to complete the game. The player can save these scores, but they need to be logged in. Duplicate times will not be saved separately. The player can create a username or login to an existing account to access their top scores for each preset difficulty and see the leaderboard (top three scores for each preset difficulty).

### Additional Comments About Website Features
- You may create your own account to save scores and access the scoreboard/leaderboard, but you don't need to login to play the game itself.
- To run locally, download all necessary files. Then, cd into the folder "minesweeper" using the command "cd minesweeper". Then, build the app using "npm run build" and run it using "npm start".

### Technologies
I used React and Express to create the frontend and backend of the web application. I used Express to set up server.js, creating routes for the frontend to call. I used React with HTML to create the frontend, generating some of the HTML, like the scoreboard table, dynamically. I used Canvas to display the board for the game, drawing the numbers, mines, and flags. I used Bootstrap and CSS to style the website, such as the buttons, table, primary colors, etc.

### Challenges
A challenge was keeping figuring out how to set up a timer so that it would only run when the game was going. I had to make sure that the timer would update correctly and that it would start and stop when necessary. Additionally, I had to ensure that different parts of the application would update and display correctly, such as the flag counter, because changes in state would not always trigger React to rerender if the state was an array and only the elements of the array changed rather than the whole array itself.

Using Bootstrap was tricky because I wanted some parts styled by bootstrap and others styled by CSS, so I had to override the default Bootstrap styling. Creating good spacing between elements was difficult and keeping the two columns separated so that they don't interfere with each other took trial and error.
