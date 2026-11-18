const App = window.App = {
  KEY: 'cut-keep-v1',
  DAY: 864e5,
  DOW: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  WEEK: ['W', 'W', 'W', 'A', 'B', 'A', 'W'],
  TITLES: {home: 'Overview', workout: 'Workout', refs: 'Workout References', calories: 'Calories', recipes: 'Recipes', weight: 'Weight'},
  PLAN: {
    A: {name: 'Full body lift', ex: [['Goblet squat', '3 x 10'], ['Push-ups or bench press', '3 x 8-12'], ['One-arm dumbbell row', '3 x 10 each'], ['Dumbbell overhead press', '3 x 8-12'], ['Plank', '3 x 30 sec']]},
    B: {name: 'Leg and hinge day', ex: [['Romanian deadlift', '3 x 10'], ['Incline or floor press', '3 x 10'], ['Lat pulldown or band row', '3 x 12'], ['Walking lunges', '3 x 8 each'], ['Dead bug', '3 x 10 each']]},
    W: {name: 'Walk and stretch', ex: [['Brisk walk', '30 min'], ['Full-body stretch', '10 min']]},
    L: {name: 'Lunch circuit (40 min)', ex: [['Push-ups', '3 rounds x 10'], ['Bodyweight squats', '3 rounds x 15'], ['Reverse lunges', '3 rounds x 12 each'], ['Plank', '3 rounds x 30 sec'], ['Brisk walk', '5 min']]}
  },
  RECIPES: [
    {n: 'Chicken salad wrap', c: 380, p: 42, i: '5 oz chicken, 1/2 cup nonfat Greek yogurt, celery, mustard, whole-wheat wrap',
     s: ['Dice cooked chicken and mix with Greek yogurt, mustard, and chopped celery.', 'Season with salt and pepper.', 'Lay out the wrap, add lettuce, spoon the filling on, and roll tight.']},
    {n: 'Turkey taco lettuce wraps', c: 360, p: 40, i: '6 oz 93% lean ground turkey, taco seasoning, lettuce cups, salsa, light cheese',
     s: ['Brown the turkey in a non-stick pan over medium heat, breaking it up.', 'Add taco seasoning and a splash of water. Simmer 3 minutes.', 'Spoon into lettuce cups and top with salsa and a little cheese.']},
    {n: 'Chicken veggie stir fry', c: 420, p: 45, i: '6 oz chicken, broccoli, peppers, low-sodium soy, 1/2 cup rice',
     s: ['Cut the chicken into bite pieces and cook in a hot pan for 5 to 6 minutes.', 'Add broccoli and peppers and stir fry for 4 minutes.', 'Add low-sodium soy and garlic. Serve over 1/2 cup cooked rice.']},
    {n: 'Egg white veggie scramble', c: 320, p: 34, i: '1 cup egg whites + 1 egg, spinach, peppers, mushrooms, 1 slice light toast',
     s: ['Saute spinach, peppers, and mushrooms in a non-stick pan for 3 minutes.', 'Pour in the egg whites and one whole egg. Stir over medium-low heat.', 'Serve with a slice of light toast.']},
    {n: 'Cottage cheese protein pancakes', c: 340, p: 38, i: '1 cup cottage cheese, 2 eggs, 1/2 cup oats, berries',
     s: ['Blend cottage cheese, eggs, and oats until smooth.', 'Pour small rounds onto a lightly oiled non-stick pan.', 'Cook 2 minutes per side. Top with berries.']},
    {n: 'Shrimp cauliflower rice bowl', c: 360, p: 38, i: '6 oz shrimp, cauliflower rice, salsa, 1/4 avocado',
     s: ['Microwave the cauliflower rice for 3 minutes.', 'Sear the shrimp 2 minutes per side with pepper and lime.', 'Build the bowl with rice, shrimp, salsa, and avocado.']},
    {n: 'Chocolate Greek yogurt bowl', c: 260, p: 35, i: '1 scoop chocolate protein, 1 cup nonfat Greek yogurt, berries, cocoa',
     s: ['Stir the protein into the yogurt until smooth. Add water a spoon at a time if it is thick.', 'Top with berries and a dusting of cocoa.']},
    {n: 'Chicken bean chili', c: 420, p: 48, i: '6 oz chicken, 1/2 cup beans, diced tomatoes, chili powder',
     s: ['Brown 6 oz diced chicken in a pot.', 'Add beans, diced tomatoes, chili powder, cumin, and salt. Simmer 20 minutes.', 'Batch cook and portion for 3 to 4 days.']}
  ],

  pages: {},
  actions: {},
  ui: {page: 'home', date: '', week: null, lastKey: ''},
  state: null,

  defaults() {
    return {start: 255, goal: 190, cal: 2200, pro: 180, rate: 1.5, waterGoal: 8, startDate: null,
            weights: [], logs: {}, water: {}, done: {}};
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
