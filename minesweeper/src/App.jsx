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
  const [numSqrLeft, setNumSqrLeft] = useState(grid.x * grid.y); // number of squares that are still covered

  // keeps track of the current game state
  const [boardState, setBoardState] = useState([]); // numbers 1-8 means there are that many mines around that square, -1 means a mine, 0 means no mines
  const [flagPlacements, setFlagPlacements] = useState([]); // stores where flags are placed, (x, y) coordinates
  const [uncoveredSqr, setUncoveredSqr] = useState([]); // stores where the covered and uncovered squares are (0 means covered, 1 means uncovered)
  const [boardReady, setBoardReady] = useState(false); // whether the board has been generated and ready for a game
  const [gameStart, setGameStart] = useState(false); // whether the game has been started by a user clicking a ready board

  // username information; "Guest" is default for not logged in users
  const [user, setUser] = useState("Guest");

  // for scoreboard
  const [recentTime, setRecentTime] = useState(-1); // holds most recent time; -1 means there is no recentTime to save
  const [didSaveTime, setDidSaveTime] = useState(false); // whether most recent time has been saved
  const [theMode, setTheMode] = useState("Custom"); // holds what mode the recentTime was achieved on

  // stopwatch for recording time took to complete game by user
  const [timer, setTimer] = useState(0); // stores how much time has passed since starting timer (in milliseconds)
  const [isTimerOn, setIsTimerOn] = useState(false); // true if timer is running, false otherwise


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
    setIsTimerOn(false);

    // hides leaderboard
    const scoreboard = document.getElementById('leaderboard');
    scoreboard.style.display = 'none';

    // clear flag placements
    setFlagPlacements([]);
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

  // !!! TODO - add leaderboard/scoreboard; style;
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
          setFlagPlacements([]);
          setIsTimerOn(false);
        } else if (numSqr === numMine) {
          //!!!
          // found all the mines, won; reset game
          alert(`Congrats! You won!\nYou took a total of: ${Math.floor(timer / 60000)} min ${Math.floor((timer % 60000) / 1000)} sec`);
          setRecentTime(timer);
          setDidSaveTime(false);

          setBoardReady(false);
          setGameStart(false);
          setBoardState(clearBoard());
          setFlagPlacements([]);
          setIsTimerOn(false);
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
      setIsTimerOn(true);
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

    // hides leaderboard
    const scoreboard = document.getElementById('leaderboard');
    scoreboard.style.display = 'none';
    setTheMode('Easy');

    setIsTimerOn(false);

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

    // hides leaderboard
    const scoreboard = document.getElementById('leaderboard');
    scoreboard.style.display = 'none';
    setTheMode('Medium');

    setIsTimerOn(false);

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

    // hides leaderboard
    const scoreboard = document.getElementById('leaderboard');
    scoreboard.style.display = 'none';
    setTheMode('Hard');

    setIsTimerOn(false);

    setGrid({x: 24, y: 20});
    setWidth(24 * cubeSize);
    setHeight(20 * cubeSize);
    setNumMine(99);
    setNumSqrLeft(24 * 20);
    setBoardReady(false);
    setGameStart(false);
  }

  // custom game mode, can change board size and number of mines
  function customMode() {
    const menu = document.getElementById('customMenu');
    menu.style.display = 'block';

    // hides leaderboard
    const scoreboard = document.getElementById('leaderboard');
    scoreboard.style.display = 'none';
    setTheMode('Custom');

    setIsTimerOn(false);
  }

  function login() {
    const username = document.querySelector( "#username" ),
          password = document.querySelector( "#password" ),
          json = {"username": username.value, "password": password.value},
          userVal = username.value   

    fetch('/login', {
      method:'POST',
      body: JSON.stringify( json ),
      headers: {'Content-Type': 'application/json'}
    }).then(response => {
      if (response.status === 200) {
        alert("Successfully logged in/created account!");
        setUser(userVal);
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
    setNumSqrLeft(newValue * regY);
  }

  const handleChangeGridY = (event, newValue) => {
    let regX = grid.x;
    setGrid({x: regX, y: newValue});
    setHeight(newValue * cubeSize);
    setNumSqrLeft(newValue * regX);
  }

  // highscore/leaderboard
  function displayScores() {
    if (user === 'Guest') {
      // user is not signed in, cannot save
      alert('Please sign in to view scoreboard!');
    } else {
      const category = document.querySelector( "#category" ),
          json = {category: category.value}
    
    fetch( '/getHighscores', {
      method:'POST',
      body: JSON.stringify( json ),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      } else {
        alert("Oops, something went wrong! Please try again.")
        return Promise.reject('Bad status: ' + response.status);
      }
    }).then(jres => {
      const scoreboard = document.getElementById('leaderboard');
      scoreboard.replaceChildren(); // getting rid of any existing html

      // creating table to append to scoreboard
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tbody = document.createElement('tbody');
      if (category.value === 'own') {
        // caption
        const caption = document.createElement('caption');
        caption.textContent = "My Top Three Scores";
        table.appendChild(caption);

        // header
        const theader = document.createElement('tr');
        const hdiff = document.createElement('th');
        hdiff.textContent = 'Difficulty';
        theader.appendChild(hdiff);
        const hscore = document.createElement('th');
        hscore.textContent = 'My Score';
        theader.appendChild(hscore);
        thead.appendChild(theader);
    
        // table rows
        const easyrow = document.createElement('tr');
        const erm = document.createElement('td');
        erm.textContent = 'Easy';
        easyrow.appendChild(erm);
        const ers = document.createElement('td');
        if (jres.easy === -1) {
          ers.textContent = 'N/A';
        } else {
          ers.textContent = formatTimer(jres.easy);
        }
        easyrow.appendChild(ers);
        tbody.appendChild(easyrow);

        const mediumrow = document.createElement('tr');
        const mrm = document.createElement('td');
        mrm.textContent = 'Medium';
        mediumrow.appendChild(mrm);
        const mrs = document.createElement('td');
        if (jres.medium === -1) {
          mrs.textContent = 'N/A';
        } else {
          mrs.textContent = formatTimer(jres.medium);
        }
        mediumrow.appendChild(mrs);
        tbody.appendChild(mediumrow);

        const hardrow = document.createElement('tr');
        const hrm = document.createElement('td');
        hrm.textContent = 'Hard';
        hardrow.appendChild(hrm);
        const hrs = document.createElement('td');
        if (jres.hard === -1) {
          hrs.textContent = 'N/A';
        } else {
          hrs.textContent = formatTimer(jres.hard);
        }
        hardrow.appendChild(hrs);
        tbody.appendChild(hardrow);
    
        table.appendChild(thead);
        table.appendChild(tbody);
      } else {
        // caption
        const caption = document.createElement('caption');
        if (category.value === 'easy') {
          caption.textContent = "Easy Mode Leaderboard";
        } else if (category.value === 'medium') {
          caption.textContent = "Medium Mode Leaderboard";
        } else if (category.value === 'hard') {
          caption.textContent = "Hard Mode Leaderboard";
        }
        table.appendChild(caption);

        // header
        const theader = document.createElement('tr');
        const hrank = document.createElement('th');
        hrank.textContent = 'Rank';
        theader.appendChild(hrank);
        const huser = document.createElement('th');
        huser.textContent = 'Username';
        theader.appendChild(huser);
        const hscore = document.createElement('th');
        hscore.textContent = 'Score';
        theader.appendChild(hscore);
        thead.appendChild(theader);

        for (let i = 0; i < 3; i++) {
          // table rows
          if (jres[i] === -1) {
            const row = document.createElement('tr');
            const rr = document.createElement('td');
            rr.textContent = 'N/A';
            row.appendChild(rr);

            const ru = document.createElement('td');
            ru.textContent = 'N/A';
            row.appendChild(ru);

            const rs = document.createElement('td');
            rs.textContent = 'N/A';
            row.appendChild(rs);
            tbody.appendChild(row);
          } else {
            const row = document.createElement('tr');
            const rr = document.createElement('td');
            rr.textContent = `${i + 1}`;
            row.appendChild(rr);

            const ru = document.createElement('td');
            ru.textContent = jres[i].userName;
            row.appendChild(ru);

            const rs = document.createElement('td');
            rs.textContent = formatTimer(jres[i].score);
            row.appendChild(rs);
            tbody.appendChild(row);
          }   
        }
    
        table.appendChild(thead);
        table.appendChild(tbody);

      }
      scoreboard.appendChild(table);
      scoreboard.style.display = 'block';
    })

    
    }
  }

  function saveScore() {
    if (user === 'Guest') {
      // user is not signed in, cannot save
      alert('Please sign in to save scores!');
    } else {
      // user is signed in
      if (recentTime === -1) {
        alert('Please play and win a game before saving!');
      } else if (didSaveTime) {
        alert('The most recent score has already been saved!');
      } else if (theMode === 'Custom') {
        alert('The scoreboard does not save times achieved on the Custom difficulty.')
      } else { 
        const json = {"score": recentTime, "mode": theMode}

        fetch('/saveScore', {
          method:'POST',
          body: JSON.stringify( json ),
          headers: {'Content-Type': 'application/json'}
        }).then(response => {
          if (response.status === 200) {
            alert("Score was saved!")
            setDidSaveTime(true);
          } else {
            alert("Oops, failed to save score! Make sure you are logged in.")
          }
        })
      }
    }
  }

  // timer functions
  // starts timer if isTimerOn is true (updates every 1000 ms)
  useEffect(() => {
    let interval;
    if (isTimerOn) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1000); // Update every 10ms
      }, 1000);
    } else {
      setTimer(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval); // Cleanup on unmount or isRunning change
  }, [isTimerOn]);

  // formats the timer (in milliseconds) into minutes and seconds
  function formatTimer(ms) {
    const minutes = Math.floor(ms / 60000); // calculates the minutes
    const seconds = Math.floor((ms % 60000) / 1000); // calculates the seconds minus full minutes
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };


  return (
    <>
      <div>
        <p> <b>User:</b> {user}</p>
      </div>
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
        <h3 id='stopwatchDisplay'>{isTimerOn? `Time: ${formatTimer(timer)}` : ''}</h3>
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
            Number of Mines
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
            Board Tiles Width
          </Typography>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Slider
              value={typeof grid.x === 'number' ? grid.x : 0}
              onChange={handleChangeGridX}
              min={4}
              max={Math.floor(document.body.offsetWidth / 30) < 30? Math.floor(document.body.offsetWidth / 30) : 30}
              aria-labelledby="changeGridX"
              valueLabelDisplay="auto"
              step={1}
            />
          </Grid>
          <br/>
          <Typography id="changeGridY" gutterBottom>
            Board Tiles Height
          </Typography>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Slider
              value={typeof grid.y === 'number' ? grid.y : 0}
              onChange={handleChangeGridY}
              min={4}
              max={26}
              aria-labelledby="changeGridY"
              valueLabelDisplay="auto"
              step={1}
            />
          </Grid>
        </div>

        <br/>
        <div>
          <button onClick={() => saveScore()}>
            Save Recent Score
          </button>
        </div>

        <br />
        <label htmlFor="category">Choose a category:</label>
        <select id="category" name="categories">
          <option value="own">My Own</option>
          <option value="easy">Easy Mode</option>
          <option value="medium">Medium Mode</option>
          <option value="hard">Hard Mode</option>
        </select>
        <button onClick={() => displayScores()}>
          Display Highscores
        </button>
        <div id='leaderboard'>
          
        </div>

      </div>
    </>
  )
}

export default App
