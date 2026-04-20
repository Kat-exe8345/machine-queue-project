function getHeapLevels(heap) {
  const levels = []
  let start = 0
  let nodesAtLevel = 1

  while (start < heap.length) {
    levels.push(heap.slice(start, start + nodesAtLevel))
    start += nodesAtLevel
    nodesAtLevel *= 2
  }

  return levels
}

function HeapView({ heap, activeIndices }) {
  const levels = getHeapLevels(heap)
  const root = heap[0]

  return (
    <section className="card heap-card">
      <div className="card-title-row">
        <h2>Heap View</h2>
        <span className="badge">Array + tree</span>
      </div>

      <div className="heap-summary">
        <div>
          <span>Root</span>
          <strong>{root ? root.name : 'Empty'}</strong>
        </div>
        <div>
          <span>Nodes</span>
          <strong>{heap.length}</strong>
        </div>
      </div>

      <div className="heap-tree" aria-label="Heap tree visualization">
        {levels.length === 0 ? (
          <p className="empty-state">The heap is empty. Add machines to see the tree structure.</p>
        ) : (
          levels.map((level, levelIndex) => (
            <div className="tree-level" key={`level-${levelIndex}`}>
              {level.map((machine) => {
                const index = heap.indexOf(machine)
                const isActive = activeIndices.includes(index)

                return (
                  <div className={`tree-node ${isActive ? 'tree-node-active' : ''}`} key={machine.id}>
                    <strong>{machine.name}</strong>
                    <span>C{machine.criticality}</span>
                    <span>{machine.powerRequired}</span>
                    <small>#{index}</small>
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      <div className="heap-array">
        <div className="heap-array-head">
          <span>Array index</span>
          <span>Priority order</span>
        </div>

        <ul>
          {heap.map((machine, index) => (
            <li key={machine.id} className={activeIndices.includes(index) ? 'active-array-item' : ''}>
              <span>{index}</span>
              <span>{machine.name}</span>
              <span>Crit {machine.criticality}</span>
              <span>{machine.powerRequired} power</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default HeapView