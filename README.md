# Coffee Strapi Backend

A Strapi v5 CMS backend for a coffee shop application, providing API endpoints for product catalog, orders, and Telegram bot integration.

## Overview

This project is part of a larger coffee shop system:
- **Backend** (this project): Strapi CMS providing REST API endpoints
- **Frontend**: `../coffee-app` - Customer-facing application
- **Telegram Bot**: `../coffee-bot` - Order management and customer interaction

## Key Features

- **JSON-based Localization**: Multi-language support (Russian, English, Chinese) using JSON fields
  - More efficient than Strapi native i18n (66% fewer database rows)
  - Avoids Strapi v5 i18n bugs ([Issue #24445](https://github.com/strapi/strapi/issues/24445))
  - All locales in single record instead of separate records per locale
- **Product Catalog**: Categories, subcategories, products with portions and pricing
- **Caching System**: In-memory cache with TTL support for improved performance
- **Telegram Integration**: Custom authentication endpoint for Telegram bot
- **Bootstrap System**: Automatic data initialization on first run
- **Custom Controllers**: Enhanced product endpoints with relation population

## Technology Stack

- **Strapi**: v5.33.1
- **Node.js**: 20.18.1+
- **Database**: PostgreSQL (production), SQLite (development)
- **TypeScript**: Full TypeScript support
- **ORM**: Strapi Document Service API

## Getting Started

### Prerequisites

- Node.js 20.18.1 or higher
- PostgreSQL (for production) or SQLite (for development)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials
```

### Environment Variables

Key environment variables:

```env
# Server
HOST=0.0.0.0
PORT=1337

# Database (PostgreSQL)
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=coffee
DATABASE_USERNAME=coffee
DATABASE_PASSWORD=your_password

# Secrets (generate new ones for production)
APP_KEYS=...
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
JWT_SECRET=...

# Telegram Integration
TELEGRAM_BOT_TOKEN=your_bot_token

# Bootstrap (optional, remove after first run)
CLEAN_TABLES=true  # Set to true to reset database on startup
```

### Development

```bash
# Start development server with hot reload
npm run develop

# The admin panel will be available at:
# http://localhost:1337/admin
```

### Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Localization Structure

This project uses **JSON-based localization** instead of Strapi's native i18n plugin.

### Why JSON-based Localization?

1. **Efficiency**: 66% fewer database rows (1 record instead of 3 per entity)
2. **Bug-free**: Avoids Strapi v5 i18n bug where `documentId` differs per locale
3. **Simplicity**: No complex locale synchronization logic needed
4. **Performance**: Faster queries, better cache efficiency

### Localization Example

**Database Schema:**
```json
{
  "name_by_locale": {
    "ru": "Американо",
    "en": "Americano",
    "zh": "美式咖啡"
  },
  "description_by_locale": {
    "ru": "Кофе эспрессо с водой",
    "en": "Espresso with water",
    "zh": "浓缩咖啡加水"
  }
}
```

**TypeScript Interface:**
```typescript
interface LocalizedString {
  ru: string
  en: string
  zh: string
}

interface Product {
  id: number
  documentId: string
  name_by_locale: LocalizedString
  description_by_locale: LocalizedString
  ingredients_by_locale: LocalizedString
  order: number
  avatar?: string
}
```

**Accessing Localized Content:**
```typescript
const locale = 'ru' // or 'en', 'zh'
const productName = product.name_by_locale[locale]
// Returns: "Американо" for ru, "Americano" for en, etc.
```

### Localized Entities

The following entities support multiple locales:

| Entity | Localized Fields |
|--------|------------------|
| **Category** | `name_by_locale`, `description_by_locale` |
| **Subcategory** | `name_by_locale`, `description_by_locale` |
| **Product** | `name_by_locale`, `description_by_locale`, `ingredients_by_locale` |
| **Portion** | `name_by_locale` |
| **Ingredient** | `name_by_locale` |

## Content Types

### Core Entities

- **Product**: Coffee products with localized names, descriptions, ingredients
- **Category**: Main categories (e.g., "Beverages", "Food")
- **Subcategory**: Product subcategories within categories
- **Portion**: Serving sizes (e.g., "200ml", "300ml", "450ml")
- **Ingredient**: Additional ingredients with optional weight
- **Temperature**: Temperature options (hot/cold enumeration)

### Junction Tables

Many-to-many relationships:
- **product-toportion**: Links products to portions with pricing
- **product-toingredient**: Links products to ingredients with price modifiers
- **product-totemperature**: Links products to temperature options

### Order Management

- **Order**: Customer orders
- **Cart**: Shopping cart functionality

## Bootstrap System

The application automatically initializes data on first run:

1. **Automatic Bootstrap**: Runs on startup if database is empty
2. **Clean Bootstrap**: Set `CLEAN_TABLES=true` in `.env` to reset database
3. **Data Initialization**:
   - Creates categories and subcategories
   - Uploads SVG images for subcategories
   - Creates portions and temperatures
   - Populates products with images, portions, and pricing

**Important**: Remove `CLEAN_TABLES=true` from `.env` after successful bootstrap.

### Bootstrap Files

```
src/initScripts/
├── initProducts.ts              # Main bootstrap orchestrator
├── initRolesPermissions.ts      # Permission setup
└── initProducts/                # Organized data definitions
    ├── categories.ts            # Category definitions
    ├── subcategories.ts         # Subcategory definitions with images
    ├── portions.ts              # Portion size definitions
    ├── temperatures.ts          # Temperature options
    ├── products/                # Product data by category
    │   ├── coffee.ts
    │   ├── desserts.ts
    │   ├── lemonades.ts
    │   └── ...
    └── subcategories/           # SVG images
        ├── coffee.svg
        ├── dessert.svg
        └── ...
```

## Caching System

In-memory cache for improved performance:

- **Cache Keys**: Products, categories, ingredients, portions
- **TTL Support**: Automatic expiration (default 300 seconds)
- **Invalidation**: Smart invalidation on updates
- **Management Endpoints**:
  - `GET /api/cache/stats` - Cache statistics
  - `POST /api/cache/clear` - Clear all caches
  - `POST /api/cache/warmup` - Pre-populate caches

## API Endpoints

### Product API

```
GET /api/products              # Get all products with relations
GET /api/products/:id          # Get single product
POST /api/products             # Create product (admin)
PUT /api/products/:id          # Update product (admin)
DELETE /api/products/:id       # Delete product (admin)
```

### Category API

```
GET /api/categories            # Get all categories
GET /api/categories/:id        # Get single category
```

### Telegram Integration

```
POST /api/telegram/auth        # Telegram authentication endpoint
```

## Code Style

- **ESLint**: TypeScript support with Prettier integration
- **Prettier**: Configured with import sorting
- **Import Order**: Third-party → Strapi modules → Local modules
- **Semicolons**: Disabled (`semi: false`)
- **Quotes**: Single quotes for strings

### Formatting Commands

```bash
# Lint TypeScript files
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

## Database Configuration

Supports multiple databases:
- **PostgreSQL**: Recommended for production
- **SQLite**: Default for development
- **MySQL**: Supported but not recommended

Configuration is in `config/database.ts`.

## Project Structure

```
src/
├── api/                      # Strapi API endpoints
│   ├── product/              # Product management
│   ├── category/             # Categories
│   ├── subcategory/          # Subcategories
│   ├── portion/              # Serving sizes
│   ├── ingredient/           # Additional ingredients
│   ├── temperature/          # Hot/cold options
│   ├── product-toportion/    # Product-portion pricing
│   ├── product-toingredient/ # Product-ingredient relations
│   ├── product-totemperature/# Product-temperature relations
│   ├── order/                # Order management
│   ├── cart/                 # Shopping cart
│   ├── cache/                # Cache management
│   └── telegram/             # Telegram integration
├── services/                 # Shared services
│   └── cache.ts              # In-memory caching
├── extensions/               # Strapi extensions
├── initScripts/              # Bootstrap scripts
└── index.ts                  # Application entry point
```

## Migration from v1.x (Strapi i18n)

If you're upgrading from version 1.x that used Strapi native i18n:

1. **Backup database**:
   ```bash
   pg_dump -U coffee coffee > backup_before_migration.sql
   ```

2. **Pull latest code**:
   ```bash
   git pull origin main
   ```

3. **Enable clean bootstrap**:
   ```bash
   echo "CLEAN_TABLES=true" >> .env
   ```

4. **Restart Strapi**:
   ```bash
   npm run develop
   ```

5. **Verify bootstrap** (check logs for "Database bootstrap completed successfully")

6. **Remove clean flag** from `.env`

7. **Update frontend** (see `../coffee-app/LOCALE_MIGRATION.md`)

See [CHANGELOG.md](./CHANGELOG.md) for detailed migration information.

## Development Notes

- Bootstrap runs automatically on startup if database is empty
- Custom routes defined in individual route files (e.g., `custom-product.ts`)
- Media files stored in `public/uploads/` with automatic image resizing
- All localized content uses JSON fields (`name_by_locale`, etc.)
- Strapi v5 Document Service API used throughout

## Related Documentation

- [CHANGELOG.md](./CHANGELOG.md) - Version history and migration guide
- [CLAUDE.md](./CLAUDE.md) - Development guide for Claude Code
- [Frontend Migration Guide](../coffee-app/LOCALE_MIGRATION.md) - Frontend localization changes

---

## Strapi Commands Reference

### `develop`

Start Strapi with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```bash
npm run develop
```

### `start`

Start Strapi with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```bash
npm run start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```bash
npm run build
```

### `console`

Open Strapi console for interactive queries:

```bash
npm run console
```

## Learn More

- [Strapi Documentation](https://docs.strapi.io) - Official Strapi documentation
- [Strapi v5 Document Service](https://docs.strapi.io/dev-docs/api/document-service) - Document API reference
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - PostgreSQL reference

## License

This project is proprietary software for internal use.

---

**Version**: 2.0.0
**Last Updated**: January 6, 2026
**Strapi Version**: 5.33.1
