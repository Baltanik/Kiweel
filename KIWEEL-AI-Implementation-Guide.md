# 🔄 REWIDO → KIWEEL TRANSFORMATION GUIDE

**Step-by-Step for AI (Cursor/Lovable)**  
**Version:** 1.0  
**Target Timeline:** 4 settimane (Week 1-4)  
**Tech Stack:** React 18 + TypeScript + Supabase + Tailwind

---

## 📋 FASE 0: SETUP & PREP (1-2 ore)

### STEP 0.1: Clone Rewido Repository
```bash
# Duplicate the Rewido project structure
# Create new folder: kiweel/
# Copy all files from rewido/ to kiweel/

# Update package.json
# Change name from "rewido" to "kiweel"
# Update version to "1.0.0"
```

**Deliverable:** `kiweel/` folder with clean codebase

---

### STEP 0.2: Update Branding & Constants
**File to Create:** `src/lib/constants.ts`

```typescript
// OLD (Rewido)
export const APP_NAME = "Rewido";
export const APP_TAGLINE = "Professionisti a portata di click";
export const APP_COLOR = "#3B82F6"; // Blue

// NEW (Kiweel)
export const APP_NAME = "Kiweel";
export const APP_TAGLINE = "Il tuo ecosistema wellness personale";
export const APP_COLOR = "#10B981"; // Green (wellness vibes)
export const PROFESSIONAL_CATEGORIES = [
  "Personal Trainer",
  "Dietitian",
  "Osteopath",
  "Physiotherapist",
  "Wellness Coach"
];
export const SERVICE_RADIUS_OPTIONS = [5, 10, 15, 20]; // km
```

**Deliverable:** Updated branding constants

---

## 🗄️ FASE 1: DATABASE TRANSFORMATION (6-8 ore)

### STEP 1.1: Extend Database Schema
**File:** Create `supabase/migrations/001_kiweel_schema_additions.sql`

```sql
-- 1. Add wellness-specific fields to professionals table
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS (
  profession_type TEXT CHECK (profession_type IN ('PT', 'Dietitian', 'Osteopath', 'Physiotherapist', 'Coach')),
  specializations TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  health_focus TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  availability_json JSONB DEFAULT '{"monday": [], "tuesday": [], ...}'
);

-- 2. Add wellness fields to users table (clients)
ALTER TABLE users ADD COLUMN IF NOT EXISTS (
  health_goals TEXT[] DEFAULT '{}',
  fitness_level TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
  medical_conditions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  current_professionals UUID[] DEFAULT '{}',
  kiweel_tokens INT DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free'
);

-- 3. Create SHARED_DATA table (Core Differentiator)
CREATE TABLE IF NOT EXISTS shared_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('diet_plan', 'workout_plan', 'diagnosis', 'progress', 'prescription')),
  category TEXT,
  content JSONB,
  file_urls TEXT[] DEFAULT '{}',
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_log JSONB DEFAULT '[]',
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'shared')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shared_data_client ON shared_data(client_id);
CREATE INDEX idx_shared_data_professional ON shared_data(professional_id);
CREATE INDEX idx_shared_data_type ON shared_data(data_type);

-- 4. Create DIET_PLANS table
CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dietitian_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  meals_per_day INT DEFAULT 3,
  plan_json JSONB,
  macros_target JSONB DEFAULT '{"protein": 30, "carbs": 40, "fat": 30}',
  shared_with_professionals UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_diet_plans_dietitian ON diet_plans(dietitian_id);
CREATE INDEX idx_diet_plans_client ON diet_plans(client_id);

-- 5. Create WORKOUT_PLANS table
CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  program_type TEXT CHECK (program_type IN ('strength', 'cardio', 'flexibility', 'mixed')),
  exercises_json JSONB,
  duration_days INT DEFAULT 30,
  shared_with_professionals UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workout_plans_trainer ON workout_plans(trainer_id);
CREATE INDEX idx_workout_plans_client ON workout_plans(client_id);

-- 6. Create PROGRESS_TRACKING table
CREATE TABLE IF NOT EXISTS progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL(5,2),
  measurements JSONB DEFAULT '{"chest": 0, "waist": 0, "hips": 0}',
  energy_level INT CHECK (energy_level BETWEEN 1 AND 10),
  mood TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_progress_tracking_client ON progress_tracking(client_id);
CREATE INDEX idx_progress_tracking_date ON progress_tracking(tracking_date DESC);

-- 7. Create MISSIONS table (Gamification)
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('daily', 'weekly', 'milestone')),
  title TEXT NOT NULL,
  description TEXT,
  target_value INT,
  current_progress INT DEFAULT 0,
  token_reward INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'failed')),
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_missions_client ON missions(client_id);
CREATE INDEX idx_missions_status ON missions(status);

-- 8. Create TOKENS_TRANSACTIONS table
CREATE TABLE IF NOT EXISTS tokens_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'purchase', 'gift')),
  amount INT NOT NULL,
  description TEXT,
  related_entity_id UUID,
  balance_before INT,
  balance_after INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tokens_transactions_user ON tokens_transactions(user_id);
CREATE INDEX idx_tokens_transactions_type ON tokens_transactions(transaction_type);

-- 9. Update PROFESSIONAL_POSTS for Kiweel
ALTER TABLE professional_posts ADD COLUMN IF NOT EXISTS (
  post_category TEXT DEFAULT 'showcase' CHECK (post_category IN ('showcase', 'tip', 'achievement', 'milestone', 'transformation')),
  engagement_score INT DEFAULT 0
);

-- 10. Create RLS Policies for new tables
ALTER TABLE shared_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: shared_data - clients can view their own, pros can view shared
CREATE POLICY "shared_data_client_access"
  ON shared_data FOR SELECT
  USING (
    auth.uid() = client_id OR 
    (auth.uid() IN (SELECT user_id FROM professionals WHERE id = professional_id))
  );

-- RLS Policy: diet_plans - clients and assigned pros
CREATE POLICY "diet_plans_access"
  ON diet_plans FOR SELECT
  USING (
    auth.uid() = client_id OR
    auth.uid() = (SELECT user_id FROM professionals WHERE id = dietitian_id) OR
    auth.uid() = ANY(shared_with_professionals)
  );

-- RLS Policy: workout_plans - clients and assigned pros
CREATE POLICY "workout_plans_access"
  ON workout_plans FOR SELECT
  USING (
    auth.uid() = client_id OR
    auth.uid() = (SELECT user_id FROM professionals WHERE id = trainer_id) OR
    auth.uid() = ANY(shared_with_professionals)
  );

-- RLS Policy: progress_tracking - clients only
CREATE POLICY "progress_tracking_own_access"
  ON progress_tracking FOR SELECT
  USING (auth.uid() = client_id);

-- RLS Policy: missions - clients only
CREATE POLICY "missions_own_access"
  ON missions FOR SELECT
  USING (auth.uid() = client_id);

-- RLS Policy: tokens - users only
CREATE POLICY "tokens_own_access"
  ON tokens_transactions FOR SELECT
  USING (auth.uid() = user_id);
```

**Deliverable:** Migration script ready for deployment to Supabase

**Action:** Run migration in Supabase console:
```bash
supabase migration up
# or manually paste SQL in Supabase SQL Editor
```

---

### STEP 1.2: Update TypeScript Types
**File:** `src/integrations/supabase/types.ts`

```typescript
// Add new types for Kiweel

export interface Professional extends Rewido.Professional {
  profession_type: 'PT' | 'Dietitian' | 'Osteopath' | 'Physiotherapist' | 'Coach';
  specializations: string[];
  certifications: string[];
  health_focus: string[];
  featured: boolean;
  availability_json: Record<string, string[]>;
}

export interface KiwellClient extends Rewido.User {
  health_goals: string[];
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  medical_conditions: string[];
  allergies: string[];
  current_professionals: string[];
  kiweel_tokens: number;
  subscription_tier: 'free' | 'pro' | 'business';
}

export interface SharedData {
  id: string;
  client_id: string;
  professional_id: string;
  data_type: 'diet_plan' | 'workout_plan' | 'diagnosis' | 'progress' | 'prescription';
  category: string;
  content: Record<string, any>;
  file_urls: string[];
  shared_at: string;
  access_log: any[];
  visibility: 'private' | 'shared';
  created_at: string;
  updated_at: string;
}

export interface DietPlan {
  id: string;
  dietitian_id: string;
  client_id: string;
  name: string;
  description: string;
  meals_per_day: number;
  plan_json: Record<string, any>;
  macros_target: { protein: number; carbs: number; fat: number };
  shared_with_professionals: string[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlan {
  id: string;
  trainer_id: string;
  client_id: string;
  name: string;
  description: string;
  program_type: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  exercises_json: Record<string, any>;
  duration_days: number;
  shared_with_professionals: string[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressTracking {
  id: string;
  client_id: string;
  tracking_date: string;
  weight: number;
  measurements: { chest: number; waist: number; hips: number };
  energy_level: number;
  mood: string;
  notes: string;
  created_at: string;
}

export interface Mission {
  id: string;
  client_id: string;
  mission_type: 'daily' | 'weekly' | 'milestone';
  title: string;
  description: string;
  target_value: number;
  current_progress: number;
  token_reward: number;
  status: 'active' | 'completed' | 'expired' | 'failed';
  expires_at: string;
  completed_at: string;
  created_at: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earn' | 'spend' | 'purchase' | 'gift';
  amount: number;
  description: string;
  related_entity_id: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
}
```

**Deliverable:** Updated TypeScript types

---

## 🎨 FASE 2: FRONTEND REFACTOR (10-12 ore)

### STEP 2.1: Update Authentication Flow
**File:** `src/contexts/AuthContext.tsx`

Change registration flow to separate client vs professional:

```typescript
// Add to AuthContext
export interface AuthContextType {
  // ... existing
  signUpAsClient: (email: string, password: string, name: string, health_goals: string[]) => Promise<void>;
  signUpAsProfessional: (
    email: string, 
    password: string, 
    name: string, 
    profession: 'PT' | 'Dietitian' | 'Osteopath' | 'Physiotherapist' | 'Coach',
    specializations: string[]
  ) => Promise<void>;
  getUserRole: () => 'client' | 'professional' | null;
}
```

**Deliverable:** Updated auth context

---

### STEP 2.2: Update Professional Categories Filter
**File:** `src/components/professionals/FilterSheet.tsx`

```typescript
// OLD (Rewido)
const categories = [
  "Idraulico", "Elettricista", "Parrucchiera", "Meccanico", ...
];

// NEW (Kiweel)
const professionTypes = [
  { id: 'PT', label: 'Personal Trainer', icon: '💪' },
  { id: 'Dietitian', label: 'Dietitian', icon: '🥗' },
  { id: 'Osteopath', label: 'Osteopath', icon: '🦴' },
  { id: 'Physiotherapist', label: 'Physiotherapist', icon: '🏥' },
  { id: 'Coach', label: 'Wellness Coach', icon: '🧘' }
];

// Update filter query
const filterByProfession = async (professionType: string) => {
  const { data } = await supabase
    .from('professionals')
    .select('*')
    .eq('profession_type', professionType)
    .lte('distance_km', selectedRadius);
};
```

**Deliverable:** Updated professional filter UI

---

### STEP 2.3: Create Shared Data Component
**File:** `src/components/kiweel/SharedDataViewer.tsx`

```typescript
// Component to display shared data from professionals
interface SharedDataViewerProps {
  clientId: string;
  dataType?: 'diet_plan' | 'workout_plan' | 'progress' | 'all';
}

export function SharedDataViewer({ clientId, dataType = 'all' }: SharedDataViewerProps) {
  const [sharedData, setSharedData] = useState<SharedData[]>([]);

  useEffect(() => {
    const subscription = supabase
      .from('shared_data')
      .on('*', payload => {
        // Real-time update
        setSharedData(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [clientId]);

  return (
    <div className="space-y-4">
      {sharedData.map(data => (
        <Card key={data.id} className="p-4">
          <div className="flex items-center gap-2">
            <Badge>{data.data_type}</Badge>
            <span className="font-semibold">{data.category}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">{data.content.description}</p>
          <Button size="sm" className="mt-4">View Details</Button>
        </Card>
      ))}
    </div>
  );
}
```

**Deliverable:** Shared data viewer component

---

### STEP 2.4: Create Diet Plan Manager
**File:** `src/components/kiweel/DietPlanManager.tsx`

```typescript
// Component for dietitians to create/edit diet plans
export function DietPlanManager({ clientId }: { clientId: string }) {
  const [formData, setFormData] = useState({
    name: '',
    meals_per_day: 3,
    macros_target: { protein: 30, carbs: 40, fat: 30 },
    meals: [],
    shared_with_professionals: [] as string[]
  });

  const createDietPlan = async () => {
    const { error } = await supabase
      .from('diet_plans')
      .insert([{
        dietitian_id: currentUserProfessionalId,
        client_id: clientId,
        ...formData,
        status: 'active'
      }]);

    if (!error) {
      toast.success('Diet plan created!');
      // Create shared_data entry for visibility
      await supabase.from('shared_data').insert([{
        client_id: clientId,
        professional_id: currentUserProfessionalId,
        data_type: 'diet_plan',
        content: formData
      }]);
    }
  };

  return (
    <form onSubmit={createDietPlan} className="space-y-4">
      <Input 
        placeholder="Plan name" 
        value={formData.name}
        onChange={e => setFormData({...formData, name: e.target.value})}
      />
      
      <Select value={String(formData.meals_per_day)} onValueChange={val => 
        setFormData({...formData, meals_per_day: parseInt(val)})
      }>
        <option>1 meal</option>
        <option>2 meals</option>
        <option>3 meals</option>
        <option>4 meals</option>
      </Select>

      {/* Macro inputs */}
      <div className="grid grid-cols-3 gap-2">
        <Input type="number" placeholder="Protein %" value={formData.macros_target.protein} />
        <Input type="number" placeholder="Carbs %" value={formData.macros_target.carbs} />
        <Input type="number" placeholder="Fat %" value={formData.macros_target.fat} />
      </div>

      <Button type="submit" className="w-full">Create Diet Plan</Button>
    </form>
  );
}
```

**Deliverable:** Diet plan manager component

---

### STEP 2.5: Create Workout Plan Manager
**File:** `src/components/kiweel/WorkoutPlanManager.tsx`

Similar to DietPlanManager, but for workout plans (exercises, reps, sets, duration)

**Deliverable:** Workout plan manager component

---

### STEP 2.6: Create Progress Tracking Component
**File:** `src/components/kiweel/ProgressTracker.tsx`

```typescript
// Component for clients to log weight, measurements, mood
export function ProgressTracker({ clientId }: { clientId: string }) {
  const [weight, setWeight] = useState('');
  const [mood, setMood] = useState('');
  const [measurements, setMeasurements] = useState({ chest: '', waist: '', hips: '' });

  const logProgress = async () => {
    const { error } = await supabase
      .from('progress_tracking')
      .insert([{
        client_id: clientId,
        tracking_date: new Date().toISOString().split('T')[0],
        weight: parseFloat(weight),
        measurements,
        mood,
        energy_level: 5 // default
      }]);

    if (!error) {
      toast.success('Progress logged!');
      // Award tokens for consistency
      await awardTokens(clientId, 10, 'Progress logged');
    }
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Log Today's Progress</h3>
      <Input type="number" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} />
      <div className="grid grid-cols-3 gap-2 mt-2">
        <Input placeholder="Chest" value={measurements.chest} onChange={e => setMeasurements({...measurements, chest: e.target.value})} />
        <Input placeholder="Waist" value={measurements.waist} onChange={e => setMeasurements({...measurements, waist: e.target.value})} />
        <Input placeholder="Hips" value={measurements.hips} onChange={e => setMeasurements({...measurements, hips: e.target.value})} />
      </div>
      <Select value={mood} onValueChange={setMood} className="mt-2">
        <option>How's your mood?</option>
        <option>Great</option>
        <option>Good</option>
        <option>Okay</option>
        <option>Bad</option>
      </Select>
      <Button onClick={logProgress} className="w-full mt-4">Log Progress</Button>
    </Card>
  );
}
```

**Deliverable:** Progress tracking component

---

### STEP 2.7: Update Professional Dashboard
**File:** `src/pages/ProDashboard.tsx`

Add new tabs for Kiweel features:

```typescript
// Add to dashboard tabs
const tabs = [
  { id: 'home', label: 'Home', component: <DashboardHome /> },
  { id: 'portfolio', label: 'Portfolio', component: <PortfolioManager /> },
  { id: 'shared-data', label: 'Shared Data', component: <SharedDataManager /> },
  { id: 'diet-plans', label: 'Diet Plans', component: <DietPlanManager /> },
  { id: 'workout-plans', label: 'Workout Plans', component: <WorkoutPlanManager /> },
  { id: 'clients', label: 'My Clients', component: <ClientsList /> },
  { id: 'bookings', label: 'Bookings', component: <BookingsList /> },
  { id: 'feed', label: 'Kiweel Feed', component: <KiwellFeedManager /> }
];
```

**Deliverable:** Updated dashboard with new tabs

---

### STEP 2.8: Create Gamification System
**File:** `src/components/kiweel/Gamification.tsx`

```typescript
export function GameificationHub({ userId }: { userId: string }) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [tokens, setTokens] = useState(0);

  // Load missions
  useEffect(() => {
    supabase
      .from('missions')
      .select('*')
      .eq('client_id', userId)
      .eq('status', 'active')
      .then(({ data }) => setMissions(data || []));

    // Load token balance
    supabase
      .from('users')
      .select('kiweel_tokens')
      .eq('id', userId)
      .single()
      .then(({ data }) => setTokens(data?.kiweel_tokens || 0));
  }, [userId]);

  const completeMission = async (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    // Update mission
    await supabase
      .from('missions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', missionId);

    // Award tokens
    await awardTokens(userId, mission.token_reward, `Completed: ${mission.title}`);
    
    toast.success(`+${mission.token_reward} tokens!`);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-green-500 to-teal-500 p-6 text-white">
        <h3 className="text-2xl font-bold">{tokens} Kiweel Tokens</h3>
        <p className="text-sm opacity-90">Earn by completing missions</p>
      </Card>

      <div className="space-y-2">
        <h4 className="font-semibold">Active Missions</h4>
        {missions.map(mission => (
          <Card key={mission.id} className="p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">{mission.title}</p>
                <Progress value={(mission.current_progress / mission.target_value) * 100} className="mt-2" />
              </div>
              <Badge variant="secondary">+{mission.token_reward}</Badge>
            </div>
            {mission.current_progress >= mission.target_value && (
              <Button size="sm" onClick={() => completeMission(mission.id)} className="mt-2">Claim Reward</Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// Helper function
async function awardTokens(userId: string, amount: number, description: string) {
  // Get current balance
  const { data: user } = await supabase
    .from('users')
    .select('kiweel_tokens')
    .eq('id', userId)
    .single();

  const newBalance = (user?.kiweel_tokens || 0) + amount;

  // Update user balance
  await supabase
    .from('users')
    .update({ kiweel_tokens: newBalance })
    .eq('id', userId);

  // Log transaction
  await supabase
    .from('tokens_transactions')
    .insert([{
      user_id: userId,
      transaction_type: 'earn',
      amount,
      description,
      balance_before: user?.kiweel_tokens || 0,
      balance_after: newBalance
    }]);
}
```

**Deliverable:** Gamification hub component

---

### STEP 2.9: Update Rewall (Rename to Kiweel Feed)
**File:** `src/pages/KiwellFeed.tsx`

```typescript
// OLD: src/pages/Rewall.tsx → NEW: src/pages/KiwellFeed.tsx

// Update post types for wellness
const POST_CATEGORIES = [
  { id: 'showcase', label: 'Work Showcase', icon: '📸' },
  { id: 'tip', label: 'Wellness Tip', icon: '💡' },
  { id: 'achievement', label: 'Client Achievement', icon: '🏆' },
  { id: 'milestone', label: 'Milestone', icon: '🎯' },
  { id: 'transformation', label: 'Transformation', icon: '✨' }
];

// Update post creation form
export function CreatePost() {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('showcase');
  const [images, setImages] = useState<File[]>([]);

  const createPost = async () => {
    // Upload images
    const imageUrls = await Promise.all(images.map(img => uploadImage(img)));

    // Create post
    const { error } = await supabase
      .from('professional_posts')
      .insert([{
        pro_id: currentUserId,
        content,
        image_urls: imageUrls,
        post_category: category,
        visibility: 'public'
      }]);

    if (!error) {
      toast.success('Post published!');
      await awardTokens(currentUserId, 5, 'Post published on Kiweel Feed');
    }
  };

  return (
    // Form for creating posts
  );
}
```

**Deliverable:** Renamed and updated Rewall to Kiweel Feed

---

## 🔗 FASE 3: INTEGRATION & REAL-TIME (8-10 ore)

### STEP 3.1: Create Real-time Subscriptions for Shared Data
**File:** `src/hooks/useSharedData.ts`

```typescript
export function useSharedData(clientId: string, professionId?: string) {
  const [sharedData, setSharedData] = useState<SharedData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      let query = supabase
        .from('shared_data')
        .select('*')
        .eq('client_id', clientId);

      if (professionId) {
        query = query.eq('professional_id', professionId);
      }

      const { data } = await query;
      setSharedData(data || []);
      setLoading(false);
    };

    fetchData();

    // Subscribe to real-time changes
    const subscription = supabase
      .from('shared_data')
      .on('*', payload => {
        if (payload.new.client_id === clientId) {
          if (payload.eventType === 'INSERT') {
            setSharedData(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setSharedData(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setSharedData(prev => prev.filter(item => item.id !== payload.old.id));
          }
        }
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [clientId, professionId]);

  return { sharedData, loading };
}
```

**Deliverable:** Real-time shared data hook

---

### STEP 3.2: Create Hooks for Diet/Workout Plans
**File:** `src/hooks/useDietPlans.ts` & `src/hooks/useWorkoutPlans.ts`

Similar pattern to `useSharedData` but for diet_plans and workout_plans tables.

**Deliverable:** Diet and workout plan hooks with real-time subscriptions

---

### STEP 3.3: Create Token Economy Transactions
**File:** `src/integrations/tokens/tokenService.ts`

```typescript
export class TokenService {
  // Award tokens for various actions
  static async awardTokensForAction(userId: string, action: string) {
    const tokenMap = {
      'daily_check_in': 5,
      'post_published': 5,
      'comment_posted': 2,
      'booking_completed': 50,
      'diet_plan_followed_week': 100,
      'workout_completed': 10,
      'mission_completed': 50
    };

    const amount = tokenMap[action as keyof typeof tokenMap] || 0;
    if (amount === 0) return;

    await awardTokens(userId, amount, action);
  }

  // Spend tokens for services/features
  static async spendTokens(userId: string, amount: number, service: string) {
    const { data: user } = await supabase
      .from('users')
      .select('kiweel_tokens')
      .eq('id', userId)
      .single();

    if ((user?.kiweel_tokens || 0) < amount) {
      throw new Error('Insufficient tokens');
    }

    const newBalance = user!.kiweel_tokens - amount;

    await supabase
      .from('users')
      .update({ kiweel_tokens: newBalance })
      .eq('id', userId);

    await supabase
      .from('tokens_transactions')
      .insert([{
        user_id: userId,
        transaction_type: 'spend',
        amount: -amount,
        description: service,
        balance_before: user!.kiweel_tokens,
        balance_after: newBalance
      }]);
  }

  // Get token balance
  static async getBalance(userId: string) {
    const { data } = await supabase
      .from('users')
      .select('kiweel_tokens')
      .eq('id', userId)
      .single();

    return data?.kiweel_tokens || 0;
  }
}
```

**Deliverable:** Token economy service

---

### STEP 3.4: Update Booking System to Track Wellness Progress
**File:** `src/components/kiweel/BookingIntegration.tsx`

When booking is completed:
```typescript
// After booking marked as completed
const completeBooking = async (bookingId: string) => {
  // ... existing booking completion logic

  // Log wellness interaction
  await supabase
    .from('progress_tracking')
    .insert([{
      client_id: bookingClientId,
      tracking_date: new Date().toISOString().split('T')[0],
      notes: `Session with ${professionalName}`
    }]);

  // Award tokens
  await TokenService.awardTokensForAction(bookingClientId, 'booking_completed');
};
```

**Deliverable:** Integrated booking system with wellness tracking

---

## 📱 FASE 4: UI/UX REFINEMENT (6-8 ore)

### STEP 4.1: Create Kiweel-Themed Layout
**File:** `src/components/layout/KiwellLayout.tsx`

```typescript
// New layout with wellness branding
export function KiwellLayout({ children }: { children: ReactNode }) {
  return (
    <MobileLayout>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-green-500 to-teal-500 text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Kiweel</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white text-green-600">
              {tokensBalance} Tokens
            </Badge>
            <Notification />
          </div>
        </div>
      </header>
      
      <main className="pb-20">
        {children}
      </main>

      <BottomNav 
        tabs={[
          { id: 'home', label: 'Home', icon: '🏠' },
          { id: 'discover', label: 'Discover', icon: '🔍' },
          { id: 'shared-data', label: 'Health', icon: '❤️' },
          { id: 'messages', label: 'Chat', icon: '💬' },
          { id: 'profile', label: 'Profile', icon: '👤' }
        ]}
      />
    </MobileLayout>
  );
}
```

**Deliverable:** Kiweel-themed layout component

---

### STEP 4.2: Create Professional Discovery with Wellness Focus
**File:** `src/pages/DiscoverProfessionals.tsx`

```typescript
// Update to show profession_type and health_focus instead of generic categories
export function DiscoverProfessionals() {
  const [filters, setFilters] = useState({
    profession_type: '',
    health_goals: [],
    distance_km: 15
  });

  const query = supabase
    .from('professionals')
    .select('*, users(name, avatar_url), rating')
    .eq('profession_type', filters.profession_type || null)
    .lte('distance_km', filters.distance_km);

  // Render filtered professionals with health-focused info
  return (
    <>
      {professionals.map(pro => (
        <ProfessionalWellnessCard key={pro.id} professional={pro} />
      ))}
    </>
  );
}
```

**Deliverable:** Updated professional discovery UI

---

### STEP 4.3: Create Client Dashboard
**File:** `src/pages/ClientDashboard.tsx`

```typescript
export function ClientDashboard({ userId }: { userId: string }) {
  return (
    <KiwellLayout>
      <div className="space-y-4 p-4">
        {/* Tokens & Missions */}
        <GameificationHub userId={userId} />

        {/* Shared Data from Professionals */}
        <SharedDataViewer clientId={userId} />

        {/* Progress Tracking */}
        <ProgressTracker clientId={userId} />

        {/* My Professionals */}
        <MyProfessionalsCard userId={userId} />

        {/* Upcoming Bookings */}
        <UpcomingBookingsCard userId={userId} />
      </div>
    </KiwellLayout>
  );
}
```

**Deliverable:** New client dashboard for Kiweel

---

## 🧪 FASE 5: TESTING & OPTIMIZATION (4-6 ore)

### STEP 5.1: Test Database Migrations
```bash
# In Supabase console, test:
1. SELECT * FROM shared_data; -- should be empty
2. SELECT * FROM diet_plans; -- should be empty
3. SELECT * FROM workout_plans; -- should be empty
4. SELECT * FROM progress_tracking; -- should be empty
5. SELECT * FROM missions; -- should be empty

# Test RLS policies:
# - Create test client, test professional
# - Insert shared_data as professional
# - Try to read as client (should work)
# - Try to read as random user (should fail)
```

**Deliverable:** Confirmed database working correctly

---

### STEP 5.2: Test Real-time Subscriptions
```typescript
// Test in browser console:
const subscription = supabase
  .from('shared_data')
  .on('*', payload => {
    console.log('Change received!', payload);
  })
  .subscribe();

// Insert test data from another window, should see real-time update
```

**Deliverable:** Confirmed real-time working

---

### STEP 5.3: Test User Flows
```
Test Flow 1: Register as Professional (PT)
- Go to /auth
- Click "Register as Professional"
- Fill profession type = "PT"
- Add specializations
- Verify in professionals table

Test Flow 2: Professional Creates Diet Plan
- Login as Dietitian
- Go to dashboard → Diet Plans
- Create diet plan
- Verify shared_data entry created
- Verify real-time update

Test Flow 3: Client Sees Shared Data
- Login as client
- Go to Health tab
- Should see diet plans from assigned dietitian
- Click to view details

Test Flow 4: Token Rewards
- Complete mission
- Should see tokens increase
- Check tokens_transactions table for log
```

**Deliverable:** User flow testing completed

---

### STEP 5.4: Performance Optimization
```typescript
// Add code splitting for new features
const DietPlanManager = lazy(() => import('./DietPlanManager'));
const WorkoutPlanManager = lazy(() => import('./WorkoutPlanManager'));
const ProgressTracker = lazy(() => import('./ProgressTracker'));
const GameificationHub = lazy(() => import('./Gamification'));

// Optimize queries with pagination
const PAGE_SIZE = 20;

const { data: pagedSharedData } = await supabase
  .from('shared_data')
  .select('*')
  .eq('client_id', userId)
  .range(0, PAGE_SIZE - 1)
  .order('created_at', { ascending: false });
```

**Deliverable:** Performance optimized

---

## 🚀 FASE 6: LAUNCH PREPARATION (4-6 ore)

### STEP 6.1: Create Seed Data for Testing
```sql
-- Insert test professionals
INSERT INTO professionals (user_id, profession_type, specializations, health_focus)
VALUES 
  ('user-id-1', 'PT', '{strength, cardio}', '{weight loss, muscle gain}'),
  ('user-id-2', 'Dietitian', '{nutrition, meal planning}', '{weight management, sports nutrition}'),
  ('user-id-3', 'Osteopath', '{manual therapy}', '{back pain, sports injuries}');

-- Insert test missions
INSERT INTO missions (client_id, mission_type, title, target_value, token_reward)
VALUES
  ('client-id-1', 'daily', 'Complete today workout', 1, 10),
  ('client-id-1', 'weekly', 'Follow diet plan 5 days', 5, 50);
```

**Deliverable:** Seed data ready

---

### STEP 6.2: Deploy to Staging
```bash
# Deploy to Vercel staging
vercel --prod

# Test all functionality on staging
# Generate QA checklist, tick off each item
```

**Deliverable:** Staging deployment working

---

### STEP 6.3: Create Landing Page
**File:** `src/pages/Landing.tsx`

Update landing to show Kiweel differentiators:
- Shared data ecosystem
- Multi-professional collaboration
- Gamification & tokens
- Wellness focus

**Deliverable:** Updated landing page

---

### STEP 6.4: Prepare Soft Launch
- Create 10 test professional accounts
- Create 30 test client accounts
- Seed diet/workout plans
- Test end-to-end booking flow with wellness data
- Create monitoring dashboard (PostHog, Sentry)

**Deliverable:** Ready for soft launch

---

## 📋 COMPLETION CHECKLIST

```
FASE 1: DATABASE ✓
[ ] Schema migrations deployed to Supabase
[ ] All tables created with correct fields
[ ] RLS policies implemented
[ ] Indexes created for performance
[ ] TypeScript types updated

FASE 2: FRONTEND ✓
[ ] Auth flow updated for Professional/Client
[ ] Professional categories narrowed to 5
[ ] Shared data viewer component built
[ ] Diet plan manager component built
[ ] Workout plan manager component built
[ ] Progress tracker component built
[ ] Dashboard tabs updated
[ ] Gamification hub built
[ ] Rewall renamed to Kiweel Feed
[ ] Post categories updated for wellness

FASE 3: INTEGRATION ✓
[ ] Real-time subscriptions working
[ ] Shared data hooks implemented
[ ] Token economy service built
[ ] Booking system integrated with wellness
[ ] All hooks tested with real data

FASE 4: UI/UX ✓
[ ] Kiweel layout created
[ ] Professional discovery updated
[ ] Client dashboard created
[ ] Wellness branding applied
[ ] Mobile responsive confirmed

FASE 5: TESTING ✓
[ ] Database tests passed
[ ] Real-time subscription tests passed
[ ] User flow tests completed
[ ] Performance optimization done

FASE 6: LAUNCH ✓
[ ] Seed data created
[ ] Staging deployed
[ ] Landing page updated
[ ] Monitoring configured
[ ] Soft launch ready

READY FOR PRODUCTION ✓
```

---

## 🎯 SUCCESS CRITERIA

Before launching to Lainate professionals:

1. ✅ All database tables working with real data
2. ✅ Real-time updates working (<500ms latency)
3. ✅ Shared data accessible to authorized professionals
4. ✅ Token economy rewarding actions
5. ✅ UI intuitive and responsive
6. ✅ Zero console errors
7. ✅ Load time <3 seconds (first page)
8. ✅ All user flows tested end-to-end

---

## 📞 SUPPORT

**If your AI gets stuck:**

1. Check the TypeScript types match the database schema
2. Verify RLS policies allow the action
3. Check browser console for actual error messages
4. Test directly in Supabase SQL editor
5. Use Network tab to see actual API responses

---

**Ready to transform Rewido → Kiweel? Start with FASE 0 and proceed step by step! 🚀**

