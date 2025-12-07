import React, { useMemo } from 'react';
import { FinanceContextType } from '../types';
import { formatCurrency } from '../utils';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DashboardProps {
  data: FinanceContextType;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { students, fees, payments, expenses } = data;

  const stats = useMemo(() => {
    // 1. Total Income (Actually collected)
    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);

    // 2. Total Expense
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 3. Current Balance
    const balance = totalIncome - totalExpense;

    // 4. Potential Arrears (Total needed - Total collected)
    const totalPotential = fees.reduce((sum, f) => sum + (f.amount * students.length), 0);
    const arrears = totalPotential - totalIncome;

    return { totalIncome, totalExpense, balance, arrears };
  }, [students, fees, payments, expenses]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthIncome = payments
        .filter(p => {
          const d = new Date(p.date);
          return d.getMonth() === index && d.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + p.amount, 0);

      const monthExpense = expenses
        .filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === index && d.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        name: month,
        Pemasukan: monthIncome,
        Pengeluaran: monthExpense,
      };
    });
  }, [payments, expenses]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    return Object.keys(cats).map(key => ({ name: key, value: cats[key] }));
  }, [expenses]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Saldo Kas" 
          value={stats.balance} 
          icon={<DollarSign className="text-white" size={24} />}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Total Pemasukan" 
          value={stats.totalIncome} 
          icon={<TrendingUp className="text-white" size={24} />}
          color="bg-blue-500"
        />
        <StatCard 
          title="Total Pengeluaran" 
          value={stats.totalExpense} 
          icon={<TrendingDown className="text-white" size={24} />}
          color="bg-rose-500"
        />
        <StatCard 
          title="Total Tunggakan" 
          value={stats.arrears} 
          icon={<AlertCircle className="text-white" size={24} />}
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Arus Kas Bulanan (Tahun Ini)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="Pemasukan" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
           <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Distribusi Pengeluaran</h3>
           {categoryData.length > 0 ? (
             <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
           ) : (
             <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                <TrendingDown size={48} className="mb-2 opacity-20" />
                <p>Belum ada pengeluaran</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(value)}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color} shadow-lg shadow-${color}/30`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;