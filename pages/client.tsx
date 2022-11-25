import { ChangeEventHandler, useEffect, useState } from 'react'
import io from 'socket.io-client'

import type { ChangeEvent } from 'react'
import type { Socket } from 'socket.io-client'

let socket: undefined | Socket
let key = 0;

export default function Client() {
  const [alias, setAlias] = useState('')
  const [input, setInput] = useState('')
  const [messageObject, setMessageObject] = useState<string[]>([])
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
    </>
  )
}
/* 
    Messages need to be printed to everybody's screen.
    Pairing that message with the sender's alias would be nice.
*/