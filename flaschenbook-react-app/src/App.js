import React, { useState, useEffect } from "react";
import AppContext from "./context";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import Survey from "./components/Survey";
import MyPage from "./components/MyPage";
import Detail from "./components/BookDetail";
import "font-awesome/css/font-awesome.min.css";
import MainLogo from "./components/MainLogo";
import Footer from "./components/Footer";

function App() {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const sessionInfo = localStorage.getItem("sessionInfo");
      setIsLogged(
        sessionInfo &&
          sessionInfo !== "undefined" &&
          sessionInfo !== "null" &&
          JSON.parse(sessionInfo)
          ? true
          : false
      );
    };

    window.addEventListener("storage", checkSession);

    return () => {
      window.removeEventListener("storage", checkSession);
    };
  }, []);

  useEffect(() => {
    const sessionInfo = localStorage.getItem("sessionInfo");
    setIsLogged(
      sessionInfo &&
        sessionInfo !== "undefined" &&
        sessionInfo !== "null" &&
        JSON.parse(sessionInfo)
        ? true
        : false
    );
  }, []);

  return (
    <AppContext.Provider value={{ setIsLogged, isLogged }}>
      <Router>
        <div>
          <MainLogo />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/register"
              element={isLogged ? <Navigate to="/" /> : <Register />}
            />
            <Route
              path="/login"
              element={isLogged ? <Navigate to="/" /> : <Login />}
            />
            <Route path="/survey" element={<Survey />} />
            <Route
              path="/my-page"
              element={isLogged ? <MyPage /> : <Navigate to="/login" />}
            />
             <Route path="/detail/:isbn" element={<Detail />} /> 
          </Routes>
          <Footer />
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
