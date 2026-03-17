import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { analystAPI } from '../services/api'
import { 
  FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiEye 
} from 'react-icons/fi'

const Container = styled.div``

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

const FilterBar = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
`

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
  
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
  padding: 0.75rem 1rem;
  padding-left: 2.5rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  color: var(--text-primary);
  transition: var(--transition);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(76, 110, 245, 0.1);
  }
`

const SearchWrapper = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
    font-size: 1.125rem;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(76, 110, 245, 0.1);
  }
  
  option {
    background: var(--bg-card);
  }
`

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$secondary ? 'var(--bg-tertiary)' : 'var(--primary)'};
  border: 1px solid ${props => props.$secondary ? 'var(--border-color)' : 'var(--primary)'};
  color: ${props => props.$secondary ? 'var(--text-primary)' : 'white'};
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.$secondary ? 'var(--bg-hover)' : 'var(--primary-dark)'};
    transform: translateY(-1px);
  }
`

const TableCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  thead {
    background: var(--bg-tertiary);
    
    th {
      padding: 1rem;
      text-align: left;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border-color);
    }
  }
  
  tbody {
    tr {
      border-bottom: 1px solid var(--border-color);
      transition: var(--transition);
      
      &:hover {
        background: var(--bg-tertiary);
      }
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    td {
      padding: 1rem;
      color: var(--text-primary);
      font-size: 0.95rem;
    }
  }
`

const Badge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    if (props.$type === 'LOW') return `
      background: rgba(81, 207, 102, 0.2);
      color: var(--success);
    `
    if (props.$type === 'MEDIUM') return `
      background: rgba(255, 212, 59, 0.2);
      color: var(--warning);
    `
    if (props.$type === 'HIGH') return `
      background: rgba(255, 107, 107, 0.2);
      color: var(--danger);
    `
    if (props.$type === 'APPROVED') return `
      background: rgba(81, 207, 102, 0.2);
      color: var(--success);
    `
    if (props.$type === 'HOLD') return `
      background: rgba(255, 212, 59, 0.2);
      color: var(--warning);
    `
    if (props.$type === 'BLOCKED' || props.$type === 'ESCALATED') return `
      background: rgba(255, 107, 107, 0.2);
      color: var(--danger);
    `
  }}
`

const ViewButton = styled.button`
  padding: 0.5rem 1rem;
  background: var(--primary);
  border: none;
  color: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  
  &:hover {
    background: var(--primary-dark);
    box-shadow: var(--shadow-glow);
  }
`

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  
  .page-info {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
  
  .page-buttons {
    display: flex;
    gap: 0.5rem;
  }
`

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  
  &:hover:not(:disabled) {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const EmptyState = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);
  
  svg {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }
`

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState({
    search: '',
    riskLevel: '',
    status: ''
  })

  const fetchTransactions = async (page = 0) => {
    setLoading(true)
    try {
      const params = {
        page,
        size: 20,
        ...filters
      }
      const response = await analystAPI.getTransactions(params)
      setTransactions(response.data.transactions)
      setCurrentPage(response.data.currentPage)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const applyFilters = () => {
    fetchTransactions(0)
  }

  const clearFilters = () => {
    setFilters({ search: '', riskLevel: '', status: '' })
    setTimeout(() => fetchTransactions(0), 100)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Container>
      <Header>
        <h2>Transaction History</h2>
        <p>View and analyze all processed transactions</p>
      </Header>

      <FilterBar>
        <FilterGroup style={{ flex: 2 }}>
          <label>Search</label>
          <SearchWrapper>
            <FiSearch />
            <Input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by Transaction ID or User ID..."
            />
          </SearchWrapper>
        </FilterGroup>

        <FilterGroup>
          <label>Risk Level</label>
          <Select name="riskLevel" value={filters.riskLevel} onChange={handleFilterChange}>
            <option value="">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <label>Status</label>
          <Select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="HOLD">On Hold</option>
            <option value="BLOCKED">Blocked</option>
            <option value="ESCALATED">Escalated</option>
          </Select>
        </FilterGroup>

        <Button onClick={applyFilters}>
          <FiFilter />
          Apply
        </Button>

        <Button $secondary onClick={clearFilters}>
          Clear
        </Button>
      </FilterBar>

      <TableCard>
        {loading ? (
          <EmptyState>
            <div>Loading transactions...</div>
          </EmptyState>
        ) : transactions.length === 0 ? (
          <EmptyState>
            <FiSearch />
            <h3>No transactions found</h3>
            <p>Try adjusting your filters</p>
          </EmptyState>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>User ID</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.transactionId}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {txn.transactionId}
                    </td>
                    <td>{txn.type}</td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{txn.amount?.toFixed(2)}
                    </td>
                    <td>{txn.userId || 'N/A'}</td>
                    <td>
                      <Badge $type={txn.riskLevel}>{txn.riskLevel}</Badge>
                    </td>
                    <td>
                      <Badge $type={txn.status}>{txn.status}</Badge>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {formatDate(txn.transactionTime)}
                    </td>
                    <td>
                      <ViewButton>
                        <FiEye />
                        View
                      </ViewButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Pagination>
              <div className="page-info">
                Page {currentPage + 1} of {totalPages} ({transactions.length} transactions)
              </div>
              <div className="page-buttons">
                <PageButton
                  onClick={() => fetchTransactions(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <FiChevronLeft />
                  Previous
                </PageButton>
                <PageButton
                  onClick={() => fetchTransactions(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                  <FiChevronRight />
                </PageButton>
              </div>
            </Pagination>
          </>
        )}
      </TableCard>
    </Container>
  )
}

export default TransactionHistory
