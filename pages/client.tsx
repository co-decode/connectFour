import { useEffect, useState } from 'react'
import io from 'socket.io-client'

import type { ChangeEvent } from 'react'
import type { Socket } from 'socket.io-client'
import GameBoard from './gameboard'

let socket: undefined | Socket
let key = 0;

export default function Client() {
  const [alias, setAlias] = useState('')
  const [input, setInput] = useState('')
  const [messageObject, setMessageObject] = useState<string[]>([])
  const [pieces, setPieces] = useState<number[]>([0])
    const [piecePos, setPiecePos] = useState<number>(3)
    const [moves, setMoves] = useState<number[][]>(
        Array.from({length:6}, (_,i) => 
            Array.from({length: 7}, () => 0))
        )
    const [turn, setTurn] = useState<string>("RED")
    const [gameOver, setGameOver] = useState<boolean>(false)

  useEffect(() => {
    socketInitializer()
  }, [])

  const socketInitializer = async () => {
    fetch('/api/socket')
    socket = io()

    socket.on('connect', () => {
      console.log('connected')
    })

    socket.on('update-input', (msg) => { 
      // NOTE: setState here needs its function form to facilitate rerendering within an async function.
      setMessageObject((prev) => [...prev, `${msg.name}: ${msg.text}`])
    })

    socket.on('piecePosUpdate', (col) => {
      setPiecePos((prev) => col)
    })
  }

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleClick = () => {
    if (socket !== undefined) {
      socket.emit('input-change', {name: alias, text: input})
    }
    setInput("")
  }

  const aliasChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAlias(e.target.value)
  }

  return (
    <>
    {messageObject.map(v => <div key={key++}>{v}</div>)}
    <button onClick={handleClick}>submit</button>
    <input
      placeholder="Type something"
      value={input}
      onChange={onChangeHandler}
    />
    <input
      placeholder="Your name"
      onChange={aliasChange}
    />
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
      socket={socket}
    />
    </>
  )
}
/* 
    Messages need to be printed to everybody's screen.
    Pairing that message with the sender's alias would be nice.
*/