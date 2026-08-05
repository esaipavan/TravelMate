import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  UtensilsCrossed,
  Flame,
  Leaf,
  Star,
  MapPin,
  Clock,
  Droplets,
  ShoppingBag,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { rv, CARD_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import type { Dish, Restaurant, FoodGuide, SpiceLevel } from '../types';

interface Props {
  food: FoodGuide;
  destination: string;
}

const SPICE_META: Record<SpiceLevel, { label: string; dots: number; cls: string }> = {
  none: { label: 'No Spice', dots: 0, cls: 'text-muted-foreground' },
  mild: { label: 'Mild', dots: 1, cls: 'text-amber-500' },
  medium: { label: 'Medium', dots: 2, cls: 'text-orange-500' },
  hot: { label: 'Hot', dots: 3, cls: 'text-red-500' },
  'very-hot': { label: 'Very Hot', dots: 4, cls: 'text-red-700' },
};

function SpiceIndicator({ level }: { level: SpiceLevel }) {
  const { label, dots, cls } = SPICE_META[level];
  if (dots === 0) return null;
  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-medium ${cls}`} aria-label={label}>
      {Array.from({ length: dots }).map((_, i) => (
        <Flame key={i} className="h-2.5 w-2.5 fill-current" aria-hidden />
      ))}
      <span className="ml-0.5">{label}</span>
    </span>
  );
}

function DietaryBadges({ dish }: { dish: Dish }) {
  return (
    <>
      {dish.isVegan && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
          <Leaf className="h-2.5 w-2.5" aria-hidden />
          Vegan
        </span>
      )}
      {!dish.isVegan && dish.isVegetarian && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          <Leaf className="h-2.5 w-2.5" aria-hidden />
          Vegetarian
        </span>
      )}
    </>
  );
}

function DishCard({ dish }: { dish: Dish }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="relative flex gap-4 overflow-hidden rounded-2xl border border-border/50 bg-card p-4"
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-30px' }}
    >
      {/* Must-try ribbon */}
      {dish.mustTry && (
        <div className="absolute right-0 top-0">
          <div className="flex h-6 w-24 -translate-y-px translate-x-6 rotate-45 items-center justify-center bg-primary text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
            Must Try
          </div>
        </div>
      )}

      {/* Emoji */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl"
        aria-hidden
      >
        {dish.emoji}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <h4 className="text-sm font-bold leading-snug text-foreground">{dish.name}</h4>
          <DietaryBadges dish={dish} />
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {dish.description}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {dish.spiceLevel !== 'none' && <SpiceIndicator level={dish.spiceLevel} />}
          <span className="text-[11px] font-medium text-muted-foreground">{dish.priceRange}</span>
        </div>
      </div>
    </motion.div>
  );
}

function RestaurantRow({ restaurant }: { restaurant: Restaurant }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col gap-1.5 rounded-xl border border-border/40 bg-card p-4 sm:flex-row sm:items-start sm:gap-4"
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-20px' }}
    >
      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h4 className="text-sm font-bold text-foreground">{restaurant.name}</h4>
          <span className="text-[11px] font-medium text-primary">{restaurant.priceRange}</span>
          <span className="text-[11px] text-muted-foreground">{restaurant.cuisine}</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {restaurant.description}
        </p>
      </div>

      {/* Side meta */}
      <div className="flex shrink-0 flex-col gap-1 sm:items-end sm:text-right">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground sm:justify-end">
          <Clock className="h-3 w-3 shrink-0" aria-hidden />
          {restaurant.hours}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground sm:justify-end">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
          {restaurant.area}
        </span>
      </div>
    </motion.div>
  );
}

function DrinksTab({ food }: { food: FoodGuide }) {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-6">
      {/* Local drinks */}
      {food.drinks.length > 0 && (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Local Drinks
          </h3>
          <motion.ul
            className="grid gap-2 sm:grid-cols-2"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-20px' }}
          >
            {food.drinks.map((drink, i) => {
              const [name, ...rest] = drink.split(' — ');
              return (
                <motion.li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border/40 bg-card p-3"
                  variants={rv(LIST_ITEM_VARIANTS, reduced)}
                >
                  <span className="text-base" aria-hidden>
                    🍹
                  </span>
                  <div className="min-w-0 text-xs leading-relaxed">
                    <p className="font-semibold text-foreground">{name}</p>
                    {rest.length > 0 && (
                      <p className="mt-0.5 text-muted-foreground">{rest.join(' — ')}</p>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      )}

      {/* Street food */}
      {food.streetFood.length > 0 && (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Street Food Guide
          </h3>
          <motion.ul
            className="space-y-2"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-20px' }}
          >
            {food.streetFood.map((item, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-2 text-sm text-foreground"
                variants={rv(LIST_ITEM_VARIANTS, reduced)}
              >
                <span className="mt-0.5 shrink-0 text-primary" aria-hidden>
                  ›
                </span>
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}

      {/* Water safety */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden />
        <div className="text-sm">
          <p className="font-semibold text-foreground">Tap Water</p>
          <p className="mt-0.5 text-muted-foreground">
            {food.waterSafety === 'safe'
              ? 'Tap water is safe to drink — no need to buy bottled water.'
              : food.waterSafety === 'bottled'
                ? 'Use bottled water for drinking and brushing teeth. Tap water is not safe for visitors.'
                : 'Use filtered or bottled water. Tap water may cause stomach issues for unaccustomed visitors.'}
          </p>
        </div>
      </div>

      {/* Dietary notes */}
      {food.dietaryNotes.length > 0 && (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Dietary Notes
          </h3>
          <ul className="space-y-2">
            {food.dietaryNotes.map((note, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
              >
                <span className="mt-0.5 shrink-0 text-amber-500" aria-hidden>
                  ℹ
                </span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Market tips */}
      {food.marketTips.length > 0 && (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Markets & Food Streets
          </h3>
          <motion.ul
            className="space-y-2"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {food.marketTips.map((tip, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border/40 bg-card p-3 text-sm"
                variants={rv(LIST_ITEM_VARIANTS, reduced)}
              >
                <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {tip}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}
    </div>
  );
}

export function FoodSection({ food, destination }: Props) {
  const [tab, setTab] = useState('dishes');

  const mustTryCount = food.dishes.filter((d) => d.mustTry).length;

  if (food.dishes.length === 0 && food.restaurants.length === 0) {
    return (
      <section id="food" aria-label={`Food and drink in ${destination}`} className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Food &amp; Drink</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Curated food guide not available for this destination.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          Ask your AI assistant about local cuisine, must-try dishes, and restaurant recommendations
          for {destination}.
        </div>
      </section>
    );
  }

  return (
    <section id="food" aria-label={`Food and drink in ${destination}`} className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Food &amp; Drink</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {food.dishes.length} local dishes · {mustTryCount} must-tries · {food.restaurants.length}{' '}
          recommended restaurants
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto gap-1 rounded-xl p-1">
          <TabsTrigger
            value="dishes"
            className="gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            <UtensilsCrossed className="h-3.5 w-3.5" aria-hidden />
            Dishes
          </TabsTrigger>
          <TabsTrigger
            value="restaurants"
            className="gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            <Star className="h-3.5 w-3.5" aria-hidden />
            Restaurants
          </TabsTrigger>
          <TabsTrigger
            value="drinks"
            className="gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            <Flame className="h-3.5 w-3.5" aria-hidden />
            Drinks &amp; More
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dishes" className="mt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {food.dishes.map((dish) => (
              <DishCard key={dish.name} dish={dish} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="restaurants" className="mt-5">
          <div className="space-y-3">
            {food.restaurants.map((r) => (
              <RestaurantRow key={r.name} restaurant={r} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drinks" className="mt-5">
          <DrinksTab food={food} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
