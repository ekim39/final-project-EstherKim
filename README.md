# Final Project: Minesweeper (Esther Kim)

## Description
I recreated the game minesweeper using the game on google as reference (https://g.co/kgs/A6ZeS5o). The player can generate the board and then click any one of the tiles to start the game. If the player hits a mine, the game is over. If the player successfully uncovers all tiles except the ones with mines, then they win. The player can place down flags on the tiles with mines to mark them, which will prevent them from uncovering the tile with a flag on it.

There are three preset levels of difficulity: easy, medium and hard. There is a fourth mode where the player can change the width, height, and number of mines on the board to create a custom difficulty. There is a timer that keeps track of how long the player took to complete the game. The player can save these scores, but they need to be logged in. Duplicate times will not be saved separately. The player can create a username or login to an existing account to access their top scores and see the leaderboard.

### Additional Comments About Website Features
- You may create your own account to save scores and access the scoreboard/leaderboard, but you don't need to login to play the game itself.
- To run locally, download all necessary files. Then, cd into the folder "minesweeper" using the command "cd minesweeper". Then, build the app using "npm run build" and run it using "npm start".

### Technologies & Challenges
I used React and Express to create the frontend and backend of the web application. I used Express to set up server.js, creating routes for the frontend to call. 

A challenge was keeping figuring out how to set up a timer so that it would only run when the game was going. I had to make sure that the timer would update correctly and that it would start and stop when necessary. Additionally, I had to ensure that different parts of the application would update and display correctly, such as the flag counter, because changes in state would not always trigger React to rerender if the state was an array and only the elements of the array changed rather than the whole array itself.

### Turning in Your Project (Due Friday, June 27, 11:59 pm)

Submit a second PR on the final project repo to turn in your app and code.

Deploy your app, in the form of a webpage, to Glitch/Heroku/Digital Ocean or some other service; it is critical that the application functions correctly wherever you post it.

1. A link to the project itself
3. An outline of the technologies you used and how you used them.
6. What accessibility features you included in your project.

Think of 1, 3, and 4 in particular in a similar vein to the design / technical achievements for A1—A4. Make a case for why what you did was challenging and why your implementation deserves a grade of 100%.

The video described above is also due on Canvas at this time.
