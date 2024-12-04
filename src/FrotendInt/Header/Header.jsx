import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";

const Header = ({ onSignOut }) => {
  const handleSignOut = () => {
    signOut(auth).then(onSignOut);
  };

  return (
    <header>
      <button onClick={handleSignOut}>Sign Out</button>
    </header>
  );
};

export default Header;
