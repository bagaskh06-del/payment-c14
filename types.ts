export interface Student {
  id: string;
  name: string;
  nim: string;
  phone: string;
}

export interface Fee {
  id: string;
  title: string;
  amount: number;
  deadline: string; // ISO Date string
  category: string;
}

export interface Payment {
  id: string;
  feeId: string;
  studentId: string;
  date: string;
  amount: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
}

export type ViewState = 'dashboard' | 'students' | 'fees' | 'expenses' | 'reports';

export interface FinanceContextType {
  students: Student[];
  fees: Fee[];
  payments: Payment[];
  expenses: Expense[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  addFee: (fee: Omit<Fee, 'id'>) => void;
  deleteFee: (id: string) => void;
  togglePayment: (feeId: string, studentId: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  resetData: () => void;
}
