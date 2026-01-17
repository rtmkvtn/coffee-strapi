export const subcategoriesData = {
  beverages: [
    {
      order: 1,
      image: 'milkshake.svg',
      translations: {
        ru: { name: 'Милкшейк', description: 'Описание милкшейк' },
        en: { name: 'Milkshake', description: 'Milkshake description' },
        zh: { name: '奶昔', description: '奶昔描述' },
      },
    },
    {
      order: 2,
      image: 'lemonade.svg',
      translations: {
        ru: { name: 'Лимонады', description: 'Описание лимонады' },
        en: { name: 'Lemonades', description: 'Lemonades description' },
        zh: { name: '柠檬水', description: '柠檬水描述' },
      },
    },
    {
      order: 3,
      image: 'smoothie.svg',
      translations: {
        ru: { name: 'Смузи', description: 'Описание смузи' },
        en: { name: 'Smoothies', description: 'Smoothies description' },
        zh: { name: '思慕雪', description: '思慕雪描述' },
      },
    },
    {
      order: 4,
      image: 'coffee.svg',
      translations: {
        ru: { name: 'Кофе', description: 'Описание кофе' },
        en: { name: 'Coffee', description: 'Coffee description' },
        zh: { name: '咖啡', description: '咖啡描述' },
      },
    },
    {
      order: 5,
      image: 'tea.svg',
      translations: {
        ru: { name: 'Авторский чай', description: 'Описание авторский чай' },
        en: {
          name: 'Signature Tea',
          description: 'Signature tea description',
        },
        zh: { name: '特色茶', description: '特色茶描述' },
      },
    },
    {
      order: 6,
      image: 'not_coffee.svg',
      translations: {
        ru: { name: 'Не кофе', description: 'Описание не кофе' },
        en: { name: 'Non-Coffee', description: 'Non-coffee description' },
        zh: { name: '非咖啡', description: '非咖啡描述' },
      },
    },
  ],
  food: [
    {
      order: 1,
      image: 'shawarma.svg',
      translations: {
        ru: { name: 'Шаурма', description: 'Описание шаурма' },
        en: { name: 'Shawarma', description: 'Shawarma description' },
        zh: { name: '沙威玛', description: '沙威玛描述' },
      },
    },
    {
      order: 2,
      image: 'salad.svg',
      translations: {
        ru: { name: 'Салаты', description: 'Описание салаты' },
        en: { name: 'Salads', description: 'Salads description' },
        zh: { name: '沙拉', description: '沙拉描述' },
      },
    },
    {
      order: 3,
      image: 'snacks.png',
      translations: {
        ru: { name: 'Закуски', description: 'Описание закуски' },
        en: { name: 'Snacks', description: 'Snacks description' },
        zh: { name: '小吃', description: '小吃描述' },
      },
    },
    {
      order: 4,
      image: 'pancakes.svg',
      translations: {
        ru: { name: 'Блинчики', description: 'Описание блинчики' },
        en: { name: 'Pancakes', description: 'Pancakes description' },
        zh: { name: '薄饼', description: '薄饼描述' },
      },
    },
    {
      order: 5,
      image: 'desserts.svg',
      translations: {
        ru: { name: 'Десерты', description: 'Описание десерты' },
        en: { name: 'Desserts', description: 'Desserts description' },
        zh: { name: '甜品', description: '甜品描述' },
      },
    },
  ],
}

export const subcategoryToProducts: Record<number, string> = {
  0: 'milkshake',
  1: 'lemonades',
  2: 'smoothies',
  3: 'coffee',
  4: 'signatureTea',
  5: 'nonCoffee',
  6: 'shawarma',
  7: 'salads',
  8: 'snacks',
  9: 'pancakes',
  10: 'desserts',
}
