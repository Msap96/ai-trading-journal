import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

interface Trade {
  entry_date: string;
  symbol: string;
  entry_price: number;
  exit_price: number;
  position_size: number;
  trade_type: 'long' | 'short';
  market_conditions: string[];
  notes: string;
  chart_images: string[];
}

const TradeJournal: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [newTrade, setNewTrade] = useState<Partial<Trade>>({
    market_conditions: [],
    chart_images: []
  });
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const response = await axios.get('http://localhost:8000/trades/');
      setTrades(response.data);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Upload images first
      const imageUrls = await Promise.all(
        Array.from(selectedImages || []).map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const response = await axios.post('http://localhost:8000/upload/', formData);
          return response.data.url;
        })
      );

      // Create trade with image URLs
      const tradeData = {
        ...newTrade,
        chart_images: imageUrls,
        entry_date: new Date().toISOString()
      };

      await axios.post('http://localhost:8000/trades/', tradeData);
      fetchTrades();
      setNewTrade({ market_conditions: [], chart_images: [] });
      setSelectedImages(null);
    } catch (error) {
      console.error('Error creating trade:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trade Journal</h1>
      
      {/* Trade Entry Form */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">New Trade Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Symbol</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={newTrade.symbol || ''}
                onChange={(e) => setNewTrade({ ...newTrade, symbol: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Trade Type</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={newTrade.trade_type || 'long'}
                onChange={(e) => setNewTrade({ ...newTrade, trade_type: e.target.value as 'long' | 'short' })}
                required
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Entry Price</label>
              <input
                type="number"
                step="0.00001"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={newTrade.entry_price || ''}
                onChange={(e) => setNewTrade({ ...newTrade, entry_price: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Exit Price</label>
              <input
                type="number"
                step="0.00001"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={newTrade.exit_price || ''}
                onChange={(e) => setNewTrade({ ...newTrade, exit_price: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Position Size</label>
              <input
                type="number"
                step="0.00001"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={newTrade.position_size || ''}
                onChange={(e) => setNewTrade({ ...newTrade, position_size: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Chart Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="mt-1 block w-full"
                onChange={(e) => setSelectedImages(e.target.files)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Market Conditions</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter conditions separated by commas"
              value={newTrade.market_conditions?.join(', ') || ''}
              onChange={(e) => setNewTrade({
                ...newTrade,
                market_conditions: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={4}
              value={newTrade.notes || ''}
              onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })}
            />
          </div>

          <div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Trade
            </button>
          </div>
        </form>
      </div>

      {/* Trade History */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Trade History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/L</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trades.map((trade, index) => {
                const pl = (trade.exit_price - trade.entry_price) * trade.position_size * (trade.trade_type === 'long' ? 1 : -1);
                return (
                  <tr key={index} className={pl >= 0 ? 'bg-green-50' : 'bg-red-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(trade.entry_date), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.symbol}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.trade_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.entry_price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.exit_price}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {pl.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TradeJournal;