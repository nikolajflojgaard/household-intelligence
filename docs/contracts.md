# Contracts

## InputSnapshot

```ts
type InputSnapshot = {
  generatedAt: string;
  householdId: string;
  people: Person[];
  chores: Chore[];
  calendarEvents: CalendarEvent[];
  homeState?: HomeState;
  energyState?: EnergyState;
  weather?: WeatherState;
  preferences?: Preferences;
};
```

## TopAction

```ts
type TopAction = {
  id: string;
  title: string;
  summary: string;
  category: string;
  score: number;
  urgency: 'low' | 'medium' | 'high';
  confidence: number;
  ownerId?: string;
  reasons: string[];
  sourceSignals: string[];
  whyNow: string;
  consequenceIfIgnored?: string;
  actions?: ActionOption[];
};
```

## TopThreeResult

```ts
type TopThreeResult = {
  generatedAt: string;
  actions: TopAction[];
  suppressedCount: number;
  missingSources: string[];
};
```

## DailyBrief

```ts
type DailyBrief = {
  generatedAt: string;
  topActions: TopAction[];
  nikolajTasks: TopAction[];
  risks: string[];
  opportunities: string[];
  canWait?: string[];
};
```

## FeedbackEvent

```ts
type FeedbackEvent = {
  recommendationId: string;
  event: 'done' | 'snooze' | 'dismissed' | 'useful' | 'wrong';
  actorId?: string;
  timestamp: string;
};
```
