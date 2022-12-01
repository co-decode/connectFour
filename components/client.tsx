import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import styles from "../styles/client.module.css"
import io from 'socket.io-client'

import type { ChangeEvent } from 'react'
import type { Socket } from 'socket.io-client'
import GameBoard from './gameboard'

let socket: undefined | Socket
let key = 0;

export default function Client() {
  const [alias, setAlias] = useState<string>("")
  const aliasRef = useRef<HTMLInputElement | null>(null)
  const [input, setInput] = useState('')
  const [messageObject, setMessageObject] = useState<string[]>([])
  const chatRef = useRef<HTMLDivElement | null>(null)

  const [pieces, setPieces] = useState<number[]>([0])
  const [piecePos, setPiecePos] = useState<number>(3)
  const [moves, setMoves] = useState<number[][]>(
    Array.from({length:6}, (_,i) => 
        Array.from({length: 7}, () => 0))
    )
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [guard, setGuard] = useState<boolean>(false)
  const pieceRef = useRef<null | HTMLDivElement>(null)
      
  const [turn, setTurn] = useState<string>("WAITING")
  const [side, setSide] = useState<string>("UNSET")
  const [locale, setLocale] = useState<string | null>(null)
  const [room, setRoom] = useState<string | null>(null)

  useEffect(() => {
    socketInitializer()
  }, [])

  const socketInitializer = async () => {
    fetch('/api/socket')
    socket = io()

    socket.on('connect', () => {
      console.log('connected')
    })
    socket.on('receiveSide', (side, roomID) => {
      console.log('welcome',side,roomID)
      if (side === "BLUE") {
        socket?.emit('startGame', roomID)
        setTurn("RED")
      }
      setSide(side)
      setRoom(roomID)
    })
    socket.on('startGame', () => {
      setTurn("RED")
    })
    socket.on('endGame', (caller, roomID) => {
      socket?.emit('leaveGame', null, roomID)
      setRoom(null)
      if (caller != null) {
        setTurn(caller === "RED" ? "BLUE" : "RED")
        setGameOver(true)
      }
    })

    socket.on('update-input', (msg:{name:string, text:string}) => { 
      // NOTE: setState here needs its function form to facilitate rerendering within an async function.
      setMessageObject((prev) => [...prev, `${msg.name}: ${msg.text}`])
    })

    socket.on('piecePosUpdate', (col) => {
      setPiecePos((prev) => col)
    })

    socket.on('placeMove', (row) => {
      if (pieceRef == null || pieceRef.current == null) return
      pieceRef.current.style.transform = `translate(-50%, ${600 - (5 - row) * 100}px)`
      pieceRef.current = null
      setGuard(true)
    })
    
    socket.on('updateMovesTurnAndPieces', (row, col, t) => {
      setMoves((moves) => moves.map((v,r) => r === row ? v.map((prev,c) => c === col ? (t === "RED" ? 1 : 2) : prev) : v))
      setPieces((prev) => [...prev, 0])
      setTurn(t === "RED" ? "BLUE" : "RED")
      setGuard(false)
    })
    socket.on('gameOver', () => {
      setGameOver(true)
    })
  }

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const sendOnEnter = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleClick()
  }

  const handleClick = () => {
    if (alias.length == 0) {
      if (!aliasRef.current?.value) return
      setAlias(aliasRef.current.value)
      aliasRef.current.style.display = "none"
      return
    }
    if (socket !== undefined) {
      socket.emit('input-change', {name: alias, text: input}, room)
    }
    setMessageObject([...messageObject, `Me: ${input}`])
    setInput("")
  }

  const toggleChat = () => {
    if (chatRef.current == null) return
    let currentLeft = chatRef.current.style.left 
    chatRef.current.style.left = currentLeft === "100%" ? "73%" : "100%"
  }

  const chooseLocal = () => {
    setLocale("LOCAL")
    setTurn("RED")
  }
  const chooseOnline = () => {
    setLocale("ONLINE")
    socket?.emit('requestSide')
  }
  const leaveGame = () => {
    if (locale === "ONLINE" && turn !== "WAITING" && room !== null){
      let caller = gameOver ? null : side
      socket?.emit('leaveGame', caller, room)
      setRoom(null)
      if (!gameOver){
        setTurn(side === "RED" ? "BLUE" : "RED")
        setGameOver(true)
    }
    } else if (locale === "ONLINE" && (turn === "WAITING" || room === null)) {
      socket?.emit('leaveGame', null, room)
      resetState()
    } else if (locale === "LOCAL") {
      resetState()
    }
  }
  const resetState = () => {
    // setAlias("")
    setInput('')
    setMessageObject([])
    setPieces([0])
    setPiecePos(3)
    setMoves(
      Array.from({length:6}, (_,i) => 
        Array.from({length: 7}, () => 0))
    )
    setGameOver(false)
    setGuard(false)
    setTurn("WAITING")
    setSide("UNSET")
    setLocale(null)
    setRoom(null)
  }
  return (
    <>
    {locale ?
    <>
      <GameBoard 
      pieces={pieces}
      setPieces={setPieces}  
      piecePos={piecePos} 
      setPiecePos={setPiecePos} 
      moves={moves}
      setMoves={setMoves} 
      turn={turn} 
      setTurn={setTurn} 
      gameOver={gameOver} 
      setGameOver={setGameOver}
      guard={guard}
      setGuard={setGuard}
      side={side}
      room={room}
      locale={locale}
      pieceRef={pieceRef}
      socket={socket}
    /> 
    <button 
      className={styles.leaveButton}
      onClick={leaveGame}>{
        turn === "WAITING" ? "Leave Game" : 
        gameOver === false && locale === "ONLINE" ? "Forfeit" :
        room !== null ? "Leave Chat" :
        "Leave Game" }
    </button>
    {/* Components specific to ONLINE play */}
    {locale === "ONLINE" ? <>
    <div ref={chatRef} className={styles.chatContainer}>
    {alias ? <input
      placeholder="Type something"
      value={input}
      onChange={onChangeHandler}
      onKeyDown={sendOnEnter}
      />
      : null }
    <input
      placeholder="Your name"
      ref={aliasRef}
      />
    <button onClick={handleClick}>{
      alias.length === 0 ?
      "Set Name" : "Send"}
    </button>
    <div className={styles.msgContainer}>
    {messageObject.map(v => <div key={key++}>{v}</div>)}
    </div>
    </div>
    <div className={styles.chatToggle} onClick={toggleChat}/>
    </> : null}
    </>: 
    <div className={styles.titleContainer}>
    <h1>Kinect Fore!</h1>
    <div className={styles.localeButtons}>
      <button onClick={chooseLocal}>Play Local</button>
      <button onClick={chooseOnline}>Play Online</button>
    </div>
    </div>}

    </>
  )
}
/* 
    Messages need to be printed to everybody's screen.
    Pairing that message with the sender's alias would be nice.
*/