import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Card, CardContent, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const BASE_URL = 'http://localhost:3001';

const TransactionCard = ({ transaction, onDelete, onOpenUpdateModal }) => (
  <TableRow hover>
    <TableCell>{transaction.text}</TableCell>
    <TableCell>${transaction.amount}</TableCell>
    <TableCell>
      <Button size="small" onClick={() => onDelete(transaction.id)} variant="outlined"  style={{ marginRight: '10px', color:'#293b8a' }}>
        Delete
      </Button>
      <Button size="small" onClick={() => onOpenUpdateModal(transaction)} style={{  color:'#293b8a' }} variant="outlined">
        Update
      </Button>
    </TableCell>
  </TableRow>
);

function Expense() {
  const history = useHistory();
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({ text: '', amount: '' });
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [username, setUsername] = useState('');

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
        userId: userId,
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

  const updateTransaction = async () => {
    try {
      if (!selectedTransaction || !selectedTransaction.text.trim() || !selectedTransaction.amount) {
        alert('Please enter both text and amount for the transaction.');
        return;
      }

      await axios.put(`${BASE_URL}/expense/${selectedTransaction.id}`, selectedTransaction);
      const updatedTransactions = transactions.map(transaction =>
        transaction.id === selectedTransaction.id ? selectedTransaction : transaction
      );
      setTransactions(updatedTransactions);
      setSelectedTransaction(null);
      setOpenUpdateModal(false);
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleOpenUpdateModal = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setSelectedTransaction(null);
    setOpenUpdateModal(false);
  };

  const getTotalExpenses = () => {
    return transactions.reduce((total, transaction) => total + parseInt(transaction.amount), 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    history.push('/');
  };

  const chartData = {
    labels: transactions.map(transaction => transaction.text),
    datasets: [
      {
        label: 'Expenses',
        data: transactions.map(transaction => transaction.amount),
        backgroundColor: 'rgba(41, 59, 138)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0f0333',
        padding: '10px 20px',
        color: 'white',
        borderRadius: '8px',
        border: '3px solid #0c0c0d',
        marginBottom: '20px',
      }}>
        <Typography variant="h7" component="div" style={{ color: 'white' }}>
          Expense Tracker
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Typography variant="h8" component="div">
            {username && `Welcome, ${username}!`}
          </Typography>
          <Button style={{backgroundColor: '#293b8a', border: '1px solid ', fontSize:'10px',}} variant="contained "  onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>

      <div style={{ display: 'flex', gap: '30px' }}>
        <div style={{ flex: 1 }}>
          <h3>Expenses</h3>
          <TableContainer style={{ marginBottom: '20px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map(transaction => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onDelete={deleteTransaction}
                    onOpenUpdateModal={handleOpenUpdateModal}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div className="total-expenses" style={{ fontWeight: 'bold' }}>
            Total Expenses: ${getTotalExpenses()}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Add New Expense</h3>
          <TextField
            label="Enter text..."
            value={newTransaction.text}
            onChange={(e) => setNewTransaction({ ...newTransaction, text: e.target.value })}
            fullWidth
            size="small"
            style={{ marginBottom: '10px' }}
          />
          <TextField
            label="Enter amount..."
            type="number"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
            fullWidth
            size="small"
            style={{ marginBottom: '10px' }}
          />
          <Button style={{backgroundColor: '#293b8a', border: '1px solid', marginTop: '10px',}} variant="contained" onClick={addTransaction} >Add Expense</Button>

          <div style={{ marginTop: '30px' }}>
            <h3>Expense Chart</h3>
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          </div>
        </div>
      </div>

      <Dialog open={openUpdateModal} onClose={handleCloseUpdateModal}>
        <DialogTitle>Update Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Update the details of the selected transaction.
          </DialogContentText>
          <TextField
            label="Text"
            value={selectedTransaction ? selectedTransaction.text : ''}
            onChange={(e) => setSelectedTransaction({ ...selectedTransaction, text: e.target.value })}
            fullWidth
            size="small"
            style={{ marginBottom: '10px', marginTop: '20px' }}
          />
          <TextField
            label="Amount"
            type="number"
            value={selectedTransaction ? selectedTransaction.amount : ''}
            onChange={(e) => setSelectedTransaction({ ...selectedTransaction, amount: e.target.value })}
            fullWidth
            size="small"
            style={{ marginBottom: '10px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateModal} style={{color: '#293b8a',}}>Cancel</Button>
          <Button onClick={updateTransaction} variant="contained" style={{backgroundColor: '#293b8a',}}>Update</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Expense;
