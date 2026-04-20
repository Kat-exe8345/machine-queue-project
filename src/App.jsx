import { useEffect, useMemo, useRef, useState } from 'react'
import Machine from './logic/Machine.js'
import MinHeap from './logic/MinHeap.js'
import { runSimulation } from './utils/heapHelpers.js'

const SAMPLE_CASES = {
  normal: {
    label: 'Normal Selection',
    totalPower: 70,
    machines: [
      { name: 'Machine A', criticality: 1, powerRequired: 50 },
      { name: 'Machine B', criticality: 2, powerRequired: 30 },
      { name: 'Machine C', criticality: 1, powerRequired: 20 },
    ],
  },
  limited: {
    label: 'Limited Power',
    totalPower: 45,
    machines: [
      { name: 'Machine D', criticality: 1, powerRequired: 25 },
      { name: 'Machine E', criticality: 2, powerRequired: 30 },
      { name: 'Machine F', criticality: 3, powerRequired: 20 },
    ],
  },
  tied: {
    label: 'Equal Criticality',
    totalPower: 60,
    machines: [
      { name: 'Machine G', criticality: 2, powerRequired: 40 },
      { name: 'Machine H', criticality: 2, powerRequired: 15 },
      { name: 'Machine I', criticality: 2, powerRequired: 20 },
    ],
  },
}

const initialMachineForm = {
  name: '',
  criticality: '',
  powerRequired: '',
}

function createMachineId() {
  return globalThis.crypto?.randomUUID?.() ?? `machine-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createMachine(input) {
  return new Machine(
    createMachineId(),
    input.name.trim(),
    Number(input.criticality),
    Number(input.powerRequired),
  )
}

function createSampleMachines(sampleKey) {
  return SAMPLE_CASES[sampleKey].machines.map(createMachine)
}

export default function App() {
  const resultsRef = useRef(null)
  const [mode, setMode] = useState(null)
  const [sampleKey, setSampleKey] = useState('normal')
  const [sampleMachines, setSampleMachines] = useState([])
  const [customMachines, setCustomMachines] = useState([])
  const [machineForm, setMachineForm] = useState(initialMachineForm)
  const [totalPower, setTotalPower] = useState(0)
  const [selectedMachines, setSelectedMachines] = useState([])
  const [remainingPower, setRemainingPower] = useState(0)
  const [steps, setSteps] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const activeMachines = mode === 'sample' ? sampleMachines : customMachines

  const summary = useMemo(
    () => ({
      machineCount: activeMachines.length,
      selectedCount: selectedMachines.length,
    }),
    [activeMachines.length, selectedMachines.length],
  )

  useEffect(() => {
    if (steps.length > 0) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [steps])

  function clearResults() {
    setSelectedMachines([])
    setRemainingPower(0)
    setSteps([])
  }

  function isValidTotalPower(value) {
    return Number.isFinite(value) && value > 0
  }

  function resetWorkspace() {
    setMode(null)
    setSampleKey('normal')
    setSampleMachines([])
    setCustomMachines([])
    setMachineForm(initialMachineForm)
    setTotalPower(0)
    clearResults()
    setStatusMessage('')
  }

  function chooseSampleMode() {
    setMode('sample')
    setSampleKey('normal')
    setSampleMachines(createSampleMachines('normal'))
    setTotalPower(SAMPLE_CASES.normal.totalPower)
    clearResults()
    setStatusMessage('Sample data is ready.')
  }

  function chooseCustomMode() {
    setMode('custom')
    setCustomMachines([])
    setMachineForm(initialMachineForm)
    setTotalPower(0)
    clearResults()
    setStatusMessage('Enter your own machines.')
  }

  function loadSample(sampleKeyValue) {
    setSampleKey(sampleKeyValue)
    setSampleMachines(createSampleMachines(sampleKeyValue))
    setTotalPower(SAMPLE_CASES[sampleKeyValue].totalPower)
    clearResults()
    setStatusMessage(`${SAMPLE_CASES[sampleKeyValue].label} is ready.`)
  }

  function updateFormField(field, value) {
    setMachineForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function addMachine(event) {
    event.preventDefault()

    const name = machineForm.name.trim()
    const criticality = Number(machineForm.criticality)
    const powerRequired = Number(machineForm.powerRequired)

    if (!name || Number.isNaN(criticality) || Number.isNaN(powerRequired)) {
      setStatusMessage('Enter a machine name, a criticality value, and a power value first.')
      return
    }

    setCustomMachines((currentMachines) => [
      ...currentMachines,
      new Machine(createMachineId(), name, criticality, powerRequired),
    ])
    setMachineForm(initialMachineForm)
    clearResults()
    setStatusMessage(`${name} has been added.`)
  }

  function startProcessing() {
    if (isProcessing || activeMachines.length === 0) {
      return
    }

    if (!isValidTotalPower(totalPower)) {
      setStatusMessage('Please enter a valid total available power before starting.')
      return
    }

    setIsProcessing(true)
    clearResults()

    const processingHeap = new MinHeap()
    for (const machine of activeMachines) {
      processingHeap.insert(machine)
    }

    const result = runSimulation(processingHeap, Number(totalPower))
    setSelectedMachines(result.selectedMachines)
    setRemainingPower(result.remainingPower)
    setSteps(result.steps)
    setStatusMessage('Processing is complete.')
    setIsProcessing(false)
  }

  function renderChoiceScreen() {
    return (
      <section className="card choice-card">
        <div className="card-title-row">
          <h2>Priority Queue Demo</h2>
          <span className="badge">Simple mode</span>
        </div>

        <p className="helper-copy">
          Choose how you want to begin. Sample mode loads a ready-made story. Custom mode lets
          you enter your own machines.
        </p>

        <div className="choice-grid">
          <button className="primary-button choice-main" type="button" onClick={chooseSampleMode}>
            Load Sample Data
          </button>
          <button className="secondary-button choice-main" type="button" onClick={chooseCustomMode}>
            Add My Own Machines
          </button>
        </div>
      </section>
    )
  }

  function renderSampleScreen() {
    return (
      <section className="card setup-card">
        <div className="card-title-row">
          <h2>Load Sample Data</h2>
          <button className="text-button" type="button" onClick={resetWorkspace} disabled={isProcessing}>
            Back
          </button>
        </div>

        <p className="helper-copy">Pick one story, review the machines, and then start processing.</p>

        <div className="sample-picker">
          <button
            type="button"
            className={sampleKey === 'normal' ? 'choice-button active' : 'choice-button'}
            onClick={() => loadSample('normal')}
            disabled={isProcessing}
          >
            Normal Selection
          </button>
          <button
            type="button"
            className={sampleKey === 'limited' ? 'choice-button active' : 'choice-button'}
            onClick={() => loadSample('limited')}
            disabled={isProcessing}
          >
            Limited Power
          </button>
          <button
            type="button"
            className={sampleKey === 'tied' ? 'choice-button active' : 'choice-button'}
            onClick={() => loadSample('tied')}
            disabled={isProcessing}
          >
            Equal Criticality
          </button>
        </div>

        <div className="input-row">
          <label>
            <span>Total Available Power</span>
            <input type="number" value={totalPower} readOnly />
          </label>
          <button
            className="primary-button"
            type="button"
            onClick={startProcessing}
            disabled={isProcessing || activeMachines.length === 0}
          >
            Start Processing
          </button>
        </div>

        <div className="machine-list-card">
          <h3>Machines ready to process</h3>
          <ul className="machine-list">
            {activeMachines.map((machine) => (
              <li key={machine.id}>
                <strong>{machine.name}</strong>
                <span>Criticality {machine.criticality}</span>
                <span>Power {machine.powerRequired}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }

  function renderCustomScreen() {
    return (
      <section className="card setup-card">
        <div className="card-title-row">
          <h2>Add My Own Machines</h2>
          <button className="text-button" type="button" onClick={resetWorkspace} disabled={isProcessing}>
            Back
          </button>
        </div>

        <form className="machine-form" onSubmit={addMachine}>
          <label>
            <span>Machine Name</span>
            <input
              type="text"
              value={machineForm.name}
              onChange={(event) => updateFormField('name', event.target.value)}
              placeholder="Machine X"
              disabled={isProcessing}
            />
          </label>

          <label>
            <span>Criticality</span>
            <input
              type="number"
              min="0"
              step="1"
              value={machineForm.criticality}
              onChange={(event) => updateFormField('criticality', event.target.value)}
              placeholder="1"
              disabled={isProcessing}
            />
          </label>

          <label>
            <span>Power Required</span>
            <input
              type="number"
              min="0"
              step="1"
              value={machineForm.powerRequired}
              onChange={(event) => updateFormField('powerRequired', event.target.value)}
              placeholder="25"
              disabled={isProcessing}
            />
          </label>

          <button className="secondary-button" type="submit" disabled={isProcessing}>
            Add Machine
          </button>

          <div className="power-section">
            <div className="power-section-header">
              <h3>Set Total Available Power</h3>
              <span className="badge">Required</span>
            </div>

            <label htmlFor="power-input">
              <span>Total Available Power</span>
              <input
                id="power-input"
                type="number"
                min="0"
                step="1"
                value={totalPower}
                onChange={(event) => setTotalPower(Number(event.target.value))}
                placeholder="70"
                disabled={isProcessing}
              />
            </label>

            <p className="power-preview">Current Total Power: {isValidTotalPower(totalPower) ? totalPower : 0}</p>
          </div>

          <div className="input-row">
            <button
              className="primary-button"
              type="button"
              onClick={startProcessing}
              disabled={isProcessing || activeMachines.length === 0}
            >
              Start Processing
            </button>
          </div>
        </form>

        <div className="machine-list-card">
          <h3>Machines ready to process</h3>
          {activeMachines.length === 0 ? (
            <p className="empty-state">No machines added yet.</p>
          ) : (
            <ul className="machine-list">
              {activeMachines.map((machine) => (
                <li key={machine.id}>
                  <strong>{machine.name}</strong>
                  <span>Criticality {machine.criticality}</span>
                  <span>Power {machine.powerRequired}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    )
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Priority Queue Demo</p>
          <h1>Easy machine selection story</h1>
          <p className="hero-copy">
            Choose sample data or enter your own machines, then read a plain-language explanation
            of every selection and skip.
          </p>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <span>Loaded machines</span>
            <strong>{summary.machineCount}</strong>
          </div>
          <div className="stat-card">
            <span>Selected</span>
            <strong>{summary.selectedCount}</strong>
          </div>
          <div className="stat-card">
            <span>Status</span>
            <strong>{isProcessing ? 'Working' : 'Ready'}</strong>
          </div>
        </div>
      </header>

      <main className="workspace single-column">
        <section className="column">
          {mode === null ? renderChoiceScreen() : null}
          {mode === 'sample' ? renderSampleScreen() : null}
          {mode === 'custom' ? renderCustomScreen() : null}

          {statusMessage ? <p className="status-message">{statusMessage}</p> : null}

          {steps.length > 0 ? (
            <section className="card results-card" ref={resultsRef}>
              <div className="card-title-row">
                <h2>Final Result</h2>
                <button className="text-button" type="button" onClick={clearResults} disabled={isProcessing}>
                  Clear Results
                </button>
              </div>

              <div className="result-block">
                <h3>Selected Machines</h3>
                {selectedMachines.length === 0 ? (
                  <p className="empty-state">No machines were selected.</p>
                ) : (
                  <ol className="selected-list">
                    {selectedMachines.map((machine) => (
                      <li key={machine.id}>{machine.name}</li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="result-block">
                <h3>Remaining Power</h3>
                <p className="power-value">{remainingPower}</p>
              </div>

              <div className="result-block steps-block">
                <h3>Step-by-Step Explanation</h3>
                <ol className="steps-list">
                  {steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </section>
          ) : null}
        </section>
      </main>
    </div>
  )
}
