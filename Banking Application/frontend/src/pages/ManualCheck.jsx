import { useState } from 'react'
import styled from 'styled-components'
import { hybridAPI } from '../services/api'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { 
  FiDollarSign, FiUser, FiMapPin, FiSmartphone, FiShoppingBag,
  FiCreditCard, FiAlertCircle, FiCheckCircle, FiClock
} from 'react-icons/fi'

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const Header = styled.div`
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.75rem;
    color: var(--text-primary);
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
`

const FormCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const Section = styled.div`
  h3 {
    font-size: 1.125rem;
    color: var(--primary-light);
    font-weight: 600;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    svg {
      font-size: 1.25rem;
    }
  }
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: var(--primary);
  }
`

const Input = styled.input`
  padding: 0.875rem 1rem;
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

const Select = styled.select`
  padding: 0.875rem 1rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  color: var(--text-primary);
  transition: var(--transition);
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    background: var(--bg-secondary);
    box-shadow: 0 0 0 3px rgba(76, 110, 245, 0.1);
  }
  
  option {
    background: var(--bg-card);
    color: var(--text-primary);
  }
`

const HelpText = styled.small`
  font-size: 0.8rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
`

const BalancePreview = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-top: 1rem;
  
  h4 {
    font-size: 1rem;
    color: var(--text-primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .balance-row {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-color);
    
    &:last-child {
      border-bottom: none;
    }
    
    span:first-child {
      color: var(--text-secondary);
    }
    
    span:last-child {
      font-weight: 600;
      color: var(--text-primary);
      
      &.warning {
        color: var(--danger);
      }
      
      &.success {
        color: var(--success);
      }
    }
  }
`

const SubmitButton = styled.button`
  padding: 1rem 2rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  
  svg {
    font-size: 1.5rem;
  }
  
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const ResultCard = styled.div`
  background: var(--bg-card);
  border: 2px solid ${props => 
    props.$risk === 'LOW' ? 'var(--success)' :
    props.$risk === 'MEDIUM' ? 'var(--warning)' :
    'var(--danger)'
  };
  border-radius: var(--radius-lg);
  padding: 2rem;
  animation: fadeIn 0.3s ease;
  
  h3 {
    font-size: 1.5rem;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
      font-size: 2rem;
      color: ${props => 
        props.$risk === 'LOW' ? 'var(--success)' :
        props.$risk === 'MEDIUM' ? 'var(--warning)' :
        'var(--danger)'
      };
    }
  }
`

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const ResultItem = styled.div`
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: var(--radius-md);
  
  .label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }
  
  .value {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
  }
`

const ReasonsBox = styled.div`
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  
  h4 {
    font-size: 1rem;
    color: var(--text-primary);
    margin-bottom: 1rem;
  }
  
  ul {
    list-style: none;
    padding: 0;
    
    li {
      padding: 0.75rem;
      background: var(--bg-card);
      border-radius: var(--radius-sm);
      margin-bottom: 0.5rem;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      &::before {
        content: '⚠️';
        font-size: 1rem;
      }
    }
  }
`

const ManualCheck = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [formData, setFormData] = useState({
    type: 'PAYMENT',
    amount: '',
    senderAccountId: '',
    receiverAccountId: '',
    senderCurrentBalance: '',
    receiverCurrentBalance: '',
    userId: '',
    location: '',
    device: '',
    merchantName: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const calculateExpectedBalances = () => {
    const amount = parseFloat(formData.amount) || 0
    const senderCurrent = parseFloat(formData.senderCurrentBalance) || 0
    const receiverCurrent = parseFloat(formData.receiverCurrentBalance) || 0
    
    let expectedSender = senderCurrent
    let expectedReceiver = receiverCurrent
    
    if (formData.type === 'TRANSFER' || formData.type === 'PAYMENT' || 
        formData.type === 'CASH_OUT' || formData.type === 'DEBIT') {
      expectedSender = senderCurrent - amount
    }
    
    if (formData.type === 'TRANSFER' || formData.type === 'PAYMENT' || formData.type === 'CASH_OUT') {
      expectedReceiver = receiverCurrent + amount
    }
    
    return { expectedSender, expectedReceiver }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await hybridAPI.checkTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
        senderCurrentBalance: parseFloat(formData.senderCurrentBalance),
        receiverCurrentBalance: parseFloat(formData.receiverCurrentBalance)
      })
      
      setResult(response.data)
      toast.success('Transaction analyzed successfully!', {
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--success)'
        }
      })
    } catch (error) {
      toast.error('Error analyzing transaction', {
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--danger)'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const { expectedSender, expectedReceiver } = calculateExpectedBalances()

  return (
    <Container>
      <Header>
        <h2>Transaction Simulation</h2>
        <p>Test new transaction payloads for fraud detection</p>
      </Header>

      <FormCard>
        <Form onSubmit={handleSubmit}>
          <Section>
            <h3><FiDollarSign /> Transaction Details</h3>
            <FormRow>
              <FormGroup>
                <Label>Transaction Type</Label>
                <Select name="type" value={formData.type} onChange={handleChange} required>
                  <option value="PAYMENT">Payment</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="CASH_OUT">Cash Out</option>
                  <option value="DEBIT">Debit</option>
                  <option value="CASH_IN">Cash In</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label><FiDollarSign /> Amount (₹)</Label>
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="e.g., 50000"
                  step="0.01"
                  min="0.01"
                  required
                />
                <HelpText>Must be positive, max ₹10,000,000</HelpText>
              </FormGroup>
            </FormRow>
          </Section>

          <Section>
            <h3><FiCreditCard /> Account Information</h3>
            <FormRow>
              <FormGroup>
                <Label>Source Account ID</Label>
                <Input
                  type="text"
                  name="senderAccountId"
                  value={formData.senderAccountId}
                  onChange={handleChange}
                  placeholder="e.g., ACC1234567890"
                  minLength="3"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Destination Account ID</Label>
                <Input
                  type="text"
                  name="receiverAccountId"
                  value={formData.receiverAccountId}
                  onChange={handleChange}
                  placeholder="e.g., ACC9876543210"
                  minLength="3"
                  required
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>Source Current Balance</Label>
                <Input
                  type="number"
                  name="senderCurrentBalance"
                  value={formData.senderCurrentBalance}
                  onChange={handleChange}
                  placeholder="e.g., 100000"
                  step="0.01"
                  min="0"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Destination Current Balance</Label>
                <Input
                  type="number"
                  name="receiverCurrentBalance"
                  value={formData.receiverCurrentBalance}
                  onChange={handleChange}
                  placeholder="e.g., 50000"
                  step="0.01"
                  min="0"
                  required
                />
              </FormGroup>
            </FormRow>

            {formData.amount && formData.senderCurrentBalance && (
              <BalancePreview>
                <h4>📊 Expected Balances After Transaction</h4>
                <div className="balance-row">
                  <span>Sender Balance:</span>
                  <span className={expectedSender < 0 ? 'warning' : 'success'}>
                    ₹{expectedSender.toFixed(2)}
                    {expectedSender < 0 && ' ⚠️ INSUFFICIENT FUNDS'}
                  </span>
                </div>
                <div className="balance-row">
                  <span>Receiver Balance:</span>
                  <span className="success">₹{expectedReceiver.toFixed(2)}</span>
                </div>
              </BalancePreview>
            )}
          </Section>

          <Section>
            <h3><FiUser /> User & Behavioral Information</h3>
            <FormRow>
              <FormGroup>
                <Label><FiUser /> User ID</Label>
                <Input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="e.g., CUST001"
                  minLength="3"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label><FiMapPin /> Location</Label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Mumbai"
                  minLength="2"
                  required
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label><FiSmartphone /> Device</Label>
                <Input
                  type="text"
                  name="device"
                  value={formData.device}
                  onChange={handleChange}
                  placeholder="e.g., Android"
                  minLength="2"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label><FiShoppingBag /> Merchant Name</Label>
                <Input
                  type="text"
                  name="merchantName"
                  value={formData.merchantName}
                  onChange={handleChange}
                  placeholder="e.g., Amazon"
                  minLength="2"
                  required
                />
              </FormGroup>
            </FormRow>
          </Section>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Analyzing...' : 'Check Transaction'}
          </SubmitButton>
        </Form>
      </FormCard>

      {result && (
        <ResultCard $risk={result.riskLevel}>
          <h3>
            {result.riskLevel === 'LOW' ? <FiCheckCircle /> :
             result.riskLevel === 'MEDIUM' ? <FiClock /> :
             <FiAlertCircle />}
            Transaction Result
          </h3>
          
          <ResultGrid>
            <ResultItem>
              <div className="label">Transaction ID</div>
              <div className="value">{result.transactionId}</div>
            </ResultItem>
            <ResultItem>
              <div className="label">ML Score</div>
              <div className="value">{(result.mlScore * 100).toFixed(2)}%</div>
            </ResultItem>
            <ResultItem>
              <div className="label">Rule Score</div>
              <div className="value">{(result.ruleBasedScore * 100).toFixed(2)}%</div>
            </ResultItem>
            <ResultItem>
              <div className="label">Combined Score</div>
              <div className="value">{result.combinedPercentage.toFixed(2)}%</div>
            </ResultItem>
            <ResultItem>
              <div className="label">Risk Level</div>
              <div className="value">{result.riskLevel}</div>
            </ResultItem>
            <ResultItem>
              <div className="label">Status</div>
              <div className="value">{result.status}</div>
            </ResultItem>
          </ResultGrid>

          {result.reasons && result.reasons.length > 0 && (
            <ReasonsBox>
              <h4>Fraud Indicators</h4>
              <ul>
                {result.reasons.map((reason, index) => (
                  <li key={index}>{reason.reason}</li>
                ))}
              </ul>
            </ReasonsBox>
          )}
        </ResultCard>
      )}
    </Container>
  )
}

export default ManualCheck
