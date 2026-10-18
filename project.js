document.addEventListener("DOMContentLoaded", () => {

const ORDER = ["pinspace", "fitcontrol", "gamecollection"];
const params = new URLSearchParams(location.search);
let id = ORDER.includes(params.get("p")) ? params.get("p") : ORDER[0];
const modal = document.getElementById("projModal");

// mostrar projeto
// ======================================================
const show = (pid, push) => {
    id = pid;
    modal.querySelectorAll(".pv").forEach(a => {
        const on = a.dataset.project === pid;
        a.classList.toggle("active", on);
        const v = a.querySelector(".pv-bg");
        if(on){
            if(v.preload === "none") v.preload = "auto";
            v.currentTime = 0;
            v.play().catch(() => {});
            a.querySelector(".pv-track").scrollLeft = 0;
        } else { v.pause(); }
    });
    try{ sessionStorage.setItem("pmCur", pid); }catch(e){}
    if(push) history.replaceState(null, "", "project.html?p=" + pid + (embedded ? "&embed=1" : ""));
    if(embedded) window.parent.postMessage({ type:"pv-project", id:pid }, "*");
    document.title = modal.querySelector(`.pv[data-project="${pid}"] .pv-title`).textContent + " | Arthur Sal";
};
const step = (d) => show(ORDER[(ORDER.indexOf(id) + d + ORDER.length) % ORDER.length], true);

// botões
// ======================================================
modal.querySelectorAll("[data-pv-play]").forEach(btn => btn.addEventListener("click", () => {
    const v = btn.closest(".pv").querySelector(".pv-bg");
    v.currentTime = 0;
    v.play().catch(() => {});
}));
modal.querySelectorAll("[data-pv-scroll]").forEach(btn => btn.addEventListener("click", () => {
    const track = btn.closest(".pv").querySelector(".pv-track");
    track.scrollBy({ left: track.querySelector(".pv-panel").offsetWidth * +btn.dataset.pvScroll, behavior:"smooth" });
}));
modal.querySelectorAll(".pv-track").forEach(track => {
    track.addEventListener("wheel", (e) => {
        if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){ track.scrollLeft += e.deltaY; e.preventDefault(); }
    }, { passive:false });
    const nav = track.closest(".pv").querySelectorAll("[data-pv-scroll]");
    const upd = () => {
        const max = track.scrollWidth - track.clientWidth - 2;
        nav[0].classList.toggle("off", track.scrollLeft <= 2);
        nav[1].classList.toggle("off", track.scrollLeft >= max);
    };
    track.addEventListener("scroll", upd, { passive:true });
    window.addEventListener("resize", upd);
    new MutationObserver(upd).observe(track.closest(".pv"), { attributes:true, attributeFilter:["class"] });
    upd();
});
modal.querySelectorAll("[data-pv-prev]").forEach(b => b.addEventListener("click", () => step(-1)));
modal.querySelectorAll("[data-pv-next]").forEach(b => b.addEventListener("click", () => step(1)));

// imagens em grande
// ======================================================
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lbCount = document.getElementById("lbCount");
let lbList = [], lbIdx = 0;

// mostra a imagem i (volta ao início no fim)
const lbShow = (i) => {
    if(!lbList.length) return;
    lbIdx = (i + lbList.length) % lbList.length;
    lightboxImg.classList.remove("lb-in");
    void lightboxImg.offsetWidth;
    lightboxImg.src = lbList[lbIdx].src;
    lightboxImg.alt = lbList[lbIdx].alt;
    lightboxImg.classList.add("lb-in");
    lbCount.textContent = (lbIdx + 1) + " / " + lbList.length;
    lightbox.classList.toggle("lb-single", lbList.length < 2);
};

document.querySelectorAll(".zoom-img").forEach(img => {
    img.addEventListener("click", () => {
        const track = img.closest(".marquee-track, [data-gallery]");
        lbList = track ? [...track.querySelectorAll(".zoom-img")] : [img];
        lightbox.classList.add("active");
        lbShow(lbList.indexOf(img));
    });
});

document.getElementById("lbPrev").addEventListener("click", (e) => { e.stopPropagation(); lbShow(lbIdx - 1); });
document.getElementById("lbNext").addEventListener("click", (e) => { e.stopPropagation(); lbShow(lbIdx + 1); });

lightbox.addEventListener("click", (e) => {
    if(e.target === lightbox || e.target.classList.contains("lightbox-close")){
        lightbox.classList.remove("active");
    }
});

document.addEventListener("keydown", (e) => {
    if(!lightbox.classList.contains("active")) return;
    if(e.key === "ArrowLeft"){ e.stopImmediatePropagation(); lbShow(lbIdx - 1); }
    if(e.key === "ArrowRight"){ e.stopImmediatePropagation(); lbShow(lbIdx + 1); }
    if(e.key === "Escape"){ e.stopImmediatePropagation(); lightbox.classList.remove("active"); }
}, true);

// deslizar no telemóvel
let lbX = null;
lightbox.addEventListener("touchstart", (e) => { lbX = e.touches[0].clientX; }, { passive:true });
lightbox.addEventListener("touchend", (e) => {
    if(lbX === null) return;
    const dx = e.changedTouches[0].clientX - lbX;
    lbX = null;
    if(Math.abs(dx) > 40) lbShow(lbIdx + (dx < 0 ? 1 : -1));
});


// fechar
// ======================================================
const embedded = params.get("embed") === "1" && window.parent !== window;
const closeView = () => {
    if(embedded) window.parent.postMessage({ type:"pv-close" }, "*");
    else location.href = "index.html#portfolio";
};
document.getElementById("pmodalClose").addEventListener("click", (e) => { e.preventDefault(); closeView(); });
document.addEventListener("keydown", (e) => {
    if(lightbox.classList.contains("active")) return;
    if(e.key === "Escape") closeView();
});

// idioma
// ======================================================
const PT = {
    "pv.site": "Site",
    "pv.web": "App Web",
    "pv.desk": "App Desktop",
    "pv.android": "App Android",
    "pv.demo": "Demonstração",
    "projects.title": "Projetos Recentes",
    "card.pin": "Mood boards e colagens",
    "pv.play": "Reproduzir",
    "pv.close": "Fechar",
    "pv.overview": "Visão geral:",
    "pv.challenge": "O desafio:",
    "pv.built": "Feito com:",
    "pv.next": "Próximo projeto",
    "pv.prev": "Anterior",
    "pv.nextShort": "Próximo",
    "card.gc": "App Android de coleção de jogos",
    "gc.p1": "O Game Collection é uma app Android para guardar e organizar a tua coleção de videojogos, criada como projeto de estudo em Kotlin e Jetpack Compose (Material 3).",
    "gc.p2": "Adiciona jogos com capa, plataforma, género e ano, marca-os como Por Jogar, A Jogar ou Concluído, pesquisa pelo nome, guarda favoritos e muda entre modo claro e escuro — tudo fica guardado no telemóvel.",
    "gc.problem": "<strong>Problema:</strong> Acompanhar uma coleção de jogos de várias consolas acaba normalmente em notas e listas espalhadas.",
    "gc.solution": "<strong>Solução:</strong> Uma app Android simples e offline que junta todos os jogos num só sítio, com capas, estado, pesquisa e favoritos.",
    "card.fit": "Gestão de ginásios",
    "pin.p1": "Cria mood boards, vision boards e colagens — ao estilo Canva + Pinterest.",
    "pin.p2": "Um editor criativo de quadros para juntar ideias, guardar visões e partilhar com o mundo. Escolhe um modelo, arrasta formas e texto e publica o teu quadro.",
    "pin.problem": "<strong>Problema:</strong> Criar quadros visuais e colagens de ideias normalmente exige ferramentas complexas.",
    "pin.solution": "<strong>Solução:</strong> Um editor intuitivo ao estilo Canva/Pinterest para criar, guardar e partilhar mood boards e colagens diretamente no navegador.",
    "fit.p1": "O FitControl V4 é uma aplicação de gestão de ginásios desenvolvida em Python com CustomTkinter.",
    "fit.p2": "O sistema permite gerir sócios, funcionários, planos, pagamentos e presenças numa interface moderna e intuitiva — com reconhecimento facial integrado.",
    "fit.problem": "<strong>Problema:</strong> Os ginásios pequenos têm dificuldade em controlar manualmente sócios, pagamentos e acessos.",
    "fit.solution": "<strong>Solução:</strong> Um sistema de gestão completo que automatiza sócios, planos, finanças e o controlo de presenças por reconhecimento facial."
};
let lang = "en";
try{ lang = localStorage.getItem("lang") || "en"; }catch(e){}
document.documentElement.lang = lang;
if(lang === "pt"){
    document.querySelectorAll("[data-i18n]").forEach(el => { if(PT[el.dataset.i18n]) el.textContent = PT[el.dataset.i18n]; });
    document.querySelectorAll("[data-i18n-html]").forEach(el => { if(PT[el.dataset.i18nHtml]) el.innerHTML = PT[el.dataset.i18nHtml]; });
}

show(id, false);
});
