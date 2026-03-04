// src/App.jsx
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [todos, setTodos] = useState([])
  const [newTask, setNewTask] = useState('')
  const [newTime, setNewTime] = useState('')

  // State untuk fitur Edit
  const [editingId, setEditingId] = useState(null)
  const [editTask, setEditTask] = useState('')
  const [editTime, setEditTime] = useState('')

  useEffect(() => {
    fetchTodos()

    const subscription = supabase
      .channel('todos_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, () => {
        fetchTodos()
      })
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [])

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.log('Error fetching:', error)
    else setTodos(data)
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const { error } = await supabase
      .from('todos')
      .insert([{ task: newTask, due_time: newTime }])

    if (error) console.log('Error adding:', error)
    
    setNewTask('') 
    setNewTime('') 
  }

  const deleteTodo = async (id) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) console.log('Error deleting:', error)
  }

  // --- FUNGSI EDIT ---
  
  // 1. Tombol Edit diklik: Masukkan data lama ke form edit
  const startEditing = (todo) => {
    setEditingId(todo.id)
    setEditTask(todo.task)
    setEditTime(todo.due_time || '')
  }

  // 2. Batal edit
  const cancelEditing = () => {
    setEditingId(null)
    setEditTask('')
    setEditTime('')
  }

  // 3. Simpan perubahan ke Supabase
  const saveEdit = async (id) => {
    if (!editTask.trim()) return

    const { error } = await supabase
      .from('todos')
      .update({ task: editTask, due_time: editTime })
      .eq('id', id)

    if (error) console.log('Error updating:', error)
    
    // Keluar dari mode edit setelah berhasil
    setEditingId(null)
  }

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>📝 To-Do List Sync</h2>
      
      {/* Form Tambah */}
      <form onSubmit={addTodo} style={{ marginBottom: '20px', display: 'flex', gap: '5px' }}>
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Mau ngerjain apa?" 
          style={{ padding: '8px', flex: 1 }}
        />
        <input 
          type="time" 
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 15px', cursor: 'pointer' }}>Tambah</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map((todo) => (
          <li key={todo.id} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
            
            {/* LOGIKA TAMPILAN: Jika sedang diedit vs Tampilan normal */}
            {editingId === todo.id ? (
              // Tampilan saat mode EDIT
              <div style={{ display: 'flex', gap: '5px' }}>
                <input 
                  type="text" 
                  value={editTask} 
                  onChange={(e) => setEditTask(e.target.value)} 
                  style={{ padding: '5px', flex: 1 }}
                />
                <input 
                  type="time" 
                  value={editTime} 
                  onChange={(e) => setEditTime(e.target.value)} 
                  style={{ padding: '5px' }}
                />
                <button onClick={() => saveEdit(todo.id)} style={{ color: 'green', cursor: 'pointer' }}>Simpan</button>
                <button onClick={cancelEditing} style={{ color: 'gray', cursor: 'pointer' }}>Batal</button>
              </div>
            ) : (
              // Tampilan NORMAL
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span>{todo.task}</span>
                  {todo.due_time && (
                    <span style={{ marginLeft: '10px', fontSize: '0.85em', color: '#666', backgroundColor: '#eee', padding: '2px 6px', borderRadius: '4px' }}>
                      ⏰ {todo.due_time}
                    </span>
                  )}
                </div>
                <div>
                  <button onClick={() => startEditing(todo)} style={{ color: 'blue', cursor: 'pointer', border: 'none', background: 'none', marginRight: '10px' }}>Edit</button>
                  <button onClick={() => deleteTodo(todo.id)} style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}>Hapus</button>
                </div>
              </div>
            )}
            
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App