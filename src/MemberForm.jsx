import React, { useState } from 'react'

const MemberForm = ({ addMember }) => {
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [date, setDate] = useState('')
  const [trainingType, setTrainingType] = useState('')
  const [paymentStatus, setPaymentStatus] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const newMember = { name, lastName, date, trainingType, paymentStatus }
    addMember(newMember)
    setName('')
    setLastName('')
    setDate('')
    setTrainingType('')
    setPaymentStatus(false)
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
        <option value="Karate">Karate</option>
        <option value="Gym">Gym</option>
        <option value="Taekwondo">Taekwondo</option>
        <option value="Gymnastics">Gymnastics</option>
      </select>
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


