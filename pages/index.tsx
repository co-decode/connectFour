import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Client from './client'
import GameBoard from './gameboard'

export default function Home() {
  return (
    <div className={styles.container}>
      <Client />
      {/* <GameBoard /> */}
    </div>
  )
}
