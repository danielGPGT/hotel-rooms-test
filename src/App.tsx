import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import Hotels from './pages/Hotels'
import Contracts from './pages/Contracts'
import Tours from './pages/Tours'
import Inventory from './pages/Inventory'
import Rates from './pages/Rates'
import PricingSandbox from './pages/PricingSandbox'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/hotels" replace />} />
        <Route path="hotels" element={<Hotels />} />
        <Route path="contracts" element={<Contracts />} />
        <Route path="tours" element={<Tours />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="rates" element={<Rates />} />
        <Route path="pricing" element={<PricingSandbox />} />
      </Route>
    </Routes>
  )
}

export default App
