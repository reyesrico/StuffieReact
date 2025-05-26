import React from "react";
import "./Piece.scss";

// Define directions and piece types
export type Direction = 0 | 1 | 2 | 3; // 0: up, 1: right, 2: down, 3: left
export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

// Piece component
interface PieceProps {
  type: PieceType;
  direction: Direction;
  position: { x: number; y: number };
}

// Define tetromino shapes for each piece and rotation (each block is 1 unit in size)
export const pieceShapes: Record<PieceType, Record<Direction, { x: number; y: number }[]>> = {
  I: {
    0: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
    1: [{ x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
    2: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
    3: [{ x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  },
  O: {
    0: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    1: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    2: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    3: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  },
  T: {
    0: [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
    1: [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: 1, y: 0 }],
    2: [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }],
    3: [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }],
  },
  S: {
    0: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 1 }],
    1: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: -1 }],
    2: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 1 }],
    3: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: -1 }],
  },
  Z: {
    0: [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    1: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: -1, y: -1 }],
    2: [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    3: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: -1, y: -1 }],
  },
  J: {
    0: [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
    1: [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: 1, y: -1 }],
    2: [{ x: 0, y: 0 }, { x: -1, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }],
    3: [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 1 }],
  },
  L: {
    0: [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }],
    1: [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    2: [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }],
    3: [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: -1 }],
  },
};

export const Piece: React.FC<PieceProps> = ({ type, direction, position }) => {
  const shape = pieceShapes[type][direction];
  return (
    <>
      {shape.map((block, index) => (
        <div
          key={index}
          className={`piece-${type}-${direction}`}
          style={{
            position: "absolute",
            left: (position.x + block.x) * 30,
            top: (position.y + block.y) * 30,
            width: 30,
            height: 30,
          }}
        />
      ))}
    </>
  );
};

// Helper to get random piece type
export const getRandomPieceType = (): PieceType => {
  const types: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];
  return types[Math.floor(Math.random() * types.length)];
};

// Initial piece state
export const getInitialPiece = () => ({
  type: getRandomPieceType() as PieceType,
  direction: 0 as Direction,
  position: { x: 4, y: 0 },
});
