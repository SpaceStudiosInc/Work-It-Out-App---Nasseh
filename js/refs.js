App.pages.refs = function () {
  const A = App, list = [];
  Object.values(A.PLAN).forEach(p => p.ex.forEach(e => { if (!list.some(x => x[0] === e[0])) list.push(e); }));
  let h = '<button class="back" data-act="go" data-arg="workout">‹ Workout</button><div class="card">';
  list.forEach(([name, sets]) => {
    h += `<div class="row"><div class="grow"><div class="name">${A.esc(name)}</div><div class="mut">${A.esc(sets)}</div></div>
      <a class="vid" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' proper form tutorial')}">Video</a></div>`;
  });
  return h + '</div>';
};
