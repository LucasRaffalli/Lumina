import './styles/app.css'
import { Route, Routes } from 'react-router-dom'
import LayoutLumina from './layout/LayoutLumina'
import Home from './views/Home'
import Settings from './views/Settings'
import LayoutSettings from './layout/LayoutSettings'

export default function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<LayoutLumina />}>
          <Route index element={<Home />} />
        </Route>
        <Route path='/settings' element={<LayoutSettings />}>
          <Route index element={<Settings />} />
        </Route>
      </Routes>
    </>
  )
}
