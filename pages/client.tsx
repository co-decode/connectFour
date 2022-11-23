import { useEffect, useState } from 'react'
import io from 'socket.io-client'

import type { ChangeEvent } from 'react'
import type { Socket } from 'socket.io-client'

let socket: undefined | Socket

export default function Client() {
  const [input, setInput] = useState('')
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
      setInput(msg)
    })
  }

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)

    if (socket !== undefined) {
      socket.emit('input-change', e.target.value)
    }
  }

  return (
    <input
      placeholder="Type something"
      value={input}
      onChange={onChangeHandler}
    />
  )
}
/* 
    I need to add a submit function, and I suppose that the messages need to be stored somewhere... I might have to look at what happened in the express examples.

    Messages need to be printed to everybody's screen.
    Pairing that message with the sender's alias would be nice.

*/