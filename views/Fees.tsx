import React, { useState } from 'react';
import { FinanceContextType, Fee } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

interface FeesProps {
  data: FinanceContextType;
}

const Fees: React.FC<FeesProps> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedFeeId, setExpandedFeeId] = useState<string | null>(null);
  const [newFee, setNewFee] = useState({ title: '', amount: 0, deadline: '', category: 'Wajib' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    data.addFee(newFee);
    setNewFee({ title: '', amount: 0, deadline: '', category: 'Wajib' });
    setIsModalOpen(false);
  };

  const getPaymentStatus = (feeId: string, studentId: string) => {
    return data.payments.some(p => p.feeId === feeId && p.studentId === studentId);
  };

  const getFeeStats = (feeId: string) => {
    const paidCount = data.payments.filter(p => p.feeId === feeId).length;
    const totalStudents = data.students.length;
    const percent = totalStudents === 0 ? 0 : Math.round((paidCount / totalStudents) * 100);
    return { paidCount, totalStudents, percent };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Daftar Iuran</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Kelola tagihan dan pembayaran mahasiswa</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} />
          Buat Iuran
        </button>
      </div>

      <div className="grid gap-4">
        {data.fees.map((fee) => {
          const stats = getFeeStats(fee.id);
          const isExpanded = expandedFeeId === fee.id;
          const isOverdue = new Date(fee.deadline) < new Date();

          return (
            <div key={fee.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                onClick={() => setExpandedFeeId(isExpanded ? null : fee.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white shadow-sm ${
                    fee.category === 'Wajib' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    {fee.category.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{fee.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="font-medium text-primary-600 dark:text-primary-400">{formatCurrency(fee.amount)}</span>
                      <span>•</span>
                      <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                         <Calendar size={14} /> {formatDate(fee.deadline)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {stats.paidCount} / {stats.totalStudents} Bayar
                    </div>
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${stats.percent}%` }}
                      ></div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">Status Pembayaran Mahasiswa</h4>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(window.confirm('Hapus item iuran ini? Semua data pembayaran terkait akan hilang.')) {
                            data.deleteFee(fee.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Hapus Iuran
                      </button>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto no-scrollbar">
                      {data.students.map(student => {
                        const isPaid = getPaymentStatus(fee.id, student.id);
                        return (
                          <div 
                            key={student.id} 
                            onClick={() => data.togglePayment(fee.id, student.id)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                              isPaid 
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                                : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:border-primary-400'
                            }`}
                          >
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{student.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{student.nim}</p>
                            </div>
                            {isPaid ? (
                              <CheckCircle2 className="text-green-500" size={20} />
                            ) : (
                              <Circle className="text-gray-300 dark:text-gray-500" size={20} />
                            )}
                          </div>
                        );
                      })}
                   </div>
                </div>
              )}
            </div>
          );
        })}

        {data.fees.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500">Belum ada iuran yang dibuat.</p>
          </div>
        )}
      </div>

       {/* Create Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Buat Iuran Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Iuran</label>
                <input 
                  required
                  type="text" 
                  value={newFee.title}
                  onChange={e => setNewFee({...newFee, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="Contoh: Kas Bulan Mei"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nominal (Rp)</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  value={newFee.amount}
                  onChange={e => setNewFee({...newFee, amount: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                   <select
                      value={newFee.category}
                      onChange={e => setNewFee({...newFee, category: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                   >
                     <option value="Wajib">Wajib</option>
                     <option value="Sukarela">Sukarela</option>
                     <option value="Event">Event</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenggat Waktu</label>
                   <input 
                      required
                      type="date"
                      value={newFee.deadline}
                      onChange={e => setNewFee({...newFee, deadline: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                   />
                </div>
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
                  className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-md transition-colors"
                >
                  Buat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;