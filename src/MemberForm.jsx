import React, { useState } from 'react'

const MemberForm = ({ addMember, trainingTypes }) => {
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [date, setDate] = useState('')
  const [trainingType, setTrainingType] = useState('')
  const [paymentStatus, setPaymentStatus] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const newMember = { 
      name, 
      lastName, 
      date, 
      trainingType, 
      paymentStatus,
      paymentAmount: paymentAmount ? parseFloat(paymentAmount) : 0
    }
    addMember(newMember)
    setName('')
    setLastName('')
    setDate('')
    setTrainingType('')
    setPaymentStatus(false)
    setPaymentAmount('')
  }

  return (
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
      <label className="checkbox">
        <input
          type="checkbox"
          checked={paymentStatus}
          onChange={() => setPaymentStatus(!paymentStatus)}
        />
        <span>Paid</span>
      </label>
      <button type="submit">Add Member</button>
    </form>
  )
}

export default MemberForm


