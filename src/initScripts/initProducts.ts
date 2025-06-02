import { Strapi } from '@strapi/types/dist/core'

export const initProducts = async (strapi: Strapi) => {
  // Check if we already have categories
  const existingCategories = await strapi.entityService.findMany(
    'api::category.category',
    {
      populate: '*',
    }
  )

  if (existingCategories.length > 0) {
    console.log('Database already has data, skipping bootstrap')
    return
  }

  console.log('Starting database bootstrap...')

  // Create categories
  const categories = [
    {
      name: 'Напитки',
      description: 'Разнообразные напитки',
      order: 1,
      locale: 'ru',
      publishedAt: new Date(),
    },
    {
      name: 'Еда',
      description: 'Вкусная еда',
      order: 2,
      locale: 'ru',
      publishedAt: new Date(),
    },
  ]

  const productsByCategory = {
    Напитки: {
      Кофе: [
        { name: 'Эспрессо', weight: '40мл', price: 100, locale: 'ru' },
        { name: 'Американо', weight: '200мл', price: 110, locale: 'ru' },
        { name: 'Американо', weight: '300мл', price: 130, locale: 'ru' },
        { name: 'Капучино', weight: '200мл', price: 130, locale: 'ru' },
        { name: 'Капучино', weight: '300мл', price: 150, locale: 'ru' },
        { name: 'Латте', weight: '450мл', price: 180, locale: 'ru' },
        { name: 'Раф', weight: '300мл', price: 200, locale: 'ru' },
        { name: 'Кудровый раф', weight: '300мл', price: 160, locale: 'ru' },
        { name: 'Мокачино', weight: '300мл', price: 160, locale: 'ru' },
        { name: 'Флэт уайт', weight: '200мл', price: 180, locale: 'ru' },
      ],
      'Авторский чай': [
        { name: 'Пряный манго', weight: '450мл', price: 200, locale: 'ru' },
        { name: 'Сибирский', weight: '450мл', price: 200, locale: 'ru' },
        {
          name: 'Малина-грейпфрут',
          weight: '450мл',
          price: 200,
          locale: 'ru',
        },
        {
          name: 'Облепиховый с мятой',
          weight: '450мл',
          price: 200,
          locale: 'ru',
        },
      ],
      'Не кофе': [
        {
          name: 'Пунш брусника-малина',
          weight: '',
          price: 150,
          locale: 'ru',
        },
        { name: 'Пунш тропический', weight: '', price: 150, locale: 'ru' },
        { name: 'Глинтвейн', weight: '', price: 180, locale: 'ru' },
        { name: 'Горячий шоколад', weight: '', price: 180, locale: 'ru' },
        { name: 'Какао', weight: '200мл', price: 100, locale: 'ru' },
        { name: 'Какао', weight: '300мл', price: 150, locale: 'ru' },
        { name: 'Чай Svay', weight: '', price: 100, locale: 'ru' },
      ],
      Милкшейк: [
        { name: 'Клубничный', weight: '450мл', price: 220, locale: 'ru' },
        { name: 'Банановый', weight: '450мл', price: 220, locale: 'ru' },
        { name: 'Карамельный', weight: '450мл', price: 220, locale: 'ru' },
      ],
      Лимонады: [
        {
          name: 'Маракуйя-розмарин',
          weight: '350мл',
          price: 180,
          locale: 'ru',
        },
        { name: 'Малиновый', weight: '350мл', price: 180, locale: 'ru' },
        { name: 'Манго-апельсин', weight: '350мл', price: 180, locale: 'ru' },
        {
          name: 'Клубничный апероль',
          weight: '350мл',
          price: 180,
          locale: 'ru',
        },
        {
          name: 'Мандарин-имбирь',
          weight: '350мл',
          price: 180,
          locale: 'ru',
        },
      ],
      Смузи: [
        { name: 'Лесные ягоды', weight: '350мл', price: 200, locale: 'ru' },
        { name: 'Пина-колада', weight: '350мл', price: 200, locale: 'ru' },
        { name: 'Тропический', weight: '350мл', price: 200, locale: 'ru' },
        { name: 'Клубника-банак', weight: '350мл', price: 200, locale: 'ru' },
        { name: 'Персик-манго', weight: '350мл', price: 200, locale: 'ru' },
      ],
    },
    Еда: {
      Шаурма: [
        { name: 'Классическая', weight: '', price: 200, locale: 'ru' },
        { name: 'Большая', weight: '', price: 250, locale: 'ru' },
        { name: 'Овощная', weight: '', price: 130, locale: 'ru' },
        {
          name: 'Шаурма + 5 наггетсов',
          weight: '',
          price: 270,
          locale: 'ru',
        },
      ],
      Салаты: [
        { name: 'Цезарь', weight: '', price: 190, locale: 'ru' },
        { name: 'Греческий', weight: '', price: 190, locale: 'ru' },
        { name: 'Летний', weight: '', price: 170, locale: 'ru' },
      ],
      Закуски: [
        { name: 'Картофель фри', weight: '', price: 100, locale: 'ru' },
        { name: 'Наггетсы', weight: '', price: 100, locale: 'ru' },
        { name: 'Corn dog', weight: '', price: 100, locale: 'ru' },
        { name: 'Сырные палочки', weight: '', price: 70, locale: 'ru' },
        { name: 'Hot dog', weight: '', price: 160, locale: 'ru' },
      ],
      Блинчики: [
        { name: 'Без начинки', weight: '2шт', price: 100, locale: 'ru' },
        {
          name: 'С ветчиной и сыром',
          weight: '2шт',
          price: 150,
          locale: 'ru',
        },
        { name: 'С сыром и икрой', weight: '2шт', price: 180, locale: 'ru' },
        { name: 'С брусникой', weight: '2шт', price: 130, locale: 'ru' },
        { name: 'С Nutella', weight: '2шт', price: 150, locale: 'ru' },
        {
          name: 'С шоколадом и бананом',
          weight: '2шт',
          price: 150,
          locale: 'ru',
        },
        {
          name: 'С клубникой и бананом',
          weight: '2шт',
          price: 150,
          locale: 'ru',
        },
        { name: 'Со сгущёнкой', weight: '2шт', price: 130, locale: 'ru' },
      ],
      Десерты: [
        { name: 'Cheese-cake', weight: '', price: 160, locale: 'ru' },
        { name: 'Сырники', weight: '', price: 170, locale: 'ru' },
        { name: 'Маффин', weight: '', price: 120, locale: 'ru' },
        { name: 'Круассан', weight: '', price: 150, locale: 'ru' },
        { name: 'Донатс', weight: '', price: 100, locale: 'ru' },
      ],
    },
  }

  for (const categoryData of categories) {
    const category = await strapi.entityService.create(
      'api::category.category',
      {
        data: categoryData,
      }
    )

    // Create subcategories for each category
    let subcategories = []

    if (category.name === 'Напитки') {
      subcategories = [
        { name: 'Милкшейк', order: 1, locale: 'ru' },
        { name: 'Лимонады', order: 2, locale: 'ru' },
        { name: 'Смузи', order: 3, locale: 'ru' },
        { name: 'Кофе', order: 4, locale: 'ru' },
        { name: 'Авторский чай', order: 5, locale: 'ru' },
        { name: 'Не кофе', order: 6, locale: 'ru' },
      ]
    } else if (category.name === 'Еда') {
      subcategories = [
        { name: 'Шаурма', order: 1, locale: 'ru' },
        { name: 'Салаты', order: 2, locale: 'ru' },
        { name: 'Закуски', order: 3, locale: 'ru' },
        { name: 'Блинчики', order: 4, locale: 'ru' },
        { name: 'Десерты', order: 5, locale: 'ru' },
      ]
    }

    for (const subcategoryData of subcategories) {
      const subcategory = await strapi.entityService.create(
        'api::subcategory.subcategory',
        {
          data: {
            ...subcategoryData,
            description: `Описание ${subcategoryData.name.toLowerCase()}`,
            category: category.id,
            locale: 'ru',
            publishedAt: new Date(),
          },
        }
      )

      // Create products for each subcategory
      const products = productsByCategory[category.name][subcategory.name].map(
        (product, index) => ({
          name: product.name,
          description: `${product.name}${product.weight ? ` - ${product.weight}` : ''}`,
          price: product.price,
          weight: product.weight,
          ingredients: 'Ингредиенты продукта',
          order: index + 1,
          subcategory: subcategory.id,
          category: category.id,
          locale: 'ru',
          publishedAt: new Date(),
        })
      )

      for (const productData of products) {
        await strapi.entityService.create('api::product.product', {
          data: productData,
        })
      }
    }
  }

  console.log('Database bootstrap completed successfully')
}
