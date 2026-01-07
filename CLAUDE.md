# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANT**: All git commits must be made by the user only. Claude Code should never create commits without explicit user permission.

## Coffee Strapi Backend

This is a Strapi CMS backend for a coffee shop application built with TypeScript. The project manages coffee products, categories, ingredients, portions, orders, and integrates with Telegram.

## Related Projects

This backend is part of a larger coffee shop system:
- **Frontend**: `../coffee-app` - The main customer-facing application
- **Telegram Bot**: `../coffee-bot` - Telegram bot for order management and customer interaction
- **Backend**: This project - Strapi CMS providing API endpoints for both frontend and bot

## Development Commands

```bash
# Start development server with hot reload
npm run develop

# Build the application
npm run build

# Start production server
npm run start

# Lint TypeScript files
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Strapi console
npm run console
```

## Database Configuration

The application supports multiple databases (PostgreSQL, MySQL, SQLite) configured through environment variables:
- PostgreSQL is the main production database (pg dependency)
- SQLite is used for development by default
- Database configuration is in `config/database.ts`

## Architecture Overview

### Content Types Structure
The application follows Strapi's content-type architecture with these main entities:

- **Product**: Core coffee products with JSON-based localization (ru, en, zh)
- **Category**: Main product categories (e.g., "Напитки", "Еда") with JSON localization
- **Subcategory**: Product subcategories within categories with JSON localization
- **Ingredient**: Additional ingredients for products with JSON localization (includes optional weight field)
- **Portion**: Different serving sizes for products with JSON localization
- **Temperature**: Temperature options for products (hot/cold enumeration)
- **Order**: Customer orders
- **Cart**: Shopping cart functionality

### Relationship System
The application uses junction tables to handle many-to-many relationships:
- `product-toportion`: Links products to their available portions with pricing
- `product-toingredient`: Links products to additional ingredients with price modifiers
- `product-totemperature`: Links products to temperature options (hot/cold)

### Key Features
- **Internationalization**: Products support multiple locales (ru, en, zh) via JSON-based localization
  - Uses `name_by_locale`, `description_by_locale`, `ingredients_by_locale` JSON fields
  - More efficient than Strapi native i18n (avoids Strapi v5 i18n bugs, 66% fewer database rows)
  - All locales stored in single record instead of separate records per locale
- **Caching System**: In-memory cache with TTL support for products, categories, ingredients, and portions
- **Custom Controllers**: Enhanced product controller with custom `getAll` method that populates related data
- **Telegram Integration**: Custom Telegram auth endpoint at `/api/telegram/auth`
- **Bootstrap Data**: Automatic initialization of products, categories, subcategories, portions, and temperatures on startup

## File Structure

```
src/
├── api/                      # Strapi API endpoints
│   ├── product/              # Product management
│   ├── category/             # Category management
│   ├── subcategory/          # Subcategory management
│   ├── ingredient/           # Ingredient management
│   ├── portion/              # Portion management
│   ├── temperature/          # Temperature options (hot/cold)
│   ├── product-toportion/    # Product-portion junction table
│   ├── product-toingredient/ # Product-ingredient junction table
│   ├── product-totemperature/# Product-temperature junction table
│   ├── order/                # Order management
│   ├── cart/                 # Shopping cart
│   ├── cache/                # Cache management endpoints
│   └── telegram/             # Telegram integration
├── services/                 # Shared services
│   └── cache.ts              # In-memory caching service
├── extensions/               # Strapi extensions
├── initScripts/              # Bootstrap scripts
│   ├── initProducts.ts       # Main bootstrap orchestrator
│   ├── initRolesPermissions.ts
│   └── initProducts/         # Organized bootstrap data
│       ├── categories.ts     # Category definitions
│       ├── subcategories.ts  # Subcategory definitions with SVG images
│       ├── portions.ts       # Portion size definitions
│       ├── temperatures.ts   # Temperature options
│       ├── products/         # Product data by category
│       │   ├── index.ts
│       │   ├── coffee.ts
│       │   ├── desserts.ts
│       │   ├── lemonades.ts
│       │   ├── milkshake.ts
│       │   ├── nonCoffee.ts
│       │   ├── pancakes.ts
│       │   ├── salads.ts
│       │   ├── shawarma.ts
│       │   ├── smoothies.ts
│       │   ├── snacks.ts
│       │   └── signatureTea.ts
│       └── subcategories/    # SVG images for subcategories
└── index.ts                  # Main application entry
```

## Code Style

- **ESLint**: Configured with TypeScript support and Prettier integration
- **Prettier**: Configured with import sorting via `@trivago/prettier-plugin-sort-imports`
- **Import Order**: Third-party modules → Strapi modules → Local modules
- **Semicolons**: Disabled (semi: false)
- **Quotes**: Single quotes for strings

## Custom Product Controller

The product controller (`src/api/product/controllers/product.ts`) includes a custom `getAll` method that:
- Fetches all products with category/subcategory population
- Joins related portions and ingredients data
- Returns formatted pricing and additional ingredients information

## Caching System

The application includes a custom in-memory caching system (`src/services/cache.ts`) with:
- **TTL Support**: Automatic expiration of cached items (default 300 seconds)
- **Cache Keys**: Predefined keys for products, categories, ingredients, and portions
- **Invalidation**: Helpers to invalidate product and related caches
- **Management Endpoints**: `/api/cache/stats`, `/api/cache/clear`, `/api/cache/warmup`

Cache is used in the product service to improve performance for frequently accessed data.

## Environment Variables

Key environment variables for database configuration:
- `DATABASE_CLIENT`: Database type (sqlite, postgres, mysql)
- `DATABASE_URL`: Connection string (for PostgreSQL)
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`: Connection details
- `DATABASE_USERNAME`, `DATABASE_PASSWORD`: Credentials

## Bootstrap System

The application includes a comprehensive bootstrap system that automatically initializes data on startup:
- **JSON-based Localization**: Creates entities with JSON fields containing all locales (ru, en, zh) in a single record
  - Example: `{ name_by_locale: { ru: "Напитки", en: "Beverages", zh: "饮品" } }`
- **Data Initialization**: Categories, subcategories, portions, temperatures, and products
- **Image Upload**: Automatically uploads product and subcategory images (SVGs for subcategories)
- **Junction Tables**: Automatically creates product-toportion and product-totemperature relationships
- **Clean Mode**: Supports `CLEAN_TABLES=true` environment variable to reset database before bootstrapping

The bootstrap script (`src/initScripts/initProducts.ts`) is modular with separate files for each entity type.

### Localization Structure

All localized content types use JSON fields with the following pattern:
```typescript
{
  name_by_locale: {
    ru: "Русское название",
    en: "English name",
    zh: "中文名称"
  },
  description_by_locale: {
    ru: "Русское описание",
    en: "English description",
    zh: "中文描述"
  }
}
```

This approach provides:
- **Efficiency**: 66% fewer database rows compared to Strapi native i18n
- **Reliability**: Avoids Strapi v5 i18n bugs (Issue #24445)
- **Simplicity**: No complex locale management or documentId linking
- **Performance**: Single database query returns all locales

## Development Notes

- Bootstrap runs automatically on startup if database is empty
- Custom routes are defined in individual route files (e.g., `custom-product.ts`)
- Media files are stored in `public/uploads/` with automatic image resizing
- The project uses Strapi v5.12.5 with TypeScript support
- All i18n content uses shared documentId across locales (Strapi v5 localization model)
- kill dev process after tests, as i usually run dev server from other terminal