
import "../styles.css"
import React, { useState, useEffect } from "react";


import whiteKingImg from '../assets/wk.png'; 
import whiteQueenImg from '../assets/wq.png';
import whiteRookImg from '../assets/wr.png';
import whiteBishopImg from '../assets/wb.png';
import whiteKnightImg from '../assets/wn.png';
import whitePawnImg from '../assets/wp.png';
import blackKingImg from '../assets/bk.png';
import blackQueenImg from '../assets/bq.png';
import blackRookImg from '../assets/br.png';
import blackBishopImg from '../assets/bb.png';
import blackKnightImg from '../assets/bn.png';
import blackPawnImg from '../assets/bp.png';



// Initialized Objects, Variables, Loops, & useStates:
const chessPieces = {
  whiteKing: {
    image: whiteKingImg,
    color: 'white',
    type: 'king'
  },
  whiteQueen: {
    image: whiteQueenImg,
    color: 'white',
    type: 'queen'
  },
  whiteRook: {
    image: whiteRookImg,
    color: 'white',
    type: 'rook',
  },
  whiteBishop: {
    image: whiteBishopImg,
    color: 'white',
    type: 'bishop'
  },
  whiteKnight: {
    image: whiteKnightImg,
    color: 'white',
    type: 'knight'
  },
  whitePawn: {
    image: whitePawnImg,
    color: 'white',
    type: 'pawn'
  },
  blackKing: {
    image: blackKingImg,
    color: 'black',
    type: 'king'
  },
  blackQueen: {
    image: blackQueenImg,
    color: 'black',
    type: 'queen'
  },
  blackRook: {
    image: blackRookImg,
    color: 'black',
    type: 'rook'
  },
  blackBishop: {
    image: blackBishopImg,
    color: 'black',
    type: 'bishop'
  },
  blackKnight: {
    image: blackKnightImg,
    color: 'black',
    type: 'knight'
  },
  blackPawn: {
    image: blackPawnImg,
    color: 'black',
    type: 'pawn'
  },
};

const startingPosition = [
  [chessPieces.blackRook, chessPieces.blackKnight, chessPieces.blackBishop, chessPieces.blackQueen, chessPieces.blackKing, chessPieces.blackBishop, chessPieces.blackKnight, chessPieces.blackRook],
  [chessPieces.blackPawn, chessPieces.blackPawn, chessPieces.blackPawn, chessPieces.blackPawn, chessPieces.blackPawn, chessPieces.blackPawn, chessPieces.blackPawn, chessPieces.blackPawn],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [chessPieces.whitePawn, chessPieces.whitePawn, chessPieces.whitePawn, chessPieces.whitePawn, chessPieces.whitePawn, chessPieces.whitePawn, chessPieces.whitePawn, chessPieces.whitePawn],
  [chessPieces.whiteRook, chessPieces.whiteKnight, chessPieces.whiteBishop, chessPieces.whiteQueen, chessPieces.whiteKing, chessPieces.whiteBishop, chessPieces.whiteKnight, chessPieces.whiteRook],
];

// HELPER FUNCTION RIGHT HERE:::

const getPieceColor = (chessPiece) => {
  if (!chessPiece) return null;
  return chessPiece.color;
};

const App = () => {
  // Dynamic Objects, Variables, & useStates:::
  const [board, setBoard] = useState(startingPosition);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [playerTurn, setPlayerTurn] = useState('white');
  const [alert, setAlert] = useState({ show: false, message: "" });
  const [isAIThinking, setIsAIThinking] = useState(false);

  useEffect(() => {
    console.log('selectedPiece:', selectedPiece);
  }, [selectedPiece]);

  const showAlert = (message) => {
    setAlert({ show: true, message });
    setTimeout(() => {
      setAlert({ show: false, message: "" });
    }, 3000);
  };

  useEffect(() => {
    if (playerTurn === 'black') {
      setTimeout(blackTurnAIMove, 500);
    }
  }, [playerTurn]);

  const getAIMove = async () => {
    console.log("Attempting to get AI move");
    console.log("Current board state:", board);
    try {
      const response = await fetch("/api/get_move", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          board: board,
          turn: 'black'
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No valid move found');
        } else if (response.status === 400) {
          throw new Error('Invalid request data');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('AI response data:', data);
      return data;
    } catch (error) {
      console.error('Error getting AI move:', error);
      throw error;
    }
  };

  const blackTurnAIMove = async () => {
    if (playerTurn !== 'black') {
      console.log("Not black's turn, skipping AI move");
      return;
    }

    setIsAIThinking(true);

    try {
      const response = await getAIMove();
      console.log('AI response:', response);
      if (response && response.move) {
        const move = response.move;
        console.log('AI chose move:', move);

        if (typeof move === 'object' && 'startRow' in move && 'startCol' in move && 'endRow' in move && 'endCol' in move) {
          const { startRow, startCol, endRow, endCol } = move;
          const moveSuccess = executeMove(startRow, startCol, endRow, endCol);
          if (!moveSuccess) {
            console.error('AI attempted an invalid move');
            showAlert('AI attempted an invalid move');
          }
        } else {
          console.log('AI returned an invalid move format');
          showAlert('AI move error. Invalid move format.');
        }
      } else {
        console.log('AI did not return a valid move');
        showAlert('AI move error. Please try again.');
      }
    } catch (error) {
      console.error('Error during AI move:', error);
      showAlert('Network error. Please check your connection and try again.');
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleClick = (row, col) => {
    const chessPiece = board[row][col];
    console.log(`Clicked on ${row} & ${col}`);

    if (selectedPiece) {
      if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
        executeMove(selectedPiece.row, selectedPiece.col, row, col);
      } else {
        showAlert("Invalid move. Please try again.");
      }
      setSelectedPiece(null);
    } else {
      if (chessPiece && chessPiece.color === playerTurn) {
        setSelectedPiece({ chessPiece, row, col });
      } else {
        showAlert("Wrong piece selected. It's not your turn.");
      }
    } 
  };

  const isPathClear = (board, startRow, startCol, endRow, endCol) => {
    console.log('isPathClear being called from', startRow, startCol, endRow, endCol)
    const rowStep = Math.sign(endRow - startRow);
    const colStep = Math.sign(endCol - startCol);
    let currentRow = startRow + rowStep;
    let currentCol = startCol + colStep;

    while (currentRow !== endRow || currentCol !== endCol) {
      if (board[currentRow][currentCol] !== null) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    return true; 
  };

  const isValidMove = (startRow, startCol, endRow, endCol) => {
    console.log('isValidMove called with:', startRow, startCol, endRow, endCol);
    const attackingPiece = board[startRow][startCol];
    if (!attackingPiece) return false;

    if (attackingPiece.color !== playerTurn) {
      console.log('Wrong color piece selected');
      return false;
    }

    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;

    const validPawnDirection = attackingPiece.color === 'black' ? rowDiff > 0 : rowDiff < 0;

    if (attackingPiece.type === 'pawn') {
      const targetPiece = board[endRow][endCol];
      if (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1) {
        return validPawnDirection && targetPiece && targetPiece.color !== attackingPiece.color;
      } else if (Math.abs(colDiff) === 0) {
        if (Math.abs(rowDiff) === 1) {
          return validPawnDirection && !targetPiece;
        } else if (Math.abs(rowDiff) === 2) {
          const initialRow = attackingPiece.color === 'black' ? 1 : 6;
          return startRow === initialRow && !targetPiece && !board[startRow + (rowDiff / 2)][startCol];
        }
      }
    } else if (attackingPiece.type === 'bishop') {
      if (Math.abs(colDiff) === Math.abs(rowDiff) && isPathClear(board, startRow, startCol, endRow, endCol)) {
        const targetPiece = board[endRow][endCol];
        return !targetPiece || targetPiece.color !== attackingPiece.color;
      }
    } else if (attackingPiece.type === 'rook') {
      if ((colDiff === 0 || rowDiff === 0) && isPathClear(board, startRow, startCol, endRow, endCol)) {
        const targetPiece = board[endRow][endCol];
        return !targetPiece || targetPiece.color !== attackingPiece.color;
      }
    } else if (attackingPiece.type === 'queen') {
      if ((colDiff === 0 || rowDiff === 0 || Math.abs(colDiff) === Math.abs(rowDiff)) && isPathClear(board, startRow, startCol, endRow, endCol)) {
        const targetPiece = board[endRow][endCol];
        return !targetPiece || targetPiece.color !== attackingPiece.color;
      }
    } else if (attackingPiece.type === 'king') {
      if (Math.abs(colDiff) <= 1 && Math.abs(rowDiff) <= 1) {
        const targetPiece = board[endRow][endCol];
        return !targetPiece || targetPiece.color !== attackingPiece.color;
      }
    } else if (attackingPiece.type === 'knight') {
      if ((Math.abs(colDiff) === 1 && Math.abs(rowDiff) === 2) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)) {
        const targetPiece = board[endRow][endCol];
        return !targetPiece || targetPiece.color !== attackingPiece.color;
      }
    }

    showAlert("Invalid move: Move does not comply with the rules.");
    return false;
  };

  const checkCapture = (startRow, startCol, endRow, endCol) => {
    console.log('checkCapture called with:', startRow, startCol, endRow, endCol);
    const defendingPiece = board[endRow][endCol];
    const attackingPiece = board[startRow][startCol];
    return defendingPiece !== null && defendingPiece.color !== attackingPiece.color;
  };

  const executeMove = (startRow, startCol, endRow, endCol, promotionPiece = null) => {
    console.log('executeMove called with:', startRow, startCol, endRow, endCol);
    const newBoard = board.map((row) => [...row]);
    let piece = board[startRow][startCol];
    console.log('Piece to be moved:', piece);

    if (!piece || piece.color !== playerTurn) {
      console.error('Invalid move: No piece or wrong color');
      return false;
    }

    if (promotionPiece) {
      piece = {
        symbol: promotionPiece === 'Q' ? '♛' : promotionPiece === 'R' ? '♜' : promotionPiece === 'B' ? '♝' : '♞',
        color: piece.color,
        type: promotionPiece.toLowerCase()
      };
    }

    newBoard[endRow][endCol] = piece;
    newBoard[startRow][startCol] = null;

    setBoard(newBoard);
    setSelectedPiece(null);
    const newTurn = playerTurn === 'white' ? 'black' : 'white';
    setPlayerTurn(newTurn);

    console.log(`Turn changed to ${newTurn}`);

    return true;
  };

  const resetGame = () => {
    setBoard(startingPosition);
    setSelectedPiece(null);
    setPlayerTurn('white');
    setAlert({ show: false, message: "" });
    setIsAIThinking(false);
  };

  return (
    <div className="chess-app">
      <div className="chessboard-container">
        {isAIThinking && (
          <div className="ai-thinking-overlay">
            <div className="ai-thinking-message">AI is thinking...</div>
          </div>
        )}
        <div className="chessPieces">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="rowClass">
              {row.map((piece, colIndex) => (
                <div
                  key={colIndex}
                  className={`
                    ${colIndex % 2 === rowIndex % 2 ? "whiteSquare" : "blackSquare"}
                    ${selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex ? "selected-piece" : ""}
                  `}
                  onClick={() => handleClick(rowIndex, colIndex)}
                >
                  {piece ? (
                    <img 
                      src={piece.image} 
                      alt={`${piece.color} ${piece.type}`} 
                      className={`chess-piece ${piece.color}`}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="reset-button-container">
        <button onClick={resetGame} className="reset-button">Reset Game</button>
      </div>
    </div>
  );
}

export default App;







