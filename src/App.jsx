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

  function handleDeleteMachine(id) {
    setCustomMachines((currentMachines) => {
      const nextMachines = currentMachines.filter((machine) => machine.id !== id)

      clearResults()

      if (nextMachines.length === 0) {
        setStatusMessage('Please add at least one machine before processing.')
      } else {
        setStatusMessage('Machine removed.')
      }

      return nextMachines
    })
  }

  function startProcessing() {
    if (isProcessing) {
      return
    }

    if (activeMachines.length === 0) {
      setStatusMessage('Please add at least one machine before processing.')
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
      <section className="mb-6 rounded-md border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-medium">Priority Queue Demo</h2>
          <span className="text-sm text-gray-500">Simple mode</span>
        </div>

        <p className="text-sm text-gray-600">
          Choose how you want to begin. Sample mode loads ready-made machine data. Custom mode lets
          you enter your own machine data.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button className="bg-black px-4 py-2 text-sm text-white rounded-md" type="button" onClick={chooseSampleMode}>
            Load Sample Data
          </button>
          <button className="bg-blue-600 px-4 py-2 text-sm text-white rounded-md" type="button" onClick={chooseCustomMode}>
            Add My Own Machines
          </button>
        </div>
      </section>
    )
  }

  function renderSampleScreen() {
    return (
      <section className="mb-6 rounded-md border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-medium">Load Sample Data</h2>
          <button className="text-sm text-blue-600" type="button" onClick={resetWorkspace} disabled={isProcessing}>
            Back
          </button>
        </div>

        <p className="text-sm text-gray-600">Pick one story, review the machines, and then start processing.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-sm text-white ${sampleKey === 'normal' ? 'bg-blue-700' : 'bg-blue-600'}`}
            onClick={() => loadSample('normal')}
            disabled={isProcessing}
          >
            Normal Selection
          </button>
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-sm text-white ${sampleKey === 'limited' ? 'bg-blue-700' : 'bg-blue-600'}`}
            onClick={() => loadSample('limited')}
            disabled={isProcessing}
          >
            Limited Power
          </button>
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-sm text-white ${sampleKey === 'tied' ? 'bg-blue-700' : 'bg-blue-600'}`}
            onClick={() => loadSample('tied')}
            disabled={isProcessing}
          >
            Equal Criticality
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="grid gap-1">
            <span className="text-sm">Total Available Power</span>
            <input className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none" type="number" value={totalPower} readOnly />
          </label>
          <button
            className="rounded-md bg-black px-4 py-2 text-sm text-white"
            type="button"
            onClick={startProcessing}
            disabled={isProcessing || activeMachines.length === 0}
          >
            Start Processing
          </button>
        </div>

        <div className="mt-4 rounded-md border border-gray-200 p-4">
          <h3 className="text-base font-medium">Added Machines</h3>
          <ul className="mt-3 grid gap-2">
            {activeMachines.map((machine) => (
              <li key={machine.id} className="flex items-center justify-between border-b border-gray-200 py-2">
                <div className="grid gap-0.5">
                  <strong className="text-sm font-medium">{machine.name}</strong>
                  <span className="text-sm text-gray-600">Criticality: {machine.criticality}</span>
                  <span className="text-sm text-gray-600">Power: {machine.powerRequired}</span>
                </div>
                <button
                  className="ml-2 cursor-pointer text-red-600"
                  type="button"
                  onClick={() => handleDeleteMachine(machine.id)}
                  aria-label={`Delete ${machine.name}`}
                  disabled={isProcessing}
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }

  function renderCustomScreen() {
    return (
      <section className="mb-6 rounded-md border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-medium">Add My Own Machines</h2>
          <button className="text-sm text-blue-600" type="button" onClick={resetWorkspace} disabled={isProcessing}>
            Back
          </button>
        </div>

        <form className="grid gap-3" onSubmit={addMachine}>
          <label className="grid gap-1">
            <span className="text-sm">Machine Name</span>
            <input
              className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none"
              type="text"
              value={machineForm.name}
              onChange={(event) => updateFormField('name', event.target.value)}
              placeholder="Machine X"
              disabled={isProcessing}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Criticality</span>
            <input
              className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none"
              type="number"
              min="0"
              step="1"
              value={machineForm.criticality}
              onChange={(event) => updateFormField('criticality', event.target.value)}
              placeholder="1"
              disabled={isProcessing}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Power Required</span>
            <input
              className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none"
              type="number"
              min="0"
              step="1"
              value={machineForm.powerRequired}
              onChange={(event) => updateFormField('powerRequired', event.target.value)}
              placeholder="25"
              disabled={isProcessing}
            />
          </label>

          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white" type="submit" disabled={isProcessing}>
            Add Machine
          </button>

          <div className="mt-2 grid gap-3 rounded-md border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-medium">Set Total Available Power</h3>
              <span className="text-sm text-gray-500">Required</span>
            </div>

            <label htmlFor="power-input" className="grid gap-1">
              <span className="text-sm">Total Available Power</span>
              <input
                className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none"
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

            <p className="text-sm text-gray-600">Current Total Power: {isValidTotalPower(totalPower) ? totalPower : 0}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <button
              className="rounded-md bg-black px-4 py-2 text-sm text-white"
              type="button"
              onClick={startProcessing}
              disabled={isProcessing || activeMachines.length === 0}
            >
              Start Processing
            </button>
          </div>
        </form>

        <div className="mt-4 rounded-md border border-gray-200 p-4">
          <h3 className="text-base font-medium">Added Machines</h3>
          {activeMachines.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">No machines added yet.</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {activeMachines.map((machine) => (
                <li key={machine.id} className="flex items-center justify-between border-b border-gray-200 py-2">
                  <div className="grid gap-0.5">
                    <strong className="text-sm font-medium">{machine.name}</strong>
                    <span className="text-sm text-gray-600">Criticality: {machine.criticality}</span>
                    <span className="text-sm text-gray-600">Power: {machine.powerRequired}</span>
                  </div>
                  <button
                    className="ml-2 cursor-pointer text-red-600"
                    type="button"
                    onClick={() => handleDeleteMachine(machine.id)}
                    aria-label={`Delete ${machine.name}`}
                    disabled={isProcessing}
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <div className="mx-auto mt-10 w-full max-w-6xl px-6">
      <header className="mb-6 grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Priority Queue / Min heap Demo</h1>
          <p className="text-md text-gray-600">
            Choose sample data or enter your own machine data, then read a plain-language explanation
            of every selection and skip.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-gray-200 p-4">
            <span className="text-sm text-gray-600">Loaded machines</span>
            <strong className="mt-1 block text-lg font-semibold">{summary.machineCount}</strong>
          </div>
          <div className="rounded-md border border-gray-200 p-4">
            <span className="text-sm text-gray-600">Selected</span>
            <strong className="mt-1 block text-lg font-semibold">{summary.selectedCount}</strong>
          </div>
          <div className="rounded-md border border-gray-200 p-4">
            <span className="text-sm text-gray-600">Status</span>
            <strong className="mt-1 block text-lg font-semibold">{isProcessing ? 'Working' : 'Ready'}</strong>
          </div>
        </div>
      </header>

      <main>
        {mode === null ? (
          <section className="mb-6">{renderChoiceScreen()}</section>
        ) : (
          <section className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              {mode === 'sample' ? renderSampleScreen() : null}
              {mode === 'custom' ? renderCustomScreen() : null}
            </div>

            <div className="space-y-4">
              <section ref={resultsRef} className="rounded-md border border-gray-200 bg-white p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-base font-medium">Results</h2>
                  <button className="text-sm text-blue-600" type="button" onClick={clearResults} disabled={isProcessing}>
                    Clear Results
                  </button>
                </div>

                <div className="mb-4 rounded-md border border-gray-200 p-4">
                  <h3 className="text-base font-medium">Selected Machines</h3>
                  {selectedMachines.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-600">No machines selected yet.</p>
                  ) : (
                    <ol className="mt-2 space-y-1 pl-5 text-sm">
                      {selectedMachines.map((machine) => (
                        <li key={machine.id} className="flex items-center gap-2 py-1">✅ {machine.name}</li>
                      ))}
                    </ol>
                  )}
                </div>

                <div className="mb-4 rounded-md border border-gray-200 p-4">
                  <h3 className="text-base font-medium">Remaining Power</h3>
                  <p className="mt-1 text-lg font-semibold">{remainingPower}</p>
                </div>

                {statusMessage ? <p className="text-sm text-gray-600">{statusMessage}</p> : null}
              </section>

              <section className="rounded-md border border-gray-200 bg-gray-100 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-base font-medium">Logs</h3>
                  <span className="text-sm text-gray-500">max 64 lines visible</span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 text-sm font-mono">
                  {steps.length === 0 ? (
                    <p className="text-gray-600">Steps will appear here after processing.</p>
                  ) : (
                    steps.map((step) => <p key={step} className="border-b border-gray-200 pb-2">{step}</p>)
                  )}
                </div>
              </section>
            </div>
          </section>
        )}
      </main>
      </div>
    </div>
  )
}
