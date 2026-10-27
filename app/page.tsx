import { Board } from "./ulam/Board";
import { OwnerGoesHome } from "./RoleSwitch";

// The Ulam board is the front door for customers; a phone in owner mode goes to the owner's Home at /owner.
export default function Home() {
  return (
    <main id="main" className="wrap wide">
      <OwnerGoesHome />
      <Board />
    </main>
  );
}
