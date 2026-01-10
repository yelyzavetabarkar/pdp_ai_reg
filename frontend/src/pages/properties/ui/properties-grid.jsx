export function PropertiesGrid({
  properties,
  filters,
  user,
  onFavorite,
  onBook,
  onShare,
  favorites = [],
  renderItem,
}) {
  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property, idx) =>
        renderItem ? (
          renderItem({
            property,
            user,
            isFavorite: favorites.includes(property.id),
            onFavorite,
            onBook,
            onShare,
            filters,
          })
        ) : (
          <div key={`grid-item-${idx}`} className="property-grid-item">
            {property.name}
          </div>
        )
      )}
    </div>
  );
}
