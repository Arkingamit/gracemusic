import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const MetronomeWidget: React.FC = () => {
  const [bpm, setBpm] = useState('120');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const bpmValue = parseInt(bpm);
    if (isPlaying && bpmValue > 0) {
      const interval = 60000 / bpmValue;
      intervalRef.current = setInterval(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 100);
      }, interval);
    } else {
      clearInterval(intervalRef.current!);
      setIsBlinking(false);
    }
    return () => clearInterval(intervalRef.current!);
  }, [isPlaying, bpm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBpm(e.target.value);
  };

  const handleBlur = () => {
    if (bpm.trim() === '' || isNaN(parseInt(bpm))) {
      setBpm('120');
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setBpm('120');
  };

  return (
    <div className="bg-muted rounded-lg p-4 shadow-sm max-w-sm mx-auto space-y-3">
      {/* Blinking Light */}
      <div className="flex justify-center">
        <div
          className={`w-10 h-10 rounded-full border-4 transition-all duration-100 flex items-center justify-center ${
            isBlinking
              ? 'bg-purple-500 border-purple-600 shadow-lg shadow-purple-500/50'
              : 'bg-gray-300 border-gray-400 dark:bg-gray-600 dark:border-gray-500'
          }`}
        >
          <span className="text-base">🎵</span>
        </div>
      </div>

      {/* Mobile (Dropdown) */}
      <div className="block sm:hidden text-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-center text-sm">
              Metronome Controls <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full mt-2 space-y-3">
            <Label htmlFor="bpm" className="text-xs">BPM</Label>
            <Input
              id="bpm"
              type="text"
              inputMode="numeric"
              value={bpm}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter BPM"
              className="text-center text-sm"
            />
            <div className="flex flex-col gap-2">
              {!isPlaying ? (
                <Button onClick={() => setIsPlaying(true)} className="text-sm gap-1">
                  <Play className="w-4 h-4" />
                  Start
                </Button>
              ) : (
                <Button onClick={() => setIsPlaying(false)} variant="outline" className="text-sm gap-1">
                  <Pause className="w-4 h-4" />
                  Stop
                </Button>
              )}
              <Button onClick={handleReset} variant="outline" className="text-sm gap-1">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Desktop Controls */}
      <div className="hidden sm:block space-y-2">
        <div className="space-y-1">
          <Label htmlFor="bpm" className="text-xs">BPM</Label>
          <Input
            id="bpm"
            type="text"
            inputMode="numeric"
            value={bpm}
            onChange={handleChange}
            onBlur={handleBlur}
            className="text-center text-sm"
          />
        </div>
        <div className="flex gap-2">
          {!isPlaying ? (
            <Button onClick={() => setIsPlaying(true)} className="flex-1 text-sm gap-1">
              <Play className="w-4 h-4" />
              Start
            </Button>
          ) : (
            <Button onClick={() => setIsPlaying(false)} variant="outline" className="flex-1 text-sm gap-1">
              <Pause className="w-4 h-4" />
              Stop
            </Button>
          )}
          <Button onClick={handleReset} variant="outline" className="flex-1 text-sm gap-1">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MetronomeWidget;
