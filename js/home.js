App.pages.home = function () {
  const A = App, S = A.state, today = A.today();
  const t = A.totals(today), water = S.water[today] || 0;
  const last = A.lastWeight(), f = A.forecast();
  const keys = A.dayKeys(today);
  const total = keys.reduce((n, k) => n + A.PLAN[k].ex.length, 0);
  const done = keys.reduce((n, k) => n + A.PLAN[k].ex.filter(([name]) => S.done[today + '|' + k + '|' + name]).length, 0);
  const fmt = s => A.pd(s).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  const dots = Array.from({length: S.waterGoal}, (_, i) => `<i class="dot ${i < water ? 'on' : ''}"></i>`).join('');

  return `
    <div class="grid2">
      <div class="card pad">
        <div class="lbl">Current weight</div>
        <div class="big2">${last.toFixed(1)}</div>
        <div class="mut">${(last - S.goal).toFixed(1)} lbs to ${S.goal}</div>
      </div>
      <div class="card pad">
        <div class="lbl">Goal date</div>
        <div class="big2 sm">${fmt(f.plan)}</div>
        <div class="mut">${f.pace ? 'At your pace: ' + fmt(f.pace) : 'Needs a few weigh-ins'}</div>
      </div>
    </div>
    <button class="card pad tile" data-act="go" data-arg="workout">
      <div class="lbl">Today's workout</div>
      <div class="h">${A.esc(A.reminder(today))}</div>
      <div class="mut">${done} of ${total} exercises done</div>
    </button>
    <button class="card pad tile" data-act="go" data-arg="calories">
      <div class="lbl">Calories today</div>
      <div class="val">${t.c}<span class="mut"> / ${S.cal}</span></div>
      ${A.bar(t.c, S.cal)}
      <div class="mut" style="margin-top:8px">${Math.max(0, S.cal - t.c)} left · ${t.p} / ${S.pro}g protein</div>
    </button>
    <div class="card pad">
      <div class="lbl">Water today</div>
      <div class="val">${water}<span class="mut"> / ${S.waterGoal} cups</span></div>
      <div class="dots">${dots}</div>
      <div class="row2">
        <button class="btn ghost" data-act="water" data-arg="-1">−1 cup</button>
        <button class="btn" data-act="water" data-arg="1">+1 cup</button>
      </div>
    </div>`;
};
