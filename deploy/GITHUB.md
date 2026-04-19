# Репозиторий GitHub

Целевой репозиторий: **[ahmed11551/englishtest](https://github.com/ahmed11551/englishtest)** (`https://github.com/ahmed11551/englishtest.git`).

## Быстрый пуш (Windows)

Из корня проекта (где лежат `bot.py` и папка `web/`):

```powershell
.\scripts\git-push-englishtest.ps1
```

Перед этим установи [Git for Windows](https://git-scm.com/download/win). При первом `git commit` Git может попросить имя и почту:

```text
git config --global user.name "Твоё имя"
git config --global user.email "you@example.com"
```

Для `git push` по HTTPS GitHub обычно нужен **Personal Access Token** вместо пароля ([документация](https://docs.github.com/en/authentication)).

## Вручную

```text
git init
git remote add origin https://github.com/ahmed11551/englishtest.git
git add -A
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

Если в репозитории на GitHub уже есть коммиты (например README), сначала: `git pull origin main --rebase`, затем снова `git push`.
