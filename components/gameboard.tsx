import { Dispatch, MouseEvent, MutableRefObject, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import styles from '../styles/gameboard.module.css'

interface Props {
    pieces: number[], 
    setPieces: Dispatch<SetStateAction<number[]>>,
    piecePos:number,
    setPiecePos: Dispatch<SetStateAction<number>>,
    moves:number[][],
    setMoves: Dispatch<SetStateAction<number[][]>>,
    turn: string,
    setTurn: Dispatch<SetStateAction<string>>,
    gameOver: boolean,
    setGameOver:Dispatch<SetStateAction<boolean>>,
    guard:boolean,
    setGuard:Dispatch<SetStateAction<boolean>>,
    side:string,
    room:string | null,
    locale:string,
    pieceRef: MutableRefObject<HTMLDivElement | null>,
    socket: Socket | undefined
}

const [RED, BLUE] = ['RED', 'BLUE']
const board =  Array.from({length: 42}, _ => 0)


/* What needs to happen next? */
/* 
- DONE Fix piece spawn in bug
- DONE Determine when the game is won.
- DONE Fix Spawn in issues with multiple bad highlights
- DONE Painting is still occuring immediately on other player's screen, it also obscures the winning players screen... maybe share guard state?
- Then work on socket integration.
    - DONE Game moves are shared
    - DONE I need to share the gameover message.
    - DONE I need to build a lobby which pairs only two players together. Perhaps I can admit spectators. Look up socket rooms.
    - DONE I must stop RED from moving when no BLUE player has joined, else game states become unsynced.
    - DONE Clean up chat position
    - DONE There should be a local game mode and a remote game mode, remote only permits the player to move on the assigned turn
    - DONE Local: No chat for local.
    - DONE Online: Make players commit to alias before joining game chat
    - DONE Release room when a game is over and players have left
    - DONE Allow players to leave before game is over??? ie to surrender.
    - DONE Ensure that a room is dropped if a player joins and leaves before another player enters.
    - DONE Players need to be able to go back to the locale choice when a game ends
    - DONE I should indicate what side a player has been allocated
    - DONE I should inidicate when a player is waiting for another player to join
    - DONE Leave Game button should say Forfeit, Leave Chat, Leave Game.
    - Alias Entry button should say Choose name or something, then chat entry can say submit
    - Local game mode should not display turn and side information.
    - turn and side information for online play should not display if turn is WAITING or if side is UNSET
    - Game size... change for screen size? And other basic formatting. Font is colliding and being obscured by gameboard

*/
export default function GameBoard({
    pieces, 
    setPieces, 
    piecePos, 
    setPiecePos, 
    moves, 
    setMoves, 
    turn, 
    setTurn, 
    gameOver,
    setGameOver,
    guard,
    setGuard,
    side,
    room,
    locale,
    pieceRef,
    socket
}: Props) {
    const holeRef = useRef<HTMLDivElement[]>([])

    useEffect(() => {
        // New pieces are spawned in the center of the board. 
        if (pieceRef.current == null ) return
        // As hover events set piecePos, the piece's offset moves it to the column over which the mouse hovers.
        // If the mouse exits the board, the piece stays at where the mouse last hovers.
        let offset = piecePos - 3
        if (pieceRef.current.style.display !== "block") pieceRef.current.style.display = "block"
        pieceRef.current.style.left = `calc(50% + ${offset * 100}px)`

    },[piecePos,pieces,pieceRef])

    useEffect(() => {
        // Disable pointer on game board when the game is over
        if (gameOver) {
            holeRef.current.forEach(hole => hole.style.cursor = "default")
        }
    }, [gameOver])

    useEffect(() => {
        // Only when a piece is added does a new paint occur, such that even without a mouseevent causing a repaint, a yellow circle will appear in the column where the cursor is hovering.
        // Ensure paint does not occur after the winning move.
        
        if (!gameOver && !guard) {
            let lowestOfCol: number | null = null;
            // No hole should be yellow if no space if available
            for (let i = 0; i < 42; i++) {
                // Ensure that the lowest unoccupied space in column is selected
                if (i % 7 === piecePos && moves[Math.floor(i / 7)][piecePos] === 0) lowestOfCol = i
                // Clear all previous highlights 
                holeRef.current[i].style.backgroundColor = "transparent"
            }
            // Guard against null case
            if (lowestOfCol == null) return
            // Paint hole yellow
            holeRef.current[lowestOfCol].style.backgroundColor = "yellow"
        } else if (guard) {
            handleOut()
        }
    },[pieces, gameOver, piecePos, moves, guard])

    const handleHover = (col: number) => {
        // Do not highlight if the game has been won
        // Block interaction from other players
        if (gameOver || (side !== turn && locale === "ONLINE")) return
        // Change piecePos and paint lowest on mouseOver event
        setPiecePos(col)
        socket?.emit('piecePosChange', col, room)
    }
    const handleOut = () => {
        for (let i = 0; i < 42; i++) {
            holeRef.current[i].style.backgroundColor = "transparent"
        }
        // All backgroundColors are cleared, but the hover event fires AFTER this event, ensuring there should always be an open space in yellow so long as the board is being hovered.
    }
    function checkMove(r:number, c:number, t:number): boolean {
        // Check count for vertical, horizontal, incline diagonal and decline diagonal
        let count = 1
        let i = 1
        // HORIZONTAL:
        while (moves[r][c + i++] === t) count++
        i = 1
        while (moves[r][c - i++] === t) count++
        if (count >= 4) return true
        i = 1
        count = 1
        // VERTICAL:
        while (r + i < 6 && moves[r + i++][c] === t) count++
        if (count === 4) return true
        i = 1
        count = 1
        // INCLINE DIAG:
        while (r + i < 6 && moves[r + i][c + i++] === t) count++
        i = 1
        while (r - i >= 0 && moves[r - i][c - i++] === t) count++
        if (count >= 4) return true
        i = 1
        count = 1
        // DECLINE DIAG:
        while (r - i >= 0 && moves[r - i][c + i++] === t) count++
        i = 1
        while (r + i < 6 && moves[r + i][c - i++] === t) count++
        if (count >= 4) return true
        i = 1
        count = 1

        return false
    }
    const handlePlacement = (col:number) => {
        if (pieceRef.current === null || (side !== turn && locale === "ONLINE")) return
        let lowestOfCol:number | null = null;
        // Loop through the game board and discover the lowest of Col
        for (let i = 0; i < 42; i++) {
            if (i % 7 === col && moves[Math.floor(i / 7)][col] === 0) lowestOfCol = i
        }
        // Guard against placing on a column that has no space
        if (lowestOfCol == null) return
        // Check which row the move will occupy 
        let row = Math.floor(lowestOfCol / 7)
        socket?.emit('placeMove', row, room)
        // Piece translates, there should be a transition property set for this.
        pieceRef.current.style.transform = `translate(-50%, ${600 - (5 - row) * 100}px)`
        // Release highlighting
        handleOut()
        // Remove the ref to the piece so that new mouseEvents do not disrupt placement
        pieceRef.current = null
        setGuard(true)
        function afterDelay() {
            // Add the move to the list of occupied circles
            socket?.emit('changeMovesTurnAndPieces', row, col, turn, room)
            setMoves(moves.map((v,r) => r === row ? v.map((prev,c) => c === col ? (turn === RED ? 1 : 2) : prev) : v))
            // Generate a new piece after a delay, and switch turns
            setPieces([...pieces, 0])
            setTurn(turn === RED ? BLUE : RED)
            setGuard(false)
        }
        // Check if the game has been won
        if (!checkMove(row, col, turn === RED ? 1 : 2)) setTimeout(afterDelay, 300)
        else {
            socket?.emit('gameOver', room)
            setGameOver(true)}
    }
    return (
        <div style={{width:'100%', height:'80vh', position:'relative'}}>
            <h3>You are {side}</h3>
            {turn === "WAITING" ?
            <h3>Waiting for an opponent...</h3> :
            <h3>It is {turn}&apos;s turn</h3> }
            {gameOver ? <h1>THE GAME IS WON! {turn} WINS!</h1> : null}
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