import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import './App.css'

interface UserForm {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}

function App() {
  const [dbStatus, setDbStatus] = useState('Desconocido')
  const [dbVersion, setDbVersion] = useState<string | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [createdMessage, setCreatedMessage] = useState<string | null>(null)
  const [form, setForm] = useState<UserForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'usuario',
  })

  useEffect(() => {
    checkDatabaseConnection()
  }, [])

  async function checkDatabaseConnection() {
    setLoadingStatus(true)
    try {
      const response = await fetch('http://localhost:8000/test-db')
      const data = await response.json()
      if (response.ok && data.database_status === 'connected') {
        setDbStatus('Conectada')
        setDbVersion(data.version ?? null)
      } else {
        setDbStatus('Error')
        setDbVersion(null)
      }
    } catch (error) {
      setDbStatus('Error')
      setDbVersion(null)
    } finally {
      setLoadingStatus(false)
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreatedMessage(`Usuario creado: ${form.firstName} ${form.lastName} (${form.email})`)
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'usuario',
    })
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">CRM Electoral</p>
          <h1>Panel de administración</h1>
          <p className="subtitle">
            Crea usuarios de la aplicación y verifica el acceso a la base de datos.
          </p>
        </div>
        <div className="status-card">
          <span className="status-label">Estado base de datos</span>
          <strong className={dbStatus === 'Conectada' ? 'status-ok' : 'status-error'}>{dbStatus}</strong>
          <p>{loadingStatus ? 'Verificando conexión...' : dbVersion ? `Versión: ${dbVersion}` : 'No hay versión disponible'}</p>
          <button onClick={checkDatabaseConnection} disabled={loadingStatus}>
            {loadingStatus ? 'Actualizando...' : 'Revisar conexión'}
          </button>
        </div>
      </section>

      <section className="card create-user-card">
        <div className="card-header">
          <div>
            <h2>Crear nuevo usuario</h2>
            <p>Registra un usuario que podrá iniciar sesión en el CRM electoral.</p>
          </div>
        </div>

        <form onSubmit={handleCreateUser} className="user-form">
          <div className="field-row">
            <label>
              Nombre
              <input name="firstName" value={form.firstName} onChange={handleChange} required />
            </label>
            <label>
              Apellido
              <input name="lastName" value={form.lastName} onChange={handleChange} required />
            </label>
          </div>

          <div className="field-row">
            <label>
              Correo electrónico
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              Contraseña
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </label>
          </div>

          <label className="field-single">
            Rol de usuario
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="usuario">Usuario</option>
              <option value="administrador">Administrador</option>
            </select>
          </label>

          <div className="actions-row">
            <button type="submit">Crear usuario</button>
            <button type="button" className="secondary" onClick={() => setCreatedMessage(null)}>
              Limpiar mensaje
            </button>
          </div>
        </form>

        {createdMessage ? <div className="toast">{createdMessage}</div> : null}
      </section>
    </main>
  )
}

export default App
