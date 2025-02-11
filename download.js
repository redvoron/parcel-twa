import axios from 'axios';
import fs from 'fs/promises';

async function downloadCities() {
  const baseUrl = 'http://geodb-free-service.wirefreethought.com/v1/geo/cities';
  const limit = 10;
  let offset = 0;
  const allCities = [];

  try {
    let hasMore = true;
    while (hasMore) {
      console.log(`Загрузка городов с offset=${offset}...`);
      
      const response = await axios.get(baseUrl, {
        params: {
          limit,
          offset,
          languageCode: 'en'
        }
      });

      const { data, metadata } = response.data;
      allCities.push(...data);

      if (offset >= metadata.totalCount) {
        hasMore = false;
      }

      offset += limit;
      
      // Добавляем задержку, чтобы не перегружать API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await fs.writeFile(
      'cities-en.json',
      JSON.stringify(allCities, null, 2),
      'utf-8'
    );

    console.log(`Загружено ${allCities.length} городов`);

  } catch (error) {
    console.error('Ошибка при загрузке городов:', error);
    throw error;
  }
}

// Запуск функции
downloadCities();