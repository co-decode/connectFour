import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react'
import styles from '../styles/gameboard.module.css'
interface Position {
    row: number,
    col: number
}
/* 
interface Helper {
    horizontal: number[][],
    vertical: number[][],
    inclineDiag: number[][],
    declineDiag: number[][]
}

const helper: Helper = {
    horizontal: [[0,1],[0,-1]],
    vertical: [[1,0],[-1,0]],
    inclineDiag: [[1,1],[-1,-1]],
    declineDiag: [[1,-1],[-1,1]]
}
 */
const [RED, BLUE] = ['RED', 'BLUE']

const board =  Array.from({length: 42}, _ => 0)

/* What needs to happen next? */
/* 
- DONE Fix piece spawn in bug
- DONE Determine when the game is won.
- Next ->> Fix Spawn in issues with multiple bad highlights
- Then work on socket integration.
*/
export default function GameBoard() {
    const [pieces, setPieces] = useState<number[]>([0])
    const [piecePos, setPiecePos] = useState<number>(3)
    const [moves, setMoves] = useState<number[][]>(
        Array.from({length:6}, (_,i) => 
            Array.from({length: 7}, () => 0))
        )
    const [turn, setTurn] = useState<string>(RED)
    const [gameOver, setGameOver] = useState<boolean>(false)
    const pieceRef = useRef<null | HTMLDivElement>(null)
    const holeRef = useRef<HTMLDivElement[]>([])

    useEffect(() => {
        // New pieces are spawned in the center of the board. 
        if (pieceRef.current == null ) return
        // As hover events set piecePos, the piece's offset moves it to the column over which the mouse hovers.
        // If the mouse exits the board, the piece stays at where the mouse last hovers.
        let offset = piecePos - 3
        if (pieceRef.current.style.display !== "block") pieceRef.current.style.display = "block"
        pieceRef.current.style.left = `calc(50% + ${offset * 100}px)`

    },[piecePos,pieces])

    useEffect(() => {
        if (gameOver) {
            holeRef.current.forEach(hole => hole.style.cursor = "default")
        
        }
    }, [gameOver])

    function paintLowest(col:number) {
        let lowestOfCol: number | null = null;
        // No hole should be yellow if no space if available
        for (let i = 0; i < 42; i++) {
            // Ensure that the lowest unoccupied space in column is selected
            
            if (i % 7 === col && moves[Math.floor(i / 7)][col] === 0) lowestOfCol = i 
        }
        // Guard against null case
        if (lowestOfCol == null) return
        // Turn hole yellow
        holeRef.current[lowestOfCol].style.backgroundColor = "yellow"
    }

    useEffect(() => {
        // Only when a piece is added does a new paint occur, such that even without a mouseevent causing a repaint, a yellow circle will appear in the column where the cursor is hovering.
        // Ensure paint does not occur after the winning move.
        let col = piecePos
        if (!gameOver) paintLowest(col)
    },[pieces])

    const handleHover = (col: number) => {
        // Do not highlight if the game has been won:
        if (gameOver) return
        // Change piecePos and paint lowest on mouseOver event
        setPiecePos(col)
        paintLowest(col)
    }
    const handleOut = () => {
        for (let i = 0; i < 42; i++) {
            holeRef.current[i].style.backgroundColor = "transparent"
        }
        // All backgroundColors are cleared, but the hover event fire AFTER this event, ensuring there should always be an open space in yellow so long as the board is being hovered.
    }
    function checkMove(r:number, c:number, t:number): boolean {
        // Check count for vertical, horizontal, incline diagonal and decline diagonal
        // let center = moves[r][c]
        let count = 1
        let i = 1
        // HORIZONTAL:
        while (moves[r][c + i++] === t) count++
        i = 1
        while (moves[r][c - i++] === t) count++
        if (count >= 4) return true
        console.log(count)
        i = 1
        count = 1
        // VERTICAL:
        while (r + i < 6 && moves[r + i++][c] === t) count++
        if (count === 4) return true
        console.log(count)
        i = 1
        count = 1
        // INCLINE DIAG:
        while (r + i < 6 && moves[r + i][c + i++] === t) count++
        i = 1
        while (r - i >= 0 && moves[r - i][c - i++] === t) count++
        console.log(count)
        if (count >= 4) return true
        i = 1
        count = 1
        // DECLINE DIAG:
        while (r - i >= 0 && moves[r - i][c + i++] === t) count++
        i = 1
        while (r + i < 6 && moves[r + i][c - i++] === t) count++
        console.log(count)
        if (count >= 4) return true
        i = 1
        count = 1

        return false
    }
    const handlePlacement = (col:number) => {
        if (pieceRef.current === null) return
        let lowestOfCol:number | null = null;
        // Loop through the game board and discover the lowest of Col
        for (let i = 0; i < 42; i++) {
            if (i % 7 === col && moves[Math.floor(i / 7)][col] === 0) lowestOfCol = i
        }
        // Guard against placing on a column that has no space
        if (lowestOfCol == null) return
        // Add the move to the list of occupied circles
        // setMoves(moves.map((v,i) => i === lowestOfCol ? (turn === RED ? 1 : 2) : v))
        let row = Math.floor(lowestOfCol / 7)
        setMoves(moves.map((v,r) => r === row ? v.map((prev,c) => c === col ? (turn === RED ? 1 : 2) : prev) : v))
        // Check which row the move will occupy 
        // Piece translates, there should be a transition property set for this.
        pieceRef.current.style.transform = `translate(-50%, ${600 - (5 - row) * 100}px)`
        // Release highlighting
        handleOut()
        // Remove the ref to the piece so that new mouseEvents do not disrupt placement
        pieceRef.current = null
        // Generate a new piece after a delay, and switch turns
        function afterDelay() {
            setPieces([...pieces, 0])
            setTurn(turn === RED ? BLUE : RED)
        }
        // Check if the game has been won
        if (!checkMove(row, col, turn === RED ? 1 : 2)) setTimeout(afterDelay, 300)
        else setGameOver(true)
    }
    return (
        <div style={{width:'100%', height:'100vh', position:'relative'}}>
            {gameOver ? <h1>THE GAME IS WON! A WINNER IS {turn}!</h1> : null}
        {pieces.map((v,i) =>
            <div 
                key={i}
                className={i % 2 === 0 ? styles.piece : styles.bluePiece} 
                ref={i === pieces.length - 1 ? pieceRef : undefined} 
                style={{position:'absolute'}}/>
        )}
        <div className={styles.board}>
        {
       board.map((v,i) => 
            <div 
                ref={el => {if (el == null) return; holeRef.current.push(el)}}
                key={`r${Math.floor(i / 7)}c${i % 7}}`} 
                className={styles.hole} 
                onMouseOver={(e: MouseEvent)=>handleHover(i%7)}
                onMouseOut={handleOut}
                onClick={(e: MouseEvent) => handlePlacement(i%7)}/>
                )
        }
        </div>
        </div>
    )
}

/* 
    I have two choices in making the game board:
    1. I can use a pseudo element and box shadows
    2. I can use an svg element with a mask

*/
/* 
    <svg viewBox="0 0 100 50" width="100%">
    <defs>
        <mask id="mask" x="0" y="0" width="80" height="30">
        <rect x="5" y="5" width="90" height="40" fill="#fff"/>
        <circle cx="50" cy="25" r="15" />
        </mask>
    </defs>
    <rect x="0" y="0" width="100" height="50" mask="url(#mask)" fill-opacity="0.7"/>    
    </svg> 
*/

/* 
    Test Requests...
    I should test all the explained steps for each function.
*/


/* 
 Transition property for dropping the pieces is a flat 0.3s
 It's not too important, but it would be nice to scale their fall times based on how far they are falling...
*/



// FIXED
/* BUG:
    I'm having issues with the game pieces not resetting fast enough.
    When the new piece appears it appears mid, but right now I need a mouse out and mouse over event to trigger repositioning
    Else, without these events, a click will count that spot as used, but the piece will land over some other position.
*/