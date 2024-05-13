import React, { useState, useEffect } from "react";
import "./styles.css";

function Square({ value, onSquareClick, isWinning }) {
  return (
    <button
      className={"square " + (isWinning ? "square--winning" : "")}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({
  xIsNext,
  squares,
  onPlay,
  currentMove,
  history,
  winningSquares,
}) {
  function handleClick(i) {
    const locations = [
      [1, 1],
      [2, 1],
      [3, 1],
      [1, 2],
      [2, 2],
      [3, 2],
      [1, 3],
      [2, 3],
      [3, 3],
    ];
    let clickLocation = locations[i];
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const currentSquares = history[currentMove].squares;
    const nextSquares = currentSquares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares, clickLocation);
  }

  const size = 3;
  let board = [];

  for (let row = 0; row < size; row++) {
    let rowArray = [];
    for (let col = 0; col < size; col++) {
      const i = row * size + col;
      rowArray.push(
        <Square
          isWinning={winningSquares.includes(i)}
          key={i}
          value={squares[i]}
          onSquareClick={() => handleClick(i)}
        />,
      );
    }
    board.push(
      <div key={row} className="board-row">
        {rowArray}
      </div>,
    );
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner.winner;
  } else if (currentMove === 9) {
    status = "Draw";
  } else {
    status = `Next player: ${xIsNext ? "X" : "O"}`;
  }
  return (
    <>
      <div className="neonText">Move Number: {currentMove + 1}</div>
      <div className="neonText">{status}</div>
      {board}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null) }]);
  const [currentMove, setCurrentMove] = useState(0);
  let xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const winner = calculateWinner(currentSquares.squares);
  const [isReversed, setIsReversed] = useState(true);
  const [points, setPoints] = useState(100);
  const [bet, setBet] = useState(null);
  const [betPlaced, setBetPlaced] = useState(false);
  const [betAmount, setBetAmount] = useState("");

  useEffect(() => {
    if (winner && betPlaced) {
      const amount = parseInt(betAmount, 10);
      if ((winner && bet === winner.winner) || (!winner && bet === "Draw")) {
        setPoints(points + amount * 2);
      } else {
        setPoints(points - amount);
      }
      setBetPlaced(false);
    }
  }, [winner, betPlaced]);

  function resetGame() {
    setHistory([{ squares: Array(9).fill(null) }]);
    setCurrentMove(0);
    setBet(null);
    setBetPlaced(false);
    setBetAmount("");
  }

  function handleBet(choice) {
    const amount = parseInt(betAmount, 10);
    if (amount > 0) {
      setBet(choice);
      setBetPlaced(true);
      setPoints(points - amount);
    } else {
      alert("Please enter a valid bet amount.");
    }
  }

  const renderBetButtons = () => {
    return (
      <div>
        <input
          id="betInput"
          type="number"
          placeholder="Enter bet amount"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
        />
        <button className="betting-button" onClick={() => handleBet("X")}>
          Bet on X
        </button>
        <button className="betting-button" onClick={() => handleBet("O")}>
          Bet on O
        </button>
        <button className="betting-button" onClick={() => handleBet("Draw")}>
          Bet on Draw
        </button>
      </div>
    );
  };

  function handleBet(choice) {
    const amount = parseInt(betAmount);
    if (amount > 0) {
      setBet(choice);
      setBetPlaced(true);
      setPoints(points - amount);
    } else {
      alert("Please enter a valid bet amount.");
    }
  }

  const handleToggleClick = () => {
    setIsReversed(!isReversed);
  };

  function handlePlay(nextSquares, location, checkWinner = false) {
    const nextHistory = history.slice(0, currentMove + 1);
    nextHistory.push({
      squares: nextSquares,
      location: location,
    });
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    if (checkWinner) {
      calculateWinner(nextSquares);
    }
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    const description =
      move > 0
        ? `Go to move #${move} at ${history[move].location}`
        : "Go to game start";

    return (
      <li key={move}>
        <button className="button" onClick={() => jumpTo(move)}>
          {description}
        </button>
      </li>
    );
  });

  function fillBoard() {
    const currentSquares = history[currentMove].squares.slice();
    if (currentSquares.includes(null)) {
      let emptySquares = getEmptySquares(currentSquares);

      for (let i = emptySquares.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [emptySquares[i], emptySquares[j]] = [emptySquares[j], emptySquares[i]];
      }

      emptySquares.forEach((index, i) => {
        setTimeout(() => {
          if (currentSquares[index] === null) {
            const nextSquares = currentSquares.slice();
            nextSquares[index] = i % 2 === 0 ? "X" : "O";
            handlePlay(nextSquares, index, false);
          }
        }, i * 100);
      });
    }
  }

  function getEmptySquares(squares) {
    let emptyIndices = [];
    squares.forEach((square, index) => {
      if (square === null) {
        emptyIndices.push(index);
      }
    });
    return emptyIndices;
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares.squares}
          onPlay={handlePlay}
          currentMove={currentMove}
          history={history}
          winningSquares={winner ? winner.line : []}
        />
      </div>
      <div className="game-info">
        <div className="neonText">Points Available: {points}</div>

        {renderBetButtons()}
        <button className="button" onClick={fillBoard}>
          Auto-Fill Board
        </button>
        <button className="button" onClick={handleToggleClick}>
          Flip List
        </button>
        <button className="button" onClick={resetGame}>
          Reset Game
        </button>
        <ol>{isReversed ? moves.reverse() : moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}
