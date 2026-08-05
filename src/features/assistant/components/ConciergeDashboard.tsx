import { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { computeTripInsight } from '../services/recommendation.engine';
import { CompanionHero } from './CompanionHero';
import { MorningBrief } from './MorningBrief';
import { BudgetAdvisor } from './BudgetAdvisor';
import { ItineraryOptimizer } from './ItineraryOptimizer';
import { PackingAssistant } from './PackingAssistant';
import { FoodGuide } from './FoodGuide';
import { SafetyAdvisor } from './SafetyAdvisor';
import { AIJournal } from './AIJournal';
import { CompanionChat } from './CompanionChat';
import type { TripRow } from '@/features/trips/types';

const TABS: { value: string; label: string; emoji: string }[] = [
  { value: 'brief', label: 'Brief', emoji: '🌅' },
  { value: 'budget', label: 'Budget', emoji: '💰' },
  { value: 'plan', label: 'Plan', emoji: '🗺️' },
  { value: 'pack', label: 'Pack', emoji: '🎒' },
  { value: 'eat', label: 'Eat', emoji: '🍽️' },
  { value: 'safe', label: 'Safe', emoji: '🛡️' },
  { value: 'journal', label: 'Journal', emoji: '📖' },
  { value: 'chat', label: 'Chat', emoji: '💬' },
];

interface Props {
  trip: TripRow;
}

export function ConciergeDashboard({ trip }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const insight = useMemo(() => computeTripInsight(trip, today), [trip, today]);

  return (
    <div className="space-y-5">
      <CompanionHero trip={trip} insight={insight} intel={null} />

      <Tabs defaultValue="brief">
        <ScrollArea className="w-full">
          <TabsList className="mb-1 flex h-auto w-max min-w-full gap-0.5 rounded-xl bg-muted/40 p-1">
            {TABS.map(({ value, label, emoji }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <span aria-hidden>{emoji}</span>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="h-1.5" />
        </ScrollArea>

        <div className="pt-2">
          <TabsContent value="brief" className="mt-0 focus-visible:outline-none">
            <MorningBrief trip={trip} />
          </TabsContent>
          <TabsContent value="budget" className="mt-0 focus-visible:outline-none">
            <BudgetAdvisor trip={trip} />
          </TabsContent>
          <TabsContent value="plan" className="mt-0 focus-visible:outline-none">
            <ItineraryOptimizer trip={trip} />
          </TabsContent>
          <TabsContent value="pack" className="mt-0 focus-visible:outline-none">
            <PackingAssistant trip={trip} />
          </TabsContent>
          <TabsContent value="eat" className="mt-0 focus-visible:outline-none">
            <FoodGuide trip={trip} />
          </TabsContent>
          <TabsContent value="safe" className="mt-0 focus-visible:outline-none">
            <SafetyAdvisor trip={trip} />
          </TabsContent>
          <TabsContent value="journal" className="mt-0 focus-visible:outline-none">
            <AIJournal trip={trip} />
          </TabsContent>
          <TabsContent value="chat" className="mt-0 focus-visible:outline-none">
            <CompanionChat trip={trip} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
