import { useMemo, useRef, useState } from 'react'
import Controls from './components/Controls.jsx'
import HeapView from './components/HeapView.jsx'
import LogsPanel from './components/LogsPanel.jsx'
import MachineForm from './components/MachineForm.jsx'
import Machine from './logic/Machine.js'
import MinHeap from './logic/MinHeap.js'
import { runSimulation } from './utils/heapHelpers.js'

const SAMPLE_CASES = {
  case1: {
    label: 'Case 1',
    totalPower: 70,
    machines: [
      { name: 'A', criticality: 1, powerRequired: 50 },
      { name: 'B', criticality: 2, powerRequired: 30 },
      { name: 'C', criticality: 1, powerRequired: 20 },
    ],
  },
  case2: {
    label: 'Case 2',
    totalPower: 50,
    machines: [
      { name: 'D', criticality: 3, powerRequired: 40 },
      { name: 'E', criticality: 3, powerRequired: 15 },
      { name: 'F', criticality: 3, powerRequired: 25 },
      { name: 'G', criticality: 4, powerRequired: 10 },
    ],
  },
}

function createMachineId() {
  return globalThis.crypto?.randomUUID?.() ?? `machine-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createMachineFromInput(input) {
  return new Machine(
    createMachineId(),
    input.name.trim(),
    Number(input.criticality),
    Number(input.powerRequired),
  )
}

function collectOperationHighlights(heap) {
  const action = heap.lastAction

  if (!action) {
    return []
  }

  return action.indices ?? []
}

function App() {
  const heapRef = useRef(new MinHeap())
  const [machines, setMachines] = useState([])
  const [heapSnapshot, setHeapSnapshot] = useState([])
  const [logs, setLogs] = useState([])
  const [selectedMachines, setSelectedMachines] = useState([])
  const [remainingPower, setRemainingPower] = useState(0)
  const [totalPower, setTotalPower] = useState(0)
  const [activeIndices, setActiveIndices] = useState([])

  const summary = useMemo(
    () => ({
      machineCount: machines.length,
      heapSize: heapSnapshot.length,
      selectedCount: selectedMachines.length,
    }),
    [heapSnapshot.length, machines.length, selectedMachines.length],
  )

  function syncHeapView(nextLogs, nextActiveIndices = []) {
    setHeapSnapshot(heapRef.current.toArray())

    if (nextLogs.length > 0) {
      setLogs((currentLogs) => [...currentLogs, ...nextLogs])
    }

    setActiveIndices(nextActiveIndices)
  }

  function handleAddMachine(machineInput) {
    const machine = createMachineFromInput(machineInput)
    const insertLogs = heapRef.current.insert(machine)

    setMachines((currentMachines) => [...currentMachines, machine])
    syncHeapView(insertLogs, collectOperationHighlights(heapRef.current))
  }

  function handleRunSimulation() {
    const result = runSimulation(heapRef.current, Number(totalPower))
    setSelectedMachines(result.selectedMachines)
    setRemainingPower(result.remainingPower)
    setLogs((currentLogs) => [...currentLogs, ...result.logs])
    setActiveIndices([0])
  }

  function handleLoadSample(sampleKey) {
    const sample = SAMPLE_CASES[sampleKey]

    if (!sample) {
      return
    }

    heapRef.current = new MinHeap()

    const loadedMachines = sample.machines.map(createMachineFromInput)
    const nextLogs = [`[info] Loaded ${sample.label} with ${loadedMachines.length} machines`]

    for (const machine of loadedMachines) {
      nextLogs.push(...heapRef.current.insert(machine))
    }

    setMachines(loadedMachines)
    setTotalPower(sample.totalPower)
    setSelectedMachines([])
    setRemainingPower(sample.totalPower)
    setLogs(nextLogs)
    setHeapSnapshot(heapRef.current.toArray())
    setActiveIndices(collectOperationHighlights(heapRef.current))
  }

  function handleClearAll() {
    heapRef.current = new MinHeap()
    setMachines([])
    setHeapSnapshot([])
    setLogs([])
    setSelectedMachines([])
    setRemainingPower(0)
    setTotalPower(0)
    setActiveIndices([])
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Priority Queue Visualizer</p>
          <h1>Custom min heap for power-aware machine scheduling</h1>
          <p className="hero-copy">
            Insert machines, watch the heap rebalance, and run the simulation that
            selects the highest-priority jobs under a total power budget.
          </p>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <span>Machines</span>
            <strong>{summary.machineCount}</strong>
          </div>
          <div className="stat-card">
            <span>Heap size</span>
            <strong>{summary.heapSize}</strong>
          </div>
          <div className="stat-card">
            <span>Selected</span>
            <strong>{summary.selectedCount}</strong>
          </div>
        </div>
      </header>

      <main className="workspace">
        <section className="column column-left">
          <MachineForm onAddMachine={handleAddMachine} />

          <Controls
            totalPower={totalPower}
            selectedMachines={selectedMachines}
            remainingPower={remainingPower}
            onTotalPowerChange={setTotalPower}
            onRunSimulation={handleRunSimulation}
            onLoadSample={handleLoadSample}
            onClearAll={handleClearAll}
          />

          <HeapView heap={heapSnapshot} activeIndices={activeIndices} />
        </section>

        <section className="column column-right">
          <LogsPanel logs={logs} />

          <section className="card roster-card">
            <div className="card-title-row">
              <h2>Machine roster</h2>
              <span className="badge">{machines.length} total</span>
            </div>

            {machines.length === 0 ? (
              <p className="empty-state">No machines yet. Add one or load a sample case.</p>
            ) : (
              <ul className="roster-list">
                {machines.map((machine) => (
                  <li key={machine.id}>
                    <strong>{machine.name}</strong>
                    <span>Crit {machine.criticality}</span>
                    <span>{machine.powerRequired} power</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
      </main>
    </div>
  )
}

export default App
