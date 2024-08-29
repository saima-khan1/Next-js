import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import HomePage from "./homepage/page";

export default function Home() {
  return (
    <main>
      {/* <h1>Hello world</h1>
      <Link href="users">Users </Link>
      <Link href="register">Register </Link> */}
      <HomePage />
    </main>
  );
}
