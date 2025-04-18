import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BudgetInputProps {
  budget: string;
  setBudget: React.Dispatch<React.SetStateAction<string>>;
  onConfirm: () => void;
}

const BudgetInput: React.FC<BudgetInputProps> = ({ budget, setBudget, onConfirm }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && budget.trim()) {
      onConfirm();
    }
  };

  return (
    <div className="flex justify-start mb-4 animate-fadeIn">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 text-gray-800 rounded-2xl p-5 max-w-[85%] shadow-[0_8px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] transition-all duration-300">
        <div className="font-medium mb-3 text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">What's your approximate budget?</div>
        <div className="flex items-center mb-4 border rounded-lg p-2 bg-white/50 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/60">
          <span className="text-lg font-semibold text-gray-500 px-2">₹</span>
          <Input
            type="number"
            placeholder="e.g. 100000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 focus-visible:ring-transparent bg-transparent"
          />
        </div>
        <div className="mb-2 text-sm text-gray-500">Common budget ranges:</div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => setBudget("50000")} className="text-sm py-1 h-7">₹50,000</Button>
          <Button variant="outline" size="sm" onClick={() => setBudget("100000")} className="text-sm py-1 h-7">₹1,00,000</Button>
          <Button variant="outline" size="sm" onClick={() => setBudget("200000")} className="text-sm py-1 h-7">₹2,00,000</Button>
          <Button variant="outline" size="sm" onClick={() => setBudget("500000")} className="text-sm py-1 h-7">₹5,00,000</Button>
        </div>
        <Button 
          onClick={onConfirm} 
          className="bg-accent hover:bg-accent/90 w-full shadow-[0_4px_12px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_16px_rgba(249,115,22,0.4)]"
          disabled={!budget.trim()}
        >
          Confirm Budget
        </Button>
      </div>
    </div>
  );
};

export default BudgetInput; 