import * as fs from 'fs'
import * as path from 'path'

import { Strapi } from '@strapi/types/dist/core'

import { categoriesData } from './initProducts/categories'
import { portionsData } from './initProducts/portions'
import { productsData } from './initProducts/products'
import {
  subcategoriesData,
  subcategoryToProducts,
} from './initProducts/subcategories'
import { temperaturesData } from './initProducts/temperatures'

const LOCALES = ['ru', 'en', 'zh'] as const

const uploadImageToStrapi = async (
  strapi: Strapi,
  imagePath: string
): Promise<string | null> => {
  try {
    if (!fs.existsSync(imagePath)) {
      console.warn(`Image file not found: ${imagePath}`)
      return null
    }

    const fileName = path.basename(imagePath)
    const fileStats = fs.statSync(imagePath)

    // Upload file using Strapi's upload service
    const uploadedFiles = await strapi
      .plugin('upload')
      .service('upload')
      .upload({
        data: {},
        files: {
          filepath: imagePath,
          originalFilename: fileName,
          mimetype: `image/${path.extname(imagePath).substring(1)}`,
          size: fileStats.size,
        },
      })

    if (uploadedFiles && uploadedFiles.length > 0) {
      // Return the URL of the uploaded file
      return uploadedFiles[0].url
    }

    return null
  } catch (error) {
    console.error(`Error uploading image ${imagePath}:`, error)
    return null
  }
}

export const initProducts = async (
  strapi: Strapi,
  cleanTables: boolean = false
) => {
  // Clean all tables if requested
  if (cleanTables) {
    console.log('Cleaning database tables...')

    try {
      // Delete all product-toportion entries
      const productToPortions = await strapi
        .documents('api::product-toportion.product-toportion')
        .findMany({ limit: 999 })
      console.log(`Found ${productToPortions.length} product-toportion entries`)
      for (const item of productToPortions) {
        await strapi
          .documents('api::product-toportion.product-toportion')
          .delete({ documentId: item.documentId })
      }

      // Delete all product-toingredient entries
      const productToIngredients = await strapi
        .documents('api::product-toingredient.product-toingredient')
        .findMany({ limit: 999 })
      console.log(
        `Found ${productToIngredients.length} product-toingredient entries`
      )
      for (const item of productToIngredients) {
        await strapi
          .documents('api::product-toingredient.product-toingredient')
          .delete({ documentId: item.documentId })
      }

      // Delete all product-totemperature entries (if exists)
      try {
        const productToTemperatures = await strapi
          .documents('api::product-totemperature.product-totemperature')
          .findMany({ limit: 999 })
        console.log(
          `Found ${productToTemperatures.length} product-totemperature entries`
        )
        for (const item of productToTemperatures) {
          await strapi
            .documents('api::product-totemperature.product-totemperature')
            .delete({ documentId: item.documentId })
        }
      } catch (error) {
        // Skip if product-totemperature doesn't exist
      }

      // Delete all uploaded files
      try {
        const uploadedFiles = await strapi
          .documents('plugin::upload.file')
          .findMany({ limit: 999 })
        console.log(`Found ${uploadedFiles.length} uploaded files`)
        for (const file of uploadedFiles) {
          await strapi.plugin('upload').service('upload').remove(file)
        }
        console.log(`Deleted ${uploadedFiles.length} uploaded files`)
      } catch (error) {
        console.error('Error deleting uploaded files:', error)
      }

      // Delete all products (fetch from each locale and delete each locale)
      const allProducts = []
      for (const locale of LOCALES) {
        const products = await strapi
          .documents('api::product.product')
          .findMany({ locale, limit: 999 })
        allProducts.push(...products)
      }
      console.log(`Found ${allProducts.length} product entries`)

      // Delete each locale separately
      for (const product of allProducts) {
        await strapi.documents('api::product.product').delete({
          documentId: product.documentId,
          locale: product.locale,
        })
      }

      // Delete all subcategories (fetch from each locale and delete each locale)
      const allSubcategories = []
      for (const locale of LOCALES) {
        const subcategories = await strapi
          .documents('api::subcategory.subcategory')
          .findMany({ locale, limit: 999 })
        allSubcategories.push(...subcategories)
      }
      console.log(`Found ${allSubcategories.length} subcategory entries`)

      // Delete each locale separately
      for (const subcategory of allSubcategories) {
        await strapi.documents('api::subcategory.subcategory').delete({
          documentId: subcategory.documentId,
          locale: subcategory.locale,
        })
      }

      // Delete all categories (fetch from each locale and delete each locale)
      const allCategories = []
      for (const locale of LOCALES) {
        const categories = await strapi
          .documents('api::category.category')
          .findMany({ locale, limit: 999 })
        allCategories.push(...categories)
      }
      console.log(`Found ${allCategories.length} category entries`)

      // Delete each locale separately
      for (const category of allCategories) {
        await strapi.documents('api::category.category').delete({
          documentId: category.documentId,
          locale: category.locale,
        })
      }

      // Delete all portions (fetch from each locale and delete each locale)
      const allPortions = []
      for (const locale of LOCALES) {
        const portions = await strapi
          .documents('api::portion.portion')
          .findMany({ locale, limit: 999 })
        allPortions.push(...portions)
      }
      console.log(`Found ${allPortions.length} portion entries`)

      // Delete each locale separately
      for (const portion of allPortions) {
        await strapi.documents('api::portion.portion').delete({
          documentId: portion.documentId,
          locale: portion.locale,
        })
      }

      // Delete all temperatures
      const temperatures = await strapi
        .documents('api::temperature.temperature')
        .findMany()
      console.log(`Found ${temperatures.length} temperatures`)
      for (const temperature of temperatures) {
        await strapi
          .documents('api::temperature.temperature')
          .delete({ documentId: temperature.documentId })
      }

      console.log('Database tables cleaned successfully')
    } catch (error) {
      console.error('Error cleaning database tables:', error)
      throw error
    }
  } else {
    // Check if we already have categories
    const existingCategories = await strapi
      .documents('api::category.category')
      .findMany()

    if (existingCategories.length > 0) {
      console.log('Database already has data, skipping bootstrap')
      return
    }
  }

  console.log('Starting database bootstrap...')

  // Ensure required locales exist
  const localeConfigs = {
    ru: { code: 'ru', name: 'Russian (ru)' },
    en: { code: 'en', name: 'English (en)' },
    zh: { code: 'zh', name: 'Chinese (zh)' },
  }

  console.log('Checking and creating locales...')
  const existingLocales = await strapi.plugin('i18n').service('locales').find()
  const existingLocaleCodes = existingLocales.map((l) => l.code)

  for (const locale of LOCALES) {
    if (!existingLocaleCodes.includes(locale)) {
      console.log(`Creating locale: ${locale}`)
      await strapi
        .plugin('i18n')
        .service('locales')
        .create(localeConfigs[locale])
    }
  }

  // Create portions in all locales and store their document IDs
  console.log('Creating portions...')
  const portionIds: Record<string, any> = {}

  for (const portionData of portionsData) {
    const portionName = portionData.translations['ru'].name

    // Create first locale
    const portion = await strapi.documents('api::portion.portion').create({
      data: {
        name: portionData.translations['ru'].name,
      },
      locale: 'ru',
    })

    const documentId = portion.documentId
    portionIds[portionName] = documentId

    // Create localizations for other locales
    for (const locale of LOCALES.slice(1)) {
      await strapi.documents('api::portion.portion').create({
        data: {
          name: portionData.translations[locale].name,
        },
        locale,
        documentId, // Use the same documentId to create a localization
      })
    }
  }

  // Create temperatures and store their document IDs
  console.log('Creating temperatures...')
  const temperatureIds: Record<string, any> = {}

  for (const temperatureData of temperaturesData) {
    const temperature = await strapi
      .documents('api::temperature.temperature')
      .create({
        data: {
          type: temperatureData.type,
        },
      })
    temperatureIds[temperatureData.type] = temperature.documentId
  }

  // Create categories in all locales
  console.log('Creating categories...')
  for (const categoryData of categoriesData) {
    const categoryType = categoryData.order === 1 ? 'beverages' : 'food'

    // Create category (first locale, then localizations)
    const category = await strapi.documents('api::category.category').create({
      data: {
        name: categoryData.translations['ru'].name,
        description: categoryData.translations['ru'].description,
        order: categoryData.order,
      },
      locale: 'ru',
    })

    const categoryDocumentId = category.documentId

    // Create localizations for other locales
    for (const locale of LOCALES.slice(1)) {
      await strapi.documents('api::category.category').create({
        data: {
          name: categoryData.translations[locale].name,
          description: categoryData.translations[locale].description,
          order: categoryData.order,
        },
        locale,
        documentId: categoryDocumentId,
      })
    }

    // Get subcategories for this category
    const subcategoriesList = subcategoriesData[categoryType]
    let subcategoryIndex = categoryData.order === 1 ? 0 : 6

    // Create subcategories and products for each subcategory
    for (const subcategoryData of subcategoriesList) {
      // Create subcategory (first locale, then localizations)
      const subcategory = await strapi
        .documents('api::subcategory.subcategory')
        .create({
          data: {
            name: subcategoryData.translations['ru'].name,
            description: subcategoryData.translations['ru'].description,
            order: subcategoryData.order,
            category: categoryDocumentId,
          },
          locale: 'ru',
        })

      const subcategoryDocumentId = subcategory.documentId

      // Create localizations for other locales (without relations)
      for (const locale of LOCALES.slice(1)) {
        await strapi.documents('api::subcategory.subcategory').create({
          data: {
            name: subcategoryData.translations[locale].name,
            description: subcategoryData.translations[locale].description,
            order: subcategoryData.order,
            // Don't include category - relations are shared across locales
          },
          locale,
          documentId: subcategoryDocumentId,
        })
      }

      // Get products for this subcategory
      const productKey = subcategoryToProducts[subcategoryIndex]
      const products = productsData[productKey] || []

      // Create products
      for (const productData of products) {
        // Upload image if available
        let imageUrl: string | null = null
        if (productData.image) {
          // Use path relative to project root, not __dirname (which is in dist/)
          const projectRoot = path.resolve(__dirname, '../../..')
          const imagePath = path.join(
            projectRoot,
            'src',
            'initScripts',
            'initProducts',
            'products',
            'images',
            productData.image
          )
          imageUrl = await uploadImageToStrapi(strapi, imagePath)
          if (imageUrl) {
            console.log(
              `Uploaded image for ${productData.translations['ru'].name}: ${imageUrl}`
            )
          }
        }

        // Create product (first locale, then localizations)
        const productPayload: any = {
          name: productData.translations['ru'].name,
          description: productData.translations['ru'].description,
          ingredients: productData.translations['ru'].ingredients,
          order: productData.order,
          subcategory: subcategoryDocumentId,
          category: categoryDocumentId,
        }

        // Add image URL if available
        if (imageUrl) {
          productPayload.avatar = imageUrl
        }

        const product = await strapi.documents('api::product.product').create({
          data: productPayload,
          locale: 'ru',
        })

        const productDocumentId = product.documentId

        // Create localizations for other locales (without relations)
        for (const locale of LOCALES.slice(1)) {
          const localizedPayload: any = {
            name: productData.translations[locale].name,
            description: productData.translations[locale].description,
            ingredients: productData.translations[locale].ingredients,
            order: productData.order,
            // Don't include subcategory/category - relations are shared across locales
          }

          // Add image URL if available (same URL for all locales)
          if (imageUrl) {
            localizedPayload.avatar = imageUrl
          }

          await strapi.documents('api::product.product').create({
            data: localizedPayload,
            locale,
            documentId: productDocumentId,
          })
        }

        // Create product-toportion entries for each portion/price pair
        for (let i = 0; i < productData.portion.length; i++) {
          const portionName = productData.portion[i]
          const price = productData.price[i]

          // Skip empty portions
          if (!portionName) continue

          await strapi
            .documents('api::product-toportion.product-toportion')
            .create({
              data: {
                product: productDocumentId,
                portion: portionIds[portionName],
                price: price,
              },
            })
        }

        // Create product-totemperature entries for each temperature
        if (productData.temperature && productData.temperature.length > 0) {
          for (const temperatureType of productData.temperature) {
            // Skip empty temperatures
            if (!temperatureType) continue

            await strapi
              .documents('api::product-totemperature.product-totemperature')
              .create({
                data: {
                  product: productDocumentId,
                  temperature: temperatureIds[temperatureType],
                },
              })
          }
        }
      }

      subcategoryIndex++
    }
  }

  console.log('Database bootstrap completed successfully')
}
