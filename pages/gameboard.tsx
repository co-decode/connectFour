import styles from '../styles/gameboard.module.css'

export default function GameBoard() {
    return (
        <>
        {<div className={styles.board}>
        
           
        </div>}
        </>
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