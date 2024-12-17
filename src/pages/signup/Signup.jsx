import { useState } from "react";
import "./signup.scss";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase";  // Correct path to firebase.js

const Signup = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      // Create user with Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);

      // Navigate to the login page after successful signup
      navigate("/login");
    } catch (error) {
      // Handle specific Firebase errors
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("This email is already in use. Try logging in instead.");
          break;
        case "auth/invalid-email":
          setError("The email address is invalid. Please check and try again.");
          break;
        case "auth/weak-password":
          setError("The password is too weak. Please use at least 6 characters.");
          break;
        default:
          setError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Create an account</h1>
          <input
            name="email"
            required
            type="email"
            placeholder="Email"
          />
          <input
            name="password"
            required
            type="password"
            minLength={6}
            placeholder="Password"
          />
          <button disabled={isLoading}>{isLoading ? "Signing up..." : "Signup"}</button>
          {error && <span className="error">{error}</span>}
          <Link to="/login">Already have an account? Login</Link>
        </form>
      </div>
    </div>
  );
};

export default Signup;
