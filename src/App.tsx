import { Route, Routes } from 'react-router-dom'
import Home from './views/Home'
import NotFoundPage from './views/NotFoundPage'
import Settings from './views/Settings'
import { pdfjs } from 'react-pdf';
import 'react-toastify/dist/ReactToastify.css';
import UpdatePage from './components/update'
import { useEscapeKey } from './hooks/useEscapeKey'
import LayoutLumina from './layout/LayoutLumina'
import LayoutSettings from './layout/LayoutSettings'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function App() {
  useEscapeKey();

  return (
    <>
      <Routes>
        <Route path='/' element={<LayoutLumina />}>
          <Route index element={<Home />} />
        </Route>
        <Route path='/settings' element={<LayoutSettings />}>
          <Route index element={<Settings />} />
          <Route path="update" element={<UpdatePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;