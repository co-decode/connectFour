import { NextApiRequest, NextApiResponse } from 'next'
import {Server} from 'socket.io'
import type { Server as HTTPServer } from 'http'
import type { Socket as NetSocket } from 'net'
import type { Server as IOServer } from 'socket.io'

/* I was fortunate enough to find this here: 
  https://stackoverflow.com/questions/74023393/working-with-typescript-next-js-and-socket-io 
  
  I don't think I would have ever come up with this... I don't actually understand the http library and I'd never heard of the net library.

  But... I could have done better to understand that the NextApiResponse type from the next import was throwing the error on the res dot chain.
  socket now exists on the res object (NextApiResponseWithSocket)
  server now exists on the res.socket object (SocketWithIO, from 'net' library)
  io now exists on the res.socket.server object (SocketServer, from 'http' library) 
      'io' is just a Server from the http... which jives with what I did in the express-ts example
      http.createServer(express())
      This is just pointing to the fact that we want a TYPE for an http server that we arbitrarily call io, so that ts is happy.
      And this is true when instantiated, because here the io Server is actually a call to the socket.io Server class.

*/

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

interface roomObject {
  [roomName:string]: number;
}

let roomCounter = 0
let roomList: roomObject = {} 

const SocketHandler = (_: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Socket is already running.')
  } else {
    console.log('Socket is initializing...')

    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', (socket) => {
      socket.on('disconnecting', ()=> {
        socket.rooms.forEach(val => {
          if (!val.includes("room",0)) return
          if (roomList[val] != undefined) delete roomList[val]
          socket.to(val).emit('endGame', "FORCED", val)
        })
      })
      socket.on('requestSide', () => {
        if (roomList[`room${roomCounter}`] == undefined) {
          roomList[`room${roomCounter}`] = 1
          socket.join(`room${roomCounter}`)
          socket.emit('receiveSide', "RED", `room${roomCounter}`)
        } else {
          socket.join(`room${roomCounter}`)
          socket.emit('receiveSide', "BLUE", `room${roomCounter++}`)
        }
      })
      socket.on('startGame', (roomID) => {
        socket.to(roomID).emit('startGame')
      })
      socket.on('leaveGame', (caller, roomID) => {
        socket.to(roomID).emit('endGame', caller, roomID)
        socket.leave(roomID)
        if (roomList[roomID] != undefined) delete roomList[roomID]
      })

      socket.on('input-change', (msg, roomID) => {
        socket.to(roomID).emit('update-input', msg)
      })
      socket.on('piecePosChange', (col, roomID) => {
        socket.to(roomID).emit('piecePosUpdate', col)
      })
      socket.on('placeMove', (row, roomID) => {
        socket.to(roomID).emit('placeMove', row)
      })
      socket.on('changeMovesTurnAndPieces', (row, col, turn, tie, roomID) => {
        socket.to(roomID).emit('updateMovesTurnAndPieces', row, col, turn, tie)
      })
      socket.on('gameOver', (roomID) => {
        socket.to(roomID).emit('gameOver')
      })
    })
  }

  res.end()
}

export default SocketHandler
