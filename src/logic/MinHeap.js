import Machine from './Machine.js'

function cloneMachine(machine) {
  return new Machine(machine.id, machine.name, machine.criticality, machine.powerRequired)
}

class MinHeap {
  constructor(items = []) {
    this.heap = items.map(cloneMachine)
    this.lastAction = null
  }

  compare(a, b) {
    if (a.criticality !== b.criticality) {
      return a.criticality < b.criticality
    }

    if (a.powerRequired !== b.powerRequired) {
      return a.powerRequired < b.powerRequired
    }

    return a.name.localeCompare(b.name) < 0
  }

  swap(i, j) {
    const temp = this.heap[i]
    this.heap[i] = this.heap[j]
    this.heap[j] = temp
    this.lastAction = { type: 'swap', indices: [i, j] }

    return [`[swap] Swapped index ${i} with index ${j}`]
  }

  heapifyUp(index) {
    const logs = []
    let currentIndex = index

    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2)
      const currentMachine = this.heap[currentIndex]
      const parentMachine = this.heap[parentIndex]

      if (this.compare(parentMachine, currentMachine)) {
        break
      }

      logs.push(`[swap] ${currentMachine.name} moved above ${parentMachine.name}`)
      logs.push(...this.swap(currentIndex, parentIndex))
      currentIndex = parentIndex
    }

    if (logs.length === 0) {
      logs.push(`[insert] Machine settled at index ${currentIndex}`)
    }

    this.lastAction = { type: 'insert', indices: [currentIndex] }
    return logs
  }

  heapifyDown(index) {
    const logs = []
    let currentIndex = index

    while (true) {
      const leftIndex = 2 * currentIndex + 1
      const rightIndex = 2 * currentIndex + 2
      let smallestIndex = currentIndex

      if (leftIndex < this.heap.length && this.compare(this.heap[leftIndex], this.heap[smallestIndex])) {
        smallestIndex = leftIndex
      }

      if (rightIndex < this.heap.length && this.compare(this.heap[rightIndex], this.heap[smallestIndex])) {
        smallestIndex = rightIndex
      }

      if (smallestIndex === currentIndex) {
        break
      }

      logs.push(`[swap] ${this.heap[currentIndex].name} moved below ${this.heap[smallestIndex].name}`)
      logs.push(...this.swap(currentIndex, smallestIndex))
      currentIndex = smallestIndex
    }

    if (logs.length === 0) {
      logs.push(`[extract] Heap property already satisfied at index ${currentIndex}`)
    }

    this.lastAction = { type: 'extract', indices: [currentIndex] }
    return logs
  }

  insert(machine) {
    this.heap.push(cloneMachine(machine))
    const index = this.heap.length - 1
    const logs = [`[insert] Inserted ${machine.name} at index ${index}`]
    logs.push(...this.heapifyUp(index))
    return logs
  }

  extractMin() {
    if (this.isEmpty()) {
      this.lastAction = { type: 'extract', indices: [] }
      return { machine: null, logs: ['[extract] Heap is empty'] }
    }

    const minimumMachine = this.heap[0]
    const logs = [`[extract] Removed ${minimumMachine.name} from the root`]
    const lastMachine = this.heap.pop()

    if (this.heap.length > 0) {
      this.heap[0] = lastMachine
      logs.push(`[extract] Moved ${lastMachine.name} to the root`)
      logs.push(...this.heapifyDown(0))
    } else {
      this.lastAction = { type: 'extract', indices: [0] }
    }

    return { machine: minimumMachine, logs }
  }

  peek() {
    return this.heap[0] ?? null
  }

  isEmpty() {
    return this.heap.length === 0
  }

  toArray() {
    return this.heap.map(cloneMachine)
  }

  clone() {
    return new MinHeap(this.heap)
  }
}

export default MinHeap