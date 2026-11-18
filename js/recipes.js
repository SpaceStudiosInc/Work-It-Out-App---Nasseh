App.pages.recipes = function () {
  const A = App;
  return A.RECIPES.map((r, i) => `<div class="card pad">
    <div class="row" style="border:0;padding:0">
      <div class="grow"><div class="name">${A.esc(r.n)}</div><div class="mut">${r.c} cal · ${r.p}g protein</div></div>
      <button class="btn" data-act="logRecipe" data-arg="${i}">Log</button>
    </div>
    <div class="mut ing">${A.esc(r.i)}</div>
    <ol class="steps">${r.s.map(x => `<li>${A.esc(x)}</li>`).join('')}</ol>
  </div>`).join('');
};
