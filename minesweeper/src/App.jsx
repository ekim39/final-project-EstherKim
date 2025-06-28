import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import './App.css'

function App() {
  // these should not change during deployment
  const [cubeSize, setCubeSize] = useState(30);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  // these can be adjusted
  const [grid, setGrid] = useState({x: 18, y: 14});
  const [width, setWidth] = useState(grid.x * cubeSize);
  const [height, setHeight] = useState(grid.y * cubeSize);
  const [numMine, setNumMine] = useState(40);

  // keeps track of the current game state
  const [boardState, setBoardState] = useState([]); // numbers 1-8 means there are that many mines around that square, -1 means a mine, 0 means no mines
  const [flagPlacements, setFlagPlacements] = useState([]); // stores where flags are placed, (x, y) coordinates
  const [uncoveredSqr, setUncoveredSqr] = useState([]); // stores where the covered and uncovered squares are (0 means covered, 1 means uncovered)
  const [numSqrLeft, setNumSqrLeft] = useState(grid.x * grid.y); // number of squares that are still covered
  const [boardReady, setBoardReady] = useState(false); // whether the board has been generated and ready for a game
  const [gameStart, setGameStart] = useState(false); // whether the game has been started by a user clicking a ready board

  // username information; "Guest" is default for not logged in users
  const [user, setUser] = useState("Guest");


  // checks if two arrays are equal (by value)
  function arrEqs(a, b) {
    return (a.length === b.length) && a.every((item, i) => item === b[i]);
  }

  // draws the border of the board
  function drawBorder() {
    const cubeWidth = width/grid.x;
    const cubeHeight = height/grid.y;

    let canvas = document.getElementById('board');
    let context = canvas.getContext('2d');

    const coveredColor = getComputedStyle(document.documentElement).getPropertyValue('color');

    context.strokeStyle = coveredColor; 

    // creates the grid lines around each square in the board
    for (var x = startX; x <= startX + width; x += cubeWidth) {
      context.moveTo(x, startY);
      context.lineTo(x, startY + height);
    }
    
    for (var y = startY; y <= startY + height; y += cubeHeight) {
      context.moveTo(startX, y);
      context.lineTo(startX + width, y);
    }
    context.stroke();
  }

  // sets a mine on the board at coordinate x and y
  function setMineAtCell (x, y, board) {
    let updatedBoard = [];
    updatedBoard = board;
    updatedBoard[y][x] = -1;
    if (x !== 0) {
      // not at leftside
      if (updatedBoard[y][x - 1] != -1) {
        updatedBoard[y][x - 1] += 1;
      }
      if (y !== 0) {
        // not at top left corner
        if (updatedBoard[y - 1][x - 1] != -1) {
          updatedBoard[y - 1][x - 1] += 1;
        }
      }
    }
    if (x !== (grid.x - 1)) {
      // not at rightside
      if (updatedBoard[y][x + 1] != -1) {
        updatedBoard[y][x + 1] += 1;
      }
      if (y !== (grid.y - 1)) {
        // not at bottom right corner
        if (updatedBoard[y + 1][x + 1] != -1) {
          updatedBoard[y + 1][x + 1] += 1;
        }
      }
    }
    if (y !== 0) {
      // not at top
      if (updatedBoard[y - 1][x] != -1) {
        updatedBoard[y - 1][x] += 1;
      }
      if (x !== (grid.x - 1)) {
        // not at top right corner
        if (updatedBoard[y - 1][x + 1] != -1) {
          updatedBoard[y - 1][x + 1] += 1;
        }
      }
    }
    if (y !== (grid.y - 1)) {
      // not at bottom
      if (updatedBoard[y + 1][x] != -1) {
        updatedBoard[y + 1][x] += 1;
      }
      if (x !== 0) {
        // not at bottom left corner
        if (updatedBoard[y + 1][x - 1] != -1) {
          updatedBoard[y + 1][x - 1] += 1;
        }
      }
    }
    return updatedBoard;
  }

  function clearBoard() {
    return Array.from({length: grid.y}, () => Array(grid.x).fill(0));
  }

  // draws the initial board in generating a random board state
  function drawBoard() {
    // reset game
    setNumSqrLeft(0);
    setGameStart(false);

    // board state that will be set to boardState
    let currentBoard = [];

    let canvas = document.getElementById('board');
    let context = canvas.getContext('2d');

    // clear board
    context.clearRect(startX, startY, width, height);

    drawBorder();
    const coveredColor = getComputedStyle(document.documentElement).getPropertyValue('color');
    context.fillStyle = coveredColor;

    // sets all spots on board to 0, clearing the board
    currentBoard = clearBoard();

    // covers all squares on board
    // y is the rows and x is the columns
    for (let i = 0; i < grid.y; i++) {
      for (let j = 0; j < grid.x; j++) {
        context.fillRect(startX + (cubeSize * j), startY + (cubeSize * i), cubeSize, cubeSize);
      }
    }

    // save current state of board
    setBoardState(currentBoard);

    // indicate that board has been drawn
    setBoardReady(true);

    // update text with number of flags left to place
    let flagNum = document.getElementById("flagNumDisplay");
    flagNum.textContent = `Number of Flags to Place: ${numMine}`;
  }

  // returns true or false for whether tx and ty are valid coordinates to place a mine
  // nx and ny is the spot the player pressed
  function isXYValidSpot(tx, ty, nx, ny, board) {
    let isValid = true;
    if (board[ty][tx] === -1) {
      isValid = false;
    } else if (tx <= nx + 1 && tx >= nx - 1) {
      if (ty <= ny + 1 && ty >= ny - 1) {
        isValid = false;
      }
    }
    return isValid;
  }

  // nx and ny is coordinates that the player pressed, do not want a mine there
  function calculateUnderlyingBoard(nx, ny) {
    //console.log(Array.from({ length: grid.y }, () => Array(grid.x).fill(0)));
    let completelynewboard = clearBoard();
    let numMineStillLeft = numMine;
    while (numMineStillLeft !== 0) {
      let x = Math.floor(Math.random() * (grid.x));
      let y = Math.floor(Math.random() * (grid.y));
      if (isXYValidSpot(x, y, nx, ny, completelynewboard)) {
        completelynewboard = setMineAtCell(x, y, completelynewboard);
        numMineStillLeft--;
      }
    }
    setBoardState(completelynewboard);
    return completelynewboard;
  }

  // draws the whole board uncovered
  function drawWholeBoard(theBoard) {
    let canvas = document.getElementById('board');
    let context = canvas.getContext('2d');

    const squareBackground = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color');
    
    
    for (let i = 0; i < grid.y; i++) {
      for (let j = 0; j < grid.x; j++) {
        // if theBoard[i][j] === 0, then all that is needed is to fill out background
        context.fillStyle = squareBackground;
        context.fillRect(startX + (cubeSize * j), startY + (cubeSize * i), cubeSize, cubeSize);   
        
        if (theBoard[i][j] === -1) {
          // there is a mine on the board
          var mineImg = new Image();
          mineImg.onload = function() {
            context.drawImage(mineImg, startX + (j * cubeSize), startY + (i * cubeSize), 30, 30);
          };
          mineImg.src = "/public/mine.png";
        } else if (theBoard[i][j] > 0 && theBoard[i][j] < 9) {
          // there is a number on the board
          context.font = 'bold 20px Arial';
          if (theBoard[i][j] === 1) {
            context.fillStyle = 'blue';
          } else if (theBoard[i][j] === 2) {
            context.fillStyle = 'green';
          } else if (theBoard[i][j] === 3) {
            context.fillStyle = 'red';
          } else if (theBoard[i][j] === 4) {
            context.fillStyle = 'purple';
          } else if (theBoard[i][j] === 5) {
            context.fillStyle = 'orange';
          } else if (theBoard[i][j] === 6) {
            context.fillStyle = '#e0099c';
          } else if (theBoard[i][j] === 7) {
            context.fillStyle = 'black';
          } else {
            context.fillStyle = 'gray'; 
          }
          
          context.textAlign = 'center';
          context.textBaseline = 'middle';

          const fx = (startX + (cubeSize * j)) + (cubeSize / 2);
          const fy = (startY + (cubeSize * i)) + (cubeSize / 2);
          context.fillText(theBoard[i][j].toString(), fx, fy);
        }
      }
    }
  }

  function drawOneCube(x, y, theBoard, checkRest, alreadyChecked, trackSqrLeft, trackUncoveredSqr) {
    let canvas = document.getElementById('board');
    let context = canvas.getContext('2d');

    const squareBackground = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color');
    //const squareInner = getComputedStyle(document.documentElement).getPropertyValue('background-color');
    //context.strokeStyle = squareInner;
    context.fillStyle = squareBackground;

    // if theBoard[y][x] === 0, then all that is needed is to fill out background
    context.fillRect(startX + (cubeSize * x), startY + (cubeSize * y), cubeSize, cubeSize);

    // indicate this square had been uncovered
    trackSqrLeft--;
    trackUncoveredSqr.push([x, y]);
    
    if (theBoard[y][x] === -1) {
      // there is a mine on the board
      var mineImg = new Image();
      mineImg.onload = function() {
        context.drawImage(mineImg, startX + (x * cubeSize), startY + (y * cubeSize), 30, 30);
      };
      mineImg.src = "/public/mine.png";
    } else if (theBoard[y][x] > 0 && theBoard[y][x] < 9) {
      // there is a number on the board
      context.font = 'bold 20px Arial';
      if (theBoard[y][x] === 1) {
        context.fillStyle = 'blue';
      } else if (theBoard[y][x] === 2) {
        context.fillStyle = 'green';
      } else if (theBoard[y][x] === 3) {
        context.fillStyle = 'red';
      } else if (theBoard[y][x] === 4) {
        context.fillStyle = 'purple';
      } else if (theBoard[y][x] === 5) {
        context.fillStyle = 'orange';
      } else if (theBoard[y][x] === 6) {
        context.fillStyle = '#e0099c';
      } else if (theBoard[y][x] === 7) {
        context.fillStyle = 'black';
      } else {
        context.fillStyle = 'gray'; 
      }
      
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      const fx = (startX + (cubeSize * x)) + (cubeSize / 2);
      const fy = (startY + (cubeSize * y)) + (cubeSize / 2);
      context.fillText(theBoard[y][x].toString(), fx, fy);
    } else if (theBoard[y][x] === 0) {
      if (x !== 0) {
        // not at leftside
        // checking if the coordinates we want to add are already in checkRest or alreadyChecked array
        if (!JSON.stringify(checkRest).includes(JSON.stringify([x - 1, y])) &&
        !JSON.stringify(alreadyChecked).includes(JSON.stringify([x - 1, y])) && 
        !JSON.stringify(trackUncoveredSqr).includes(JSON.stringify([x - 1, y])) &&
        !JSON.stringify(flagPlacements).includes(JSON.stringify([x - 1, y]))) {
          checkRest.push([x - 1, y]);
        }
        
        if (y !== 0) {
          // not at top left corner
          if (!JSON.stringify(checkRest).includes(JSON.stringify([x - 1, y - 1])) &&
          !JSON.stringify(alreadyChecked).includes(JSON.stringify([x - 1, y - 1])) && 
          !JSON.stringify(trackUncoveredSqr).includes(JSON.stringify([x - 1, y - 1])) && 
          !JSON.stringify(flagPlacements).includes(JSON.stringify([x - 1, y - 1]))) {
            checkRest.push([x - 1, y - 1]);
          }
        }
      }
      if (x !== (grid.x - 1)) {
        // not at rightside
        if (!JSON.stringify(checkRest).includes(JSON.stringify([x + 1, y])) && 
        !JSON.stringify(alreadyChecked).includes(JSON.stringify([x + 1, y])) && 
        !JSON.stringify(trackUncoveredSqr).includes(JSON.stringify([x + 1, y])) &&
        !JSON.stringify(flagPlacements).includes(JSON.stringify([x + 1, y]))) {
          checkRest.push([x + 1, y]);
        }
        if (y !== (grid.y - 1)) {
          // not at bottom right corner
          if (!JSON.stringify(checkRest).includes(JSON.stringify([x + 1, y + 1])) &&
          !JSON.stringify(alreadyChecked).includes(JSON.stringify([x + 1, y + 1])) &&
          !JSON.stringify(trackUncoveredSqr).includes(JSON.stringify([x + 1, y + 1])) &&
          !JSON.stringify(flagPlacements).includes(JSON.stringify([x + 1, y + 1]))) {
            checkRest.push([x + 1, y + 1]);
          }
        }
      }
      if (y !== 0) {
        // not at top
        if (!JSON.stringify(checkRest).includes(JSON.stringify([x, y - 1])) && 
        !JSON.stringify(alreadyChecked).includes(JSON.stringify([x, y - 1])) && 
        !JSON.stringify(trackUncoveredSqr).includes(JSON.stringify([x, y - 1])) && !JSON.stringify(flagPlacements).includes(JSON.stringify([x, y - 1]))) {
          checkRest.push([x, y - 1]);
        }
        
        if (x !== (grid.x - 1)) {
          // not at top right corner
          if (!JSON.stringify(checkRest).includes(JSON.stringify([x + 1, y - 1])) && 
          !JSON.stringify(alreadyChecked).includes(JSON.stringify([x + 1, y - 1])) && 
          !JSON.stringify(trackUncoveredSqr).includes(JSON.stringify([x + 1, y - 1])) && 
          !JSON.stringify(flagPlacements).includes(JSON.stringify([x + 1, y - 1]))) {
            checkRest.push([x + 1, y - 1]);
          }
        }
      }
      if (y !== (grid.y - 1)) {
        // not at bottom
        if (!JSON.stringify(checkRest).includes(JSON.stringify([x, y + 1])) && 
        !JSON.stringify(alreadyChecked).includes(JSON.stringify([x, y + 1])) && 
        !JSON.stringify(trackUncoveredSqr).includes(JSON.stringify([x, y + 1])) && 
        !JSON.stringify(flagPlacements).includes(JSON.stringify([x, y + 1]))) {
          checkRest.push([x, y + 1]);
        }
        if (x !== 0) {
          // not at bottom left corner
          if (!JSON.stringify(checkRest).includes(JSON.stringify([x - 1, y + 1])) && 
          !JSON.stringify(alreadyChecked).includes(JSON.stringify([x - 1, y + 1])) && 
          !JSON.stringify(trackUncoveredSqr).includes(JSON.stringify([x - 1, y + 1])) && 
          !JSON.stringify(flagPlacements).includes(JSON.stringify([x - 1, y + 1]))) {
            checkRest.push([x - 1, y + 1]);
          }
        }
      }
    }
    if (checkRest.length !== 0) {
      let removedElement = checkRest.shift();
      alreadyChecked.push([x, y]);
      return drawOneCube(removedElement[0], removedElement[1], theBoard, checkRest, alreadyChecked, trackSqrLeft, trackUncoveredSqr);
    } else {
      setUncoveredSqr(trackUncoveredSqr);
      return trackSqrLeft;
    }
  }

  function headerDrawOneCube(x, y, theBoard) {
    if (gameStart) {
      return drawOneCube(x, y, theBoard, [], [], numSqrLeft, uncoveredSqr);
    } else {
      return drawOneCube(x, y, theBoard, [], [], grid.x * grid.y, []);
    }
  }

  // !!! TODO - add custom difficulty; add timer; add leaderboard/scoreboard; style;
  function cubeClicked(event) {
    if (gameStart) {
      let canvas = document.getElementById('board');
      let container = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - container.left) / cubeSize);
      const y = Math.floor((event.clientY - container.top) / cubeSize);
      // check if flag is on that square
      if (!JSON.stringify(flagPlacements).includes(JSON.stringify([x, y]))) {
        let numSqr = headerDrawOneCube(x, y, boardState);
        setNumSqrLeft(numSqr);
        //console.log(numSqr);
        if (boardState[y][x] === -1) {
          // clicked on mine
          alert("Game Over! You hit a mine!")
          drawWholeBoard(boardState);
          setNumSqrLeft(0);
          // reset game
          setBoardReady(false);
          setGameStart(false);
          setBoardState(clearBoard());
        } else if (numSqr === numMine) {
          // found all the mines, won; reset game
          alert("Congrats! You won!");
          setBoardReady(false);
          setGameStart(false);
          setBoardState(clearBoard());
        }
      }
    } else {
      // indicates first move has been made and underlying elements have been created
      let canvas = document.getElementById('board');
      let container = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - container.left) / cubeSize);
      const y = Math.floor((event.clientY - container.top) / cubeSize);
      let calcBoard = calculateUnderlyingBoard(x, y);
      let numSqr = headerDrawOneCube(x, y, calcBoard);
      setGameStart(true);
      setNumSqrLeft(numSqr);
      setFlagPlacements([]);
    }
  }

  // puts down flag if square is covered and has no flag, removes flag if square is covered and has a flag
  function putFlag(event) {
    event.preventDefault();
    if (gameStart) {
      let canvas = document.getElementById('board');
      let context = canvas.getContext('2d');
      let container = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - container.left) / cubeSize);
      const y = Math.floor((event.clientY - container.top) / cubeSize);
      if (!JSON.stringify(uncoveredSqr).includes(JSON.stringify([x, y]))) {
        if (JSON.stringify(flagPlacements).includes(JSON.stringify([x, y]))) {
          // update text with number of flags left to place
          let flagNum = document.getElementById("flagNumDisplay");
          flagNum.textContent = `Number of Flags to Place: ${numMine - (flagPlacements.length - 1)}`;

          // there is a flag, so remove flag
          let updatedArr = flagPlacements.filter(item => !arrEqs(item, [x, y]));
          setFlagPlacements(updatedArr);

          // draw covered square
          const coveredColor = getComputedStyle(document.documentElement).getPropertyValue('color');
          context.fillStyle = coveredColor;
          context.fillRect(startX + (cubeSize * x), startY + (cubeSize * y), cubeSize, cubeSize);
        } else {
          // update text with number of flags left to place
          let flagNum = document.getElementById("flagNumDisplay");
          flagNum.textContent = `Number of Flags to Place: ${numMine - (flagPlacements.length + 1)}`;

          // there is no flag, so add flag
          flagPlacements.push([x, y]);

          // draw image of flag
          var mineImg = new Image();
          mineImg.onload = function() {
            context.drawImage(mineImg, startX + (x * cubeSize), startY + (y * cubeSize), 30, 30);
          };
          mineImg.src = "/public/flag.png";
        }
      }
    }
  }

  // Preset Game Modes
  function easyMode() {
    // update text with number of flags left to place
    let flagNum = document.getElementById("flagNumDisplay");
    flagNum.textContent = '';

    const menu = document.getElementById('customMenu');
    menu.style.display = 'none';

    setGrid({x: 10, y: 8});
    setWidth(10 * cubeSize);
    setHeight(8 * cubeSize);
    setNumMine(10);
    setNumSqrLeft(10 * 8);
    setBoardReady(false);
    setGameStart(false);
  }

  function mediumMode() {
    let flagNum = document.getElementById("flagNumDisplay");
    flagNum.textContent = '';

    const menu = document.getElementById('customMenu');
    menu.style.display = 'none';

    setGrid({x: 18, y: 14});
    setWidth(18 * cubeSize);
    setHeight(14 * cubeSize);
    setNumMine(40);
    setNumSqrLeft(18 * 14);
    setBoardReady(false);
    setGameStart(false);
  }

  function hardMode() {
    let flagNum = document.getElementById("flagNumDisplay");
    flagNum.textContent = '';

    const menu = document.getElementById('customMenu');
    menu.style.display = 'none';

    setGrid({x: 24, y: 20});
    setWidth(24 * cubeSize);
    setHeight(20 * cubeSize);
    setNumMine(99);
    setNumSqrLeft(24 * 20);
    setBoardReady(false);
    setGameStart(false);
  }

  function customMode() {
    const menu = document.getElementById('customMenu');
    menu.style.display = 'block';
  }

  function login() {
    const username = document.querySelector( "#username" ),
          password = document.querySelector( "#password" ),
          json = {"username": username.value, "password": password.value}   

    fetch('/login', {
      method:'POST',
      body: JSON.stringify( json ),
      headers: {'Content-Type': 'application/json'}
    }).then(response => {
      if (response.status === 200) {
        alert("Successfully logged in/created account!");
        setUser(username.value);
      } else {
        alert("Oops, that username exists! Please try again or use a different username.");
      }
    })

    // clearing input values
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    usernameInput.value = '';
    passwordInput.value = '';
  }

  function logout() {
    if (user !== 'Guest') {
      fetch('/logout', {
        method:'GET'
      }).then(response => {
        if (response.status === 200) {
          alert("Logged out successfully!")
          setUser('Guest');
        } else {
          alert("Oops, logout failed! Please try again.")
        }
      })
    } else {
      alert("You are not logged in!");
    }
  }

  // functions to handle sliders
  const handleChangeNumMine = (event, newValue) => {
    setNumMine(newValue);
  };

  const handleChangeGridX = (event, newValue) => {
    let regY = grid.y;
    setGrid({x: newValue, y: regY});
    setWidth(newValue * cubeSize);
  }

  return (
    <>
      <div>
        <h1>Minesweeper</h1>
      </div>
      <div>
        <p>If you are a new or returning user, enter your username and password to save your scores (if the username doesn't exist, a new account will be created):</p>
        <br/>
        <label htmlFor='username'>Username:</label>
        <input type="text" id="username"></input>
        <br/>
        <label htmlFor='password'>Password:</label>
        <input type="password" id="password"></input>
        <br/>
        <button onClick={() => login()}>
          Register/Login
        </button>
      </div>
      <div>
        <button onClick={() => logout()}>
          Logout
        </button>
      </div>
      <br/>
      <div>
        <h3 id='flagNumDisplay'></h3>
      </div>
      <div>
        <canvas id='board' width={width} height={height} 
        onClick={boardReady ? cubeClicked : () => alert("Please generate the board before starting the game!")}
        onContextMenu={boardReady ? putFlag : () => alert("Please generate the board before starting the game!")}></canvas>
      </div>
      
      <div>
        <button onClick={() => drawBoard()}>
          Generate Board
        </button>
        <br/>
        <h4>Difficulty Settings:</h4>
        <button onClick={() => easyMode()}>
          Easy
        </button>
        <button onClick={() => mediumMode()}>
          Medium
        </button>
        <button onClick={() => hardMode()}>
          Hard
        </button>

        <button onClick={() => customMode()}>
          Custom
        </button>
        <div id='customMenu'>
          <Typography id="changeNumMine" gutterBottom>
            Ratio of Initial Alive Cells
          </Typography>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Slider
              value={typeof numMine === 'number' ? numMine : 0}
              onChange={handleChangeNumMine}
              min={1}
              max={(grid.x * grid.y) - 10}
              aria-labelledby="changeNumMine"
              valueLabelDisplay="auto"
              step={1}
            />
          </Grid>
          <br/>
          <Typography id="changeGridX" gutterBottom>
            Board Cubes Width
          </Typography>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Slider
              value={typeof grid.x === 'number' ? grid.x : 0}
              onChange={handleChangeGridX}
              min={4}
              max={Math.floor(document.body.offsetWidth / 30)}
              aria-labelledby="changeGridX"
              valueLabelDisplay="auto"
              step={1}
            />
          </Grid>
        </div>

      </div>
    </>
  )
}

export default App
