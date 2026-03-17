import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { analystAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FiBell, FiAlertTriangle, FiCheckCircle, FiClock } from 'react-icons/fi'
import { toast } from 'react-toastify'

const Container = styled.div``

const Header = styled.div`
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.75rem;
    color: var(--text-primary);
    font-weight: 600;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
      color: var(--primary);
    }
  }
  
  p {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
`

const AlertsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const AlertCard = styled.div`
  background: var(--bg-card);
  border: 2px solid ${props => 
    props.$severity === 'HIGH' ? 'var(--danger)' :
    props.$severity === 'MEDIUM' ? 'var(--warning)' :
    'var(--info)'
  };
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: var(--transition);
  animation: slideIn 0.3s ease;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: var(--shadow-lg);
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`

const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`

const AlertTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    font-size: 1.5rem;
    color: ${props => 
      props.$severity === 'HIGH' ? 'var(--danger)' :
      props.$severity === 'MEDIUM' ? 'var(--warning)' :
      'var(--info)'
    };
  }
  
  h4 {
    font-size: 1.125rem;
    color: var(--text-primary);
    font-weight: 600;
  }
`

const SeverityBadge = styled.span`
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => 
    props.$severity === 'HIGH' ? 'rgba(255, 107, 107, 0.2)' :
    props.$severity === 'MEDIUM' ? 'rgba(255, 212, 59, 0.2)' :
    'rgba(77, 171, 247, 0.2)'
  };
  color: ${props => 
    props.$severity === 'HIGH' ? 'var(--danger)' :
    props.$severity === 'MEDIUM' ? 'var(--warning)' :
    'var(--info)'
  };
`

const AlertMessage = styled.div`
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-line;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
`

const AlertFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
`

const AlertTime = styled.div`
  font-size: 0.875rem;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  
  svg {
    font-size: 1rem;
  }
`

const MarkReadButton = styled.button`
  padding: 0.5rem 1.25rem;
  background: var(--primary);
  border: none;
  color: white;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: var(--primary-dark);
    box-shadow: var(--shadow-glow);
  }
`

const EmptyState = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 4rem 2rem;
  text-align: center;
  
  svg {
    font-size: 4rem;
    color: var(--success);
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.5rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--text-secondary);
  }
`

const Alerts = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchAlerts = async () => {
    try {
      const response = await analystAPI.getAlerts()
      setAlerts(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching alerts:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (alertId) => {
    try {
      await analystAPI.markAlertRead(alertId, user.username)
      toast.success('Alert marked as read', {
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--success)'
        }
      })
      fetchAlerts()
    } catch (error) {
      toast.error('Error marking alert as read', {
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--danger)'
        }
      })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <Container>
        <Header>
          <h2><FiBell /> Real-Time Alerts</h2>
          <p>Loading alerts...</p>
        </Header>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <h2><FiBell /> Real-Time Alerts</h2>
        <p>Monitor high-risk transactions and suspicious activities</p>
      </Header>

      {alerts.length === 0 ? (
        <EmptyState>
          <FiCheckCircle />
          <h3>All Clear!</h3>
          <p>No unread alerts at the moment</p>
        </EmptyState>
      ) : (
        <AlertsGrid>
          {alerts.map((alert) => (
            <AlertCard key={alert.id} $severity={alert.severity}>
              <AlertHeader>
                <AlertTitle $severity={alert.severity}>
                  <FiAlertTriangle />
                  <h4>{alert.alertType.replace(/_/g, ' ')}</h4>
                </AlertTitle>
                <SeverityBadge $severity={alert.severity}>
                  {alert.severity}
                </SeverityBadge>
              </AlertHeader>

              <AlertMessage>{alert.message}</AlertMessage>

              <AlertFooter>
                <AlertTime>
                  <FiClock />
                  {formatDate(alert.createdAt)}
                </AlertTime>
                <MarkReadButton onClick={() => handleMarkAsRead(alert.id)}>
                  <FiCheckCircle />
                  Mark as Read
                </MarkReadButton>
              </AlertFooter>
            </AlertCard>
          ))}
        </AlertsGrid>
      )}
    </Container>
  )
}

export default Alerts
