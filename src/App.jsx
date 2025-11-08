import React, { useEffect, useMemo, useState } from 'react'
import { db } from './firebase'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDocs,
} from 'firebase/firestore'
import MemberForm from './MemberForm.jsx'
import MemberList from './MemberList.jsx'
import TrainingTypesManager from './TrainingTypesManager.jsx'
import EditMemberForm from './EditMemberForm.jsx'

const App = () => {
  const [members, setMembers] = useState([])
  const [trainingTypes, setTrainingTypes] = useState([])
  const [filter, setFilter] = useState('all') // 'all' | 'unpaid'
  const [search, setSearch] = useState('')
  const [trainingFilter, setTrainingFilter] = useState('all')
  const [error, setError] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [memberToDelete, setMemberToDelete] = useState(null)

  // Realtime subscription - try with orderBy first, fallback to simple query
  useEffect(() => {
    let unsub
    const membersRef = collection(db, 'members')
    
    // Try with orderBy first
    const tryOrderedQuery = () => {
      try {
        const q = query(membersRef, orderBy('createdAt', 'asc'))
        unsub = onSnapshot(
          q,
          (snap) => {
            const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
            setMembers(rows)
            setError(null)
          },
          (err) => {
            // If orderBy fails (e.g., no index or no createdAt field), try without it
            if (err.code === 'failed-precondition' || err.code === 'unavailable') {
              console.warn('Ordered query failed, trying simple query:', err.message)
              trySimpleQuery()
            } else {
              console.error('Firestore error:', err)
              setError(`Connection error: ${err.message}`)
            }
          }
        )
      } catch (err) {
        console.error('Query setup error:', err)
        trySimpleQuery()
      }
    }

    // Fallback: simple query without orderBy
    const trySimpleQuery = () => {
      try {
        unsub = onSnapshot(
          membersRef,
          (snap) => {
            const rows = snap.docs.map((d) => {
              const data = d.data()
              return { id: d.id, ...data }
            })
            // Sort client-side by createdAt if available, otherwise by id
            rows.sort((a, b) => {
              if (a.createdAt && b.createdAt) {
                return a.createdAt.toMillis?.() - b.createdAt.toMillis?.() || 0
              }
              return a.id.localeCompare(b.id)
            })
            setMembers(rows)
            setError(null)
          },
          (err) => {
            console.error('Firestore connection error:', err)
            setError(`Cannot connect to database: ${err.message}. Check your internet connection and Firestore rules.`)
          }
        )
      } catch (err) {
        console.error('Simple query setup error:', err)
        setError('Failed to connect to database')
      }
    }

    tryOrderedQuery()
    return () => {
      if (unsub) unsub()
    }
  }, [])

  // Subscribe to training types
  useEffect(() => {
    const typesRef = collection(db, 'trainingTypes')
    const unsub = onSnapshot(
      typesRef,
      (snap) => {
        const types = snap.docs.map((d) => ({ id: d.id, name: d.data().name }))
        setTrainingTypes(types)
      },
      (err) => {
        console.error('Error loading training types:', err)
      }
    )
    return () => unsub()
  }, [])

  // Initialize default training types on first load
  useEffect(() => {
    const initDefaults = async () => {
      try {
        const snap = await getDocs(collection(db, 'trainingTypes'))
        if (snap.empty) {
          const defaults = ['Karate', 'Gym', 'Taekwondo', 'Gymnastics']
          for (const name of defaults) {
            await addDoc(collection(db, 'trainingTypes'), { 
              name, 
              createdAt: serverTimestamp() 
            })
          }
        }
      } catch (err) {
        console.error('Error initializing training types:', err)
      }
    }
    initDefaults()
  }, [])

  // Add new training type
  const addTrainingType = async (name) => {
    if (!name.trim()) return
    try {
      // Check if already exists
      const q = query(collection(db, 'trainingTypes'), where('name', '==', name.trim()))
      const snap = await getDocs(q)
      if (!snap.empty) {
        setError('Training type already exists')
        setTimeout(() => setError(null), 3000)
        return
      }
      await addDoc(collection(db, 'trainingTypes'), { 
        name: name.trim(), 
        createdAt: serverTimestamp() 
      })
      setError(null)
    } catch (err) {
      console.error('Error adding training type:', err)
      setError(`Failed to add training type: ${err.message}`)
      setTimeout(() => setError(null), 5000)
    }
  }

  // Delete training type
  const deleteTrainingType = async (id) => {
    try {
      // Check if any members use this training type
      const typeName = trainingTypes.find(t => t.id === id)?.name
      if (typeName) {
        const membersUsingType = members.filter(m => m.trainingType === typeName)
        if (membersUsingType.length > 0) {
          setError(`Cannot delete: ${membersUsingType.length} member(s) are using this training type`)
          setTimeout(() => setError(null), 5000)
          return
        }
      }
      await deleteDoc(doc(db, 'trainingTypes', id))
      setError(null)
    } catch (err) {
      console.error('Error deleting training type:', err)
      setError(`Failed to delete training type: ${err.message}`)
      setTimeout(() => setError(null), 5000)
    }
  }

  const daysInMonth = (year, monthIndex) => {
    return new Date(year, monthIndex + 1, 0).getDate()
  }

  // Next billing date is the next occurrence of the join day each month
  const nextBillingDate = (joinDateString, fromDateString) => {
    const joinDate = new Date(joinDateString || new Date().toISOString().slice(0, 10))
    const from = fromDateString ? new Date(fromDateString) : new Date()
    const targetDay = joinDate.getDate()
    let year = from.getFullYear()
    let month = from.getMonth()
    let dim = daysInMonth(year, month)
    let day = Math.min(targetDay, dim)
    let candidate = new Date(year, month, day)
    if (candidate <= from) {
      month += 1
      if (month > 11) {
        month = 0
        year += 1
      }
      dim = daysInMonth(year, month)
      day = Math.min(targetDay, dim)
      candidate = new Date(year, month, day)
    }
    return candidate.toISOString().slice(0, 10)
  }

  // Normalize and auto-unpay in Firestore
  useEffect(() => {
    const now = new Date()
    members.forEach(async (m) => {
      try {
        const ref = doc(db, 'members', m.id)
        // Ensure paidUntil exists if paid but missing
        if (m.paymentStatus && !m.paidUntil) {
          await updateDoc(ref, { paidUntil: nextBillingDate(m.date, now.toISOString().slice(0, 10)) })
          return
        }
        // Auto-unpay if expired
        if (m.paidUntil && m.paymentStatus && now > new Date(m.paidUntil)) {
          await updateDoc(ref, { paymentStatus: false, paidUntil: null })
        }
      } catch (err) {
        console.error(`Error normalizing member ${m.id}:`, err)
        // Don't set error state here to avoid spam
      }
    })
  }, [members])

  // Periodic server-backed expiry check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      members.forEach(async (m) => {
        try {
          if (m.paidUntil && m.paymentStatus && now > new Date(m.paidUntil)) {
            await updateDoc(doc(db, 'members', m.id), { paymentStatus: false, paidUntil: null })
          }
        } catch (err) {
          console.error(`Error checking expiry for member ${m.id}:`, err)
        }
      })
    }, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [members])

  const addMember = async (newMember) => {
    try {
      const paidUntil = newMember.paymentStatus
        ? nextBillingDate(newMember.date, new Date().toISOString().slice(0, 10))
        : null
      await addDoc(collection(db, 'members'), {
        name: newMember.name,
        lastName: newMember.lastName,
        date: newMember.date,
        trainingType: newMember.trainingType,
        paymentStatus: !!newMember.paymentStatus,
        paymentAmount: newMember.paymentAmount || 0,
        paidUntil,
        createdAt: serverTimestamp(),
      })
      setError(null)
    } catch (err) {
      console.error('Error adding member:', err)
      setError(`Failed to add member: ${err.message}`)
      setTimeout(() => setError(null), 5000)
    }
  }

  const togglePaymentStatus = async (id) => {
    try {
      const current = members.find((m) => m.id === id)
      if (!current) return
      const nextPaid = !current.paymentStatus
      const updates = {
        paymentStatus: nextPaid,
        paidUntil: nextPaid
          ? nextBillingDate(current.date, new Date().toISOString().slice(0, 10))
          : null,
      }
      await updateDoc(doc(db, 'members', id), updates)
      setError(null)
    } catch (err) {
      console.error('Error updating payment status:', err)
      setError(`Failed to update payment: ${err.message}`)
      setTimeout(() => setError(null), 5000)
    }
  }

  const editMember = async (id, updatedData) => {
    try {
      await updateDoc(doc(db, 'members', id), {
        name: updatedData.name,
        lastName: updatedData.lastName,
        date: updatedData.date,
        trainingType: updatedData.trainingType,
        paymentAmount: updatedData.paymentAmount || 0,
      })
      setEditingMember(null)
      setError(null)
    } catch (err) {
      console.error('Error editing member:', err)
      setError(`Failed to update member: ${err.message}`)
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleDeleteClick = (id) => {
    const member = members.find((m) => m.id === id)
    setMemberToDelete({ id, name: member ? `${member.name} ${member.lastName}` : 'this member' })
  }

  const confirmDelete = async () => {
    if (memberToDelete) {
      try {
        await deleteDoc(doc(db, 'members', memberToDelete.id))
        setMemberToDelete(null)
        setError(null)
      } catch (err) {
        console.error('Error deleting member:', err)
        setError(`Failed to delete member: ${err.message}`)
        setTimeout(() => setError(null), 5000)
      }
    }
  }

  const displayedMembers = useMemo(() => {
    let result = members
    if (filter === 'unpaid') {
      result = result.filter((m) => !m.paymentStatus)
    }
    if (trainingFilter !== 'all') {
      result = result.filter((m) => m.trainingType === trainingFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((m) =>
        `${m.name} ${m.lastName}`.toLowerCase().includes(q)
      )
    }
    return result
  }, [members, filter, trainingFilter, search])

  return (
    <div className="container">
      <h1>Gym Tracker</h1>
      {error && (
        <div style={{ 
          padding: '12px', 
          background: '#ffebee', 
          color: '#c62828', 
          borderRadius: '4px', 
          marginBottom: '12px',
          border: '1px solid #ef5350'
        }}>
          ⚠️ {error}
        </div>
      )}
      <TrainingTypesManager
        trainingTypes={trainingTypes}
        onAdd={addTrainingType}
        onDelete={deleteTrainingType}
      />
      <MemberForm addMember={addMember} trainingTypes={trainingTypes} />
      <div style={{ marginTop: 12, marginBottom: 8, display: 'grid', gap: 8, gridTemplateColumns: '1fr', alignItems: 'center' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span>Status:</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span>Training:</span>
          <select value={trainingFilter} onChange={(e) => setTrainingFilter(e.target.value)}>
            <option value="all">All</option>
            {trainingTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </label>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <MemberList
        members={displayedMembers}
        togglePaymentStatus={togglePaymentStatus}
        onDeleteClick={handleDeleteClick}
        onEditClick={setEditingMember}
      />
      {editingMember && (
        <EditMemberForm
          member={editingMember}
          trainingTypes={trainingTypes}
          onSave={(data) => editMember(editingMember.id, data)}
          onCancel={() => setEditingMember(null)}
        />
      )}
      {memberToDelete && (
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
          onClick={() => setMemberToDelete(null)}
        >
          <div
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
            <p>Are you sure you want to delete <strong>{memberToDelete.name}</strong>? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button
                onClick={confirmDelete}
                className="danger"
                style={{ flex: 1 }}
              >
                Delete
              </button>
              <button
                onClick={() => setMemberToDelete(null)}
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
          </div>
        </div>
      )}
    </div>
  )
}

export default App


