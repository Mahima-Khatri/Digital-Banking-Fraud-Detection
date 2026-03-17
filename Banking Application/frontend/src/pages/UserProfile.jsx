import { useState } from 'react'
import styled from 'styled-components'
import { analystAPI } from '../services/api'
import { 
  FiUser, FiSearch, FiActivity, FiAlertTriangle, FiDollarSign,
  FiTrendingUp, FiMapPin, FiSmartphone, FiCalendar
} from 'react-icons/fi'
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

const SearchCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
`

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const FormGroup = styled.div`
  flex: 1;
  
  label {
    display: block;
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
`

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  color: var(--text-primary);
  transition: var(--transition);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(76, 110, 245, 0.1);
  }
`

const SearchButton = styled.button`
  padding: 0.875rem 2rem;
  background: var(--primary);
  border: none;
  color: white;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  
  svg {
    font-size: 1.25rem;
  }
  
  &:hover {
    background: var(--primary-dark);
    box-shadow: var(--shadow-glow);
  }
`

const ProfileCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  animation: fadeIn 0.3s ease;
`

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
`

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  font-weight: 700;
  box-shadow: var(--shadow-lg);
`

const ProfileInfo = styled.div`
  flex: 1;
  
  h3 {
    font-size: 1.5rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  .user-id {
    font-size: 0.95rem;
    color: var(--text-secondary);
    font-family: monospace;
  }
`

const RiskBadge = styled.div`
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 1rem;
  text-transform: uppercase;
  background: ${props => 
    props.$level === 'LOW' ? 'rgba(81, 207, 102, 0.2)' :
    props.$level === 'MEDIUM' ? 'rgba(255, 212, 59, 0.2)' :
    'rgba(255, 107, 107, 0.2)'
  };
  color: ${props => 
    props.$level === 'LOW' ? 'var(--success)' :
    props.$level === 'MEDIUM' ? 'var(--warning)' :
    'var(--danger)'
  };
  text-align: center;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const StatBox = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  
  .icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: ${props => props.$color ? `${props.$color}20` : 'rgba(76, 110, 245, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    
    svg {
      font-size: 1.25rem;
      color: ${props => props.$color || 'var(--primary)'};
    }
  }
  
  .label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  
  .subtext {
    font-size: 0.875rem;
    color: var(--text-tertiary);
    margin-top: 0.5rem;
  }
`

const DetailSection = styled.div`
  margin-top: 2rem;
  
  h4 {
    font-size: 1.125rem;
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    svg {
      color: var(--primary);
    }
  }
`

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`

const DetailItem = styled.div`
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: var(--radius-md);
  
  .label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }
  
  .value {
    font-size: 1rem;
    color: var(--text-primary);
    font-weight: 500;
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
    color: var(--text-tertiary);
    margin-bottom: 1rem;
    opacity: 0.5;
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

const UserProfile = () => {
  const [userId, setUserId] = useState('')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!userId.trim()) {
      toast.error('Please enter a User ID', {
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--danger)'
        }
      })
      return
    }

    setLoading(true)
    try {
      const response = await analystAPI.getUserProfile(userId)
      if (response.data.exists) {
        setProfile(response.data)
      } else {
        toast.info(response.data.message, {
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--info)'
          }
        })
        setProfile(null)
      }
    } catch (error) {
      toast.error('Error loading profile', {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Container>
      <Header>
        <h2><FiUser /> User Risk Profile</h2>
        <p>Analyze customer transaction history and behavioral patterns</p>
      </Header>

      <SearchCard>
        <SearchForm onSubmit={handleSearch}>
          <FormGroup>
            <label>Enter User ID</label>
            <Input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g., CUST001"
              disabled={loading}
            />
          </FormGroup>
          <SearchButton type="submit" disabled={loading}>
            <FiSearch />
            {loading ? 'Loading...' : 'Load Profile'}
          </SearchButton>
        </SearchForm>
      </SearchCard>

      {profile ? (
        <ProfileCard>
          <ProfileHeader>
            <Avatar>{profile.userId.charAt(0)}</Avatar>
            <ProfileInfo>
              <h3>Customer Profile</h3>
              <div className="user-id">User ID: {profile.userId}</div>
            </ProfileInfo>
            <RiskBadge $level={profile.riskLevel}>
              {profile.riskLevel} Risk
            </RiskBadge>
          </ProfileHeader>

          <StatsGrid>
            <StatBox $color="var(--primary)">
              <div className="icon">
                <FiActivity />
              </div>
              <div className="label">Total Transactions</div>
              <div className="value">{profile.totalTransactions}</div>
            </StatBox>

            <StatBox $color="var(--danger)">
              <div className="icon">
                <FiAlertTriangle />
              </div>
              <div className="label">Fraud Count</div>
              <div className="value">{profile.fraudCount}</div>
              <div className="subtext">
                {profile.fraudRate.toFixed(2)}% fraud rate
              </div>
            </StatBox>

            <StatBox $color="var(--success)">
              <div className="icon">
                <FiDollarSign />
              </div>
              <div className="label">Total Amount</div>
              <div className="value">₹{profile.totalAmount.toFixed(0)}</div>
            </StatBox>

            <StatBox $color="var(--info)">
              <div className="icon">
                <FiTrendingUp />
              </div>
              <div className="label">Avg Transaction</div>
              <div className="value">₹{profile.avgTransactionAmount.toFixed(0)}</div>
            </StatBox>
          </StatsGrid>

          <DetailSection>
            <h4><FiCalendar /> Transaction Timeline</h4>
            <DetailGrid>
              <DetailItem>
                <div className="label">First Transaction</div>
                <div className="value">{formatDate(profile.firstTransactionDate)}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Last Transaction</div>
                <div className="value">{formatDate(profile.lastTransactionDate)}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Risk Score</div>
                <div className="value">{profile.riskScore.toFixed(2)} / 100</div>
              </DetailItem>
            </DetailGrid>
          </DetailSection>

          <DetailSection>
            <h4><FiMapPin /> Behavioral Patterns</h4>
            <DetailGrid>
              <DetailItem>
                <div className="label">Common Location</div>
                <div className="value">{profile.commonLocations || 'N/A'}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Common Device</div>
                <div className="value">{profile.commonDevices || 'N/A'}</div>
              </DetailItem>
            </DetailGrid>
          </DetailSection>
        </ProfileCard>
      ) : !loading && (
        <EmptyState>
          <FiUser />
          <h3>No Profile Loaded</h3>
          <p>Enter a User ID above to view their risk profile</p>
        </EmptyState>
      )}
    </Container>
  )
}

export default UserProfile
