function Controls({
  totalPower,
  selectedMachines,
  remainingPower,
  onTotalPowerChange,
  onRunSimulation,
  onLoadSample,
  onClearAll,
}) {
  return (
    <section className="card controls-card">
      <div className="card-title-row">
        <h2>Simulation Controls</h2>
        <span className="badge">Heap scheduler</span>
      </div>

      <div className="controls-grid">
        <label>
          <span>Total Power</span>
          <input
            type="number"
            min="0"
            step="1"
            value={totalPower}
            onChange={(event) => onTotalPowerChange(Number(event.target.value))}
            placeholder="70"
          />
        </label>

        <div className="button-row">
          <button className="primary-button" type="button" onClick={onRunSimulation}>
            Run Simulation
          </button>
          <button className="secondary-button" type="button" onClick={onClearAll}>
            Clear All
          </button>
        </div>
      </div>

      <div className="sample-panel">
        <div className="sample-copy">
          <strong>Demo cases</strong>
          <p>Use the preset inputs to validate the tie-break rule and the power budget.</p>
        </div>

        <div className="button-row button-row-wrap">
          <button className="ghost-button" type="button" onClick={() => onLoadSample('case1')}>
            Load Sample 1
          </button>
          <button className="ghost-button" type="button" onClick={() => onLoadSample('case2')}>
            Load Sample 2
          </button>
        </div>
      </div>

      <div className="results-strip">
        <div>
          <span>Selected</span>
          <strong>{selectedMachines.length}</strong>
        </div>
        <div>
          <span>Remaining Power</span>
          <strong>{remainingPower}</strong>
        </div>
      </div>
    </section>
  )
}

export default Controls