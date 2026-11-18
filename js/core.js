const App = window.App = {
  KEY: 'cut-keep-v1',
  DAY: 864e5,
  DOW: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  WEEK: ['W', 'W', 'W', 'A', 'B', 'A', 'W'],
  TITLES: {home: 'Overview', workout: 'Workout', refs: 'Workout References', calories: 'Calories', planner: 'Meal Planner', weight: 'Weight'},
  PLAN: {
    A: {name: 'Full body lift', ex: [['Goblet squat', '3 x 10'], ['Push-ups or bench press', '3 x 8-12'], ['One-arm dumbbell row', '3 x 10 each'], ['Dumbbell overhead press', '3 x 8-12'], ['Plank', '3 x 30 sec']]},
    B: {name: 'Leg and hinge day', ex: [['Romanian deadlift', '3 x 10'], ['Incline or floor press', '3 x 10'], ['Lat pulldown or band row', '3 x 12'], ['Walking lunges', '3 x 8 each'], ['Dead bug', '3 x 10 each']]},
    W: {name: 'Walk and stretch', ex: [['Brisk walk', '30 min'], ['Full-body stretch', '10 min']]},
    L: {name: 'Lunch circuit (40 min)', ex: [['Push-ups', '3 rounds x 10'], ['Bodyweight squats', '3 rounds x 15'], ['Reverse lunges', '3 rounds x 12 each'], ['Plank', '3 rounds x 30 sec'], ['Brisk walk', '5 min']]}
  },
  RECIPES: [
    {n: 'Green goddess chicken salad wrap', c: 380, p: 42},
    {n: 'Turkey taco lettuce wraps', c: 360, p: 40},
    {n: 'Chicken veggie stir fry', c: 420, p: 45},
    {n: 'Egg white veggie scramble', c: 320, p: 34},
    {n: 'Cottage cheese protein pancakes', c: 340, p: 38},
    {n: 'Shrimp cauliflower rice bowl', c: 360, p: 38},
    {n: 'Chocolate Greek yogurt bowl', c: 260, p: 35},
    {n: 'Chicken bean chili', c: 420, p: 48}
  ],

  pages: {},
  actions: {},
  ui: {page: 'home', date: '', week: null, lastKey: ''},
  state: null,

  defaults() {
    return {start: 255, goal: 190, cal: 2200, pro: 180, rate: 1.5, waterGoal: 8, startDate: null,
            weights: [], logs: {}, water: {}, done: {}, plan: {}};
  },
  load() {
    try { return Object.assign(this.defaults(), JSON.parse(localStorage.getItem(this.KEY)) || {}); }
    catch (e) { return this.defaults(); }
  },
  save() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.state)); } catch (e) {}
  },

  ymd(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },
  today() { return this.ymd(new Date()); },
  pd(s) { return new Date(s + 'T12:00'); },
  addDays(s, n) { return this.ymd(new Date(this.pd(s).getTime() + Math.round(n) * this.DAY)); },
  weeksBetween(a, b) { return (this.pd(b) - this.pd(a)) / (7 * this.DAY); },
  esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  },
  val(id) { return document.getElementById(id).value; },
  bar(v, max) { return `<div class="bar"><i style="width:${Math.max(0, Math.min(100, v / max * 100))}%"></i></div>`; },
  dayLabel(s) {
    const d = this.pd(s);
    return (s === this.today() ? 'Today · ' : '') + d.toLocaleDateString('en-US', {weekday: 'long', month: 'short', day: 'numeric'});
  },

  totals(d) {
    return (this.state.logs[d] || []).reduce((a, x) => ({c: a.c + x.c, p: a.p + x.p}), {c: 0, p: 0});
  },
  dayKeys(s) {
    const w = this.pd(s).getDay();
    return [this.WEEK[w]].concat(w >= 3 && w <= 5 ? ['L'] : []);
  },
  reminder(s) {
    const A = this, w = A.pd(s).getDay();
    return A.PLAN[A.WEEK[w]].name + (A.dayKeys(s).includes('L') ? ' + lunch circuit' : '') + (w === 5 ? ' (light)' : '');
  },
  weekDates(s) {
    const start = this.pd(s);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({length: 7}, (_, i) => {
      const x = new Date(start);
      x.setDate(start.getDate() + i);
      return this.ymd(x);
    });
  },
  strip(dates, showCal) {
    const A = this;
    return `<div class="strip">${dates.map(s => {
      const x = A.pd(s), sel = s === A.ui.date, has = !showCal && A.dayKeys(s).some(k => k !== 'W');
      const tail = showCal ? `<em>${A.totals(s).c || '–'}</em>` : '<i></i>';
      return `<button class="chip ${sel ? 'sel' : ''} ${has ? 'has' : ''}" data-act="day" data-arg="${s}">
        <small>${A.DOW[x.getDay()]}</small><b>${x.getDate()}</b>${tail}</button>`;
    }).join('')}</div>`;
  },

  addLog(n, c, p) {
    const S = this.state, d = this.ui.date;
    S.logs[d] = S.logs[d] || [];
    S.logs[d].push({n, c: Math.round(c), p: Math.round(p)});
    this.save();
  },

  sortWeights() {
    this.state.weights.sort((a, b) => a.d < b.d ? -1 : 1);
    return this.state.weights;
  },
  lastWeight() {
    const W = this.sortWeights();
    return W.length ? W[W.length - 1].w : this.state.start;
  },
  avg7() {
    const l = this.sortWeights().slice(-7);
    return l.length ? l.reduce((a, x) => a + x.w, 0) / l.length : null;
  },
  startDate() {
    const S = this.state;
    return S.startDate || (S.weights[0] && S.weights[0].d) || this.today();
  },
  forecast() {
    const A = this, S = A.state, today = A.today(), last = A.lastWeight(), left = last - S.goal;
    if (left <= 0) return {plan: today, pace: today};
    const lost = S.start - last, weeks = A.weeksBetween(A.startDate(), today);
    return {
      plan: A.addDays(today, left / S.rate * 7),
      pace: lost > 0 && weeks > 0 ? A.addDays(today, left / (lost / weeks) * 7) : null
    };
  }
};
App.state = App.load();
App.ui.date = App.today();
