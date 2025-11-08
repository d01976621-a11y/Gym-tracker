import React from 'react'

const MemberList = ({ members, togglePaymentStatus, onDeleteClick, onEditClick }) => {
  return (
    <div className="list">
      <h2>Members</h2>
      {members.length === 0 ? (
        <p>No members yet. Add your first member above.</p>
      ) : (
        <ul>
          {members.map((member) => (
            <li key={member.id} className="member">
              <div className="member-row">
                <p className="member-name">
                  {member.name} {member.lastName}
                </p>
                <div className="member-actions">
                  <button onClick={() => togglePaymentStatus(member.id)}>
                    {member.paymentStatus ? 'Mark Unpaid' : 'Mark Paid'}
                  </button>
                  <button
                    onClick={() => onEditClick(member)}
                    style={{
                      background: '#2196F3',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Edit
                  </button>
                  <button className="danger" onClick={() => onDeleteClick(member.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="member-details">
                <p>Training: {member.trainingType}</p>
                <p>Joined: {member.date}</p>
                <p>Monthly Payment: ${typeof member.paymentAmount === 'number' ? member.paymentAmount.toFixed(2) : '0.00'}</p>
                <p>Paid: {member.paymentStatus ? 'Yes' : 'No'}</p>
                {member.paidUntil && (
                  <p>Paid until: {member.paidUntil}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MemberList


