import React, { useState } from 'react';
import { Calculator, X, Delete, Plus, Minus } from 'lucide-react';

interface QuickCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickCalculator: React.FC<QuickCalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [clearNext, setClearNext] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (display === '0' || clearNext) {
      setDisplay(digit);
      setClearNext(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleDecimal = () => {
    if (clearNext) {
      setDisplay('0.');
      setClearNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOp = (op: string) => {
    const current = parseFloat(display) || 0;
    if (prevValue === null) {
      setPrevValue(current);
    } else if (operation) {
      const result = calculate(prevValue, current, operation);
      setPrevValue(result);
      setDisplay(String(result));
    }
    setOperation(op);
    setClearNext(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return Number((a + b).toFixed(4));
      case '-':
        return Number((a - b).toFixed(4));
      case '×':
        return Number((a * b).toFixed(4));
      case '÷':
        return b !== 0 ? Number((a / b).toFixed(4)) : 0;
      default:
        return b;
    }
  };

  const handleEqual = () => {
    if (prevValue === null || !operation) return;
    const current = parseFloat(display) || 0;
    const result = calculate(prevValue, current, operation);
    setDisplay(String(result));
    setPrevValue(null);
    setOperation(null);
    setClearNext(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setClearNext(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 w-72 bg-zinc-950 border-2 border-yellow-400/90 rounded-2xl shadow-2xl overflow-hidden font-mono animate-scale-up">
      {/* Header */}
      <div className="bg-zinc-900 px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-bold font-sans">
          <Calculator className="w-4 h-4" />
          <span>آلة حاسبة سريعة للكاشير</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Screen */}
      <div className="p-3 bg-zinc-900/90 text-right">
        <div className="text-[11px] text-zinc-400 h-4 font-mono">
          {prevValue !== null && operation ? `${prevValue} ${operation}` : ''}
        </div>
        <div className="text-2xl font-black text-white truncate tracking-wider">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="p-2.5 grid grid-cols-4 gap-1.5 bg-zinc-950">
        <button
          type="button"
          onClick={handleClear}
          className="p-2 bg-red-950/60 text-red-400 hover:bg-red-900 rounded-lg text-xs font-black"
        >
          C
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="p-2 bg-zinc-850 text-zinc-300 hover:bg-zinc-800 rounded-lg text-xs font-black flex items-center justify-center"
        >
          <Delete className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => handleOp('÷')}
          className="p-2 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg text-xs font-black"
        >
          ÷
        </button>
        <button
          type="button"
          onClick={() => handleOp('×')}
          className="p-2 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg text-xs font-black"
        >
          ×
        </button>

        {['7', '8', '9'].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleDigit(num)}
            className="p-2.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-sm font-black"
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleOp('-')}
          className="p-2 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg text-xs font-black flex items-center justify-center"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {['4', '5', '6'].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleDigit(num)}
            className="p-2.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-sm font-black"
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleOp('+')}
          className="p-2 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg text-xs font-black flex items-center justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {['1', '2', '3'].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleDigit(num)}
            className="p-2.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-sm font-black"
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          onClick={handleEqual}
          className="row-span-2 p-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 rounded-lg text-base font-black flex items-center justify-center"
        >
          =
        </button>

        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="col-span-2 p-2.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-sm font-black"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDecimal}
          className="p-2.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-sm font-black"
        >
          .
        </button>
      </div>
    </div>
  );
};
