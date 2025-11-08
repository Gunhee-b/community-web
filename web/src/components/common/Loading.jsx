function Loading({ size = 'md', fullScreen = false }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const spinner = (
    <div
      className={`${sizes[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
    ></div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {spinner}
      </div>
    )
  }

  return <div className="flex justify-center items-center py-8">{spinner}</div>
}

export default Loading
