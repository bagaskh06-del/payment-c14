import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Student, Fee, Payment, Expense, FinanceContextType, ViewState 
} from './types';
import { generateId } from './utils';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Students from './views/Students';
import Fees from './views/Fees';
import Expenses from './views/Expenses';
import Reports from './views/Reports';
import { Menu, Moon, Sun } from 'lucide-react';

// --- Context Setup ---
const FinanceContext = createContext<FinanceContextType | null>(null);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider");
  return context;
};

// --- Mock Data ---
const initialStudents: Student[] = [
  { id: 's1', name: 'Andi Pratama', nim: '2023001', phone: '081234567890' },
  { id: 's2', name: 'Budi Santoso', nim: '2023002', phone: '081234567891' },
  { id: 's3', name: 'Citra Dewi', nim: '2023003', phone: '081234567892' },
];

const initialFees: Fee[] = [
  { id: 'f1', title: 'Kas Januari', amount: 20000, deadline: new Date().toISOString(), category: 'Wajib' },
];

// --- Main Component ---
const App: React.FC = () => {
  // State
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('finance_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });
  const [fees, setFees] = useState<Fee[]>(() => {
    const saved = localStorage.getItem('finance_fees');
    return saved ? JSON.parse(saved) : initialFees;
  });
  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('finance_payments');
    return saved ? JSON.parse(saved) : [];
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('finance_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
       return localStorage.getItem('theme') === 'dark' || 
       (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Effects for persistence
  useEffect(() => localStorage.setItem('finance_students', JSON.stringify(students)), [students]);
  useEffect(() => localStorage.setItem('finance_fees', JSON.stringify(fees)), [fees]);
  useEffect(() => localStorage.setItem('finance_payments', JSON.stringify(payments)), [payments]);
  useEffect(() => localStorage.setItem('finance_expenses', JSON.stringify(expenses)), [expenses]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Actions
  const addStudent = (s: Omit<Student, 'id'>) => setStudents([...students, { ...s, id: generateId() }]);
  const updateStudent = (s: Student) => setStudents(students.map(st => st.id === s.id ? s : st));
  const deleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
    setPayments(payments.filter(p => p.studentId !== id)); // Cleanup payments
  };

  const addFee = (f: Omit<Fee, 'id'>) => setFees([...fees, { ...f, id: generateId() }]);
  const deleteFee = (id: string) => {
    setFees(fees.filter(f => f.id !== id));
    setPayments(payments.filter(p => p.feeId !== id)); // Cleanup payments
  };

  const togglePayment = (feeId: string, studentId: string) => {
    const existing = payments.find(p => p.feeId === feeId && p.studentId === studentId);
    if (existing) {
      setPayments(payments.filter(p => p.id !== existing.id));
    } else {
      const fee = fees.find(f => f.id === feeId);
      if (fee) {
        setPayments([...payments, { 
          id: generateId(), 
          feeId, 
          studentId, 
          date: new Date().toISOString(),
          amount: fee.amount 
        }]);
      }
    }
  };

  const addExpense = (e: Omit<Expense, 'id'>) => setExpenses([...expenses, { ...e, id: generateId() }]);
  const deleteExpense = (id: string) => setExpenses(expenses.filter(e => e.id !== id));
  
  const resetData = () => {
     if(window.confirm("Apakah Anda yakin ingin mereset semua data?")) {
        localStorage.clear();
        window.location.reload();
     }
  }

  const contextValue: FinanceContextType = {
    students, fees, payments, expenses,
    addStudent, updateStudent, deleteStudent,
    addFee, deleteFee,
    togglePayment,
    addExpense, deleteExpense,
    resetData
  };

  // Render Logic
  const renderView = () => {
    switch (currentView) {
      case 'students': return <Students data={contextValue} />;
      case 'fees': return <Fees data={contextValue} />;
      case 'expenses': return <Expenses data={contextValue} />;
      case 'reports': return <Reports data={contextValue} />;
      default: return <Dashboard data={contextValue} />;
    }
  };

  return (
    <FinanceContext.Provider value={contextValue}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar 
          currentView={currentView} 
          onChangeView={setCurrentView} 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Navbar */}
          <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-4">
               <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
               >
                 <Menu size={20} />
               </button>
               <h1 className="text-xl font-semibold text-gray-800 dark:text-white capitalize md:block hidden">
                 {currentView === 'fees' ? 'Iuran & Kas' : currentView}
               </h1>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full transition-colors"
                title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Bendahara</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                </div>
                <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                  B
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-4 md:p-8 relative">
            <div className="max-w-7xl mx-auto pb-12">
               {renderView()}
            </div>
          </main>
        </div>
      </div>
    </FinanceContext.Provider>
  );
};

export default App;