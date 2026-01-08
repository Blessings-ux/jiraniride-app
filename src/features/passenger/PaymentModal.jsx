import { useState } from 'react';
import { mpesaService } from '../../services/mpesaService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function PaymentModal({ amount, onComplete, onCancel }) {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async () => {
    setIsLoading(true);
    setError(null);
    try {
        await mpesaService.initiatePayment({
            phoneNumber: phone,
            amount: amount,
            accountReference: "JiraniRide"
        });
        // Success
        onComplete();
    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h3 className="text-xl font-bold mb-4">Pay via M-Pesa</h3>
        <p className="mb-4 text-gray-600">Amount to pay: <span className="font-bold">KES {amount}</span></p>
        
        {error && <div className="p-2 mb-4 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">M-Pesa Number</label>
                <Input 
                    placeholder="0712345678" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>
            
            <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handlePay} isLoading={isLoading}>Pay Now</Button>
            </div>
        </div>
      </div>
    </div>
  );
}
