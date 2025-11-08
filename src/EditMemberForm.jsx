import React, { useState, useEffect } from 'react'

const EditMemberForm = ({ member, trainingTypes, onSave, onCancel }) => {
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [date, setDate] = useState('')
  const [trainingType, setTrainingType] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')

  useEffect(() => {
    if (member) {
      setName(member.name || '')
      setLastName(member.lastName || '')
      setDate(member.date || '')
      setTrainingType(member.trainingType || '')
      setPaymentAmount(member.paymentAmount || '')
    }
  }, [member])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      name,
      lastName,
      date,
      trainingType,
      paymentAmount: paymentAmount ? parseFloat(paymentAmount) : 0,
    })
  }

  if (!member) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>Edit Member</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="First Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <select
            value={trainingType}
            onChange={(e) => setTrainingType(e.target.value)}
            required
          >
            <option value="">Select Training Type</option>
            {trainingTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Monthly Payment Amount"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button type="submit" style={{ flex: 1 }}>
              Save Changes
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                background: '#757575',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditMemberForm

