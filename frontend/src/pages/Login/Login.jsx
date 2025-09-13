import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Login.css";
import { showToast } from "../../components/ToastContainer";
import AnimatedMonkey from "../../components/AnimatedMonkey/AnimatedMonkey";

const Login = ({ onLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(null);

  const API = import.meta.env.VITE_API_URL;
  // console.log("API: ", API);

  // Handle typing detection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [name, email, password]);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setIsTyping(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (isRegister && !name.trim())) {
      setIsSuccess(false);
      return showToast.error("All fields required");
    }
    
    setIsLoading(true);
    setIsSuccess(null);
    
    try {
      if (isRegister) {
        await axios.post(`${API}/api/auth/register`, { username: name, email, password });
        setIsSuccess(true);
        showToast.success('Registered successfully, now login!');
        setIsRegister(false);
      } else {
        const res = await axios.post(`${API}/api/auth/login`, { email, password });
        setIsSuccess(true);
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("email", email);
        onLogin(res.data.username);
      }
    } catch (err) {
      setIsSuccess(false);
      showToast.error(err.response?.data?.msg || 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <AnimatedMonkey 
        isTyping={isTyping}
        isSuccess={isSuccess}
        isRegister={isRegister}
        isLoading={isLoading}
      />
      <form onSubmit={handleSubmit} className="login-form">
        <h2>{isRegister ? "Register" : "Login"} to Chat</h2>
        {isRegister && (
          <input 
            type="text" 
            placeholder="Name" 
            value={name} 
            onChange={handleInputChange(setName)} 
            required 
          />
        )}
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={handleInputChange(setEmail)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={handleInputChange(setPassword)} 
          required 
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : (isRegister ? "Register" : "Login")}
        </button>
        <button type="button" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Already have account? Login" : "No account? Register"}
        </button>
      </form>
    </div>
  );
};

export default Login;

