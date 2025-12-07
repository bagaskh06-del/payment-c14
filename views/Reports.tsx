import React from 'react';
import { FinanceContextType } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Printer, MessageCircle, AlertTriangle } from 'lucide-react';

interface ReportsProps {
  data: FinanceContextType;
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const { students, fees, payments, expenses } = data;

  const handlePrint = () => {
    window.print();
  };

  const getUnpaidStudents = (feeId: string) => {
    return students.filter(s => !payments.some(p => p.feeId === feeId && p.studentId === s.id));
  };

  const sendWhatsAppReminder = (student: any, totalDebt: number) => {
    const message = `Halo ${student.name}, diingatkan untuk segera melunasi tunggakan uang kas sebesar ${formatCurrency(totalDebt)}. Terima kasih.`;
    const url = `https://wa.me/${student.phone.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const calculateStudentDebt = (studentId: string) => {
    let debt = 0;
    fees.forEach(fee => {
      const isPaid = payments.some(p => p.feeId === fee.id && p.studentId === studentId);
      if (!isPaid) debt += fee.amount;
    });
    return debt;
  };

  // Generate debt report
  const studentsWithDebt = students
    .map(s => ({ ...s, debt: calculateStudentDebt(s.id) }))
    .filter(s => s.debt > 0)
    .sort((a, b) => b.debt - a.debt);

  const totalCollected = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center no-print">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Laporan Keuangan</h2>
           <p className="text-gray-500 text-sm">Ringkasan dan tagihan</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Printer size={18} />
          Cetak PDF
        </button>
      </div>

      {/* Summary Report (Printable) */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 card-shadow">
        <div className="text-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">Laporan Kas Kelas</h1>
          <p className="text-gray-500 text-sm mt-1">Dicetak pada: {new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">Total Pemasukan</p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-300">{formatCurrency(totalCollected)}</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-red-800 dark:text-red-300">{formatCurrency(totalExpense)}</p>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">Daftar Tunggakan Mahasiswa</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-2">Nama</th>
                <th className="py-2 text-right">Total Tunggakan</th>
                <th className="py-2 text-right no-print">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {studentsWithDebt.map(student => (
                <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 font-medium text-gray-800 dark:text-gray-200">{student.name}</td>
                  <td className="py-3 text-right text-red-600 font-mono font-medium">{formatCurrency(student.debt)}</td>
                  <td className="py-3 text-right no-print">
                    <button 
                      onClick={() => sendWhatsAppReminder(student, student.debt)}
                      className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded transition-colors"
                      title="Kirim Pesan WhatsApp"
                    >
                      <MessageCircle size={14} /> Tagih
                    </button>
                  </td>
                </tr>
              ))}
              {studentsWithDebt.length === 0 && (
                <tr><td colSpan={3} className="py-4 text-center text-gray-500">Tidak ada tunggakan. Luar biasa!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="no-print bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3 items-start">
        <AlertTriangle className="text-amber-600 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-amber-800 dark:text-amber-300">Peringatan Pembayaran</h4>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
            Gunakan tombol WhatsApp di atas untuk mengirim pengingat personal kepada mahasiswa yang masih memiliki tunggakan. Pastikan nomor WhatsApp valid.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;