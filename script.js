document.addEventListener("DOMContentLoaded", () => {

const skills = [
    { icone: "fab fa-html5", nome: "HTML" },
    { icone: "fab fa-css3-alt", nome: "CSS" },
    { icone: "fab fa-js", nome: "JavaScript" },
    { icone: "fab fa-python", nome: "Python" },
    { icone: "fab fa-java", nome: "Java" },
    { icone: "fab fa-git-alt", nome: "Git" }
];

const listaSkills = document.querySelector(".skills");

skills.forEach(skill => {
    listaSkills.innerHTML += `
        <span>
            <i class="${skill.icone}"></i>
            ${skill.nome}
        </span>
    `;
});

document.querySelector("#btnProjetos").addEventListener("click", () => {
    document.querySelector("#portfolio").scrollIntoView({ behavior: "smooth" });
});

const topo = document.querySelector("#topo");

window.addEventListener("scroll", () => {
    topo.style.display = window.scrollY > 300 ? "block" : "none";
});

topo.addEventListener("click", () => {
    window.scrollTo({ top:0, behavior:"smooth" });
});

const fadeElements = document.querySelectorAll("#sobre, #competencias, #portfolio, #contacto");

fadeElements.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity .6s ease, transform .6s ease";
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, { threshold:0.1 });

fadeElements.forEach(el => observer.observe(el));

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

document.querySelectorAll(".zoom-img").forEach(img => {
    img.addEventListener("click", () => {
        lightboxImg.src = img.src;
        lightbox.classList.add("active");
    });
});

lightbox.addEventListener("click", (e) => {
    if(e.target !== lightboxImg){
        lightbox.classList.remove("active");
    }
});

document.querySelectorAll(".marquee").forEach(marquee => {

    const bar = marquee.parentElement.querySelector(".marquee-scrollbar");
    if(!bar) return;

    const thumb = bar.querySelector(".marquee-scrollbar-thumb");

    const update = () => {
        const maxScroll = marquee.scrollWidth - marquee.clientWidth;
        const thumbRange = bar.clientWidth - thumb.clientWidth;
        thumb.style.width = Math.max(40, (marquee.clientWidth / marquee.scrollWidth) * bar.clientWidth) + "px";
        thumb.style.transform = "translateX(" + (maxScroll > 0 ? (marquee.scrollLeft / maxScroll) * thumbRange : 0) + "px)";
    };

    window.addEventListener("resize", update);
    marquee.addEventListener("scroll", update);
    window.addEventListener("load", update);
    setTimeout(update, 500);

    let thumbDrag = false;
    thumb.addEventListener("pointerdown", e => {
        thumbDrag = true;
        e.preventDefault();
    });

    window.addEventListener("pointermove", e => {
        if(!thumbDrag) return;
        const barRect = bar.getBoundingClientRect();
        const ratio = (e.clientX - barRect.left - thumb.clientWidth / 2) / (barRect.width - thumb.clientWidth);
        marquee.scrollLeft = ratio * (marquee.scrollWidth - marquee.clientWidth);
    });

    bar.addEventListener("click", e => {
        if(e.target === thumb) return;
        const barRect = bar.getBoundingClientRect();
        const ratio = (e.clientX - barRect.left) / barRect.width;
        marquee.scrollLeft = ratio * (marquee.scrollWidth - marquee.clientWidth);
    });

    let trackDrag = null;
    marquee.addEventListener("pointerdown", e => {
        trackDrag = { startX: e.clientX, startLeft: marquee.scrollLeft };
    });

    marquee.addEventListener("pointermove", e => {
        if(!trackDrag) return;
        const delta = e.clientX - trackDrag.startX;
        const isClick = Math.abs(delta) < 5;
        marquee.scrollLeft = trackDrag.startLeft - delta;
        if(!isClick) e.preventDefault();
    });

    const endDrag = () => { thumbDrag = false; trackDrag = null; };
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

});

});
