import { createFileRoute } from '@tanstack/react-router';
import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommuteForm } from '@/components/CommuteForm';
import { CommuteMap } from '@/components/CommuteMap';
import { RiskScoreCard } from '@/components/RiskScoreCard';
import { RouteAlternatives } from '@/components/RouteAlternatives';
import { CarbonFootprint } from '@/components/CarbonFootprint';
import { CongestionForecast } from '@/components/CongestionForecast';
import { AIAdvisor } from '@/components/AIAdvisor';
import { AIChatTab } from '@/components/AIChatTab';
import { CommuteHistory } from '@/components/CommuteHistory';
import { AuthForm, UserMenu, useAuth } from '@/components/AuthGuard';
import { ScrollReveal } from '@/components/ScrollReveal';
import { calculateRisk, type TransportMode, type RiskResult } from '@/lib/risk-scoring';
import { supabase } from '@/integrations/supabase/client';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/hooks/use-dark-mode';

export const Route = createFileRoute('/')({
  component: Index,
});

const SKILLS_MARQUEE = [
  'Risk Analysis', 'Route Intelligence', 'AI-Powered', 'Real-time Data',
  'Carbon Tracking', 'Smart Scheduling', 'Safety First', 'Congestion Forecast',
  'Multi-modal', 'Commute Optimization',
];

function Index() {
  const { user, loading: authLoading } = useAuth();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [formData, setFormData] = useState({
    origin: 'Koramangala, Bangalore',
    destination: 'Whitefield, Bangalore',
    departureTime: '08:30',
    transportMode: 'car' as TransportMode,
    dayOfWeek: 'Monday',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const handleAnalyze = useCallback(async (data: typeof formData) => {
    setFormData(data);
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = calculateRisk(data.departureTime, data.dayOfWeek, data.transportMode);
    setRiskResult(result);
    setIsLoading(false);

    if (user) {
      await supabase.from('commute_history').insert({
        user_id: user.id,
        origin: data.origin,
        destination: data.destination,
        departure_time: data.departureTime,
        transport_mode: data.transportMode,
        day_of_week: data.dayOfWeek,
        risk_score: result.score,
        risk_label: result.label,
        delay_minutes: result.delayMinutes,
      });
      setHistoryRefresh(prev => prev + 1);
    }
  }, [user]);

  const handleHistoryReload = useCallback((entry: {
    origin: string;
    destination: string;
    departureTime: string;
    transportMode: TransportMode;
    dayOfWeek: string;
  }) => {
    handleAnalyze(entry);
  }, [handleAnalyze]);

  const currentHour = parseInt(formData.departureTime.split(':')[0]);
  const aiContext = riskResult
    ? `Route: ${formData.origin} → ${formData.destination}. Mode: ${formData.transportMode}. Time: ${formData.departureTime}. Risk: ${riskResult.score}/100 (${riskResult.label}). Delay: ${riskResult.delayMinutes} min. Weather: Partly cloudy, 28°C.`
    : '';

  const DarkModeToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDark}
      className="text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground tracking-wide text-sm uppercase">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 transition-colors duration-500">
        <div className="absolute top-6 right-6">
          <DarkModeToggle />
        </div>
        <div className="text-center mb-12 max-w-lg animate-[fade-in_0.8s_ease-out]">
          <h1 className="heading-editorial text-5xl md:text-6xl text-foreground mb-4">
            Smart Commute
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            AI-powered commute risk analysis for smarter travel decisions
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-chart-2 animate-pulse" />
            Available now
          </div>
        </div>
        <div className="animate-[fade-in_1s_ease-out_0.2s_both]">
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      {/* Header — minimal editorial */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-lg transition-colors duration-500">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="heading-editorial text-xl text-foreground">
            SmartCommute
          </h1>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* Skills marquee */}
      <div className="border-b border-border overflow-hidden py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...SKILLS_MARQUEE, ...SKILLS_MARQUEE].map((skill, i) => (
            <span key={i} className="mx-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {skill}
              <span className="ml-4 text-border">·</span>
            </span>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Section header */}
        <ScrollReveal>
          <div className="mb-10">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">01 — Route Analysis</p>
            <h2 className="heading-editorial text-3xl md:text-4xl text-foreground">
              Plan your commute
            </h2>
          </div>
        </ScrollReveal>

        {/* Two-column layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Form + Results */}
          <div className="space-y-8">
            <ScrollReveal delay={100}>
              <CommuteForm onAnalyze={handleAnalyze} isLoading={isLoading} />
            </ScrollReveal>
            {riskResult && (
              <>
                <ScrollReveal delay={150}>
                  <RiskScoreCard result={riskResult} departureTime={formData.departureTime} />
                </ScrollReveal>
                <ScrollReveal delay={200}>
                  <RouteAlternatives riskResult={riskResult} departureTime={formData.departureTime} />
                </ScrollReveal>
              </>
            )}
          </div>

          {/* Right: Map + Charts */}
          <div className="space-y-8">
            <ScrollReveal delay={200}>
              <CommuteMap
                origin={formData.origin}
                destination={formData.destination}
                riskResult={riskResult ?? undefined}
              />
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <CongestionForecast currentHour={currentHour} />
            </ScrollReveal>
            <ScrollReveal delay={400}>
              <CarbonFootprint selected={formData.transportMode} />
            </ScrollReveal>
          </div>
        </div>

        {/* AI Section */}
        {riskResult && (
          <ScrollReveal>
            <div className="mt-16">
              <div className="mb-8">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">02 — Intelligence</p>
                <h2 className="heading-editorial text-3xl md:text-4xl text-foreground">
                  AI Insights
                </h2>
              </div>
              <Tabs defaultValue="advisor">
                <TabsList className="mb-6">
                  <TabsTrigger value="advisor">AI Advisor</TabsTrigger>
                  <TabsTrigger value="chat">Ask AI</TabsTrigger>
                </TabsList>
                <TabsContent value="advisor">
                  <AIAdvisor
                    riskResult={riskResult}
                    transportMode={formData.transportMode}
                    origin={formData.origin}
                    destination={formData.destination}
                    departureTime={formData.departureTime}
                  />
                </TabsContent>
                <TabsContent value="chat">
                  <AIChatTab context={aiContext} />
                </TabsContent>
              </Tabs>
            </div>
          </ScrollReveal>
        )}

        {/* History */}
        <ScrollReveal>
          <div className="mt-16">
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">03 — History</p>
              <h2 className="heading-editorial text-3xl md:text-4xl text-foreground">
                Recent trips
              </h2>
            </div>
            <CommuteHistory onReload={handleHistoryReload} refreshTrigger={historyRefresh} />
          </div>
        </ScrollReveal>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 transition-colors duration-500">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">© 2026 Smart Commute Intelligence</p>
          <p className="text-xs text-muted-foreground">Berlin · Bangalore</p>
        </div>
      </footer>
    </div>
  );
}
