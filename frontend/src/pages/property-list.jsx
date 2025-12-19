import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import useAppStore from "../stores/use-app-store";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Star,
  Heart,
  Users,
  Sparkles,
  TrendingUp,
  Zap,
  Building2,
  Globe,
  Award,
  Handshake,
  Wifi,
  Car,
  Dumbbell,
  Coffee,
  ArrowRight,
  Quote,
  Flame,
  Crown,
  ChevronDown,
  Loader2,
  Shield,
  Briefcase,
} from "lucide-react";

const ITEMS_PER_PAGE = 6;

const layoutPatterns = [
  { cols: "md:col-span-2", rows: "", height: "h-[340px]", variant: "wide" },
  { cols: "", rows: "", height: "h-[340px]", variant: "standard" },
  { cols: "", rows: "", height: "h-[340px]", variant: "standard" },
  { cols: "", rows: "", height: "h-[340px]", variant: "standard" },
  { cols: "", rows: "", height: "h-[340px]", variant: "standard" },
  { cols: "md:col-span-2", rows: "", height: "h-[340px]", variant: "wide" },
];

const amenityIcons = {
  wifi: Wifi,
  parking: Car,
  gym: Dumbbell,
  coffee: Coffee,
};

const heroHighlights = [
  {
    id: "executive",
    title: "Executive-ready stays",
    description:
      "Suites curated for leadership travel with concierge-level service.",
    icon: Crown,
    accent: "from-primary/10 to-accent/10",
  },
  {
    id: "assurance",
    title: "Enterprise-grade assurance",
    description:
      "24/7 safety monitoring, enterprise billing, and policy compliance.",
    icon: Shield,
    accent: "from-emerald-500/10 to-primary/10",
  },
  {
    id: "productivity",
    title: "Productivity perks",
    description:
      "Ergonomic work zones, guaranteed fiber Wi-Fi, and meeting-ready layouts.",
    icon: Briefcase,
    accent: "from-amber-500/10 to-red-500/10",
  },
];

const PropertyCard = memo(function PropertyCard({
  property,
  index,
  isFavorite,
  onToggleFavorite,
  company,
}) {
  const patternIndex = index % layoutPatterns.length;
  const layout = layoutPatterns[patternIndex];
  const isWide = layout.variant === "wide";

  return (
    <Link
      to={`/properties/${property.id}`}
      className={`group relative block ${layout.cols} ${layout.rows}`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-card border border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 ${layout.height}`}
      >
        {/* Image */}
        <div className="absolute inset-0 bg-muted">
          <img
            src={
              property.image_url ||
              `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=80`
            }
            alt={property.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop&q=80`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        </div>

        {/* Top Actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <div className="flex gap-2 flex-wrap">
            {company?.tier === "gold" && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                <Zap className="h-3 w-3 mr-1" />
                20% off
              </Badge>
            )}
            {parseFloat(property.average_rating) >= 4.8 && (
              <Badge className="bg-white/90 text-foreground border-0 shadow-lg">
                <Award className="h-3 w-3 mr-1 text-primary" />
                Top Rated
              </Badge>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(property.id);
            }}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-200 ${
              isFavorite
                ? "bg-primary text-primary-foreground"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-white text-sm font-semibold">
                {property.average_rating
                  ? Number(property.average_rating).toFixed(1)
                  : "New"}
              </span>
            </div>
            <span className="text-white/80 text-sm">
              ({property.review_count || 0})
            </span>
          </div>

          <h3
            className={`font-bold text-white mb-2 line-clamp-2 ${isWide ? "text-xl md:text-2xl" : "text-lg"}`}
          >
            {property.name}
          </h3>

          {isWide && (
            <p className="text-white/80 text-sm line-clamp-2 mb-3">
              {property.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
            <MapPin className="h-3.5 w-3.5" />
            {property.city}
            <span className="text-white/60">•</span>
            <Users className="h-3.5 w-3.5" />
            {property.max_guests} guests
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span
                className={`font-bold text-white ${isWide ? "text-2xl" : "text-xl"}`}
              >
                ${property.price_per_night}
              </span>
              <span className="text-white/80 text-sm"> / night</span>
            </div>
            {isWide && (
              <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl">
                Book Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});

const InspirationCard = memo(function InspirationCard({ type }) {
  if (type === "quote") {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 flex flex-col justify-center h-[340px]">
        <Quote className="h-10 w-10 text-primary/50 mb-4" />
        <p className="text-lg font-medium text-foreground mb-4 italic">
          "The best corporate travel experience we've ever had. StayCorp changed
          how our team travels."
        </p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent" />
          <div>
            <p className="font-semibold text-sm">Sarah Chen</p>
            <p className="text-xs text-muted-foreground">
              VP Operations, TechCorp
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === "stats") {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 h-[340px] flex flex-col justify-center">
        <div className="text-center">
          <div className="text-5xl font-bold text-primary mb-2">98%</div>
          <p className="text-muted-foreground text-sm mb-4">
            Customer Satisfaction
          </p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="h-5 w-5 text-yellow-500 fill-yellow-500"
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on 10,000+ reviews
          </p>
        </div>
      </div>
    );
  }

  return null;
});

const HighlightCard = memo(function HighlightCard({ highlight, onExploreCurated }) {
  const Icon = highlight.icon;
  return (
    <div
      className={`p-6 rounded-2xl border border-border/40 bg-gradient-to-br ${highlight.accent} h-[340px] flex flex-col justify-between text-left`}
    >
      <div>
        <div className="w-12 h-12 rounded-2xl bg-background/80 text-primary flex items-center justify-center mb-4 shadow">
          <Icon className="h-5 w-5" />
        </div>
        <h4 className="text-xl font-semibold mb-2">{highlight.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {highlight.description}
        </p>
      </div>
      <Button
        variant="ghost"
        className="justify-start px-0 text-primary hover:text-primary/80"
        onClick={onExploreCurated}
      >
        Explore curated picks
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
});

function LoadingSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const layout = layoutPatterns[i % layoutPatterns.length];
        return (
          <div key={i} className={`${layout.cols} ${layout.rows}`}>
            <Skeleton className={`w-full rounded-2xl ${layout.height}`} />
          </div>
        );
      })}
    </>
  );
}

export default function PropertyList({
  user,
  settings,
  theme,
  onLogout,
  notifications,
  company,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [displayedProperties, setDisplayedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");

  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const store = useAppStore();

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    if (
      categoryParam &&
      ["all", "trending", "deals", "curated"].includes(categoryParam)
    ) {
      setActiveCategory(categoryParam);
    }
  }, [location.search]);

  const loadCuratedProperties = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/properties/curated");
      const curated =
        response.data?.data && Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
      setDisplayedProperties(curated);
      setHasMore(false);
      setPage(1);
    } catch (err) {
      console.log("Error fetching curated properties:", err);
      setDisplayedProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCuratedNavigate = useCallback(() => {
    navigate("/properties?category=curated");
  }, [navigate]);

  useEffect(() => {
    if (activeCategory === "curated") {
      loadCuratedProperties();
      return;
    }

    if (properties.length > 0) {
      const filtered = filterProperties(properties);
      setDisplayedProperties(filtered.slice(0, ITEMS_PER_PAGE));
      setPage(1);
      setHasMore(filtered.length > ITEMS_PER_PAGE);
    }
  }, [
    searchQuery,
    selectedCity,
    priceFilter,
    activeCategory,
    properties,
    loadCuratedProperties,
  ]);

  useEffect(() => {
    if (activeCategory === "curated") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMoreProperties();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loading, displayedProperties, activeCategory]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/properties");
      setProperties(response.data);
      store.setProperties(response.data);
      setDisplayedProperties(response.data.slice(0, ITEMS_PER_PAGE));
      setHasMore(response.data.length > ITEMS_PER_PAGE);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = (props) => {
    return props.filter((property) => {
      if (selectedCity !== "all" && property.city !== selectedCity)
        return false;
      if (
        searchQuery &&
        !property.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (priceFilter === "low" && property.price_per_night > 200) return false;
      if (
        priceFilter === "mid" &&
        (property.price_per_night < 200 || property.price_per_night > 300)
      )
        return false;
      if (priceFilter === "high" && property.price_per_night < 300)
        return false;
      if (
        activeCategory === "trending" &&
        parseFloat(property.average_rating) < 4.5
      )
        return false;
      if (activeCategory === "deals" && property.price_per_night > 150)
        return false;
      return true;
    });
  };

  const loadMoreProperties = useCallback(() => {
    if (loadingMore || activeCategory === "curated") return;

    setLoadingMore(true);

    setTimeout(() => {
      const filtered = filterProperties(properties);
      const nextPage = page + 1;
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newItems = filtered.slice(startIndex, endIndex);

      if (newItems.length > 0) {
        setDisplayedProperties((prev) => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore(endIndex < filtered.length);
      } else {
        setHasMore(false);
      }
      setLoadingMore(false);
    }, 500);
  }, [
    page,
    properties,
    loadingMore,
    searchQuery,
    selectedCity,
    priceFilter,
    activeCategory,
  ]);

  const toggleFavorite = (propertyId) => {
    store.toggleFavorite(propertyId);
  };

  const cities = [...new Set(properties.map((p) => p.city))];

  const categories = [
    {
      id: "all",
      label: "All Stays",
      icon: Sparkles,
      color: "from-primary to-accent",
    },
    {
      id: "trending",
      label: "Trending",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
    },
    {
      id: "deals",
      label: "Best Deals",
      icon: Zap,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "curated",
      label: "Curated Picks",
      icon: Crown,
      color: "from-purple-500 to-primary",
    },
  ];

  const averagePrice = properties.length
    ? Math.round(
        properties.reduce(
          (sum, property) => sum + Number(property.price_per_night || 0),
          0,
        ) / properties.length,
      )
    : null;

  const highRatedCount = properties.filter(
    (property) => parseFloat(property.average_rating) >= 4.5,
  ).length;

  const premiumShare = properties.length
    ? Math.round((highRatedCount / properties.length) * 100)
    : null;

  const curatedCities = cities.slice(0, 3).join(", ");

  const heroStats = [
    {
      label: "Avg nightly rate",
      value: averagePrice ? `$${averagePrice}` : "—",
      description: "Across currently available stays",
    },
    {
      label: "High-rating stays",
      value: premiumShare ? `${premiumShare}%` : "—",
      description: "4.5★ and above properties",
    },
    {
      label: "Featured cities",
      value: curatedCities || "Worldwide coverage",
      description: "Rotating executive hubs",
    },
  ];

  const priceLabelMap = {
    all: "Any price",
    low: "Under $200",
    mid: "$200 - $300",
    high: "$300+",
  };

  const activeFilterBadges = [
    {
      label: "City",
      value: selectedCity === "all" ? "All cities" : selectedCity,
    },
    { label: "Price", value: priceLabelMap[priceFilter] },
    {
      label: "Category",
      value:
        categories.find((cat) => cat.id === activeCategory)?.label ||
        "All stays",
    },
  ];

  const highlightPlacements = {
    1: heroHighlights[0],
    4: heroHighlights[1],
    8: heroHighlights[2],
  };

  const heroVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.08 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (index = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: "easeOut",
        delay: Math.min(index, 10) * 0.05,
      },
    }),
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <motion.div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 tracking-tight">
              <span className="text-gradient">Explore</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {properties.length}+ handpicked corporate stays in {cities.length}{" "}
              cities worldwide
            </p>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors duration-200 ${
                    isActive
                      ? "text-foreground bg-background/90 border border-primary/40 shadow-lg dark:text-white dark:bg-white/10 dark:border-white/20"
                      : "text-foreground bg-card/80 backdrop-blur border border-border/60 hover:border-primary/60"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 max-w-3xl mx-auto">
            <div className="relative flex-1 min-w-0 sm:min-w-[250px] max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/60 z-10 pointer-events-none" />
              <Input
                placeholder="Search destinations, hotels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-card border-border/50 text-base shadow-lg w-full"
              />
            </div>

            <div className="flex gap-3">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="flex-1 sm:w-[150px] h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-card border-border/50 shadow-lg">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="flex-1 sm:w-[150px] h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-card border-border/50 shadow-lg">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any price</SelectItem>
                  <SelectItem value="low">$ Budget</SelectItem>
                  <SelectItem value="mid">$$ Mid-range</SelectItem>
                  <SelectItem value="high">$$$ Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filter Summary */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {activeFilterBadges.map((token) => (
              <Badge
                key={token.label}
                variant="secondary"
                className="bg-background/80 backdrop-blur border border-border/50 rounded-full text-xs px-3 py-1"
              >
                <span className="text-muted-foreground mr-1">
                  {token.label}:
                </span>
                {token.value}
              </Badge>
            ))}
            {company?.tier && (
              <Badge className="rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-[10px] uppercase tracking-widest border-none px-3 py-0.5 shadow-lg">
                {company.tier} member
              </Badge>
            )}
          </div>
        </motion.div>
      </div>

      {/* Properties Grid */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-20"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 min-h-[600px]">
            <LoadingSkeleton />
          </div>
        ) : displayedProperties.length === 0 ? (
          <div className="text-center py-16 sm:py-20 min-h-[400px] flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find any properties matching your criteria. Try
              adjusting your filters.
            </p>
            <Button
              variant="outline"
              className="rounded-full px-8"
              onClick={() => {
                setSearchQuery("");
                setSelectedCity("all");
                setPriceFilter("all");
                setActiveCategory("all");
              }}
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 min-h-[600px]">
              {displayedProperties.map((property, index) => {
                const isFavorite = store.favorites.includes(property.id);

                // Insert inspiration cards at specific positions
                const showQuoteAfter = index === 5;
                const showStatsAfter = index === 11;
                const highlight = highlightPlacements[index];

                return (
                  <React.Fragment key={property.id}>
                    <motion.div
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                    >
                      <PropertyCard
                        property={property}
                        index={index}
                        isFavorite={isFavorite}
                        onToggleFavorite={toggleFavorite}
                        company={company}
                      />
                    </motion.div>
                    {showQuoteAfter && displayedProperties.length > 6 && (
                      <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index + 1}
                      >
                        <InspirationCard type="quote" />
                      </motion.div>
                    )}
                    {showStatsAfter && displayedProperties.length > 12 && (
                      <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index + 1}
                      >
                        <InspirationCard type="stats" />
                      </motion.div>
                    )}
                    {highlight && (
                      <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index + 0.5}
                      >
                        <HighlightCard
                          highlight={highlight}
                          onExploreCurated={handleCuratedNavigate}
                        />
                      </motion.div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="py-12">
              {loadingMore && (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-muted-foreground">Loading more stays...</p>
                </div>
              )}
              {!hasMore && displayedProperties.length > 0 && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted/50 text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    You've explored all {displayedProperties.length} properties
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Bottom Summary */}
        {!loading && displayedProperties.length > 0 && (
          <motion.div
            className="mt-10 rounded-3xl border border-border/40 bg-card/80 p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-lg"
            variants={heroVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                Need a shortcut?
              </p>
              <h3 className="text-2xl font-semibold text-foreground mt-1">
                Let us assemble a ready-to-book itinerary
              </h3>
              <p className="text-muted-foreground mt-2">
                Average nightly rate sits around{" "}
                <span className="font-semibold">{heroStats[0].value}</span>,
                with <span className="font-semibold">{heroStats[1].value}</span>{" "}
                of listings rated 4.5★ and above.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="rounded-full px-6"
                onClick={() => window.open('mailto:curator@staycorp.com?subject=Curated%20Itinerary%20Request')}
              >
                Talk to a curator
              </Button>
              <Button
                variant="ghost"
                className="rounded-full border border-border/50"
                asChild
              >
                <Link to="/bookings" className="flex items-center gap-2">
                  Review upcoming trips
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
