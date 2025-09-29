import "./styles/main.scss";
import "swiper/css";
import Swiper from "swiper";

type Item = { y: string; t: string; empty?: boolean };
type Slide = { title: string; start: number; end: number; badge: number; items: Item[] };

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const yearL = document.getElementById("yearL") as HTMLElement;
const yearR = document.getElementById("yearR") as HTMLElement;
const label = document.getElementById("label") as HTMLElement;
const badgeNum = document.getElementById("badgeNum") as HTMLElement;
const pager = document.getElementById("pager") as HTMLElement;
const cards = document.getElementById("cards") as HTMLElement;
const btnPrev = document.getElementById("prev") as HTMLButtonElement;
const btnNext = document.getElementById("next") as HTMLButtonElement;
const btnJump = document.getElementById("jump") as HTMLButtonElement;
const hotspots = document.getElementById("hotspots") as HTMLElement;

const slides: Slide[] = [
  { title: "Наука", start: 2015, end: 2022, badge: 1, items: [
    { y: "2015", t: "13 сентября — частное солнечное затмение, видимое в Южной Африке и части Антарктиды" },
    { y: "2016", t: "Телескоп «Хаббл» обнаружил самую удалённую из всех обнаруженных галактик, получившую обозначение GN-z11" },
    { y: "2017", t: "Компания Tesla официально представила первый в мире электрический грузовик Tesla Semi" }
  ]},
  { title: "Технологии", start: 2008, end: 2014, badge: 2, items: [
    { y: "2008", t: "Запуск Android Market и первая коммерческая Android-модель" },
    { y: "2012", t: "Curiosity сел на Марс, начав длительную миссию в кратере Гейла" },
    { y: "2014", t: "Посадка Philae на комету 67P/Чурюмова—Герасименко" }
  ]},
  { title: "Космос", start: 1998, end: 2005, badge: 3, items: [
    { y: "1998", t: "Начало сборки МКС на орбите" },
    { y: "2001", t: "Первый космический турист на орбите" },
    { y: "2005", t: "Deep Impact исследует комету Темпеля 1" }
  ]},
  { title: "Кино", start: 1977, end: 1984, badge: 4, items: [
    { y: "1977", t: "Премьера Star Wars: A New Hope" },
    { y: "1980", t: "The Empire Strikes Back выходит в прокат" },
    { y: "1984", t: "Премьера «Охотники за привидениями»" }
  ]},
  { title: "Спорт", start: 1988, end: 1994, badge: 5, items: [
    { y: "1988", t: "Сеул — летние Олимпийские игры" },
    { y: "1990", t: "Чемпионат мира по футболу в Италии" },
    { y: "1994", t: "Лиллехаммер — зимние Олимпийские игры" }
  ]},
  { title: "Литература", start: 2000, end: 2006, badge: 6, items: [
    { y: "2000", t: "Нобелевская премия по литературе — Гао Синцзян" },
    { y: "2003", t: "The Da Vinci Code становится мировым бестселлером" },
    { y: "2006", t: "Юбилейные издания Оруэлла возвращаются в топы" }
  ]}
];

let idx = 0;
let ringAngle = 0;
let animating = false;

function easeOutCubic(x: number){ return 1 - Math.pow(1 - x, 3); }
function tween({ from = 0, to = 1, duration = 600, update, done }:
  { from?: number; to?: number; duration?: number; update: (v:number)=>void; done?:()=>void }) {
  if (prefersReduced){ update(to); done && done(); return () => {}; }
  let start: number | null = null, raf = 0;
  const step = (ts: number) => {
    if (!start) start = ts;
    const p = Math.min(1, (ts - start) / duration);
    const v = from + (to - from) * easeOutCubic(p);
    update(v);
    if (p < 1) raf = requestAnimationFrame(step); else done && done();
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

function setActiveDot(step: number){
  document.querySelectorAll<HTMLButtonElement>(".hotdot").forEach((el,i)=>{
    el.classList.toggle("is-active", i===step);
  });
}

function buildHotspots(){
  hotspots.innerHTML = "";
  const count = Math.max(2, Math.min(6, slides.length));
  for (let i=0;i<count;i++){
    const b = document.createElement("button");
    b.className = "hotdot";
    b.style.setProperty("--deg", (i*60)+"deg");
    b.dataset.step = String(i);
    const name = (slides[i] && slides[i].title) ? slides[i].title : `Шаг ${i+1}`;
    b.setAttribute("aria-label", name);
    b.addEventListener("click", ()=>goTo(i));
    hotspots.appendChild(b);
  }
  setActiveDot(0);
}

function rotateToStep(currentIndex: number, targetIndex: number){
  const stepsCW = (targetIndex - currentIndex + slides.length) % slides.length;
  ringAngle += stepsCW * 60;
  document.documentElement.style.setProperty("--angle", ringAngle + "deg");
}

function ensureThree(items: Item[]): Item[] {
  const base = (items || []).slice(0, 3);
  while (base.length < 3) base.push({ y:"\u00A0", t:"", empty:true });
  return base;
}

let swiper: Swiper | null = null;

function positionCircleBetweenYears(){
  const stage  = document.querySelector(".stage") as HTMLElement | null;
  const yearL  = document.getElementById("yearL") as HTMLElement | null;
  const yearR  = document.getElementById("yearR") as HTMLElement | null;
  if (!stage || !yearL || !yearR) return;

  const s = stage.getBoundingClientRect();
  const r1 = yearL.getBoundingClientRect();
  const r2 = yearR.getBoundingClientRect();

  // Горизонтальный центр — середина зазора между годами
  const gapMidX = (r1.right + r2.left) / 2;
  // Вертикальный центр — середина объединённой рамки по Y
  const y1 = Math.min(r1.top, r2.top);
  const y2 = Math.max(r1.bottom, r2.bottom);
  const cx = gapMidX - s.left;
  const cy = (y1 + y2) / 2 - s.top;

  const root = document.documentElement;
  root.style.setProperty("--circle-cx", `${cx}px`);
  root.style.setProperty("--circle-cy", `${cy}px`);
}

function positionCircleAtGapCenter(){
  const stage = document.querySelector(".stage") as HTMLElement | null;
  const years = document.querySelector(".years") as HTMLElement | null;
  const yearL = document.getElementById("yearL") as HTMLElement | null;
  const yearR = document.getElementById("yearR") as HTMLElement | null;
  if (!stage || !years || !yearL || !yearR) return;

  const s  = stage.getBoundingClientRect();
  const rL = yearL.getBoundingClientRect();
  const rR = yearR.getBoundingClientRect();
  const rY = years.getBoundingClientRect();

  const cx = (rL.right + rR.left) / 2 - s.left - 320; // shift left by 320px
  const cy = (rY.top + rY.bottom) / 2 - s.top;

  const root = document.documentElement;
  root.style.setProperty("--circle-cx", `${cx}px`);
  root.style.setProperty("--circle-cy", `${cy}px`);
}

function renderCards(data: Slide){
  const three = ensureThree(data.items);
  cards.innerHTML = `<div class="swiper"><div class="swiper-wrapper"></div></div>`;
  const wrapper = cards.querySelector(".swiper-wrapper") as HTMLElement;
  wrapper.innerHTML = three.map(it =>
    `<div class="swiper-slide">
       <div class="card${it.empty ? " empty" : ""}">
         <div class="year">${it.y || "\u00A0"}</div>
         <div class="text">${it.t || ""}</div>
       </div>
     </div>`
  ).join("");

  if (swiper) swiper.destroy(true, true);
  swiper = new Swiper(cards.querySelector(".swiper") as HTMLElement, {
    slidesPerView: 3,
    spaceBetween: 80,
    allowTouchMove: false
  });
}

function addDragNavigation(el: HTMLElement){
  let startX = 0;
  let dragging = false;
  let fired = false;
  const THRESHOLD = 60;
  const LOCK_MS = 500;

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    startX = e.clientX;
    dragging = true;
    fired = false;
    el.classList.add("dragging");
    el.setPointerCapture(e.pointerId);
  };

  const onMove = (e: PointerEvent) => {
    if (!dragging || fired) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) >= THRESHOLD){
      fired = true;
      if (dx < 0) next(); else prev();
      setTimeout(()=>{ fired = false; }, LOCK_MS);
    }
  };

  const onUp = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove("dragging");
    try{ el.releasePointerCapture(e.pointerId); }catch{}
  };

  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
}

function animateYears(prev: Slide, next: Slide){
  const dur = 700;
  const k1 = tween({ from: prev.start, to: next.start, duration: dur, update: v => { yearL.textContent = String(Math.round(v)); } });
  const k2 = tween({ from: prev.end, to: next.end, duration: dur, update: v => { yearR.textContent = String(Math.round(v)); } });
  return () => { k1(); k2(); };
}

function goTo(newIndex: number){
  if (animating) return;
  const target = (newIndex + slides.length) % slides.length;
  if (target === idx) return;
  animating = true;

  const prev = slides[idx];
  const next = slides[target];

  rotateToStep(idx, target);
  setActiveDot(target);

  const cancelYears = animateYears(prev, next);

  label.style.opacity = "0";
  label.style.transform = "translateY(8px)";
  badgeNum.textContent = String(next.badge);
  label.textContent = next.title;
  pager.textContent = `${String(target+1).padStart(2,"0")}/${String(slides.length).padStart(2,"0")}`;

  cards.style.opacity = "0";
  cards.style.transform = "translateY(12px)";
  setTimeout(()=>{ renderCards(next); cards.style.opacity = "1"; cards.style.transform = "translateY(0)"; }, 120);

  setTimeout(()=>{ label.style.opacity = "1"; label.style.transform = "translateY(0)"; }, 180);

  setTimeout(()=>{
    cancelYears();
    idx = target;
    animating = false;
    positionCircleAtGapCenter();
  }, 700);
}

function next(){ goTo(idx+1); }
function prev(){ goTo(idx-1); }

function init(){
  document.getElementById("next")?.addEventListener("click", next);
  document.getElementById("prev")?.addEventListener("click", prev);
  document.getElementById("jump")?.addEventListener("click", next);

  document.addEventListener("keydown", e=>{
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  });

  let wheelLock = false;
  document.addEventListener("wheel", e=>{
    if (wheelLock) return;
    wheelLock = true;
    if (e.deltaY > 0) next(); else prev();
    setTimeout(()=> wheelLock = false, 500);
  }, { passive:true });

  positionCircleAtGapCenter();
  window.addEventListener("resize", positionCircleAtGapCenter);
  if ((document as any).fonts?.ready) (document as any).fonts.ready.then(positionCircleAtGapCenter);

  renderCards(slides[0]);
  addDragNavigation(cards);
  buildHotspots();
  pager.textContent = `01/${String(slides.length).padStart(2,"0")}`;
}

init();


