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

      // Delete all products
      const products = await strapi
        .documents('api::product.product')
        .findMany({ limit: 999 })
      console.log(`Found ${products.length} products`)
      for (const product of products) {
        await strapi
          .documents('api::product.product')
          .delete({ documentId: product.documentId })
      }

      // Delete all subcategories
      const subcategories = await strapi
        .documents('api::subcategory.subcategory')
        .findMany({ limit: 999 })
      console.log(`Found ${subcategories.length} subcategories`)
      for (const subcategory of subcategories) {
        await strapi
          .documents('api::subcategory.subcategory')
          .delete({ documentId: subcategory.documentId })
      }

      // Delete all categories
      const categories = await strapi
        .documents('api::category.category')
        .findMany({ limit: 999 })
      console.log(`Found ${categories.length} categories`)
      for (const category of categories) {
        await strapi
          .documents('api::category.category')
          .delete({ documentId: category.documentId })
      }

      // Delete all portions
      const portions = await strapi
        .documents('api::portion.portion')
        .findMany({ limit: 999 })
      console.log(`Found ${portions.length} portions`)
      for (const portion of portions) {
        await strapi
          .documents('api::portion.portion')
          .delete({ documentId: portion.documentId })
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
    // Check if we already have categories (check across all locales)
    const categoryCount = await strapi.db
      .query('api::category.category')
      .count()

    if (categoryCount > 0) {
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

  // Create portions
  console.log('Creating portions...')
  const portionIds: Record<string, any> = {}

  for (const portionData of portionsData) {
    const portionName = portionData.translations['ru'].name

    const portion = await strapi.documents('api::portion.portion').create({
      data: {
        name_by_locale: {
          ru: portionData.translations.ru.name,
          en: portionData.translations.en.name,
          zh: portionData.translations.zh.name,
        },
      },
    })

    portionIds[portionName] = portion.documentId
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

  // Create categories
  console.log('Creating categories...')
  for (const categoryData of categoriesData) {
    const categoryType = categoryData.order === 1 ? 'beverages' : 'food'

    const category = await strapi.documents('api::category.category').create({
      data: {
        name_by_locale: {
          ru: categoryData.translations.ru.name,
          en: categoryData.translations.en.name,
          zh: categoryData.translations.zh.name,
        },
        description_by_locale: {
          ru: categoryData.translations.ru.description,
          en: categoryData.translations.en.description,
          zh: categoryData.translations.zh.description,
        },
        order: categoryData.order,
      },
    })

    const categoryDocumentId = category.documentId

    // Get subcategories for this category
    const subcategoriesList = subcategoriesData[categoryType]
    let subcategoryIndex = categoryData.order === 1 ? 0 : 6

    // Create subcategories and products for each subcategory
    for (const subcategoryData of subcategoriesList) {
      // Upload subcategory image if available
      let subcategoryImageUrl: string | null = null
      if (subcategoryData.image) {
        const projectRoot = path.resolve(__dirname, '../../..')
        const imagePath = path.join(
          projectRoot,
          'src',
          'initScripts',
          'initProducts',
          'subcategories',
          subcategoryData.image
        )
        subcategoryImageUrl = await uploadImageToStrapi(strapi, imagePath)
        if (subcategoryImageUrl) {
          console.log(
            `Uploaded image for subcategory ${subcategoryData.translations['ru'].name}: ${subcategoryImageUrl}`
          )
        }
      }

      // Create subcategory
      const subcategoryPayload: any = {
        name_by_locale: {
          ru: subcategoryData.translations.ru.name,
          en: subcategoryData.translations.en.name,
          zh: subcategoryData.translations.zh.name,
        },
        description_by_locale: {
          ru: subcategoryData.translations.ru.description,
          en: subcategoryData.translations.en.description,
          zh: subcategoryData.translations.zh.description,
        },
        order: subcategoryData.order,
        category: categoryDocumentId,
      }

      // Add image URL if available
      if (subcategoryImageUrl) {
        subcategoryPayload.avatar = subcategoryImageUrl
      }

      const subcategory = await strapi
        .documents('api::subcategory.subcategory')
        .create({
          data: subcategoryPayload,
        })

      const subcategoryDocumentId = subcategory.documentId

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

        // Create product
        const productPayload: any = {
          name_by_locale: {
            ru: productData.translations.ru.name,
            en: productData.translations.en.name,
            zh: productData.translations.zh.name,
          },
          description_by_locale: {
            ru: productData.translations.ru.description,
            en: productData.translations.en.description,
            zh: productData.translations.zh.description,
          },
          ingredients_by_locale: {
            ru: productData.translations.ru.ingredients,
            en: productData.translations.en.ingredients,
            zh: productData.translations.zh.ingredients,
          },
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
        })

        const productDocumentId = product.documentId

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
