import { useState } from 'react'
import AppRoutes from './routes'
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
    </>
  )
}

export default App
