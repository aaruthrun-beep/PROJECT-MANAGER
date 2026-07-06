export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
      style={{
        backgroundImage: 'radial-gradient(circle at 30% 20%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 70% 80%, #d97706 0%, transparent 50%)',
      }}
    />
  )
}
