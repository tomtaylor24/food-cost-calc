const LoadingBlock = () => {
  return (
    <div className="loadingBlock" role="status">
      <span className="loadingSpinner" aria-hidden="true" />
      <span className="srOnly">読み込み中</span>
    </div>
  )
}

export default LoadingBlock
