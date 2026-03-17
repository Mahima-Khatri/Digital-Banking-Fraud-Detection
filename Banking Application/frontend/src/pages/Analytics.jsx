import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { hybridAPI, analystAPI } from '../services/api'
import { FiActivity, FiShield, FiTarget, FiZap, FiCheckCircle } from 'react-icons/fi'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const Container = styled.div`padding-bottom: 2rem;`

const Header = styled.div`
  margin-bottom: 2rem;
  h2 { font-size: 1.75rem; color: var(--text-primary); font-weight: 600; display: flex; align-items: center; gap: 0.75rem; }
`

const MetricsGrid = styled.div`
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 1.5rem; 
  margin-bottom: 2rem;
`

const MetricCard = styled.div`
  background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); text-align: center;
  .value { font-size: 2.2rem; font-weight: 700; color: var(--primary); margin: 0.5rem 0; }
  .label { font-size: 0.875rem; color: var(--text-secondary); font-weight: 500; }
`

const MainGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem;
  @media (max-width: 1024px) { grid-template-columns: 1fr; }
`

const AnalyticsCard = styled.div`
  background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color);
  h3 { margin-bottom: 1.5rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; }
`

const ConfusionMatrix = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: center;
  .box { 
    padding: 25px 15px; border-radius: 8px; display: flex; flex-direction: column; justify-content: center;
    .num { font-size: 1.7rem; font-weight: bold; margin-bottom: 5px; }
    .label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
  }

  .tn { background: #1a332d; color: #28a745; border: 1px solid rgba(40, 167, 69, 0.3); }
  .fp { background: #331a1a; color: #dc3545; border: 1px solid rgba(220, 53, 69, 0.3); }
  .fn { background: #331a1a; color: #dc3545; border: 1px solid rgba(220, 53, 69, 0.3); }
  .tp { background: #1a332d; color: #28a745; border: 1px solid rgba(40, 167, 69, 0.3); }
`

const Analytics = () => {

  const [analytics, setAnalytics] = useState({ totalTransactions: 0, highRisk: 0 })
  const [allTransactions, setAllTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const trainingMetrics = {
    auc: "1.000",
    precision: "99.9%",
    recall: "99.7%",
    f1: "99.8%",
    confusion: { tn: 99998, fp: 2, fn: 5, tp: 1638 }
  }

  const fetchData = async () => {
    try {
      const analyticsRes = await hybridAPI.getAnalytics()
      setAnalytics(analyticsRes.data)

      const transactionsRes = await analystAPI.getTransactions({ page: 0, size: 1000 })
      setAllTransactions(transactionsRes.data.transactions || [])

      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  /* UPDATED CHART DATA FUNCTION */
  const getDynamicModeData = () => {

    const fraudTxns = allTransactions.filter(t => t.riskLevel === 'HIGH')
    const safeTxns = allTransactions.filter(t => t.riskLevel !== 'HIGH')

    const activeModes = [...new Set(allTransactions.map(t => t.type))]

    const fraudCounts = activeModes.map(
      mode => fraudTxns.filter(t => t.type === mode).length
    )

    const safeCounts = activeModes.map(
      mode => safeTxns.filter(t => t.type === mode).length
    )

    return {
      labels: activeModes.length > 0 ? activeModes : ['UPI','IMPS','NEFT','RTGS'],
      datasets: [
        {
          label: 'Fraud',
          data: fraudCounts.length > 0 ? fraudCounts : [0,0,0,0],
          backgroundColor: '#ff4d4f',
          borderRadius: 8,
          barThickness: 22
        },
        {
          label: 'Safe',
          data: safeCounts.length > 0 ? safeCounts : [0,0,0,0],
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 8,
          barThickness: 22
        }
      ]
    }
  }

  if (loading) {
    return (
      <Container>
        <Header>
          <h2>Loading Analytics...</h2>
        </Header>
      </Container>
    )
  }

  return (
    <Container>

      <Header>
        <h2><FiShield /> Model Performance & Training Insights</h2>
      </Header>

      <MetricsGrid>

        <MetricCard>
          <FiZap size={20} color="var(--primary)" />
          <div className="value">{trainingMetrics.auc}</div>
          <div className="label">AUC Score</div>
        </MetricCard>

        <MetricCard>
          <FiTarget size={20} color="var(--success)" />
          <div className="value">{trainingMetrics.precision}</div>
          <div className="label">Precision</div>
        </MetricCard>

        <MetricCard>
          <FiActivity size={20} color="var(--warning)" />
          <div className="value">{trainingMetrics.recall}</div>
          <div className="label">Recall</div>
        </MetricCard>

        <MetricCard>
          <FiCheckCircle size={20} color="var(--primary)" />
          <div className="value">{trainingMetrics.f1}</div>
          <div className="label">F1-Score</div>
        </MetricCard>

      </MetricsGrid>

      <MainGrid>

        <AnalyticsCard>

          <h3>Confusion Matrix (Training Set)</h3>

          <p style={{fontSize:'0.8rem',color:'#FFFFFF',marginBottom:'1.5rem'}}>
            Actual vs Predicted Validation
          </p>

          <ConfusionMatrix>

            <div className="box tn">
              <span className="num">{trainingMetrics.confusion.tn.toLocaleString()}</span>
              <span className="label">True Negative</span>
            </div>

            <div className="box fp">
              <span className="num">{trainingMetrics.confusion.fp}</span>
              <span className="label">False Positive</span>
            </div>

            <div className="box fn">
              <span className="num">{trainingMetrics.confusion.fn}</span>
              <span className="label">False Negative</span>
            </div>

            <div className="box tp">
              <span className="num">{trainingMetrics.confusion.tp.toLocaleString()}</span>
              <span className="label">True Positive</span>
            </div>

          </ConfusionMatrix>

        </AnalyticsCard>

        {/* UPDATED CHART STYLE */}

        <AnalyticsCard>

          <h3>Fraud Incidents by Mode</h3>

          <div style={{height:'280px'}}>

            <Bar
              data={getDynamicModeData()}
              options={{
                maintainAspectRatio:false,
                responsive:true,
                plugins:{
                  legend:{
                    position:'top',
                    align:'end',
                    labels:{
                      color:'#cbd5e1',
                      usePointStyle:true,
                      pointStyle:'circle'
                    }
                  },
                  tooltip:{
                    backgroundColor:'#0f172a',
                    borderColor:'#334155',
                    borderWidth:1
                  }
                },
                scales:{
                  y:{
                    beginAtZero:true,
                    ticks:{
                      color:'#94a3b8'
                    },
                    grid:{
                      color:'rgba(148,163,184,0.15)'
                    }
                  },
                  x:{
                    ticks:{
                      color:'#94a3b8',
                      font:{weight:600}
                    },
                    grid:{
                      display:false
                    }
                  }
                }
              }}
            />

          </div>

        </AnalyticsCard>

      </MainGrid>

      <AnalyticsCard style={{marginTop:'1.5rem'}}>

        <div style={{display:'flex',gap:'3rem',alignItems:'center'}}>

          <div>
            <span style={{color:'var(--text-secondary)'}}>Current Session: </span>
            <span style={{fontWeight:'bold',fontSize:'1.1rem'}}>
              {analytics.totalTransactions}
            </span>
          </div>

          <div>
            <span style={{color:'var(--text-secondary)'}}>Blocked: </span>
            <span style={{fontWeight:'bold',color:'var(--danger)',fontSize:'1.1rem'}}>
              {analytics.highRisk}
            </span>
          </div>

          <div style={{
            marginLeft:'auto',
            display:'flex',
            alignItems:'center',
            gap:'0.5rem',
            color:'var(--success)'
          }}>
            <div style={{
              width:'10px',
              height:'10px',
              background:'var(--success)',
              borderRadius:'50%',
              animation:'pulse 2s infinite'
            }} />

            <span>Monitoring Live</span>

          </div>

        </div>

      </AnalyticsCard>

    </Container>
  )
}

export default Analytics