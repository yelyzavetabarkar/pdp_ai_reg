import { useState } from 'react'
import { Button } from '@/components/ui/button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">React + Vite + shadcn/ui</h1>
      <div className="flex gap-4">
        <Button onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
      <p className="text-muted-foreground">
        Edit <code className="bg-muted px-2 py-1 rounded">src/App.jsx</code> and save to test HMR
      </p>
    </div>
  )
}

export default App
