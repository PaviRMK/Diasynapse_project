import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Sparkles,
  Utensils,
  CheckCircle2,
  X,
  Search,
  Filter,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import recipesData from '../data/recipes.json';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/PageTransition';

export function RecipesPage() {
  const { searchQuery } = useData();
  const { user } = useAuth();

  const categories = [
    'All',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks',
    'Low-Carb',
    'Vegetarian/Vegan',
    'Budget-Friendly',
  ];

  // Pick initial category based on user preference if available
  const [selectedCategory, setSelectedCategory] = useState(() => {
    try {
      const savedOnboarding = localStorage.getItem('diasynapse_onboarding');
      if (savedOnboarding) {
        const parsed = JSON.parse(savedOnboarding);
        if (parsed.dietaryPreference === 'Vegetarian' || parsed.dietaryPreference === 'Vegan') {
          return 'Vegetarian/Vegan';
        }
      }
    } catch (e) {
      console.error(e);
    }
    return 'All';
  });

  const [activeRecipe, setActiveRecipe] = useState(null);

  // Filter recipes based on category and search query
  const filteredRecipes = recipesData.filter((recipe) => {
    const matchesSearch =
      !searchQuery ||
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Vegetarian/Vegan') {
      return recipe.dietary.includes('Vegetarian') || recipe.dietary.includes('Vegan');
    }
    if (selectedCategory === 'Low-Carb') {
      return recipe.dietary.includes('Low-Carb') || recipe.carbs < 20;
    }
    if (selectedCategory === 'Budget-Friendly') {
      return recipe.dietary.includes('Budget-Friendly');
    }
    return recipe.category === selectedCategory;
  });

  return (
    <PageTransition className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Decorative Ambient Background Glows */}
      <div className="ambient-glow w-96 h-96 bg-terracotta-400/15 -top-12 -left-20 pointer-events-none" />
      <div className="ambient-glow w-80 h-80 bg-plum-400/15 top-24 -right-16 pointer-events-none" />

      {/* Header Banner */}
      <div className="mb-6 pb-6 border-b border-cream-300 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-terracotta-100 text-terracotta-800 border border-terracotta-200 mb-2">
            <Utensils className="w-3 h-3 text-terracotta-600" />
            <span>Nutritionally Balanced Culinary Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal-900 font-display">
            Diabetes-Friendly Recipe Library
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-2xl">
            Thoughtfully crafted recipes designed to stabilize postprandial glucose surges, featuring complete carbohydrate transparency.
          </p>
        </div>

        <Link
          to="/log-meal"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-terracotta-500 hover:bg-terracotta-600 shadow-warm hover:shadow-warm-md transition-all hover:scale-[1.02] self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Analyze a Custom Meal</span>
        </Link>
      </div>

      {/* Filter Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === cat
                ? 'bg-terracotta-500 text-white shadow-warm-sm'
                : 'bg-white text-charcoal-600 hover:bg-cream-100 border border-cream-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search status indicator */}
      {searchQuery && (
        <div className="mb-4 text-xs text-charcoal-600 flex items-center justify-between bg-cream-50 p-3 rounded-xl border border-cream-200">
          <span>
            Filtering by search: <strong>"{searchQuery}"</strong> ({filteredRecipes.length} found)
          </span>
          <span className="text-[11px] text-terracotta-600 font-medium">Use search bar in navbar to clear</span>
        </div>
      )}

      {/* Recipe Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="card-elevated rounded-2xl border border-cream-300 overflow-hidden shadow-warm-sm hover:shadow-warm transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Food Image with Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-cream-200">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent opacity-80" />

                  {/* Carb Badge */}
                  <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-terracotta-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-warm-sm border border-cream-200">
                    ~{recipe.carbs}g carbs
                  </span>

                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 bg-charcoal-900/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {recipe.category}
                  </span>

                  {/* Prep Time */}
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] font-medium text-white/95">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{recipe.prepTime}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <h3 className="text-base font-bold text-charcoal-900 leading-snug group-hover:text-terracotta-600 transition-colors font-display">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-charcoal-600 font-normal line-clamp-2 mt-1.5 leading-relaxed">
                    {recipe.summary}
                  </p>

                  {/* Macro Tags */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-cream-200 text-[11px] text-charcoal-500 font-medium">
                    <span>{recipe.calories} kcal</span>
                    <span>·</span>
                    <span>{recipe.protein} protein</span>
                    <span>·</span>
                    <span>{recipe.fiber} fiber</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 sm:p-5 pt-0">
                <button
                  type="button"
                  onClick={() => setActiveRecipe(recipe)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-charcoal-800 bg-cream-50 hover:bg-terracotta-50 hover:text-terracotta-700 border border-cream-300 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <span>View Recipe & Steps</span>
                  <ArrowRight className="w-3 h-3 text-terracotta-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-300 p-10 text-center shadow-warm-sm">
          <Utensils className="w-10 h-10 text-charcoal-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-charcoal-800">No recipes matched your filter</h3>
          <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
            Try choosing a different dietary category chip above or clearing your search term.
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-terracotta-700 bg-terracotta-50 hover:bg-terracotta-100 transition-colors"
          >
            Show All Recipes
          </button>
        </div>
      )}

      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {activeRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-cream-300 shadow-warm-lg max-w-2xl w-full overflow-hidden my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Image Header */}
              <div className="relative h-56 sm:h-64 w-full shrink-0">
                <img
                  src={activeRecipe.image}
                  alt={activeRecipe.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setActiveRecipe(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-charcoal-900/70 hover:bg-charcoal-900 text-white flex items-center justify-center transition-all shadow"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <span className="bg-charcoal-900/80 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {activeRecipe.category} · {activeRecipe.prepTime}
                  </span>
                  <span className="bg-terracotta-500 text-white text-xs font-bold px-3 py-1 rounded-lg shadow">
                    ~{activeRecipe.carbs}g carbs (AI-Estimated)
                  </span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-charcoal-900">
                    {activeRecipe.title}
                  </h2>
                  <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                    {activeRecipe.summary}
                  </p>
                </div>

                {/* Macro summary pills */}
                <div className="grid grid-cols-4 gap-2 p-3 bg-cream-50 rounded-xl border border-cream-200 text-center">
                  <div>
                    <span className="text-[10px] text-charcoal-400 uppercase font-semibold">Carbs</span>
                    <p className="text-xs font-bold text-terracotta-700 metric-number">{activeRecipe.carbs}g</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-400 uppercase font-semibold">Calories</span>
                    <p className="text-xs font-bold text-charcoal-800 metric-number">{activeRecipe.calories}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-400 uppercase font-semibold">Protein</span>
                    <p className="text-xs font-bold text-charcoal-800 metric-number">{activeRecipe.protein}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-400 uppercase font-semibold">Fiber</span>
                    <p className="text-xs font-bold text-sage-800 metric-number">{activeRecipe.fiber}</p>
                  </div>
                </div>

                {/* Ingredients List */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-2">
                    Ingredients ({activeRecipe.ingredients.length})
                  </h3>
                  <ul className="space-y-1.5">
                    {activeRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="text-xs text-charcoal-700 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 shrink-0 mt-0.5" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Step by Step Instructions */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-2">
                    Preparation Steps
                  </h3>
                  <ol className="space-y-2.5">
                    {activeRecipe.instructions.map((step, idx) => (
                      <li key={idx} className="text-xs text-charcoal-700 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-cream-200 text-charcoal-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-cream-200 bg-cream-50/60 flex items-center justify-between gap-3">
                <span className="text-[11px] text-charcoal-500 italic">
                  General culinary content. Not dosage advice.
                </span>
                <Link
                  to="/log-meal"
                  onClick={() => setActiveRecipe(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-terracotta-500 hover:bg-terracotta-600 shadow-warm-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Log in Meal Journal</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
