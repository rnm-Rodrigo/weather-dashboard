import { motion, AnimatePresence } from 'framer-motion';

export default function AnimatedBackground({ theme, children }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden', color: theme.color }}>
      <AnimatePresence>
        <motion.div
          key={theme.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.background,
            zIndex: -1 // Keeps it behind your content
          }}
        />
      </AnimatePresence>
      
      {/* This renders your app content on top of the background */}
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}