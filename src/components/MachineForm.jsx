import { useState } from 'react'

const initialForm = {
  name: '',
  criticality: '',
  powerRequired: '',
}

function MachineForm({ onAddMachine }) {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedName = form.name.trim()
    const criticality = Number(form.criticality)
    const powerRequired = Number(form.powerRequired)

    if (!trimmedName || Number.isNaN(criticality) || Number.isNaN(powerRequired)) {
      setError('Enter a name, criticality, and power value before adding the machine.')
      return
    }

    setError('')
    onAddMachine({ name: trimmedName, criticality, powerRequired })
    setForm(initialForm)
  }

  return (
    <section className="card">
      <div className="card-title-row">
        <h2>Add Machine</h2>
        <span className="badge">Manual input</span>
      </div>

      <form className="machine-form" onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Machine A"
          />
        </label>

        <label>
          <span>Criticality</span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.criticality}
            onChange={(event) => updateField('criticality', event.target.value)}
            placeholder="1"
          />
        </label>

        <label>
          <span>Power Required</span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.powerRequired}
            onChange={(event) => updateField('powerRequired', event.target.value)}
            placeholder="40"
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" type="submit">
          Add Machine
        </button>
      </form>
    </section>
  )
}

export default MachineForm