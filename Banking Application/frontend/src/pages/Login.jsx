import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { FiShield, FiUser, FiLock } from 'react-icons/fi'

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(76, 110, 245, 0.1) 0%, transparent 70%);
    animation: pulse 8s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
`

const LoginBox = styled.div`
  background: var(--bg-card);
  padding: 3rem;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 450px;
  border: 1px solid var(--border-color);
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.6s ease;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  
  svg {
    font-size: 4rem;
    color: var(--primary);
    filter: drop-shadow(0 0 20px rgba(76, 110, 245, 0.5));
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  h1 {
    font-size: 1.75rem;
    color: var(--text-primary);
    margin-top: 1rem;
    font-weight: 600;
  }
  
  p {
    color: var(--text-secondary);
    margin-top: 0.5rem;
    font-size: 0.95rem;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-left: 0.25rem;
`

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  svg {
    position: absolute;
    left: 1rem;
    color: var(--text-tertiary);
    font-size: 1.25rem;
    transition: var(--transition);
  }

  &:focus-within svg {
    color: var(--primary);
  }
`

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  color: var(--text-primary);
  transition: var(--transition);
  
  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--primary);
    background: var(--bg-secondary);
    box-shadow: 0 0 0 3px rgba(76, 110, 245, 0.1);
  }
`

const Button = styled.button`
  padding: 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 0.5rem;
  
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const DemoAccounts = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  
  h3 {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
    font-weight: 600;
  }
  
  p {
    font-size: 0.875rem;
    color: var(--text-tertiary);
    margin: 0.5rem 0;
    font-family: 'Courier New', monospace;
    
    strong {
      color: var(--primary-light);
    }
  }
`

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = login(username, password)
    
    if (result.success) {
      toast.success('🎉 Welcome back!', {
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)'
        }
      })
      navigate('/dashboard')
    } else {
      toast.error('❌ ' + (result.error || 'Invalid credentials'), {
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--danger)'
        }
      })
    }
    
    setLoading(false)
  }

  return (
    <LoginContainer>
      <LoginBox>
        <Logo>
          <FiShield />
          <h1>Welcome Back</h1>
          <p>Sign in to access the Fraud Detection System</p>
        </Logo>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Username</Label>
            <InputWrapper>
              <FiUser />
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <Label>Password</Label>
            <InputWrapper>
              <FiLock />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </InputWrapper>
          </FormGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Form>


      </LoginBox>
    </LoginContainer>
  )
}

export default Login
