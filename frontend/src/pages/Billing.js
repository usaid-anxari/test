import { useContext, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
  const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');

  const downloadInvoice = (invoice) => {
    const content = `
INVOICE
Invoice ID: ${invoice.id}
Date: ${new Date(invoice.date).toLocaleDateString()}
Plan: ${invoice.plan}
Amount: $${invoice.amount} ${invoice.currency}
Customer: ${invoice.name}
Email: ${invoice.email}

Thank you for your business!
TrueTestify
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (invoices.length === 0) {
    return <p className="text-gray-500">No invoices found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.plan}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${invoice.amount} {invoice.currency}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => downloadInvoice(invoice)}
                  className="text-orange-600 hover:text-orange-900 font-medium"
                >
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Billing = () => {
  const navigate = useNavigate()
  const { subscription, billingInfo, saveBilling } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: billingInfo?.name || '',
    email: billingInfo?.email || '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    address: billingInfo?.address || '',
    city: billingInfo?.city || '',
    country: billingInfo?.country || '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // const isCardValid = useMemo(() => {
  //   const num = form.cardNumber.replace(/\s+/g, '');
  //   const mm = Number(form.expMonth);
  //   const yy = Number(form.expYear);
  //   const cvc = form.cvc.trim();
  //   return num.length >= 12 && num.length <= 19 && mm >= 1 && mm <= 12 && yy >= 24 && yy <= 50 && cvc.length >= 3 && cvc.length <= 4;
  // }, [form.cardNumber, form.expMonth, form.expYear, form.cvc]);
 const isCardValid = true;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isCardValid) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // In real app, tokenize card with Stripe/PCI-compliant provider
      const { cardNumber, expMonth, expYear, cvc, ...safe } = form;
      saveBilling({ ...safe, last4: cardNumber?.slice(-4) || '0000' });
      
      // Save a mock invoice to localStorage
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const newInvoice = {
        id: `INV-${Date.now()}`,
        date: new Date().toISOString(),
        plan: subscription?.plan || 'Pro',
        amount: (subscription?.plan || 'Pro') === 'Pro' ? 49 : 0,
        currency: 'USD',
        email: safe.email,
        name: safe.name,
      };
      localStorage.setItem('invoices', JSON.stringify([newInvoice, ...invoices]));
      
      toast.success('Payment successful! Your subscription has been activated.');
      navigate('/dashboard')
      // Reset form
      setForm(prev => ({
        ...prev,
        cardNumber: '',
        expMonth: '',
        expYear: '',
        cvc: '',
      }));
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-600 mt-2">Billing</h2>

      <div className="bg-gray-100 p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Subscription</h3>
        <div className="space-y-2">
          <div className="flex justify-between"><span className="text-gray-600">Plan</span><span className="font-medium">{subscription?.plan || 'Pro'}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Status</span><span className="font-medium capitalize">{subscription?.status || 'Inactive'}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Amount</span><span className="font-medium">${(subscription?.plan || 'Pro') === 'Pro' ? '49' : '0'}/month</span></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Billing Information</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input 
            className="border p-2 rounded" 
            name="name" 
            placeholder="Full Name" 
            value={form.name} 
            onChange={handleChange} 
            required 
          />
          <input 
            className="border p-2 rounded" 
            name="email" 
            type="email" 
            placeholder="Email" 
            value={form.email} 
            onChange={handleChange} 
            required 
          />
          <input 
            className="border p-2 rounded sm:col-span-2" 
            name="cardNumber" 
            placeholder="Card Number (e.g., 4242424242424242)" 
            value={form.cardNumber} 
            onChange={handleChange} 
            required 
          />
          <input 
            className="border p-2 rounded" 
            name="expMonth" 
            placeholder="MM (e.g., 12)" 
            value={form.expMonth} 
            onChange={handleChange} 
            required 
          />
          <input 
            className="border p-2 rounded" 
            name="expYear" 
            placeholder="YY (e.g., 25)" 
            value={form.expYear} 
            onChange={handleChange} 
            required 
          />
          <input 
            className="border p-2 rounded" 
            name="cvc" 
            placeholder="CVC (e.g., 123)" 
            value={form.cvc} 
            onChange={handleChange} 
            required 
          />
          <input 
            className="border p-2 rounded sm:col-span-2" 
            name="address" 
            placeholder="Billing Address" 
            value={form.address} 
            onChange={handleChange} 
          />
          <input 
            className="border p-2 rounded" 
            name="city" 
            placeholder="City" 
            value={form.city} 
            onChange={handleChange} 
          />
          <input 
            className="border p-2 rounded" 
            name="country" 
            placeholder="Country" 
            value={form.country} 
            onChange={handleChange} 
          />
          <button 
            type="submit" 
            disabled={!isCardValid || isProcessing} 
            className={`sm:col-span-2 mt-2 px-6 py-3 font-bold rounded transition-colors ${
              isCardValid && !isProcessing 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Processing Payment...' : 'Pay & Activate'}
          </button>
        </form>
        
        {/* Validation Status */}
        <div className="mt-4 p-3 rounded text-sm">
          {!isCardValid && (
            <div className="text-red-600">
              <p>Please fill in all required fields:</p>
              <ul className="list-disc list-inside mt-1">
                {!form.name && <li>Full Name is required</li>}
                {!form.email && <li>Email is required</li>}
                {form.cardNumber.replace(/\s+/g, '').length < 12 && <li>Card number must be at least 12 digits</li>}
                {(!form.expMonth || Number(form.expMonth) < 1 || Number(form.expMonth) > 12) && <li>Valid expiry month (01-12)</li>}
                {(!form.expYear || Number(form.expYear) < 24 || Number(form.expYear) > 50) && <li>Valid expiry year (24-50)</li>}
                {form.cvc.trim().length < 3 && <li>CVC must be 3-4 digits</li>}
              </ul>
            </div>
          )}
          {isCardValid && (
            <div className="text-green-600">
              ✓ All fields are valid! You can proceed with payment.
            </div>
          )}
        </div>

        {billingInfo && (
          <div className="mt-6 text-sm text-gray-600">
            <p>Last card: •••• •••• •••• {billingInfo.last4}</p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Invoices</h3>
        <InvoiceList />
      </div>
    </div>
  );
};

export default Billing