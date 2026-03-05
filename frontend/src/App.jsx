import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Test API connection
    fetch('/api')
      .then(res => res.json())
      .then(data => {
        setMessage(data.message || 'Connected to backend!')
        setLoading(false)
      })
      .catch(err => {
        setMessage('Backend not connected')
        setLoading(false)
      })
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>MERN Stack App</h1>
        <p>{loading ? 'Loading...' : message}</p>
      </header>
    </div>
  )
}

export default App
