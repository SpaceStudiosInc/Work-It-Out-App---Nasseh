App.render = function () {
  const A = App, ui = A.ui, p = ui.page;
  const navKey = p === 'refs' ? 'workout' : p;
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.arg === navKey));

  const usesDate = p === 'workout' || p === 'calories' || p === 'planner';
  const d = A.pd(usesDate ? ui.date : A.today());
  const showToday = usesDate && ui.date !== A.today();
  document.getElementById('top').innerHTML = `
    <div>
      <div class="kick">${A.TITLES[p]}</div>
      <div class="big">${d.toLocaleDateString('en-US', {weekday: 'long'})}, ${d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</div>
    </div>
    ${showToday ? '<button class="pill" data-act="today">Today</button>' : ''}`;

  const key = p + ui.date, enter = key !== ui.lastKey;
  ui.lastKey = key;
  document.getElementById('main').innerHTML = `<section class="${enter ? 'enter' : ''}">${A.pages[p]()}</section>`;

  const sel = document.querySelector('.strip .sel');
  if (sel) sel.scrollIntoView({inline: 'center', block: 'nearest'});
};

App.toast = msg => {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(App._toastTimer);
  App._toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
};

App.act = el => {
  const fn = App.actions[el.dataset.act];
  if (fn) fn(el);
};

App.actions.go = el => {
  App.ui.page = el.dataset.arg;
  App.render();
  window.scrollTo(0, 0);
};
App.actions.day = el => {
  App.ui.date = el.dataset.arg;
  App.render();
};
App.actions.today = () => {
  App.ui.date = App.today();
  App.render();
};
App.actions.water = el => {
  const A = App, t = A.today();
  A.state.water[t] = Math.max(0, (A.state.water[t] || 0) + +el.dataset.arg);
  A.save();
  A.render();
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (el && el.tagName !== 'INPUT' && el.tagName !== 'SELECT') {
    e.preventDefault();
    return App.act(el);
  }
  if (!el) {
    const row = e.target.closest('.ex');
    if (row) row.classList.toggle('open');
  }
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-act]');
  if (el) App.act(el);
});

App.render();
