import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

const FraudChart = ({ transactions }) => {

  const fraudCount = transactions.filter(t => t.isFraud).length;
  const mediumRiskCount = transactions.filter(t => t.isMediumRisk).length;
  const safeCount = transactions.filter(t => !t.isFraud && !t.isMediumRisk).length;

  const pieData = [
    { name: 'Safe', value: safeCount, color: '#3fb158' },
    { name: 'Medium Risk', value: mediumRiskCount, color: '#f59e0b' },
    { name: 'Fraud', value: fraudCount, color: '#e53935' },
  ].filter(data => data.value > 0);

  const barData = transactions.slice(0, 10).map((t, idx) => ({
    name: t.transactionId ? t.transactionId.slice(-4) : `T${idx + 1}`,
    score: Number(((t.fraudScore || 0) * 100).toFixed(1)),
    amount: (t.amount || 0) / 1000,
  }));

  const trendData = useMemo(() => {
    const last20 = [...transactions].slice(0, 20).reverse();
    let cumulativeFraud = 0;
    return last20.map((t, idx) => {
      if (t.isFraud) cumulativeFraud++;
      return {
        name: `T${idx + 1}`,
        fraud: cumulativeFraud,
        total: idx + 1
      };
    });
  }, [transactions]);


  return (
    <>

      <div className="glass-card p-6" data-testid="fraud-pie-chart">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Transaction Status
          </h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full border border-border/40">
            Total: {transactions.length}
          </span>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>

            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(34, 40, 49, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
              itemStyle={{ color: '#fff' }}
            />

            <Legend wrapperStyle={{ color: '#fff' }} iconType="circle" />

          </PieChart>
        </ResponsiveContainer>
      </div>


      {/* Bar Chart */}
      <div className="glass-card p-6" data-testid="fraud-score-chart">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Fraud Score Analysis
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />

            <XAxis dataKey="name" stroke="#888" />

            <YAxis stroke="#888" />

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(34, 40, 49, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
              itemStyle={{ color: '#fff' }}
            />

            <Bar dataKey="score" fill="hsl(210, 60%, 45%)" name="Fraud Score (%)" />

          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart: Fraud Trends */}
      <div className="glass-card p-6 lg:col-span-2" data-testid="fraud-trend-chart">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Fraud Trends (Last 20 Transactions)
          </h3>
          <div className="flex gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3782f2]" /> Total</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#e53935]" /> Fraud</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(34, 40, 49, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                color: '#fff',
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#3782f2" 
              strokeWidth={2} 
              dot={false} 
              name="Total Transactions" 
            />
            <Line 
              type="monotone" 
              dataKey="fraud" 
              stroke="#e53935" 
              strokeWidth={3} 
              dot={{ fill: '#e53935', strokeWidth: 2, r: 4 }} 
              activeDot={{ r: 6 }}
              name="Cumulative Fraud" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default FraudChart;