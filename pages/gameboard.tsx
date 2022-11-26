import { MouseEvent, useEffect, useRef, useState } from 'react'
import styles from '../styles/gameboard.module.css'
interface Position {
    row: number,
    col: number
}

const board =  Array.from({length: 42}, _ => 0)

/* What needs to happen next? */
/* 
 - Fix piece spawn in bug
 - Determine when the game is won.
 - Then work on socket integration.
*/
export default function GameBoard() {
    const [pieces, setPieces] = useState<number[]>([0])
    const [piecePos, setPiecePos] = useState<number>(3)
    const [moves, setMoves] = useState<number[]>([])
    const pieceRef = useRef<null | HTMLDivElement>(null)
    const holeRef = useRef<HTMLDivElement[]>([])
    
    
    useEffect(() => {
        // New pieces are spawned in the center of the board. 
        // FIX THIS: It should spawn over the player's mouse hover, and if not hovering the board , then spawn central.
        // The piece is central because of its css
        if (pieceRef.current == null ) return
        // As hover events set piecePos, the piece's offset moves it to the column over which the mouse hovers.
        // If the mouse exits the board, the piece stays at where the mouse last hovers.
        let offset = piecePos - 3
        pieceRef.current.style.left = `calc(50% + ${offset * 100}px)`
    },[piecePos])

    const handleHover = (col: number) => {
        setPiecePos(col)
        let lowestOfCol: number | null = null;
        // No hole should be yellow if no space if available
        for (let i = 0; i < 42; i++) {
            // Ensure that the lowest unoccupied space in column is selected
            if (i % 7 === col && !moves.includes(i)) lowestOfCol = i 
        }
        // Guard against null case
        if (lowestOfCol == null) return
        // Turn hole yellow
        holeRef.current[lowestOfCol].style.backgroundColor = "yellow"
    }
    const handleOut = () => {
        for (let i = 0; i < 42; i++) {
            holeRef.current[i].style.backgroundColor = "transparent"
        }
        // All backgroundColors are cleared, but the hover event fire AFTER this event, ensuring there should always be an open space in yellow so long as the board is being hovered.
    }
    const handlePlacement = (col:number) => {
        if (pieceRef.current === null) return
        let lowestOfCol:number | null = null;
        // Loop through the game board and discover the lowest of Col
        for (let i = 0; i < 42; i++) {
            if (i % 7 === col && !moves.includes(i)) lowestOfCol = i
        }
        // Guard against placing on a column that has no space
        if (lowestOfCol == null) return
        // Add the move to the list of occupied circles
        setMoves([...moves, lowestOfCol])
        // Check which row the move will occupy 
        let row = Math.floor(lowestOfCol / 7)
        // Piece translates, there should be a transition property set for this.
        pieceRef.current.style.transform = `translate(-50%, ${600 - (5 - row) * 100}px)`
        // Generate a new piece.
        pieces.push(0)
    }
    return (
        <div style={{width:'100%', height:'100vh', position:'relative'}}>
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
/* BUG:
    I'm having issues with the game pieces not resetting fast enough.
    When the new piece appears it appears mid, but right now I need a mouse out and mouse over event to trigger repositioning
    Else, without these events, a click will count that spot as used, but the piece will land over some other position.
*/