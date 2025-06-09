import { useState } from 'react'
import EraShape from './EraShape'
import EraContent from './contents/EraContent'
import ElectronContent from './contents/ElectronContent'
import ReactContent from './contents/ReactContent'
import ViteContent from './contents/ViteContent'
import TypescriptContent from './contents/TypescriptContent'
import TailwindContent from './contents/TailwindContent'
import { motion, AnimatePresence } from 'framer-motion'
import './styles.css'

export default function WelcomeKit() {
  const [activePath, setActivePath] = useState<number>(5)

  const handlePathHover = (index: number) => {
    setActivePath(index)
  }

  const handlePathReset = () => {
    setActivePath(5)
  }

  const content = () => {
    switch (activePath) {
      case 0:
        return <ElectronContent />
      case 1:
        return <ReactContent />
      case 2:
        return <ViteContent />
      case 3:
        return <TypescriptContent />
      case 4:
        return <TailwindContent />
      case 5:
        return <EraContent />
      default:
        return <EraContent />
    }
  }

  return (
    <div className="welcome-content">
      <AnimatePresence mode="wait">
        <motion.div
          key={'content-' + activePath}
          style={{ zIndex: 2, flex: 1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}
        >
          {content()}
        </motion.div>
      </AnimatePresence>
      <EraShape onPathHover={handlePathHover} onPathReset={handlePathReset} />
    </div>
  )
}
