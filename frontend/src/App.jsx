import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import SignIn from "./pages/SignIn"
import '../style.css'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/sign-in" element={<SignIn/>} />
      </Routes>
    </Router>
  )
}

export default App