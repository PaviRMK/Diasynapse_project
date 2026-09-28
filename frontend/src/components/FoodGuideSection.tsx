import React, { useState } from 'react';
import { Search, ShieldCheck, ArrowRight, Utensils, Sparkles, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

export interface FoodItem {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Indian Foods';
  carbLevel: 'Low' | 'Moderate' | 'Higher';
  carbs: number; // grams
  serving: string;
  calories?: number;
  protein?: string;
  fiber?: string;
  diabetesNote: string;
  image: string;
  glycemicIndex: 'Low' | 'Medium' | 'High';
}

export const FOOD_DATABASE: FoodItem[] = [
  // ── BREAKFAST ──
  {
    id: 'idli-sambar',
    name: 'Steamed Idli (2 pcs) with Sambar',
    category: 'Breakfast',
    carbLevel: 'Moderate',
    carbs: 32,
    serving: '2 medium idlis (approx. 100g) + 1 cup sambar',
    calories: 180,
    protein: '7g',
    fiber: '4.5g',
    glycemicIndex: 'Medium',
    diabetesNote: 'Steaming preserves nutrients without added fats. Sambar adds vegetable fiber and legume protein to slow glucose absorption.',
    image: '/food/idli_sambar.jpg',
  },
  {
    id: 'ragi-dosa',
    name: 'Finger Millet (Ragi) Dosa',
    category: 'Breakfast',
    carbLevel: 'Moderate',
    carbs: 26,
    serving: '1 medium crepe (approx. 75g) + chutney',
    calories: 155,
    protein: '4.8g',
    fiber: '3.8g',
    glycemicIndex: 'Low',
    diabetesNote: 'Ragi has higher dietary fiber and polyphenol content compared to white rice batter, supporting sustained carbohydrate metabolism.',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'methi-thepla',
    name: 'Methi (Fenugreek) Whole Wheat Thepla',
    category: 'Breakfast',
    carbLevel: 'Moderate',
    carbs: 22,
    serving: '2 small flatbreads (approx. 70g)',
    calories: 170,
    protein: '5.2g',
    fiber: '4g',
    glycemicIndex: 'Low',
    diabetesNote: 'Fenugreek leaves contain galactomannan fiber and 4-hydroxyisoleucine, naturally supportive of insulin sensitivity.',
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'besan-cheela',
    name: 'Spinach & Veggie Besan Cheela',
    category: 'Breakfast',
    carbLevel: 'Moderate',
    carbs: 21,
    serving: '2 savory gram flour pancakes with mint chutney',
    calories: 220,
    protein: '11g',
    fiber: '6g',
    glycemicIndex: 'Low',
    diabetesNote: 'Chickpea flour (besan) is naturally gluten-free and low-GI, supplying steady amino acids and dietary fiber for evening satiety.',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
  },

  // ── LUNCH ──
  {
    id: 'palak-paneer',
    name: 'Palak Paneer with Multigrain Roti',
    category: 'Lunch',
    carbLevel: 'Moderate',
    carbs: 24,
    serving: '1 bowl palak paneer + 1 multigrain roti',
    calories: 320,
    protein: '16g',
    fiber: '5.5g',
    glycemicIndex: 'Low',
    diabetesNote: 'Spinach provides magnesium and antioxidants; paneer adds casein protein and healthy fats, dampening glycemic impact.',
    image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'moong-dal-tadka',
    name: 'Yellow Moong Dal Tadka with Cumin',
    category: 'Lunch',
    carbLevel: 'Moderate',
    carbs: 18,
    serving: '1 medium bowl (150g)',
    calories: 160,
    protein: '10g',
    fiber: '5g',
    glycemicIndex: 'Low',
    diabetesNote: 'Yellow split moong dal is easily digestible, high in soluble fiber and plant protein, creating minimal postprandial glucose fluctuation.',
    image: '/food/moong_dal.jpg',
  },
  {
    id: 'grilled-fish',
    name: 'Grilled Herb & Spice Fish Fillet',
    category: 'Lunch',
    carbLevel: 'Low',
    carbs: 0,
    serving: '1 medium fillet (approx. 150g)',
    calories: 190,
    protein: '28g',
    fiber: '0g',
    glycemicIndex: 'Low',
    diabetesNote: 'Lean fish supplies high-biological-value protein and anti-inflammatory omega-3 fatty acids without glycemic load, supporting postprandial insulin sensitivity.',
    image: '/food/grilled_fish.jpg',
  },
  {
    id: 'brown-rice-sambar',
    name: 'Brown Rice with Veggie Sambar & Poriyal',
    category: 'Lunch',
    carbLevel: 'Higher',
    carbs: 45,
    serving: '1/2 cup cooked brown rice + 1 cup sambar + beans poriyal',
    calories: 310,
    protein: '10g',
    fiber: '8g',
    glycemicIndex: 'Medium',
    diabetesNote: 'Portion control is key for grain staples. The generous green bean poriyal and lentil sambar provide fiber cushioning.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'vegetable-biryani',
    name: 'Diabetic-Friendly Vegetable Brown Rice Biryani',
    category: 'Lunch',
    carbLevel: 'Higher',
    carbs: 42,
    serving: '1 bowl vegetable brown rice biryani (160g) + raita',
    calories: 280,
    protein: '8g',
    fiber: '7g',
    glycemicIndex: 'Medium',
    diabetesNote: 'Prepared with whole-grain brown basmati rice and generous fiber-rich vegetables (beans, carrots, peas). Pairing with protein-rich cucumber raita helps buffer glycemic impact.',
    image: '/food/vegetable_biryani.jpg',
  },

  // ── DINNER ──
  {
    id: 'millet-kichadi',
    name: 'Foxtail Millet & Moong Dal Kitchari',
    category: 'Dinner',
    carbLevel: 'Moderate',
    carbs: 34,
    serving: '1 bowl warm kitchari (180g) with curd',
    calories: 260,
    protein: '9.5g',
    fiber: '6.5g',
    glycemicIndex: 'Low',
    diabetesNote: 'Foxtail millet releases glucose considerably slower than polished white rice, preventing overnight glycemic peaks.',
    image: '/food/foxtail_millet.jpg',
  },

  // ── SNACKS ──
  {
    id: 'roasted-makhana',
    name: 'Spiced Roasted Foxnuts (Makhana)',
    category: 'Snacks',
    carbLevel: 'Low',
    carbs: 12,
    serving: '1 large bowl roasted (30g)',
    calories: 105,
    protein: '3.5g',
    fiber: '3g',
    glycemicIndex: 'Low',
    diabetesNote: 'A light, crunchy whole food snack with low sodium, minimal glycemic load, and rich in potassium and magnesium.',
    image: '/food/roasted_makhana.jpg',
  },
  {
    id: 'sprout-salad',
    name: 'Moong Bean Sprouts & Cucumber Sundal',
    category: 'Snacks',
    carbLevel: 'Low',
    carbs: 14,
    serving: '1 cup seasoned salad (120g)',
    calories: 110,
    protein: '8g',
    fiber: '5g',
    glycemicIndex: 'Low',
    diabetesNote: 'Germinated moong beans exhibit lower starch levels and elevated enzymatic bioavailability, yielding minimal glycemic variation.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'chana-sundal',
    name: 'Kondakadalai (Black Chickpea) Sundal',
    category: 'Snacks',
    carbLevel: 'Moderate',
    carbs: 20,
    serving: '3/4 cup tempered chickpeas (100g)',
    calories: 160,
    protein: '9g',
    fiber: '7.5g',
    glycemicIndex: 'Low',
    diabetesNote: 'Black chickpeas boast an exceptionally low glycemic index and high resistant starch content, sustaining baseline energy.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'curd-flax',
    name: 'Cultured Curd with Roasted Flaxseeds',
    category: 'Snacks',
    carbLevel: 'Low',
    carbs: 6,
    serving: '1 cup fresh plain curd + 1 tbsp ground flaxseeds',
    calories: 130,
    protein: '8g',
    fiber: '2.8g',
    glycemicIndex: 'Low',
    diabetesNote: 'Cultured probiotic lactic acid bacteria support gut barrier integrity; alpha-linolenic acid (ALA) in flax seeds benefits lipids.',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80',
  },
];

export function FoodGuideSection() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeCarbTier, setActiveCarbTier] = useState<string>('All');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Indian Foods'];
  const carbTiers = ['All', 'Low (<15g)', 'Moderate (15–35g)', 'Higher (>35g)'];

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const filteredFoods = FOOD_DATABASE.filter((food) => {
    // Search filter
    const matchesSearch =
      food.name.toLowerCase().includes(search.toLowerCase()) ||
      food.diabetesNote.toLowerCase().includes(search.toLowerCase());

    // Category filter
    let matchesCategory = true;
    if (activeCategory === 'Indian Foods') {
      matchesCategory = true; // All items in our clinical curated set are Indian heritage staples
    } else if (activeCategory !== 'All') {
      matchesCategory = food.category === activeCategory;
    }

    // Carb tier filter
    let matchesCarb = true;
    if (activeCarbTier === 'Low (<15g)') {
      matchesCarb = food.carbs < 15;
    } else if (activeCarbTier === 'Moderate (15–35g)') {
      matchesCarb = food.carbs >= 15 && food.carbs <= 35;
    } else if (activeCarbTier === 'Higher (>35g)') {
      matchesCarb = food.carbs > 35;
    }

    return matchesSearch && matchesCategory && matchesCarb;
  });

  return (
    <div className="space-y-6">
      {/* Top Disclaimer Notice */}
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs sm:text-sm text-soft leading-relaxed flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary mt-0.5" />
        <div>
          <span className="font-bold text-foreground">Clinical Nutrition Telemetry: </span>
          Every culinary item and macronutrient profile in this guide is mapped directly to authentic culinary imagery and evidence-based glycemic indices. DiaSynapse provides situational guidance; consult your clinical care team for personalized carbohydrate ratios.
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3.5">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            className="field pl-10 text-xs sm:text-sm"
            placeholder="Search Makhana, Fish, Millet, Moong Dal, Biryani, Idli, Dosa, vegetables, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Meal Categories */}
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-card/60 p-1">
            {categories.map((cat) => (
              <Button
                key={cat}
                type="button"
                size="sm"
                variant={activeCategory === cat ? 'default' : 'ghost'}
                onClick={() => setActiveCategory(cat)}
                className="h-7 text-xs font-semibold px-3"
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Carb Tier Pills */}
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-card/60 p-1">
            {carbTiers.map((tier) => (
              <Button
                key={tier}
                type="button"
                size="sm"
                variant={activeCarbTier === tier ? 'secondary' : 'ghost'}
                onClick={() => setActiveCarbTier(tier)}
                className={`h-7 text-xs font-semibold px-2.5 ${activeCarbTier === tier ? 'border border-primary/40 text-foreground' : 'text-muted-foreground'}`}
              >
                {tier}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Foods Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredFoods.map((item) => {
          const shouldHideImage = item.id === 'oats-upma';
          const canShowImage = !shouldHideImage && !!item.image && !imageErrors[item.id];

          return (
            <div
              key={item.id}
              onClick={() => setSelectedFood(item)}
              className="panel-interactive group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card/90 cursor-pointer p-0 text-left transition-all"
            >
              {!shouldHideImage && (
                <div className="relative h-44 w-full overflow-hidden bg-secondary flex items-center justify-center">
                  {canShowImage ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      onError={() => handleImageError(item.id)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                      <Utensils className="h-8 w-8 text-primary/60 mb-1" />
                      <span className="text-xs font-semibold text-foreground">{item.name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-foreground">
                      {item.category}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                        item.carbLevel === 'Low'
                          ? 'bg-emerald-500/80 text-white'
                          : item.carbLevel === 'Moderate'
                          ? 'bg-amber-500/80 text-white'
                          : 'bg-primary/80 text-white'
                      }`}
                    >
                      {item.carbLevel} Carb
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-extrabold text-white shadow-md">
                    ~{item.carbs}g carbs
                  </div>
                </div>
              )}

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    Serving: {item.serving}
                  </p>
                  <p className="mt-2 text-xs text-soft line-clamp-2 leading-relaxed">
                    {item.diabetesNote}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">GI: {item.glycemicIndex}</span>
                  <span className="font-bold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View Details <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFoods.length === 0 && (
        <div className="panel p-10 text-center space-y-3">
          <Utensils className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm font-semibold text-foreground">No culinary items match your filter criteria.</p>
          <p className="text-xs text-muted-foreground">Try clearing your search term or selecting a different category.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearch('');
              setActiveCategory('All');
              setActiveCarbTier('All');
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Detailed Modal Dialog */}
      <Dialog open={!!selectedFood} onOpenChange={(o) => !o && setSelectedFood(null)}>
        <DialogContent className="sm:max-w-lg overflow-hidden p-0 border border-primary/30">
          {selectedFood && (
            <div>
              {!selectedFood || selectedFood.id !== 'oats-upma' ? (
                <div className="relative h-52 w-full overflow-hidden bg-secondary flex items-center justify-center">
                  {!imageErrors[selectedFood.id] && selectedFood.image ? (
                    <img
                      src={selectedFood.image}
                      alt={selectedFood.name}
                      onError={() => handleImageError(selectedFood.id)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                      <Utensils className="h-10 w-10 text-primary/60 mb-2" />
                      <span className="text-sm font-semibold text-foreground">{selectedFood.name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
                        {selectedFood.category}
                      </span>
                      <span className="rounded-full bg-secondary/90 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        GI: {selectedFood.glycemicIndex}
                      </span>
                    </div>
                    <DialogTitle className="mt-2 text-xl font-bold text-foreground">
                      {selectedFood.name}
                    </DialogTitle>
                  </div>
                </div>
              ) : (
                <div className="p-6 pb-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
                      {selectedFood.category}
                    </span>
                    <span className="rounded-full bg-secondary/90 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                      GI: {selectedFood.glycemicIndex}
                    </span>
                  </div>
                  <DialogTitle className="mt-3 text-xl font-bold text-foreground">
                    {selectedFood.name}
                  </DialogTitle>
                </div>
              )}

              <div className="p-6 space-y-5">
                <DialogDescription className="text-xs text-muted-foreground">
                  Standard portion context: {selectedFood.serving}
                </DialogDescription>

                {/* Macro summary pills */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-lg border border-border/80 bg-secondary/30 p-2.5">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground">Carbs</span>
                    <span className="text-lg font-extrabold text-primary">{selectedFood.carbs}g</span>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-secondary/30 p-2.5">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground">Fiber</span>
                    <span className="text-lg font-extrabold text-foreground">{selectedFood.fiber || '—'}</span>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-secondary/30 p-2.5">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground">Protein</span>
                    <span className="text-lg font-extrabold text-foreground">{selectedFood.protein || '—'}</span>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-secondary/30 p-2.5">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground">Est. Cal</span>
                    <span className="text-lg font-extrabold text-foreground">{selectedFood.calories || '—'}</span>
                  </div>
                </div>

                {/* Diabetes context */}
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <Sparkles className="h-4 w-4" /> Diabetes-Friendly Nutritional Note
                  </div>
                  <p className="text-xs sm:text-sm text-soft leading-relaxed">
                    {selectedFood.diabetesNote}
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-secondary/20 p-3 text-[11px] text-muted-foreground">
                  Clinical Tip: Pairing starchy staples with soluble plant fiber (vegetable poriyal, sambar) or healthy fats slows enzymatic carbohydrate breakdown.
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
