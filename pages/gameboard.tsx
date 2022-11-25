import { MouseEvent, useEffect, useRef, useState } from 'react'
import styles from '../styles/gameboard.module.css'
interface Position {
    row: number,
    col: number
}

const board =  Array.from({length: 42}, _ => 0)

export default function GameBoard() {
    const [piecePos, setPiecePos] = useState<number>(3)
    const pieceRef = useRef<null | HTMLDivElement>(null)
    const holeRef = useRef<HTMLDivElement[]>([])

    useEffect(() => {
        if (pieceRef.current == null ) return
        let offset = piecePos - 3
        pieceRef.current.style.left = `calc(50% + ${offset * 100}px)`
    },[piecePos])

    const handleHover = (col: number) => {
        setPiecePos(col)
        for (let i = 0; i < 41; i++) {
            if (i % 7 === col) holeRef.current[i].style.backgroundColor = "yellow"
        }
    }
    return (
        <div style={{width:'100%', height:'100vh', position:'relative'}}>
        <div className={styles.piece} ref={pieceRef} style={{position:'absolute'}}/>
        <div className={styles.board}>
        {
       board.map((v,i) => 
            <div 
                ref={el => {if (el == null) return; holeRef.current.push(el)}}
                key={`r${Math.floor(i / 7)}c${i % 7}}`} 
                className={styles.hole} 
                onMouseOver={(e: MouseEvent)=>handleHover(i%7)}/>)
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