import React, { useState, useEffect } from 'react'
/* import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider'; */
import './App.css'

function App() {
  //const [count, setCount] = useState(0)
  const [cubeSize, setCubeSize] = useState(30);
  const [width, setWidth] = useState(18 * cubeSize);
  const [height, setHeight] = useState(14 * cubeSize);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [grid, setGrid] = useState({x: 18, y: 14}); // min should be at least 3
  // keeps track of the current board state
  // is a 2D array, y rows and x cols, with 1 being alive and 0 being dead
  const [boardState, setBoardState] = useState([]);
  const [numMine, setNumMine] = useState(40);
  const [boardReady, setBoardReady] = useState(false);
  const [gameStart, setGameStart] = useState(false);
  // interactivity (sliders)

  // draws the border of the board
  function drawBorder() {
    const cubeWidth = width/grid.x;
    const cubeHeight = height/grid.y;

    let canvas = document.getElementById('board');
    let context = canvas.getContext('2d');

    const aliveColor = getComputedStyle(document.documentElement).getPropertyValue('color');

    context.strokeStyle = aliveColor; 

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
    //let board = [];
    /* for (let i = 0; i < grid.y; i++) {
      board[i] = [];
      for (let j = 0; j < grid.x; j++) {
        board[i][j] = 0;
      }
    } */
    return Array.from({ length: grid.y }, () => Array(grid.x).fill(0));
  }

  // draws the initial board in generating a random board state
  function drawBoard() {
    // board state that will be set to boardState
    let currentBoard = [];

    let canvas = document.getElementById('board');
    let context = canvas.getContext('2d');

    // clear board
    context.clearRect(startX, startY, width, height);

    drawBorder();
    const aliveColor = getComputedStyle(document.documentElement).getPropertyValue('color');
    context.fillStyle = aliveColor;

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
    console.log("end board at calcUnderlying")
    console.log(completelynewboard);
    setBoardState(completelynewboard);
    return completelynewboard;
  }

  // returns how many of the surrounding tiles of the tile at coordinate x, y are alive
  /* function checkAlive(x, y) {
    let alive = 0;
    if (x !== 0) {
      // not at leftside
      alive += boardState[y][x - 1];
      if (y !== 0) {
        // not at top left corner
        alive += boardState[y - 1][x - 1];
      }
    }
    if (x !== (grid.x - 1)) {
      // not at rightside
      alive += boardState[y][x + 1];
      if (y !== (grid.y - 1)) {
        // not at bottom right corner
        alive += boardState[y + 1][x + 1];
      }
    }
    if (y !== 0) {
      // not at top
      alive += boardState[y - 1][x];
      if (x !== (grid.x - 1)) {
        // not at top right corner
        alive += boardState[y - 1][x + 1];
      }
    }
    if (y !== (grid.y - 1)) {
      // not at bottom
      alive += boardState[y + 1][x];
      if (x !== 0) {
        // not at bottom left corner
        alive += boardState[y + 1][x - 1];
      }
    }
    return alive;
  }

  // checks whether the cell is alive or dead using its old state and how many cells around it are alive
  function newCellState(oldState, alive) {
    let newState = oldState;
    if (oldState === 0 && alive === 3) {
      newState = 1;
    } else if (oldState === 1 && (alive < 2 || alive > 3)) {
      newState = 0;
    }
    return newState;
  }

  // runs one step in the simulation of the game of life
  function runSimulation() {
    let newBoard = [];
    const cubeWidth = width/grid.x;
    const cubeHeight = height/grid.y;

    let canvas = document.getElementById('board');
    let context = canvas.getContext('2d');
    const aliveColor = getComputedStyle(document.documentElement).getPropertyValue('color');
    const deadColor = getComputedStyle(document.documentElement).getPropertyValue('background-color');
  
    for (let i = 0; i < grid.y; i++) {
      newBoard[i] = [];
      for (let j = 0; j < grid.x; j++) {
        let alive = checkAlive(j, i);
        let cellState = newCellState(boardState[j][i], alive);
        newBoard[i][j] = cellState;
        if (cellState === 1) {
          context.fillStyle = aliveColor;
          context.fillRect(startX + (cubeSize * j), startY + (cubeSize * i), cubeSize, cubeSize);
        } else {
          context.fillStyle = deadColor;
          context.fillRect(startX + (cubeSize * j), startY + (cubeSize * i), cubeSize, cubeSize);
        }
      }
    }
    setBoardState(newBoard);
    drawBorder();

  } */

  function drawOneCube(x, y) {
    let canvas = document.getElementById('board');
    let context = canvas.getContext('2d');

    const squareBackground = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color');
    const squareInner = getComputedStyle(document.documentElement).getPropertyValue('background-color');
    //context.strokeStyle = squareInner;
    context.fillStyle = squareBackground;

    // if boardState[y][x] === 0, then all that is needed is to fill out background
    context.fillRect(startX + (cubeSize * x), startY + (cubeSize * y), cubeSize, cubeSize);   
    
    if (boardState[y][x] === -1) {
      // there is a mine on the board
      var mineImg = new Image();
      mineImg.onload = function() {
        context.drawImage(mineImg, startX + (x * cubeSize), startY + (y * cubeSize), 30, 30);
      };
      mineImg.src = "/public/mine.png";
    } else if (boardState[y][x] > 0 && boardState[y][x] < 9) {
      // there is a number on the board
      context.font = 'bold 20px Arial';
      if (boardState[y][x] === 1) {
        context.fillStyle = 'blue';
      } else if (boardState[y][x] === 2) {
        context.fillStyle = 'green';
      } else if (boardState[y][x] === 3) {
        context.fillStyle = 'red';
      } else if (boardState[y][x] === 4) {
        context.fillStyle = 'purple';
      } else if (boardState[y][x] === 5) {
        context.fillStyle = 'yellow';
      } else if (boardState[y][x] === 6) {
        context.fillStyle = 'dark blue';
      } else if (boardState[y][x] === 7) {
        context.fillStyle = 'black';
      } else {
        context.fillStyle = 'gray'; 
      }
      
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      const fx = (startX + (cubeSize * x)) + (cubeSize / 2);
      const fy = (startY + (cubeSize * y)) + (cubeSize / 2);
      context.fillText(boardState[y][x].toString(), fx, fy);
    }
  }

  // !!! TODO - need to add flag function; when a square with 0 mines around it is clicked, should keep opening surrounding squares until it hits a number; need to add a win function, wins when all squares besides mines are opened (maybe have a tracker to keep track of squares still left unopened).
  function cubeClicked(event) {
    if (gameStart) {
      let canvas = document.getElementById('board');
      let container = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - container.left) / cubeSize);
      const y = Math.floor((event.clientY - container.top) / cubeSize);
      if (boardState[y][x] === -1) {
        // clicked on mine
        drawOneCube(x, y);
        alert("Game Over! You hit a mine!")
        // reset game
        setBoardReady(false);
        setGameStart(false);
        setBoardState(clearBoard());
      } else if (boardState[y][x] > 0) {
        // draw this square only
        drawOneCube(x, y);
      } else {
        // keep drawing surrounding squares until a number is drawn
        drawOneCube(x, y);
      }
    } else {
      // indicates first move has been made and underlying elements have been created
      setGameStart(true);
      let canvas = document.getElementById('board');
      let container = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - container.left) / cubeSize);
      const y = Math.floor((event.clientY - container.top) / cubeSize);
      calculateUnderlyingBoard(x, y);
      drawOneCube(x, y);
    }
  }


  // is called everytime runGame or the boardState is modified, used to run the whole simulation
  /* useEffect(() => {
    let timer; // timer keeps speed of the simulation
    if (runGame) {
      timer = setTimeout(() => {
        runSimulation();
      }, 1000);
    }

    return () => clearTimeout(timer)
  }, [runGame, boardState]) */

  return (
    <>
      <div>
        <h1>Minesweeper</h1>
      </div>
      <div>
        <canvas id='board' width={width} height={height} 
        onClick={boardReady ? cubeClicked : () => alert("Please generate the board before starting the game!")}></canvas>
      </div>
      
      <div>
        <button onClick={() => drawBoard()}>
          Generate Board
        </button>
        {/* <button onClick={() => {runGame ? setRunGame(false) : setRunGame(true)}}>
          {runGame ? 'Stop' : 'Start'}
        </button> */}
      </div>
    </>
  )
}

export default App
