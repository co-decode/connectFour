import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Client from '../components/client'

export default function Home() {
  return (
  <>
    <Head>
      <title>Kinect Fore</title>
    </Head>
    <div className={styles.container}>
      <Client />
    </div>
  </>
  )
}
