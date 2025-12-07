import React, { useState } from 'react';
import { FinanceContextType } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Plus, Trash2, ShoppingBag } from 'lucide-react';

interface ExpensesProps {
  data: FinanceContextType;
}

const Expenses: React.FC<ExpensesProps> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ title: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'Lainnya', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    data.addExpense(newExpense);
    setNewExpense({ title: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'Lainnya', description: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Pengeluaran</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Catat penggunaan dana kas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} />
          Catat Pengeluaran
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-750 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="p-4 font-medium">Tanggal</th>
              <th className="p-4 font-medium">Keperluan</th>
              <th className="p-4 font-medium">Kategori</th>
              <th className="p-4 font-medium">Nominal</th>
              <th className="p-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.expenses.length > 0 ? (
              data.expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="p-4 text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">
                    {formatDate(expense.date)}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{expense.title}</div>
                    {expense.description && <div className="text-xs text-gray-400 mt-1">{expense.description}</div>}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {expense.category}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-rose-500 whitespace-nowrap">
                    - {formatCurrency(expense.amount)}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => {
                        if(window.confirm('Hapus catatan pengeluaran ini?')) data.deleteExpense(expense.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <ShoppingBag size={32} className="mb-2 opacity-20" />
                    Belum ada pengeluaran tercatat.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Catat Pengeluaran</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Keperluan</label>
                <input 
                  required
                  type="text" 
                  value={newExpense.title}
                  onChange={e => setNewExpense({...newExpense, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  placeholder="Beli Spidol, Fotocopy..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nominal</label>
                   <input 
                      required
                      type="number"
                      min="0"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({...newExpense, amount: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                   />
                </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
                   <input 
                      required
                      type="date"
                      value={newExpense.date}
                      onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                   />
                </div>
              </div>
               <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                   <select
                      value={newExpense.category}
                      onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                   >
                     <option value="Konsumsi">Konsumsi</option>
                     <option value="Perlengkapan">Perlengkapan</option>
                     <option value="Acara">Acara</option>
                     <option value="Cetak">Cetak & Dokumen</option>
                     <option value="Lainnya">Lainnya</option>
                   </select>
                </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keterangan (Opsional)</label>
                <textarea 
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none h-20"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 shadow-md transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;