import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BudgetCharts = ({ budgetData, formData }) => {
  const [chartType, setChartType] = React.useState('pie');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!budgetData || budgetData.grandTotal === 0) return [];

    return [
      {
        name: 'Venue',
        value: budgetData.venue?.total || 0,
        color: '#3b82f6',
        percentage: ((budgetData.venue?.total || 0) / budgetData.grandTotal * 100).toFixed(1)
      },
      {
        name: 'Catering',
        value: budgetData.catering?.total || 0,
        color: '#10b981',
        percentage: ((budgetData.catering?.total || 0) / budgetData.grandTotal * 100).toFixed(1)
      },
      {
        name: 'Services',
        value: budgetData.services?.total || 0,
        color: '#f59e0b',
        percentage: ((budgetData.services?.total || 0) / budgetData.grandTotal * 100).toFixed(1)
      },
      {
        name: 'Miscellaneous',
        value: budgetData.miscellaneous?.total || 0,
        color: '#ef4444',
        percentage: ((budgetData.miscellaneous?.total || 0) / budgetData.grandTotal * 100).toFixed(1)
      }
    ].filter(item => item.value > 0);
  }, [budgetData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-1">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.value}: {formatCurrency(chartData[index]?.value)} ({chartData[index]?.percentage}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (!budgetData || budgetData.grandTotal === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Icon name="PieChart" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Data to Display</h3>
        <p className="text-muted-foreground">
          Complete the budget form to see visual breakdown
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border shadow-card">
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              <Icon name="PieChart" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Budget Visualization</h2>
              <p className="text-sm text-muted-foreground">Live data breakdown by category</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={chartType === 'pie' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('pie')}
              iconName="PieChart"
              iconPosition="left"
            >
              Pie Chart
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('bar')}
              iconName="BarChart3"
              iconPosition="left"
            >
              Bar Chart
            </Button>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        {chartType === 'pie' ? (
          <div>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '0.875rem' }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '0.875rem' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} animationDuration={800}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Insights Section */}
      <div className="p-6 border-t border-border bg-muted/10">
        <h3 className="font-semibold text-foreground mb-4">Budget Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chartData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.percentage}% of total</p>
                </div>
              </div>
              <p className="font-semibold text-foreground">{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cost per Guest */}
      {formData?.audienceSize > 0 && (
        <div className="p-6 border-t border-border bg-gradient-to-br from-success/10 to-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-success/10 rounded-lg">
                <Icon name="Users" size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost per Guest</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(budgetData.grandTotal / formData.audienceSize)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Guests</p>
              <p className="text-xl font-semibold text-foreground">{formData.audienceSize}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="p-6 border-t border-border">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Highest</p>
            <p className="text-sm font-semibold text-foreground">
              {chartData.length > 0 ? chartData.reduce((max, item) => item.value > max.value ? item : max).name : '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Lowest</p>
            <p className="text-sm font-semibold text-foreground">
              {chartData.length > 0 ? chartData.reduce((min, item) => item.value < min.value ? item : min).name : '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Categories</p>
            <p className="text-sm font-semibold text-foreground">{chartData.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetCharts;
