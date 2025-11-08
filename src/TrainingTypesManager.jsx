import React, { useState } from 'react'

const TrainingTypesManager = ({ trainingTypes, onAdd, onDelete }) => {
  const [newType, setNewType] = useState('')
  const [showManager, setShowManager] = useState(false)

  const handleAdd = (e) => {
    e.preventDefault()
    if (newType.trim()) {
      onAdd(newType)
      setNewType('')
    }
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <button
        type="button"
        onClick={() => setShowManager(!showManager)}
        style={{
          padding: '8px 16px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        {showManager ? '▼' : '▶'} Manage Training Types
      </button>

      {showManager && (
        <div
          style={{
            marginTop: '12px',
            padding: '16px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Training Types</h3>
          
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="New training type..."
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              style={{ flex: 1, padding: '8px', fontSize: '14px' }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Add
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trainingTypes.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No training types yet</p>
            ) : (
              trainingTypes.map((type) => (
                <div
                  key={type.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                  }}
                >
                  <span>{type.name}</span>
                  <button
                    onClick={() => onDelete(type.id)}
                    style={{
                      padding: '4px 12px',
                      background: '#d9534f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainingTypesManager

