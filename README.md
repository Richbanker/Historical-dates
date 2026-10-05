# Исторические даты — блок по ТЗ

[Открыть публичное демо](https://richbanker.github.io/Historical-dates/)


[![Просмотры README](https://vbr.nathanchung.dev/badge?page_id=Richbanker.Historical-dates&text=README_Views)](https://github.com/Richbanker/Historical-dates)

[Репозиторий — счётчик переходов](https://rebrand.ly/richbanker-dates)

## Стек
- TypeScript
- SCSS (Sass)
- Webpack + webpack-dev-server
- Swiper (нижний слайдер карточек, 3 колонки)

## Запуск
```bash
npm i
npm run dev
```

Продакшн-сборка
```bash
npm run build
# результат в dist/
```

Соответствие ТЗ

- Типизация: весь код на TypeScript.
- Стили: SCSS, автопрефиксинг через PostCSS/Autoprefixer.
- Сборка: Webpack, dev-server, HMR.
- Слайдер карточек: Swiper, 3 карточки по горизонтали (заглушки при нехватке).
- Нет jQuery/Bootstrap/Tailwind/Material/Antd.
- Блок автономен: логика и вёрстка независимы от остальной страницы.





