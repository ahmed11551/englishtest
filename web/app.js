(function () {
  const tg = window.Telegram && window.Telegram.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) tg.setHeaderColor("#0c4a6e");
    if (tg.setBackgroundColor) tg.setBackgroundColor("#020617");
  }

  const root = document.getElementById("root");

  const LEVEL_BANDS = [
    [0, 3, "Pre-A1", "pre_a1"],
    [4, 7, "A1", "a1"],
    [8, 12, "A2", "a2"],
    [13, 16, "B1", "b1"],
    [17, 19, "B2", "b2"],
    [20, 21, "B2+", "b2_plus"],
  ];

  const LEVEL_TEXTS = {
    pre_a1: `Pre-A1 (0–3)
Сейчас у тебя самый начальный уровень. Ты можешь узнавать отдельные слова, но строить предложения пока сложно. Грамматика практически не работает — всё на уровне догадок.
Тебе важно начать с базы: глагол to be, простые конструкции (I am, I have), базовые слова и короткие фразы. Это фундамент, без него дальше не пойдёт.`,
    a1: `A1 (4–7)
Ты уже можешь сказать простые вещи о себе: кто ты, где живёшь, чем занимаешься. Но речь очень ограниченная, и ошибок много.
Чаще всего проблемы с временами, формами глаголов и артиклями.
Тебе нужно закрепить основу: Present Simple, Present Continuous и понять, как работают a / the. Плюс расширять базовый словарь.`,
    a2: `A2 (8–12)
Ты уже можешь говорить про прошлое и настоящее, объясниться в простых ситуациях. В целом тебя понимают, даже если есть ошибки.
Но пока не хватает точности: путается Present Perfect, предлоги используются неуверенно, сложные конструкции даются тяжело.
Тебе стоит прокачать времена (особенно Present Perfect), предлоги и слова типа much / many / few / little.`,
    b1: `B1 (13–16)
Ты уже нормально общаешься на бытовые темы. Можешь поддержать разговор, рассказать историю, объяснить свою мысль.
Но речь пока не всегда точная: есть ошибки в условных предложениях, косвенной речи, иногда используешь не совсем подходящие слова.
Тебе нужно работать над точностью: conditionals, reported speech и разница между похожими словами (например, say / tell).`,
    b2: `B2 (17–19)
Ты говоришь достаточно свободно. Можешь обсуждать разные темы и в целом хорошо понимаешь английскую речь.
Ошибки уже не критичные, но иногда речь звучит «не совсем по-английски» — из-за предлогов, артиклей или выбора слов.
Тебе стоит прокачать естественность: устойчивые выражения, правильные сочетания слов и мелкие грамматические детали.`,
    b2_plus: `B2+ (20–21)
У тебя уже уверенный уровень. Ты хорошо говоришь, понимаешь английский и редко допускаешь серьёзные ошибки.
Остаются только нюансы: звучать максимально естественно, выбирать правильный стиль и избегать влияния родного языка.
Дальше — это уже движение к C1: больше живого языка, идиом и практики в сложных темах.`,
  };

  function scoreToLevel(score) {
    for (let i = 0; i < LEVEL_BANDS.length; i++) {
      const [lo, hi, label, key] = LEVEL_BANDS[i];
      if (score >= lo && score <= hi) return [label, key];
    }
    const last = LEVEL_BANDS[LEVEL_BANDS.length - 1];
    return [last[2], last[3]];
  }

  function renderStart(onBegin) {
    root.innerHTML = `
      <div class="screen-start">
        <p class="lead">Сразу грамматика: 21 вопрос без лишних шагов. В конце — балл, уровень и темы с ошибками.</p>
        <div class="btn-row">
          <button type="button" class="btn-primary" id="btn-begin">Начать тест</button>
        </div>
      </div>`;
    document.getElementById("btn-begin").onclick = onBegin;
  }

  function renderQuestion(questions, index, answers, onPick) {
    const q = questions[index];
    const pct = ((index + 1) / questions.length) * 100;
    const letters = ["a", "b", "c"];
    const optsHtml = letters
      .map(
        (L) =>
          `<button type="button" class="opt-btn" data-ch="${L}"><span class="opt-key">${L})</span>${escapeHtml(
            q.options[L]
          )}</button>`
      )
      .join("");
    root.innerHTML = `
      <div class="progress-row">
        <span>Вопрос</span>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="q-num">${index + 1}/${questions.length}</span>
      </div>
      <p class="question-text">${escapeHtml(q.id + ". " + q.text)}</p>
      <div class="opts">${optsHtml}</div>`;
    root.querySelectorAll(".opt-btn").forEach((btn) => {
      btn.onclick = () => onPick(btn.getAttribute("data-ch"));
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function uniqueSortedWrongTopics(answers) {
    const set = new Set();
    answers.forEach((a) => {
      if (!a.is_correct) set.add(a.topic);
    });
    return Array.from(set).sort();
  }

  function renderResults(questions, answers) {
    const score = answers.filter((a) => a.is_correct).length;
    const [levelLabel, levelKey] = scoreToLevel(score);
    const wrong = uniqueSortedWrongTopics(answers);
    let mistakesHtml;
    let repeatHtml;
    if (wrong.length) {
      mistakesHtml = `<ul class="topic-list">${wrong.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
      repeatHtml = `<ul class="topic-list">${wrong.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
    } else {
      mistakesHtml = `<p class="stat">Ошибок по темам нет — все ответы верные.</p>`;
      repeatHtml = `<p class="stat">Можно поддерживать уровень практикой по всем блокам.</p>`;
    }
    const levelText = LEVEL_TEXTS[levelKey] || "";
    root.innerHTML = `
      <div class="results">
        <h2>Результаты</h2>
        <p class="stat">Правильных ответов: <strong>${score}</strong> из ${questions.length}</p>
        <p class="stat">Уровень по шкале теста: <strong>${escapeHtml(levelLabel)}</strong></p>
        <div class="block-title">Темы, в которых были ошибки</div>
        ${mistakesHtml}
        <div class="block-title">Имеет смысл повторить в первую очередь</div>
        ${repeatHtml}
        <div class="level-block">${escapeHtml(levelText)}</div>
        <div class="btn-row" style="margin-top:18px">
          <button type="button" class="btn-ghost" id="btn-retry">Пройти ещё раз</button>
        </div>
      </div>`;
    document.getElementById("btn-retry").onclick = () => location.reload();
  }

  function runQuiz(questions) {
    const answers = [];
    let index = 0;

    function step() {
      if (index >= questions.length) {
        renderResults(questions, answers);
        return;
      }
      renderQuestion(questions, index, answers, (chosen) => {
        const q = questions[index];
        const isCorrect = chosen === q.correct;
        answers.push({
          topic: q.topic,
          chosen,
          correct: q.correct,
          is_correct: isCorrect,
        });
        index += 1;
        step();
      });
    }

    step();
  }

  fetch("questions.json")
    .then((r) => {
      if (!r.ok) throw new Error("questions");
      return r.json();
    })
    .then((questions) => {
      renderStart(() => runQuiz(questions));
    })
    .catch(() => {
      root.innerHTML =
        '<p class="lead">Не удалось загрузить вопросы. Открой страницу через локальный сервер или HTTPS-хостинг (один каталог с questions.json).</p>';
    });
})();
