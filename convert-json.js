import fs from 'fs/promises';
import { parse } from 'json2csv';

async function convertJsonToCsv() {
  try {
    // Читаем JSON файл
    const jsonData = await fs.readFile('cities-en.json', 'utf-8');
    const cities = JSON.parse(jsonData);

    // Определяем поля для CSV
    const fields = [
      'id',
      'wikiDataId',
      'type',
      'city',
      'name',
      'country',
      'countryCode',
      'region',
      'regionCode',
      'regionWdId',
      'latitude',
      'longitude',
      'population'
    ];

    // Конвертируем в CSV
    const csv = parse(cities, { fields });

    // Записываем CSV файл
    await fs.writeFile('cities-en.txt', csv, 'utf-8');

    console.log('Конвертация завершена успешно');

  } catch (error) {
    console.error('Ошибка при конвертации:', error);
    throw error;
  }
}

// Запуск функции
convertJsonToCsv();