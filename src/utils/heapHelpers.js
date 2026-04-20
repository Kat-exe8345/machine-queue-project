export function runSimulation(heap, totalPower) {
  const workingHeap = heap.clone()
  const selectedMachines = []
  let remainingPower = Number(totalPower) || 0
  const steps = []
  let stepNumber = 1

  function addStep(text) {
    steps.push(`Step ${stepNumber}: ${text}`)
    stepNumber += 1
  }

  addStep(`Available power is ${remainingPower}.`)

  while (!workingHeap.isEmpty()) {
    const nextMachine = workingHeap.peek()
    const remainingMachines = workingHeap.toArray()

    if (!nextMachine) {
      break
    }

    const samePriorityMachines = remainingMachines.filter(
      (machine) => machine.criticality === nextMachine.criticality,
    )
    const isTieOnCriticality = samePriorityMachines.length > 1
    const isLowestPowerAmongTies =
      isTieOnCriticality &&
      samePriorityMachines.every((machine) => machine.powerRequired >= nextMachine.powerRequired)

    if (isTieOnCriticality && isLowestPowerAmongTies) {
      addStep(
        `Choosing ${nextMachine.name} because it has the lowest criticality, and it also uses less power than the other machines with the same priority.`,
      )
    } else {
      addStep(`Choosing ${nextMachine.name} because it has the lowest criticality among the remaining machines.`)
    }

    addStep(`${nextMachine.name} requires ${nextMachine.powerRequired} power.`)
    addStep(`Available power is ${remainingPower}.`)

    const extracted = workingHeap.extractMin()

    if (!extracted.machine) {
      break
    }

    if (extracted.machine.powerRequired > remainingPower) {
      addStep(`Only ${remainingPower} power is left, so ${extracted.machine.name} cannot be selected. It is skipped.`)
      continue
    }

    selectedMachines.push(extracted.machine)
    remainingPower -= extracted.machine.powerRequired
    addStep(`${extracted.machine.name} can be selected.`)
    addStep(`Remaining power is now ${remainingPower}.`)
  }

  if (selectedMachines.length === 0) {
    addStep('No machines could be selected with the available power.')
  }

  return {
    selectedMachines,
    remainingPower,
    steps,
  }
}