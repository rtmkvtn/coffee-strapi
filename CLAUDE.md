# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

- **Product**: Core coffee products with localized content (i18n)
- **Category**: Main product categories (e.g., "Напитки", "Еда")
- **Subcategory**: Product subcategories within categories
- **Ingredient**: Additional ingredients for products
- **Portion**: Different serving sizes for products
- **Order**: Customer orders
- **Cart**: Shopping cart functionality

### Relationship System
The application uses junction tables to handle many-to-many relationships:
- `product-toportion`: Links products to their available portions with pricing
- `product-toingredient`: Links products to additional ingredients with price modifiers

### Key Features
- **Internationalization**: Products support multiple locales (i18n plugin)
- **Custom Controllers**: Enhanced product controller with custom `getAll` method that populates related data
- **Telegram Integration**: Custom Telegram auth endpoint at `/api/telegram/auth`
- **Bootstrap Data**: Automatic initialization of products and roles on startup

## File Structure

```
src/
├── api/               # Strapi API endpoints
│   ├── product/       # Product management
│   ├── category/      # Category management
│   ├── ingredient/    # Ingredient management
│   ├── portion/       # Portion management
│   ├── order/         # Order management
│   ├── cart/          # Shopping cart
│   └── telegram/      # Telegram integration
├── extensions/        # Strapi extensions
├── initScripts/       # Bootstrap scripts
└── index.ts          # Main application entry
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

## Environment Variables

Key environment variables for database configuration:
- `DATABASE_CLIENT`: Database type (sqlite, postgres, mysql)
- `DATABASE_URL`: Connection string (for PostgreSQL)
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`: Connection details
- `DATABASE_USERNAME`, `DATABASE_PASSWORD`: Credentials

## Development Notes

- The application automatically initializes sample data via `initScripts/initProducts.ts`
- Custom routes are defined in individual route files (e.g., `custom-product.ts`)
- Media files are stored in `public/uploads/` with automatic image resizing
- The project uses Strapi v5.12.5 with TypeScript support