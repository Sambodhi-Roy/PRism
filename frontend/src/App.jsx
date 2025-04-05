import { Route, Routes } from "react-router-dom"
import Main from "./pages/Main"


function App() {

  return (
    <div className="w-full h-screen bg-neutral">
      <Routes>
        <Route path="/main" element={<Main/>}/>
      </Routes>
      <Main/>
    </div>
  )
}

export default App
