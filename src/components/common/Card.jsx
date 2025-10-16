function Card({ children, className = '', onClick, hoverable = false }) {
  const hoverStyle = hoverable ? 'hover:shadow-lg cursor-pointer transition-shadow' : ''

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 ${hoverStyle} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Card
