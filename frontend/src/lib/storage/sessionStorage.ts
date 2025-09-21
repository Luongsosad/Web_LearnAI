interface Transaction {
  transactionId: string;
  amount: number;
  bankAccount: string;
  accountHolder: string;
  bank: string;
  planName: string;
  qrCode: string;
  expiresAt: number;
}

export class SessionStorage {
  private static key = 'user';
  private static apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6789';

  static setTransaction(transaction: Transaction) {
    sessionStorage.setItem('transaction', JSON.stringify(transaction));
  }
  static getTransaction() {
    const data = sessionStorage.getItem('transaction');
    return data ? JSON.parse(data) : null;
  }
  static clearTransaction() {
    sessionStorage.removeItem('transaction');
  }
}
