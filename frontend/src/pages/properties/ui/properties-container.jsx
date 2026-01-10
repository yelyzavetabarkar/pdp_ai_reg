export function PropertiesContainer({
  children,
  filters,
  onFilterChange,
  user,
  onFavorite,
}) {
  return (
    <div className="properties-container">
      {typeof children === 'function'
        ? children({ filters, onFilterChange, user, onFavorite })
        : children}
    </div>
  );
}
