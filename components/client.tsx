import { useEffect, useRef, useState } from 'react'
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
      if (side === "BLUE") socket?.emit('startGame', roomID)
      setSide(side)
      setRoom(roomID)
    })
    socket.on('startGame', () => {
      setTurn("RED")
    })
    socket.on('endGame', () => {
      socket?.emit('leaveGame')
      setRoom(null)
      setGameOver(true)
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

  const handleClick = () => {
    if (alias.length == 0  && aliasRef.current?.value) {
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

  const chooseLocal = () => {
    setLocale("LOCAL")
  }
  const chooseOnline = () => {
    setLocale("ONLINE")
    socket?.emit('requestSide')
  }
  const leaveGame = () => {
    socket?.emit('leaveGame', room)
    setGameOver(true)
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
    {/* Components specific to ONLINE play */}
    {locale === "ONLINE" ?
    <>
    <button onClick={leaveGame}>Leave Game</button>
    <button onClick={handleClick}>Submit</button>
    {alias ? <input
      placeholder="Type something"
      value={input}
      onChange={onChangeHandler}
      />
      : null }
    <input
      placeholder="Your name"
      ref={aliasRef}
      />
    {messageObject.map(v => <div key={key++}>{v}</div>)}
    </>
    : null}
    </>: 
    <>
    <button onClick={chooseLocal}>Local</button>
    <button onClick={chooseOnline}>Online</button>
    </>}
    </>
  )
}
/* 
    Messages need to be printed to everybody's screen.
    Pairing that message with the sender's alias would be nice.
*/