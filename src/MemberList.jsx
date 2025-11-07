import React from 'react'

const MemberList = ({ members, togglePaymentStatus, deleteMember }) => {
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
                  <button className="danger" onClick={() => deleteMember(member.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="member-details">
                <p>Training: {member.trainingType}</p>
                <p>Joined: {member.date}</p>
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


