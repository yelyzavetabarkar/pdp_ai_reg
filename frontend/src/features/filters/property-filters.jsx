import { useState, useMemo, useRef } from 'react';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { Search, X } from 'lucide-react';

export function PropertyFilters({ onFilterChange, cities = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const searchInputRef = useRef(null);

  const uniqueCities = useMemo(() => {
    return [...new Set(cities)].sort();
  }, [cities]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onFilterChange({ searchQuery: value, selectedCity, priceRange });
  };

  const handleCityChange = (value) => {
    setSelectedCity(value);
    onFilterChange({ searchQuery, selectedCity: value, priceRange });
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
    onFilterChange({ searchQuery, selectedCity, priceRange: value });
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedCity('all');
    setPriceRange('all');
    onFilterChange({ searchQuery: '', selectedCity: 'all', priceRange: 'all' });

    if (searchInputRef.current) {
      searchInputRef.current.value = '';
      searchInputRef.current.focus();
    }
  };

  const hasFilters = searchQuery || selectedCity !== 'all' || priceRange !== 'all';

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search properties..."
          className="pl-10"
        />
      </div>

      <Select value={selectedCity} onValueChange={handleCityChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All cities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All cities</SelectItem>
          {uniqueCities.map((city, idx) => (
            <SelectItem key={`city-${idx}`} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priceRange} onValueChange={handlePriceChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Any price" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any price</SelectItem>
          <SelectItem value="0-100">Under $100</SelectItem>
          <SelectItem value="100-200">$100 - $200</SelectItem>
          <SelectItem value="200-500">$200 - $500</SelectItem>
          <SelectItem value="500+">$500+</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
