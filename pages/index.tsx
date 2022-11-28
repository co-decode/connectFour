import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Client from '../components/client'

export default function Home() {
  return (
    <div className={styles.container}>
      <Client />
    </div>
  )
}
