import { Board } from "./ulam/Board";

// The Ulam board is the front door; the owner's home lives at /owner.
export default function Home() {
  return (
    <main id="main" className="wrap wide">
      <Board />
    </main>
  );
}
