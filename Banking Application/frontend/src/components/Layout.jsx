import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { analystAPI } from '../services/api'
import { 
  FiHome, FiSearch, FiList, FiBell, FiUser, FiLogOut, FiMenu, FiX,
  FiSun, FiMoon, FiBarChart2
} from 'react-icons/fi'
import styled from 'styled-components'

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
`

const Sidebar = styled.aside`
  width: ${props => props.$isOpen ? '260px' : '80px'};
  background: var(--bg-secondary);
  box-shadow: var(--shadow-lg);
  transition: var(--transition);
  position: fixed;
  height: 100vh;
  z-index: 100;
  overflow-y: auto;
  border-right: 1px solid var(--border-color);

  @media (max-width: 768px) {
    width: ${props => props.$isOpen ? '260px' : '0'};
  }
`

const SidebarHeader = styled.div`
  padding: 1.5rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-primary);
  
  span {
    font-size: 1.5rem;
    filter: drop-shadow(0 0 10px rgba(76, 110, 245, 0.5));
  }
`

const BrandName = styled.div`
  display: flex;
  flex-direction: column;
  
  .main {
    font-size: 1rem;
    font-weight: 700;
    color: var(--primary-light);
  }
  
  .sub {
    font-size: 0.7rem;
    color: var(--text-tertiary);
    font-weight: 400;
  }
`

const Nav = styled.nav`
  padding: 1rem 0;
`

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: var(--transition);
  position: relative;
  margin: 0.25rem 0.75rem;
  border-radius: var(--radius-md);

  &:hover {
    background: var(--bg-hover);
    color: var(--primary-light);
  }

  &.active {
    background: rgba(76, 110, 245, 0.15);
    color: var(--primary-light);
    font-weight: 600;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 60%;
      width: 3px;
      background: var(--primary);
      border-radius: 0 2px 2px 0;
    }
  }

  svg {
    font-size: 1.25rem;
    min-width: 1.25rem;
  }

  span {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    white-space: nowrap;
  }
`

const Badge = styled.span`
  background: var(--danger);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
  margin-left: auto;
  min-width: 20px;
  text-align: center;
`

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.$sidebarOpen ? '260px' : '80px'};
  transition: var(--transition);
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`

const Header = styled.header`
  background: var(--bg-secondary);
  padding: 1.25rem 2rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border-color);
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const MenuToggle = styled.button`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: var(--transition);

  &:hover {
    background: var(--bg-hover);
    border-color: var(--primary);
    color: var(--primary-light);
  }
`

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  color: var(--text-primary);
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const IconButton = styled.button`
  position: relative;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem;
  border-radius: var(--radius-md);
  transition: var(--transition);
  width: 40px;
  height: 40px;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--primary);
    color: var(--primary-light);
  }
`

const NotificationBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--danger);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: bold;
  min-width: 18px;
  text-align: center;
  animation: pulse 2s ease-in-out infinite;
`

const NotificationDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 380px;
  max-height: 500px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  z-index: 1000;
  animation: slideDown 0.2s ease;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    width: 320px;
    right: -80px;
  }
`

const DropdownHeader = styled.div`
  padding: 1rem 1.25rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h4 {
    font-size: 1rem;
    color: var(--text-primary);
    font-weight: 600;
  }
  
  span {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
`

const NotificationList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }
`

const NotificationItem = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: var(--bg-hover);
  }
  
  &:last-child {
    border-bottom: none;
  }
`

const NotificationTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const SeverityDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => 
    props.$severity === 'HIGH' ? 'var(--danger)' :
    props.$severity === 'MEDIUM' ? 'var(--warning)' :
    'var(--info)'
  };
`

const NotificationMessage = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const NotificationTime = styled.div`
  font-size: 0.75rem;
  color: var(--text-tertiary);
`

const EmptyNotifications = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--text-secondary);
  
  svg {
    font-size: 3rem;
    color: var(--success);
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.875rem;
  }
`

const ViewAllButton = styled(Link)`
  display: block;
  padding: 0.875rem;
  text-align: center;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
  color: var(--primary-light);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: var(--transition);
  
  &:hover {
    background: var(--bg-hover);
  }
`

const RoleBadge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  background: ${props => props.$role === 'ADMIN' ? 
    'linear-gradient(135deg, #ff6b6b 0%, #f03e3e 100%)' : 
    'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)'};
  color: white;
  box-shadow: ${props => props.$role === 'ADMIN' ? 
    '0 4px 12px rgba(255, 107, 107, 0.3)' : 
    '0 4px 12px rgba(81, 207, 102, 0.3)'};
`

const UserName = styled.span`
  font-weight: 500;
  color: var(--text-secondary);

  @media (max-width: 768px) {
    display: none;
  }
`

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background: rgba(255, 107, 107, 0.1);
  border: 2px solid var(--danger);
  color: var(--danger);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: var(--danger);
    color: white;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  }
`

const ContentArea = styled.div`
  padding: 2rem;
  animation: fadeIn 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [alertCount, setAlertCount] = useState(0)
  const [alerts, setAlerts] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const notificationRef = useRef(null)

  useEffect(() => {
    // Fetch alerts
    const fetchAlerts = async () => {
      try {
        const response = await analystAPI.getAlerts()
        setAlerts(response.data)
        setAlertCount(response.data.length)
      } catch (error) {
        console.error('Error fetching alerts:', error)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    //{ path: '/manual-check', icon: FiSearch, label: 'Manual Check' },
    { path: '/history', icon: FiList, label: 'History' },
    { path: '/alerts', icon: FiBell, label: 'Alerts', badge: alertCount },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/profile', icon: FiUser, label: 'Profile' }
  ]

  const getPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname)
    return item ? item.label : 'Fraud Detection System'
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now - date) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const handleNotificationClick = (alertId) => {
    setShowNotifications(false)
    navigate('/alerts')
  }

  return (
    <LayoutContainer>
      <Sidebar $isOpen={sidebarOpen}>
        <SidebarHeader>
          <Logo>
            <span>🛡️</span>
            {sidebarOpen && (
              <BrandName>
                <div className="main">SecurePay</div>
                <div className="sub">Monitor & Alert</div>
              </BrandName>
            )}
          </Logo>
        </SidebarHeader>
        <Nav>
          {navItems.map(item => (
            <NavItem
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
              $isOpen={sidebarOpen}
            >
              <item.icon />
              <span>{item.label}</span>
              {item.badge > 0 && sidebarOpen && <Badge>{item.badge}</Badge>}
            </NavItem>
          ))}
        </Nav>
      </Sidebar>

      <MainContent $sidebarOpen={sidebarOpen}>
        <Header>
          <HeaderLeft>
            <MenuToggle onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </MenuToggle>
            <HeaderTitle>{getPageTitle()}</HeaderTitle>
          </HeaderLeft>
          <UserInfo>
            <div style={{ position: 'relative' }} ref={notificationRef}>
              <IconButton onClick={() => setShowNotifications(!showNotifications)}>
                <FiBell />
                {alertCount > 0 && <NotificationBadge>{alertCount}</NotificationBadge>}
              </IconButton>
              
              {showNotifications && (
                <NotificationDropdown>
                  <DropdownHeader>
                    <h4>Notifications</h4>
                    <span>{alertCount} new</span>
                  </DropdownHeader>
                  
                  {alerts.length === 0 ? (
                    <EmptyNotifications>
                      <FiBell />
                      <p>No new notifications</p>
                    </EmptyNotifications>
                  ) : (
                    <>
                      <NotificationList>
                        {alerts.slice(0, 5).map((alert) => (
                          <NotificationItem 
                            key={alert.id}
                            onClick={() => handleNotificationClick(alert.id)}
                          >
                            <NotificationTitle>
                              <SeverityDot $severity={alert.severity} />
                              {alert.alertType.replace(/_/g, ' ')}
                            </NotificationTitle>
                            <NotificationMessage>
                              {alert.message}
                            </NotificationMessage>
                            <NotificationTime>
                              {formatTimeAgo(alert.createdAt)}
                            </NotificationTime>
                          </NotificationItem>
                        ))}
                      </NotificationList>
                      <ViewAllButton to="/alerts">
                        View All Notifications
                      </ViewAllButton>
                    </>
                  )}
                </NotificationDropdown>
              )}
            </div>
            
            <IconButton onClick={toggleTheme} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              {isDark ? <FiSun /> : <FiMoon />}
            </IconButton>
            
            <RoleBadge $role={user?.role}>{user?.role}</RoleBadge>
            {/* <UserName>{user?.fullName}</UserName> */}
            <LogoutButton onClick={logout}>
              <FiLogOut />
              Logout
            </LogoutButton>
          </UserInfo>
        </Header>
        <ContentArea>{children}</ContentArea>
      </MainContent>
    </LayoutContainer>
  )
}

export default Layout
