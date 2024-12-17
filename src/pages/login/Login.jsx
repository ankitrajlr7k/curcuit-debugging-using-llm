import { useContext, useState } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase auth function
import { auth } from "../../../firebase"; // Import auth instance from firebase.js

const Login = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { updateUser } = useContext(AuthContext); // Use context to update user data
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
      // Sign in with Firebase using email and password
      const res = await signInWithEmailAndPassword(auth, username, password);

      // Update the user in the context with the Firebase user data
      updateUser(res.user);

      // Redirect to home page after successful login
      navigate("/");
    } catch (error) {
      setError(error.message); // Show Firebase error message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <input
            name="username"
            required
            minLength={3}
            maxLength={25}
            type="email" // Updated to email since Firebase uses email for login
            placeholder="Email"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
          />
          <button disabled={isLoading}>Login</button>
          {error && <span>{error}</span>}
          <Link to="/register">{"Don't"} you have an account?</Link>
        </form>
      </div>

    </div>
  );
};

export default Login;
