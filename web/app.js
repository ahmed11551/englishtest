(function () {
  const tg = window.Telegram && window.Telegram.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) tg.setHeaderColor("#0c4a6e");
    if (tg.setBackgroundColor) tg.setBackgroundColor("#020617");
  }

  const root = document.getElementById("root");
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      <div class="question-screen enter-anim">
      <div class="progress-row">
        <span>Вопрос</span>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="q-num">${index + 1}/${questions.length}</span>
      </div>
      <p class="question-text">${escapeHtml(q.id + ". " + q.text)}</p>
      <div class="opts">${optsHtml}</div>
      <p class="question-meta">Осталось ${questions.length - (index + 1)} вопросов</p>
      </div>`;
    root.querySelectorAll(".opt-btn").forEach((btn) => {
      btn.onclick = () => {
        if (btn.disabled) return;
        const chosen = btn.getAttribute("data-ch");
        root.querySelectorAll(".opt-btn").forEach((other) => {
          other.disabled = true;
          if (other === btn) other.classList.add("opt-btn-selected");
          else other.classList.add("opt-btn-dimmed");
        });
        fireHaptic("impact");
        const delay = prefersReducedMotion ? 40 : 220;
        setTimeout(() => onPick(chosen), delay);
      };
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

  function buildPersonalRecommendations(wrongTopics) {
    if (!wrongTopics.length) {
      return {
        title: "Персональный план роста",
        points: [
          "Ошибок нет — текущая база уже сильная.",
          "Чтобы расти дальше, добавляй разговорную практику 3-4 раза в неделю.",
          "Фокус на естественной речи: collocations, phrasal verbs и произношение.",
        ],
      };
    }

    const top = wrongTopics.slice(0, 3);
    const focusLine = top.length === 1 ? top[0] : top.join(", ");
    return {
      title: "Персональные рекомендации по ошибкам",
      points: [
        `Твой главный фокус сейчас: ${focusLine}.`,
        "Сначала закрепи правила, затем отработай их на коротких устных примерах.",
        "Если хочешь быстрее перейти на следующий уровень, лучше идти с преподавателем и обратной связью.",
      ],
    };
  }

  function getNextLevelInfo(score) {
    for (let i = 0; i < LEVEL_BANDS.length; i++) {
      const [lo, hi, label] = LEVEL_BANDS[i];
      if (score >= lo && score <= hi) {
        const next = LEVEL_BANDS[i + 1];
        if (!next) return { hasNext: false, text: "Максимальный уровень в этой версии теста достигнут." };
        const need = Math.max(0, next[0] - score);
        return { hasNext: true, text: `До уровня ${next[2]} осталось ${need} правильных ответов.` };
      }
    }
    return { hasNext: false, text: "" };
  }

  function renderResults(questions, answers) {
    const score = answers.filter((a) => a.is_correct).length;
    const [levelLabel, levelKey] = scoreToLevel(score);
    const accuracy = Math.round((score / questions.length) * 100);
    const wrong = uniqueSortedWrongTopics(answers);
    const nextLevel = getNextLevelInfo(score);
    let mistakesHtml;
    if (wrong.length) {
      mistakesHtml = `<ul class="topic-list">${wrong.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
    } else {
      mistakesHtml = `<p class="stat">Ошибок по темам нет — все ответы верные.</p>`;
    }
    const levelText = LEVEL_TEXTS[levelKey] || "";
    const recommendations = buildPersonalRecommendations(wrong);
    const recommendationsHtml = `
      <div class="recommend-card">
        <div class="recommend-head">
          <span class="recommend-icon" aria-hidden="true">★</span>
          <div class="block-title">${escapeHtml(recommendations.title)}</div>
        </div>
        <ul class="topic-list topic-list-tight">${recommendations.points
          .map((p) => `<li>${escapeHtml(p)}</li>`)
          .join("")}</ul>
        <p class="recommend-cta">
          Если ты хочешь повысить свой уровень и научиться говорить по-английски. Я могу в этом помочь.
          Переходи на сайт и оставь заявку. Первый урок бесплатный.
        </p>
        <div class="cta-stack">
          <a class="btn-primary promo-btn" href="https://desharschool.ru" target="_blank" rel="noopener noreferrer">Перейти на сайт</a>
          <a class="btn-ghost cta-secondary" href="https://t.me/midniqhtman" target="_blank" rel="noopener noreferrer">Написать в Telegram</a>
        </div>
        <div class="sticky-cta-wrap">
          <a class="btn-primary promo-btn sticky-cta" href="https://desharschool.ru" target="_blank" rel="noopener noreferrer">Перейти на сайт</a>
        </div>
      </div>`;
    root.innerHTML = `
      <div class="results enter-anim">
        <h2>Результаты</h2>
        <div class="kpi-grid reveal-1">
          <div class="kpi-card kpi-countup" data-countup-id="score" data-target="${score}">
            <div class="kpi-label">Правильные ответы</div>
            <div class="kpi-value"><span class="kpi-main">0</span><span class="kpi-sub">/ ${questions.length}</span></div>
          </div>
          <div class="kpi-card kpi-countup" data-countup-id="accuracy" data-target="${accuracy}">
            <div class="kpi-label">Точность</div>
            <div class="kpi-value"><span class="kpi-main">0</span><span class="kpi-sub">%</span></div>
          </div>
          <div class="kpi-card kpi-card-wide">
            <div class="kpi-label">Текущий уровень</div>
            <div class="kpi-value">${escapeHtml(levelLabel)}</div>
            <div class="kpi-hint">${escapeHtml(nextLevel.text)}</div>
          </div>
        </div>
        <div class="section-card section-card-soft reveal-2">
          <div class="level-block">${escapeHtml(levelText)}</div>
        </div>
        <div class="section-card reveal-3">
          <div class="block-title">Темы, в которых были ошибки</div>
          ${mistakesHtml}
        </div>
        <div class="reveal-4">${recommendationsHtml}</div>
        <div class="btn-row" style="margin-top:18px">
          <button type="button" class="btn-ghost" id="btn-retry">Пройти ещё раз</button>
        </div>
      </div>`;
    runKpiCountup();
    fireHaptic("success");
    document.getElementById("btn-retry").onclick = () => location.reload();
  }

  function runQuiz(questions) {
    const normalizedQuestions = normalizeQuestions(questions);
    const answers = [];
    let index = 0;

    function step() {
      if (index >= normalizedQuestions.length) {
        renderResults(normalizedQuestions, answers);
        return;
      }
      renderQuestion(normalizedQuestions, index, answers, (chosen) => {
        const q = normalizedQuestions[index];
        const isCorrect = chosen === q.correct;
        answers.push({
          topic: q.topic,
          chosen,
          correct: q.correct,
          is_correct: isCorrect,
        });
        index += 1;
        if (prefersReducedMotion) {
          step();
          return;
        }
        const screen = root.querySelector(".question-screen");
        if (!screen) {
          step();
          return;
        }
        screen.classList.add("leave-anim");
        setTimeout(step, 170);
      });
    }

    step();
  }

  function normalizeQuestions(questions) {
    return questions.map((q) => {
      const pairs = [
        { oldKey: "a", text: q.options.a },
        { oldKey: "b", text: q.options.b },
        { oldKey: "c", text: q.options.c },
      ];
      shuffleArray(pairs);
      const letters = ["a", "b", "c"];
      const nextOptions = {};
      let nextCorrect = "a";
      pairs.forEach((item, idx) => {
        const nextKey = letters[idx];
        nextOptions[nextKey] = item.text;
        if (item.oldKey === q.correct) nextCorrect = nextKey;
      });
      return {
        ...q,
        options: nextOptions,
        correct: nextCorrect,
      };
    });
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
  }

  function fireHaptic(kind) {
    if (!tg || !tg.HapticFeedback) return;
    try {
      if (kind === "success") tg.HapticFeedback.notificationOccurred("success");
      else tg.HapticFeedback.impactOccurred("light");
    } catch (_e) {
      // no-op: haptics are optional
    }
  }

  function runKpiCountup() {
    if (prefersReducedMotion) {
      root.querySelectorAll(".kpi-countup").forEach((el) => {
        const target = Number(el.getAttribute("data-target") || 0);
        const main = el.querySelector(".kpi-main");
        if (main) main.textContent = String(target);
      });
      return;
    }
    const durationMs = 700;
    const startedAt = performance.now();
    const items = Array.from(root.querySelectorAll(".kpi-countup")).map((el) => ({
      target: Number(el.getAttribute("data-target") || 0),
      node: el.querySelector(".kpi-main"),
    }));
    function tick(ts) {
      const p = Math.min(1, (ts - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      items.forEach((item) => {
        if (!item.node) return;
        item.node.textContent = String(Math.round(item.target * eased));
      });
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
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
