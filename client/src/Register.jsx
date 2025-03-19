import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  const BASE_URL = "http://localhost:4000";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [serverError, setServerError] = useState("");
  const [clientError, setClientError] = useState(""); // Local validation error
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // ✅ Email validation regex
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      setClientError(""); // Clear client-side error when typing
      setServerError(""); // Clear server error too
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSuccess(false);

    // ✅ Client-side email validation before sending request
    if (!isValidEmail(formData.email)) {
      setClientError("Invalid email format");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/user/register`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) {
        setServerError(data.error || "Registration failed.");
      } else {
        setIsSuccess(true);
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container">
      <h2 className="heading">Register</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="label">Name</label>
          <input
            className="input"
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
            minLength={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="label">Email</label>
          <input
            className={`input ${clientError || serverError ? "input-error" : ""}`}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
          {clientError && <span className="error-msg">{clientError}</span>}
          {serverError && !clientError && <span className="error-msg">{serverError}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="label">Password</label>
          <input
            className="input"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            minLength={8}
          />
        </div>

        <button type="submit" className={`submit-button ${isSuccess ? "success" : ""}`}>
          {isSuccess ? "Registration Successful" : "Register"}
        </button>
      </form>

      <p className="link-text">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
