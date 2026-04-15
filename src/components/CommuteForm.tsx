import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bike, Car, Bus, Navigation, Mic, MicOff, ArrowRight } from 'lucide-react';
import type { TransportMode } from '@/lib/risk-scoring';

interface CommuteFormProps {
  onAnalyze: (data: {
    origin: string;
    destination: string;
    departureTime: string;
    transportMode: TransportMode;
    dayOfWeek: string;
  }) => void;
  isLoading: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

export function CommuteForm({ onAnalyze, isLoading }: CommuteFormProps) {
  const [origin, setOrigin] = useState('Koramangala, Bangalore');
  const [destination, setDestination] = useState('Whitefield, Bangalore');
  const [departureTime, setDepartureTime] = useState('08:30');
  const [transportMode, setTransportMode] = useState<TransportMode>('car');
  const [dayOfWeek, setDayOfWeek] = useState(today);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({ origin, destination, departureTime, transportMode, dayOfWeek });
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      setDestination(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <Card className="border-commute-border shadow-commute card-hover">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="origin" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Origin</Label>
            <Input id="origin" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="e.g. Koramangala" className="mt-2 bg-background border-border" />
          </div>

          <div>
            <Label htmlFor="destination" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Destination</Label>
            <div className="flex gap-2 mt-2">
              <Input id="destination" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Whitefield" className="flex-1 bg-background border-border" />
              <Button type="button" variant="outline" size="icon" onClick={startVoiceInput} className="shrink-0" title="Voice input">
                {isListening ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Departure</Label>
              <Input id="time" type="time" value={departureTime} onChange={e => setDepartureTime(e.target.value)} className="mt-2 bg-background border-border" />
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Day</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger className="mt-2 bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Transport</Label>
            <Select value={transportMode} onValueChange={(v) => setTransportMode(v as TransportMode)}>
              <SelectTrigger className="mt-2 bg-background border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="two_wheeler"><span className="flex items-center gap-2"><Bike className="h-4 w-4" /> Two Wheeler</span></SelectItem>
                <SelectItem value="car"><span className="flex items-center gap-2"><Car className="h-4 w-4" /> Car</span></SelectItem>
                <SelectItem value="auto"><span className="flex items-center gap-2"><Navigation className="h-4 w-4" /> Auto Rickshaw</span></SelectItem>
                <SelectItem value="bus"><span className="flex items-center gap-2"><Bus className="h-4 w-4" /> Bus</span></SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground font-medium tracking-wide h-12 text-sm" disabled={isLoading}>
            {isLoading ? (
              <span className="animate-pulse">Analyzing...</span>
            ) : (
              <span className="flex items-center gap-2">Analyze Commute <ArrowRight className="h-4 w-4" /></span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
