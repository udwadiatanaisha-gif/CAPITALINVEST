import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Holding, AssetClass } from '../../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface HoldingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdingToEdit?: Holding | null;
  defaultClientId?: string;
}

export const HoldingFormModal: React.FC<HoldingFormModalProps> = ({
  isOpen,
  onClose,
  holdingToEdit,
  defaultClientId
}) => {
  const { clients, addHolding, updateHolding } = useApp();

  const [formData, setFormData] = useState({
    clientId: defaultClientId || clients[0]?.id || 'CLI-001',
    assetName: '',
    assetClass: 'Equity' as AssetClass,
    symbol: '',
    sector: 'Information Technology',
    quantity: 100,
    averagePurchasePrice: 1500,
    currentPrice: 1650
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (holdingToEdit) {
      setFormData({
        clientId: holdingToEdit.clientId,
        assetName: holdingToEdit.assetName,
        assetClass: holdingToEdit.assetClass,
        symbol: holdingToEdit.symbol,
        sector: holdingToEdit.sector || 'General',
        quantity: holdingToEdit.quantity,
        averagePurchasePrice: holdingToEdit.averagePurchasePrice,
        currentPrice: holdingToEdit.currentPrice
      });
    } else {
      setFormData({
        clientId: defaultClientId || clients[0]?.id || 'CLI-001',
        assetName: '',
        assetClass: 'Equity',
        symbol: '',
        sector: 'Information Technology',
        quantity: 100,
        averagePurchasePrice: 1500,
        currentPrice: 1650
      });
    }
  }, [holdingToEdit, defaultClientId, isOpen, clients]);

  if (!isOpen) return null;

  const investedCalc = formData.quantity * formData.averagePurchasePrice;
  const currentCalc = formData.quantity * formData.currentPrice;
  const gainCalc = currentCalc - investedCalc;
  const returnPct = investedCalc > 0 ? (gainCalc / investedCalc) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.assetName.trim()) {
      setErrorMsg('Asset name is required.');
      return;
    }
    if (formData.quantity <= 0) {
      setErrorMsg('Quantity must be greater than zero.');
      return;
    }
    if (formData.averagePurchasePrice < 0 || formData.currentPrice < 0) {
      setErrorMsg('Prices must be valid positive values.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (holdingToEdit) {
        await updateHolding(holdingToEdit.id, formData);
      } else {
        await addHolding(formData);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save holding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A76A]">
              Holding Position
            </span>
            <h3 className="font-serif-display text-xl font-bold text-[#101C2C]">
              {holdingToEdit ? `Edit ${holdingToEdit.assetName}` : 'Add Portfolio Holding'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Client *</label>
            <select
              value={formData.clientId}
              onChange={e => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asset Description *</label>
              <input
                type="text"
                value={formData.assetName}
                onChange={e => setFormData({ ...formData, assetName: e.target.value })}
                placeholder="e.g. HDFC Bank Ltd"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ticker / Symbol / ISIN</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={e => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                placeholder="e.g. HDFCBANK.NS"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asset Class</label>
              <select
                value={formData.assetClass}
                onChange={e => setFormData({ ...formData, assetClass: e.target.value as AssetClass })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Equity">Equity</option>
                <option value="Debt">Debt (Bonds / Fixed Income)</option>
                <option value="Cash & Equivalents">Cash & Equivalents (Liquid)</option>
                <option value="Gold & Precious Metals">Gold & Precious Metals</option>
                <option value="Real Estate & REITs">Real Estate & REITs</option>
                <option value="Alternative Investments">Alternative Investments</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sector / Category</label>
              <input
                type="text"
                value={formData.sector}
                onChange={e => setFormData({ ...formData, sector: e.target.value })}
                placeholder="e.g. Banking & Financial"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Avg Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.averagePurchasePrice}
                onChange={e => setFormData({ ...formData, averagePurchasePrice: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.currentPrice}
                onChange={e => setFormData({ ...formData, currentPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                required
              />
            </div>
          </div>

          {/* Dynamic Real-Time Calculations */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Total Invested</span>
              <strong className="text-slate-800">₹{investedCalc.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Market Value</span>
              <strong className="text-slate-900">₹{currentCalc.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Unrealized Return</span>
              <strong className={gainCalc >= 0 ? 'text-[#147D64]' : 'text-red-600'}>
                {returnPct.toFixed(2)}%
              </strong>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#101C2C] hover:bg-[#172B46] text-white rounded-lg font-semibold cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
