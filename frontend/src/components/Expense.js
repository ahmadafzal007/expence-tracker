import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'chart.js/auto';
import Header from './landing/Header';

const BASE_URL = 'http://localhost:3001';

const Expense = () => {
  const history = useHistory();
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({ text: '', amount: '' });
  const [editTransaction, setEditTransaction] = useState(null);
  const [username, setUsername] = useState('');
  const [predictedExpense, setPredictedExpense] = useState(null);

  useEffect(() => {
    fetchTransactions();
    getUsernameFromLocalStorage();
  }, []);

  const fetchTransactions = async () => {
    try {
      const userDataJSON = localStorage.getItem('userData');
      const userData = JSON.parse(userDataJSON);
      const userId = userData.id;
      const response = await axios.get(`${BASE_URL}/expense/user/${userId}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const getUsernameFromLocalStorage = () => {
    const userDataJSON = localStorage.getItem('userData');
    const userData = JSON.parse(userDataJSON);
    if (userData && userData.username) {
      setUsername(userData.username);
    }
  };

  const addTransaction = async () => {
    try {
      if (!newTransaction.text.trim() || !newTransaction.amount) {
        alert('Please enter both text and amount for the transaction.');
        return;
      }
      const userDataJSON = localStorage.getItem('userData');
      const userData = JSON.parse(userDataJSON);
      const userId = userData.id;
      const response = await axios.post(`${BASE_URL}/expense`, {
        ...newTransaction,
        userId,
      });
      setTransactions([...transactions, response.data]);
      setNewTransaction({ text: '', amount: '' });
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/expense/${id}`);
      const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const updateTransaction = async (id, updatedTransaction) => {
    try {
      await axios.put(`${BASE_URL}/expense/${id}`, updatedTransaction);
      const updatedTransactions = transactions.map(transaction =>
        transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
      );
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const getTotalExpenses = () => {
    return transactions.reduce((total, transaction) => total + parseFloat(transaction.amount), 0).toFixed(2);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Expense Report', 20, 20);

    doc.setFontSize(12);
    let yPosition = 40;
    transactions.forEach((transaction, index) => {
      doc.text(`${index + 1}. ${transaction.text}: $${transaction.amount}`, 20, yPosition);
      yPosition += 10;
    });

    const totalExpenses = getTotalExpenses();
    doc.text(`Total Expenses: $${totalExpenses}`, 20, yPosition + 10);

    const canvas = document.getElementById('expenseChart');
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 15, yPosition + 20, 180, 100);
    }

    doc.save('expense_report.pdf');
  };

  const predictTodayExpense = async () => {
    try {
      const formattedTransactions = transactions.map(({ createdAt, amount }) => ({
        createdAt: createdAt.split('T')[0],
        amount: parseFloat(amount),
      }));

      const response = await axios.post('http://127.0.0.1:5000/predict-expense', formattedTransactions);

      if (response.data && response.data.predicted_expense) {
        setPredictedExpense(response.data.predicted_expense.toFixed(2));
      } else {
        alert("Could not predict today's expense.");
      }
    } catch (error) {
      console.error("Error predicting today's expense:", error);
    }
  };

  const chartData = {
    labels: transactions.map(transaction => transaction.text),
    datasets: [
      {
        label: 'Expenses',
        data: transactions.map(transaction => transaction.amount),
        backgroundColor: '#3b82f6',
      },
    ],
  };

  return (
    <div className="min-h-screen">
    <Header />
    <header className="text-center py-6">
      <h1 className="text-4xl font-extrabold text-indigo-700 animate-bounce">
        Welcome, {username}!
      </h1>
    </header>

    <div className="max-w-8xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => {
            localStorage.removeItem('userData');
            history.push('/');
          }}
          className=" text-red-500 px-4 py-2 rounded-md border border-red-500 hover:scale-110 transition-transform"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Expense */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-medium mb-4">Add New Expense</h3>
          <input
            type="text"
            placeholder="Enter description"
            value={newTransaction.text}
            onChange={(e) => setNewTransaction({ ...newTransaction, text: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 mb-4 shadow-sm focus:ring focus:ring-indigo-200"
          />
          <input
            type="number"
            placeholder="Enter amount"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 mb-4 shadow-sm focus:ring focus:ring-indigo-200"
          />
          <button
            onClick={addTransaction}
            className=" text-blue-500 px-4 py-2 rounded-md border border-blue-500 hover:scale-105 transition-transform"
          >
            Add Expense
          </button>
        </div>

        {/* Predicted Expense */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-medium mb-4">Predicted Expense for Today</h3>
          {predictedExpense ? (
            <p className="text-lg font-semibold">${predictedExpense}</p>
          ) : (
            <p className="text-sm text-gray-500">Prediction not available yet.</p>
          )}
          <button
            onClick={predictTodayExpense}
            className=" text-purple-500 px-4 py-2 rounded-md border border-purple-500 mt-4 hover:scale-105 transition-transform"
          >
            Predict Today's Expense
          </button>
        </div>

        {/* Total Expenses */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-medium mb-4">Total Expenses</h3>
          <p className="text-lg font-semibold">${getTotalExpenses()}</p>
          <button
            onClick={generatePDF}
            className=" text-green-500 px-4 py-2 rounded-md border border-green-500 mt-4 hover:scale-105 transition-transform"
          >
            Generate PDF Report
          </button>
        </div>
      </div>

      {/* Expenses Table and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="overflow-auto rounded-lg shadow">
          <h3 className="text-xl font-medium mb-4">Expenses</h3>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Amount</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index} className="text-center hover:bg-gray-100">
                  <td className="border px-4 py-2">{transaction.text}</td>
                  <td className="border px-4 py-2">${transaction.amount}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => setEditTransaction(transaction)}
                      className=" text-green-500 px-2 py-1 rounded-md border border-green-500 hover:scale-105 transition-transform mr-2"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className=" text-red-500 px-2 py-1 rounded-md border border-red-500 hover:scale-105 transition-transform"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-xl font-medium mb-4">Expense Chart</h3>
          <Bar
            id="expenseChart"
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top' } },
            }}
          />
        </div>
      </div>

      {editTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-xl font-medium mb-4">Update Expense</h3>
            <input
              type="text"
              placeholder="Enter description"
              value={editTransaction.text}
              onChange={(e) =>
                setEditTransaction({ ...editTransaction, text: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2 mb-4 shadow-sm focus:ring focus:ring-indigo-200"
            />
            <input
              type="number"
              placeholder="Enter amount"
              value={editTransaction.amount}
              onChange={(e) =>
                setEditTransaction({ ...editTransaction, amount: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2 mb-4 shadow-sm focus:ring focus:ring-indigo-200"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  updateTransaction(editTransaction.id, editTransaction);
                  setEditTransaction(null);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md border border-black hover:scale-105 transition-transform"
              >
                Save
              </button>
              <button
                onClick={() => setEditTransaction(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md border border-black hover:scale-105 transition-transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default Expense;
