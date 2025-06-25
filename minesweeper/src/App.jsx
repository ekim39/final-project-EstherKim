import React, { useState, useEffect } from 'react'
/* import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider'; */
import './App.css'

function App() {
  //const [count, setCount] = useState(0)
  const [cubeSize, setCubeSize] = useState(30);
  const [width, setWidth] = useState(18 * cubeSize)
  const [height, setHeight] = useState(14 * cubeSize)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [grid, setGrid] = useState({x: 18, y: 14}) // min should be at least 3
  // keeps track of the current board state
  // is a 2D array, y rows and x cols, with 1 being alive and 0 being dead
  const [boardState, setBoardState] = useState([])
  const [numMine, setNumMine] = useState(40)
  const [runGame, setRunGame] = useState(false);
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
      if (updatedBoard[y][x - 1] !== -1) {
        updatedBoard[y][x - 1] = 1;
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
    let board = [];
    for (let i = 0; i < grid.y; i++) {
      board[i] = [];
      for (let j = 0; j < grid.x; j++) {
        board[i][j] = 0;
      }
    }
    return board;
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

    // plants all mines according to numMine
    // y is the rows and x is the columns
    let numMineStillLeft = numMine;
    while (numMineStillLeft !== 0) {
      let x = Math.floor(Math.random() * (grid.x));
      let y = Math.floor(Math.random() * (grid.y));
      if (currentBoard[y][x] !== -1) {
        currentBoard = setMineAtCell(x, y, currentBoard);
        numMineStillLeft--;
      }
    }

    // covers all squares on board
    for (let i = 0; i < grid.y; i++) {
      for (let j = 0; j < grid.x; j++) {
        context.fillRect(startX + (cubeSize * j), startY + (cubeSize * i), cubeSize, cubeSize);
      }
    }

    // save current state of board
    setBoardState(currentBoard);
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
        <canvas id='board' width={width} height={height}></canvas>
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
