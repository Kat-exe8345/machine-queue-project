function getLogKind(logLine) {
  const match = logLine.match(/^\[(.*?)\]/)
  return match ? match[1] : 'info'
}

function LogsPanel({ logs }) {
  return (
    <section className="card logs-card">
      <div className="card-title-row">
        <h2>Execution Logs</h2>
        <span className="badge">{logs.length} lines</span>
      </div>

      {logs.length === 0 ? (
        <p className="empty-state">Logs will appear here after inserts, swaps, and extraction.</p>
      ) : (
        <ol className="logs-list">
          {logs.map((log, index) => (
            <li key={`${log}-${index}`} className={`log-line log-${getLogKind(log)}`}>
              <span className="log-index">{index + 1}</span>
              <span className="log-text">{log.replace(/^\[.*?\]\s*/, '')}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default LogsPanel