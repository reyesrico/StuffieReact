import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Piece,
  getInitialPiece,
  Direction,
  PieceType,
  pieceShapes
} from "./Piece";
import ThemeContext from "../../../context/ThemeContext";

// Tetris board size
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Helper: determine the absolute block positions for a piece.
const getPieceBlocks = (piece: {
  type: PieceType;
  direction: Direction;
  position: { x: number; y: number };
}) => {
  const shape = pieceShapes[piece.type][piece.direction];
  return shape.map((block) => ({
    x: piece.position.x + block.x,
    y: piece.position.y + block.y,
  }));
};

// Check collision for a piece using the board state.
const checkCollision = (
  piece: { type: PieceType; direction: Direction; position: { x: number; y: number } },
  board: number[][]
): boolean => {
  const blocks = getPieceBlocks(piece);
  return blocks.some(({ x, y }) => {
    // Check boundaries.
    if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return true;
    // y might be negative at spawn.
    if (y >= 0 && board[y][x] !== 0) return true;
    return false;
  });
};

// Merge the piece into the board.
const mergePieceIntoBoard = (
  board: number[][],
  piece: { type: PieceType; direction: Direction; position: { x: number; y: number } }
): number[][] => {
  const newBoard = board.map((row) => [...row]); // copy board
  const blocks = getPieceBlocks(piece);
  blocks.forEach(({ x, y }) => {
    if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
      newBoard[y][x] = 1; // Mark cell as filled (1)
    }
  });
  return newBoard;
};

// Clear any full rows and return the new board and number of rows cleared.
const clearFullRows = (board: number[][]): { newBoard: number[][]; rowsCleared: number } => {
  const newBoard = board.filter((row) => row.some(cell => cell === 0));
  const rowsCleared = BOARD_HEIGHT - newBoard.length;
  // Add empty rows at the top.
  for (let i = 0; i < rowsCleared; i++) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }
  return { newBoard, rowsCleared };
};

const Tetris: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const [board, setBoard] = useState<number[][]>(
    Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0))
  );
  const [piece, setPiece] = useState(getInitialPiece());
  const [level, setLevel] = useState(1);
  const [rowsCleared, setRowsCleared] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [dropInterval, setDropInterval] = useState(1000);
  const [paused, setPaused] = useState(false);
  const [flash, setFlash] = useState(false);

  // Drop piece by one row.
  const dropPiece = useCallback(() => {
    // Don't drop while paused.
    if (paused) return;
    setPiece(prev => {
      const newPiece = { ...prev, position: { ...prev.position, y: prev.position.y + 1 } };
      // If collision occurs after moving down, merge the piece.
      if (checkCollision(newPiece, board)) {
        setBoard(oldBoard => {
          const mergedBoard = mergePieceIntoBoard(oldBoard, prev);
          const { newBoard, rowsCleared: cleared } = clearFullRows(mergedBoard);
          if (cleared > 0) {
            setRowsCleared(r => r + cleared);
            // Trigger flash animation if exactly 4 rows are cleared at once.
            if (cleared === 4) {
              setFlash(true);
              setTimeout(() => setFlash(false), 1000);
            }
          }
          return newBoard;
        });
        // Generate new piece.
        const candidate = getInitialPiece();
        // If the new piece collides immediately, game over.
        if (checkCollision(candidate, board)) {
          setGameOver(true);
          return prev;
        }
        return candidate;
      }
      return newPiece;
    });
  }, [board, paused]);

  // Animate fast drop when Space is pressed.
  const animateDropPiece = useCallback(() => {
    if (paused || gameOver) return;
    let currentPiece = piece;
    const fastDrop = setInterval(() => {
      const nextPiece = { ...currentPiece, position: { ...currentPiece.position, y: currentPiece.position.y + 1 } };
      if (checkCollision(nextPiece, board)) {
        clearInterval(fastDrop);
        setBoard(oldBoard => {
          const mergedBoard = mergePieceIntoBoard(oldBoard, currentPiece);
          const { newBoard, rowsCleared: cleared } = clearFullRows(mergedBoard);
          if (cleared > 0) {
            setRowsCleared(r => r + cleared);
            if (cleared === 4) {
              setFlash(true);
              setTimeout(() => setFlash(false), 1000);
            }
          }
          return newBoard;
        });
        const candidate = getInitialPiece();
        if (checkCollision(candidate, board)) {
          setGameOver(true);
          return;
        }
        setPiece(candidate);
      } else {
        currentPiece = nextPiece;
        setPiece(nextPiece);
      }
    }, 50); // Fast drop interval for animation.
  }, [board, piece, paused, gameOver]);

  // Handle key events.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === "Enter") {
        setPaused(prev => !prev);
      } else if (e.key === "ArrowUp") {
        setPiece(prev => {
          const rotated = { ...prev, direction: ((prev.direction + 1) % 4) as Direction };
          if (checkCollision(rotated, board)) return prev;
          return rotated;
        });
      } else if (e.key === "ArrowLeft") {
        setPiece(prev => {
          const moved = { ...prev, position: { ...prev.position, x: prev.position.x - 1 } };
          if (checkCollision(moved, board)) return prev;
          return moved;
        });
      } else if (e.key === "ArrowRight") {
        setPiece(prev => {
          const moved = { ...prev, position: { ...prev.position, x: prev.position.x + 1 } };
          if (checkCollision(moved, board)) return prev;
          return moved;
        });
      } else if (e.key === "ArrowDown") {
        dropPiece();
      } else if (e.key === " " || e.code === "Space") {
        // Space key pressed - trigger fast drop with fun animation.
        animateDropPiece();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dropPiece, animateDropPiece, gameOver, board]);

  // Piece auto drop based on interval.
  useEffect(() => {
    if (gameOver || paused) return;
    const interval = setInterval(() => {
      dropPiece();
    }, dropInterval);
    return () => clearInterval(interval);
  }, [dropPiece, dropInterval, gameOver, paused]);

  // Level and speed control.
  useEffect(() => {
    setDropInterval(1000 - (level - 1) * 100);
  }, [level]);

  // Increase level every 10 rows (dummy logic).
  useEffect(() => {
    if (rowsCleared > 0 && rowsCleared % 10 === 0) {
      setLevel(l => l + 1);
    }
  }, [rowsCleared]);

  // Dummy Game Over condition: if a Piece is merged at the top.
  useEffect(() => {
    // If any cell in the top row is filled, game over.
    if (board[0].some(cell => cell !== 0)) {
      setGameOver(true);
    }
  }, [board]);

  return (
    <>
      <h2>Tetris</h2>
      <div>Level: {level}</div>
      <div>Rows Cleared: {rowsCleared}</div>
      <div style={{ position: "relative", width: 300, height: 600, border: "2px solid #333" }}>
        {gameOver && <div style={{ color: "red" }}>Game Over</div>}
        {paused && !gameOver && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 24,
            color: "blue",
            zIndex: 1,
            backgroundColor: "lightgray",
            border: "2px solid black",
            padding: 20
          }}>
            Paused
          </div>
        )}
        {/* Flash animation overlay */}
        {flash && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: BOARD_WIDTH * 30,
            height: BOARD_HEIGHT * 30,
            backgroundColor: "white",
            opacity: 0.7,
            animation: "flashAnimation 1s ease-out"
          }}/>
        )}
        <Piece type={piece.type} direction={piece.direction} position={piece.position} />
        {/* Render board grid (optional) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: BOARD_WIDTH * 30,
            height: BOARD_HEIGHT * 30,
            pointerEvents: "none",
          }}
        >
          {[...Array(BOARD_HEIGHT)].map((_, y) =>
            [...Array(BOARD_WIDTH)].map((_, x) => (
              <div
                key={`${x}-${y}`}
                style={{
                  position: "absolute",
                  left: x * 30,
                  top: y * 30,
                  width: 30,
                  height: 30,
                  border: "1px solid #eee",
                  boxSizing: "border-box",
                }}
              />
            ))
          )}
          {/* Render merged blocks from the board */}
          {board.map((row, y) =>
            row.map((cell, x) =>
              cell !== 0 ? (
                <div
                  key={`cell-${x}-${y}`}
                  style={{
                    position: "absolute",
                    left: x * 30,
                    top: y * 30,
                    width: 30,
                    height: 30,
                    background: theme === "light" ? "gray" : "lightgray",
                    border: "1px solid #333",
                    boxSizing: "border-box",
                  }}
                />
              ) : null
            )
          )}
        </div>
      </div>
      {/* CSS Keyframes for flash animation */}
      <style>{`
        @keyframes flashAnimation {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Tetris;