# Деплой фронта на Vercel

В репозитории фронт лежит в каталоге **`web/`** (статический `index.html`, `app.js`, `styles.css`, `questions.json`).

## Шаги в Vercel

1. Зайди на [vercel.com](https://vercel.com), **Add New… → Project**, подключи этот Git-репозиторий.
2. В настройках проекта: **Settings → General → Root Directory** → укажи **`web`** (важно: не корень репозитория с `bot.py`).
3. **Framework Preset:** Other (или N/A).
4. **Build Command:** оставь пустым (сборки нет).
5. **Output Directory:** оставь по умолчанию **`.`** (точка), так как корень проекта для Vercel уже папка `web`.
6. Deploy. Адрес вида `https://<имя-проекта>.vercel.app`.

## Telegram Mini App

В `.env` бота задай полный URL главной страницы, например:

```env
WEBAPP_URL=https://<имя-проекта>.vercel.app/
```

В [@BotFather](https://t.me/BotFather) для бота добавь домен Mini App (HTTPS из Vercel подходит).

После смены вопросов в боте не забудь обновить **`web/questions.json`** в том же коммите, что и `questions_data.py`, чтобы чат и приложение не разъехались.
