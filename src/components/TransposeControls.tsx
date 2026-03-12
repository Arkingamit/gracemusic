import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';

interface TransposeControlsProps {
  transposition: number;
  currentKey: string;
  onTransposeUp: () => void;
  onTransposeDown: () => void;
  onReset: () => void;
}

const TransposeControls: React.FC<TransposeControlsProps> = ({
  transposition,
  currentKey,
  onTransposeUp,
  onTransposeDown,
  onReset
}) => {
  const getTranspositionText = (value: number) => {
    if (value === 0) return 'Original Key';
    if (value > 0) return `+${value} semitones`;
    return `${value} semitones`;
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Key: {currentKey} ({getTranspositionText(transposition)})
      </Label>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onTransposeDown}
          disabled={transposition <= -11}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={transposition === 0}
        >
          Reset
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onTransposeUp}
          disabled={transposition >= 11}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TransposeControls;
