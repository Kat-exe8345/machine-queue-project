export function runSimulation(heap, totalPower) {
  const workingHeap = heap.clone()
  const selectedMachines = []
  const logs = [`[info] Running simulation with total power ${totalPower}`]
  let remainingPower = Number(totalPower) || 0

  while (!workingHeap.isEmpty()) {
    const nextMachine = workingHeap.peek()

    if (!nextMachine || nextMachine.powerRequired > remainingPower) {
      if (nextMachine) {
        logs.push(
          `[info] Stopped at ${nextMachine.name} because it needs ${nextMachine.powerRequired} power and only ${remainingPower} remains`,
        )
      }

      break
    }

    const result = workingHeap.extractMin()
    logs.push(...result.logs)

    if (!result.machine) {
      break
    }

    selectedMachines.push(result.machine)
    remainingPower -= result.machine.powerRequired
    logs.push(`[info] Selected ${result.machine.name}. Remaining power: ${remainingPower}`)
  }

  if (selectedMachines.length === 0) {
    logs.push('[info] No machines were selected')
  }

  return {
    selectedMachines,
    remainingPower,
    logs,
  }
}