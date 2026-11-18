App.pages.weight = function () {
  const A = App, S = A.state, avg = A.avg7(), f = A.forecast(), last = A.lastWeight();
  const fmt = s => A.pd(s).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  const W = A.sortWeights();

  let h = `<div class="card pad"><div class="stats">
      <div>Start<b>${S.start}</b></div><div>Now<b>${last.toFixed(1)}</b></div>
      <div>Lost<b>${(S.start - last).toFixed(1)}</b></div><div>To goal<b>${(last - S.goal).toFixed(1)}</b></div>
      <div>7-day avg<b>${avg === null ? '–' : avg.toFixed(1)}</b></div><div>Goal<b>${S.goal}</b></div>
    </div><div class="gap2">${A.bar(S.start - last, S.start - S.goal)}</div></div>`;

  h += `<div class="sec">Estimated goal date</div><div class="card pad"><div class="stats">
      <div>At ${S.rate} lbs/week<b class="sm">${fmt(f.plan)}</b></div>
      <div>At your pace<b class="sm">${f.pace ? fmt(f.pace) : '–'}</b><span>${f.pace ? 'based on loss so far' : 'needs a few weigh-ins'}</span></div>
    </div></div>`;

  h += `<div class="sec">Log weight</div><div class="card pad"><div class="frm">
      <label>Date<input id="wd" type="date" value="${A.today()}"></label>
      <label>Pounds<input id="ww" type="number" step="0.1" inputmode="decimal"></label>
      <button class="btn full" data-act="addWeight">Save</button>
    </div></div>`;

  h += '<div class="sec">History</div><div class="card">';
  if (!W.length) h += '<div class="empty">No weigh-ins yet.</div>';
  W.map((x, i) => ({...x, i})).reverse().slice(0, 30).forEach(x => h += `<div class="row">
      <div class="grow">${x.d}</div><b>${x.w} lbs</b><button class="x" data-act="delW" data-arg="${x.i}">✕</button></div>`);
  h += '</div>';

  h += `<div class="sec">Targets</div><div class="card pad"><div class="frm">
      <label>Calories/day<input id="tc" type="number" value="${S.cal}"></label>
      <label>Protein g/day<input id="tp" type="number" value="${S.pro}"></label>
      <label>Start lbs<input id="ts" type="number" value="${S.start}"></label>
      <label>Goal lbs<input id="tg" type="number" value="${S.goal}"></label>
      <label>Loss per week<input id="tr" type="number" step="0.1" value="${S.rate}"></label>
      <label>Water cups/day<input id="tw" type="number" value="${S.waterGoal}"></label>
      <label>Start date<input id="tsd" type="date" value="${A.startDate()}"></label>
      <button class="btn full" data-act="saveTargets">Save targets</button>
    </div></div>`;
  return h;
};

App.actions.addWeight = () => {
  const A = App, d = A.val('wd'), w = +A.val('ww');
  if (!d || !w) return;
  A.state.weights.push({d, w});
  A.save();
  A.render();
};
App.actions.delW = el => {
  App.state.weights.splice(+el.dataset.arg, 1);
  App.save();
  App.render();
};
App.actions.saveTargets = () => {
  const A = App, S = A.state;
  S.cal = +A.val('tc') || S.cal;
  S.pro = +A.val('tp') || S.pro;
  S.start = +A.val('ts') || S.start;
  S.goal = +A.val('tg') || S.goal;
  S.rate = +A.val('tr') || S.rate;
  S.waterGoal = +A.val('tw') || S.waterGoal;
  S.startDate = A.val('tsd') || S.startDate;
  A.save();
  A.render();
};
