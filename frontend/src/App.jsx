import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn";
import "../style.css";
import CompleteSignup from "./pages/complete-sign-up";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/complete-sign-up" element={<CompleteSignup />} />
      </Routes>
    </Router>
  );
}

export default App;
