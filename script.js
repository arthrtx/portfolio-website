document.addEventListener("DOMContentLoaded", () => {


// competências
// ======================================================
const linguagens = [
    { icone: "fab fa-html5", nome: "HTML" },
    { icone: "fab fa-css3-alt", nome: "CSS" },
    { icone: "fab fa-js", nome: "JavaScript" },
    { icone: "fab fa-python", nome: "Python" },
    { icone: "fab fa-java", nome: "Java" },
    { icone: "fas fa-mobile-screen-button", nome: "Kotlin" }
];

const ferramentas = [
    { icone: "fab fa-git-alt", nome: "Git" },
    { icone: "fab fa-github", nome: "GitHub" },
    { icone: "fas fa-code", nome: "VS Code" },
    { icone: "fas fa-database", nome: "SQLite" },
    { icone: "fas fa-bolt", nome: "Supabase" }
];

function mostrarCompetencias(lista, alvo) {
    const caixa = document.querySelector(alvo);
    lista.forEach(item => {
        caixa.innerHTML += `
            <span>
                <i class="${item.icone}"></i>
                ${item.nome}
            </span>
        `;
    });
}

mostrarCompetencias(linguagens, "#skillsLanguages");
mostrarCompetencias(ferramentas, "#skillsTools");


// menu lateral
// ======================================================
const itensMenu = document.querySelectorAll(".side-item");
const secoesMenu = [...itensMenu]
    .flatMap(item => item.dataset.target.split(" "))
    .map(id => document.getElementById(id))
    .filter(Boolean);

const observadorMenu = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
            itensMenu.forEach(item => {
                item.classList.toggle("active", item.dataset.target.split(" ").includes(entrada.target.id));
            });
        }
    });
}, { rootMargin: "-45% 0px -50% 0px" });

secoesMenu.forEach(secao => observadorMenu.observe(secao));

const botaoMenu = document.getElementById("menuBtn");
const menu = document.getElementById("sideNav");

const setMenu = (aberto) => {
    menu.classList.toggle("open", aberto);
    botaoMenu.classList.toggle("open", aberto);
    botaoMenu.setAttribute("aria-expanded", aberto);
    botaoMenu.setAttribute("aria-label", aberto ? "Close menu" : "Open menu");
};

botaoMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenu(!menu.classList.contains("open"));
});

menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("click", (e) => {
    if (menu.classList.contains("open") && !menu.contains(e.target)) setMenu(false);
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
});


// projetos (cartões + leitor)
// ======================================================
const secaoProjetos = document.getElementById("portfolio");
const listaCartoes = document.getElementById("pmFlow");

if (listaCartoes) {
    const cartoes = [...listaCartoes.querySelectorAll(".music-card")];
    const total = cartoes.length;
    let atual = Math.floor(total / 2);
    let mudo = false;
    let volume = 0.7;
    let visivel = false;
    let arrastou = false;

    // volta ao último projeto aberto
    try {
        const ultimo = sessionStorage.getItem("pmCur");
        const posicao = cartoes.findIndex(c => c.dataset.project === ultimo);
        if (posicao >= 0) atual = posicao;
    } catch (erro) {}

    const tituloAtual = document.getElementById("pmNowTitle");
    const subtituloAtual = document.getElementById("pmNowSub");
    const capaAtual = document.getElementById("pmNowArt");
    const progresso = document.getElementById("pmProgress");
    const botaoGit = document.getElementById("pmGit");
    const botaoMudo = document.getElementById("pmMute");
    const barraVolume = document.getElementById("pmVolume");
    const brilho = document.getElementById("pmAmbient");
    const fila = document.getElementById("pmQueue");
    const listaFila = document.getElementById("pmQueueList");
    const botaoFila = document.getElementById("pmQueueToggle");

    const ESCALA = [1, 0.82, 0.68];
    const OPACIDADE = [1, 0.78, 0.5];

    const GITHUB = {
        pinspace: "https://github.com/arthrtx/PinSpace_Create",
        fitcontrol: "https://github.com/arthrtx/FitControl",
        gamecollection: "https://github.com/arthrtx/GameCollection",
        huroh: "https://github.com/arthrtx/HUROH"
    };

    const video = (cartao) => cartao.querySelector("video");
    const musica = window.ArthrMusic;

    const textoMusica = (estado) => "♪ " + estado.track + " — arthr.tx";

    const preencherAtual = () => {
        const cartao = cartoes[atual];
        tituloAtual.textContent = cartao.querySelector("strong").textContent;
        subtituloAtual.textContent = musica?.state().playing
            ? textoMusica(musica.state())
            : cartao.querySelector("small").textContent;
    };

    const mostrar = () => {
        cartoes.forEach((cartao, i) => {
            const distancia = i - atual;
            const passo = Math.abs(distancia);
            const aparece = passo <= 2;

            cartao.style.transform = `translate(-50%, -50%) translateX(${distancia * 58}%) scale(${ESCALA[Math.min(passo, 2)]})`;
            cartao.style.zIndex = 10 - passo;
            cartao.style.opacity = aparece ? OPACIDADE[passo] : 0;
            cartao.style.pointerEvents = aparece ? "auto" : "none";
            cartao.classList.toggle("is-active", distancia === 0);
            cartao.setAttribute("aria-selected", distancia === 0);
            cartao.tabIndex = -1;

            // só o vídeo do cartão da frente roda
            const v = video(cartao);
            v.muted = true;
            if (distancia === 0 && visivel) {
                if (v.preload === "none") v.preload = "auto";
                v.play().catch(() => {});
            } else {
                v.pause();
            }
        });

        const cartao = cartoes[atual];
        preencherAtual();
        const capa = video(cartao).getAttribute("poster");
        capaAtual.src = capa;
        brilho.style.backgroundImage = `url("${capa}")`;
        botaoGit.href = GITHUB[cartao.dataset.project] || "https://github.com/arthrtx";
        progresso.style.transform = "scaleX(0)";
    };
    window.ppRefresh = preencherAtual;

    const andar = (passo) => {
        atual = ((atual + passo) % total + total) % total;
        mostrar();
    };

    const irPara = (i) => {
        atual = i;
        mostrar();
    };

    // barra de progresso segue o vídeo quando não há música
    cartoes.forEach((cartao, i) => {
        const v = video(cartao);
        v.addEventListener("timeupdate", () => {
            if (i !== atual || !v.duration || musica?.state().playing) return;
            progresso.style.transform = `scaleX(${v.currentTime / v.duration})`;
        });
    });

    // abrir projeto (project.html por cima do site)
    const caixaProjeto = document.getElementById("projFrame");

    const abrirProjeto = () => {
        const id = cartoes[atual].dataset.project;
        try { sessionStorage.setItem("pmCur", id); } catch (erro) {}
        caixaProjeto.innerHTML = '<iframe src="project.html?p=' + id + '&embed=1" title="Project"></iframe>';
        caixaProjeto.hidden = false;
        requestAnimationFrame(() => caixaProjeto.classList.add("open"));
        document.body.classList.add("pmodal-lock");
        video(cartoes[atual]).pause();
        setMenu(false);
    };

    const fecharProjeto = () => {
        if (caixaProjeto.hidden) return;
        caixaProjeto.classList.remove("open");
        document.body.classList.remove("pmodal-lock");
        setTimeout(() => {
            caixaProjeto.hidden = true;
            caixaProjeto.innerHTML = "";
        }, 450);
        mostrar();
    };

    window.addEventListener("message", (e) => {
        const dados = e.data || {};
        if (dados.type === "pv-close") fecharProjeto();
        if (dados.type === "pv-project") {
            const i = cartoes.findIndex(c => c.dataset.project === dados.id);
            if (i >= 0) irPara(i);
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !caixaProjeto.hidden) fecharProjeto();
    });

    cartoes.forEach((cartao, i) => cartao.addEventListener("click", () => {
        if (arrastou) return;
        if (i === atual) abrirProjeto();
        else irPara(i);
    }));

    document.getElementById("pmFlowPrev").addEventListener("click", () => andar(-1));
    document.getElementById("pmFlowNext").addEventListener("click", () => andar(1));

    const caixaAtual = document.getElementById("pmNow");
    caixaAtual.addEventListener("click", (e) => {
        if (!e.target.closest("a")) abrirProjeto();
    });
    caixaAtual.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirProjeto();
        }
    });

    // música: os botões do leitor controlam as faixas
    const botaoPlay = document.getElementById("pmPlay");
    const botaoAnterior = document.getElementById("pmPrev");
    const botaoSeguinte = document.getElementById("pmNext");

    botaoAnterior.addEventListener("click", () => musica?.prev());
    botaoSeguinte.addEventListener("click", () => musica?.next());
    botaoPlay.addEventListener("click", () => musica?.toggle());

    botaoPlay.innerHTML =
        '<svg class="i-play" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>' +
        '<svg class="i-pause" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
    botaoPlay.setAttribute("aria-label", "Play music");
    botaoAnterior.setAttribute("aria-label", "Previous track");
    botaoSeguinte.setAttribute("aria-label", "Next track");

    const mostrarFila = (estado) => {
        listaFila.innerHTML = (musica?.tracks || []).map((faixa, i) => `
            <li data-i="${i}" class="${i === estado.index ? "is-current" : ""}">
                <span class="music-q-num">${i === estado.index && estado.playing ? "♪" : i + 1}</span>
                <span class="music-q-text"><strong>${faixa.name}</strong><small>Afro / deep house · ${faixa.bpm} BPM</small></span>
            </li>`).join("");
    };

    musica?.onChange(estado => {
        mostrarFila(estado);
        secaoProjetos.classList.toggle("is-playing", estado.playing);
        botaoPlay.setAttribute("aria-label", estado.playing ? "Pause music" : "Play music");

        if (estado.playing) {
            subtituloAtual.textContent = textoMusica(estado);
            progresso.style.transform = `scaleX(${estado.progress})`;
        } else {
            subtituloAtual.textContent = cartoes[atual].querySelector("small").textContent;
        }
    });

    const setMudo = (valor) => {
        mudo = valor;
        botaoMudo.classList.toggle("is-muted", mudo);
        botaoMudo.setAttribute("aria-label", mudo ? "Unmute" : "Mute");
        musica?.setMuted(mudo);
    };

    botaoMudo.addEventListener("click", () => setMudo(!mudo));

    barraVolume.addEventListener("input", () => {
        volume = barraVolume.value / 100;
        musica?.setVolume(volume);
        setMudo(volume === 0);
    });

    // lista de faixas
    const fecharFila = () => {
        fila.hidden = true;
        botaoFila.classList.remove("active");
    };

    botaoFila.addEventListener("click", (e) => {
        e.stopPropagation();
        fila.hidden = !fila.hidden;
        botaoFila.classList.toggle("active", !fila.hidden);
        botaoFila.setAttribute("aria-expanded", !fila.hidden);
    });

    listaFila.addEventListener("click", (e) => {
        const linha = e.target.closest("li");
        if (!linha) return;
        musica?.playIndex(+linha.dataset.i);
        fecharFila();
    });

    document.addEventListener("click", (e) => {
        if (!fila.hidden && !fila.contains(e.target)) fecharFila();
    });

    // setas do teclado mudam de projeto
    document.addEventListener("keydown", (e) => {
        const caixa = secaoProjetos.getBoundingClientRect();
        const noEcra = caixa.top < innerHeight * 0.5 && caixa.bottom > innerHeight * 0.5;
        if (!noEcra || document.body.classList.contains("paper-lock")) return;
        if (e.key === "ArrowLeft") andar(-1);
        if (e.key === "ArrowRight") andar(1);
    });

    // arrastar para o lado
    let inicioX = null;

    listaCartoes.addEventListener("pointerdown", (e) => {
        inicioX = e.clientX;
        arrastou = false;
    });

    window.addEventListener("pointerup", (e) => {
        if (inicioX === null) return;
        const dx = e.clientX - inicioX;
        inicioX = null;
        if (Math.abs(dx) > 40) {
            arrastou = true;
            andar(dx < 0 ? 1 : -1);
            setTimeout(() => arrastou = false, 50);
        }
    });

    // pausa o vídeo quando a secção sai do ecrã
    new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            visivel = entrada.isIntersecting;
            secaoProjetos.classList.toggle("pm-off", !visivel);
            if (visivel) secaoProjetos.classList.add("mu-in");
            mostrar();
        });
    }, { threshold: 0.2 }).observe(secaoProjetos);

    mostrar();
}


// contacto
// ======================================================
const painelContacto = document.getElementById("contactPanel");
const abaContacto = document.getElementById("contactTab");

const setContacto = (aberto) => {
    if (!painelContacto) return;

    document.body.classList.toggle("contact-open", aberto);
    painelContacto.setAttribute("aria-hidden", !aberto);
    abaContacto?.setAttribute("aria-expanded", aberto);

    if (aberto) {
        setMenu(false);
        setTimeout(() => document.getElementById("nome")?.focus({ preventScroll: true }), 450);
    } else {
        abaContacto?.focus({ preventScroll: true });
    }
};

abaContacto?.addEventListener("click", (e) => {
    e.stopPropagation();
    setContacto(true);
});

document.getElementById("contactClose")?.addEventListener("click", () => setContacto(false));
document.getElementById("contactShade")?.addEventListener("click", () => setContacto(false));

document.querySelectorAll("[data-open-contact]").forEach(link => link.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContacto(true);
}));

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("contact-open")) setContacto(false);
});


// título do início (ocupa ~92% da largura)
// ======================================================
const tituloInicio = document.querySelector(".kh-title");

const ajustarTitulo = () => {
    if (!tituloInicio) return;
    tituloInicio.style.setProperty("--kh-fs", "100px");
    const largura = tituloInicio.scrollWidth;
    if (largura) tituloInicio.style.setProperty("--kh-fs", (100 * innerWidth * 0.92 / largura) + "px");
};

ajustarTitulo();
document.fonts?.ready.then(ajustarTitulo);
window.addEventListener("resize", ajustarTitulo);


// transição do início ao fazer scroll
// ======================================================
const inicio = document.getElementById("inicio");

if (inicio) {
    setTimeout(() => inicio.classList.add("kh-ready"), 2400);

    let pedido = false;
    let ultimoValor = "";
    const elementos = inicio.querySelectorAll(".kh-screens, .kh-veil, .kh-title, .kh-badge, .kh-sub, .kh-cta, .kh-meta, .kh-poster");

    const atualizarInicio = () => {
        pedido = false;
        const p = Math.min(1, Math.max(0, scrollY / (inicio.offsetHeight * 0.9)));
        const valor = p.toFixed(3);
        if (valor === ultimoValor) return;
        ultimoValor = valor;
        elementos.forEach(el => el.style.setProperty("--hp", valor));
    };

    new IntersectionObserver((entradas) => {
        inicio.classList.toggle("kh-off", !entradas[0].isIntersecting);
    }).observe(inicio);

    window.addEventListener("scroll", () => {
        if (!pedido) {
            pedido = true;
            requestAnimationFrame(atualizarInicio);
        }
    }, { passive: true });

    atualizarInicio();
}


// final do site
// ======================================================
const final = document.getElementById("outro");

if (final) {
    const nome = final.querySelector(".outro-name");

    const ajustarNome = () => {
        nome.style.fontSize = "100px";
        const largura = nome.scrollWidth;
        if (largura) nome.style.fontSize = (100 * final.clientWidth * (innerWidth < 720 ? 0.86 : 0.62) / largura) + "px";
    };

    ajustarNome();
    document.fonts?.ready.then(ajustarNome);
    window.addEventListener("resize", ajustarNome);

    new IntersectionObserver((entradas) => {
        final.classList.toggle("in", entradas[0].isIntersecting);
    }, { threshold: 0.15 }).observe(final);

    // a folha do final sobe por cima dos projetos
    let pedidoFinal = false;

    const atualizarFinal = () => {
        pedidoFinal = false;
        const caixa = final.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight - caixa.top) / Math.min(innerHeight * 0.7, caixa.height)));
        final.style.setProperty("--fp", p.toFixed(3));
    };

    window.addEventListener("scroll", () => {
        if (!pedidoFinal) {
            pedidoFinal = true;
            requestAnimationFrame(atualizarFinal);
        }
    }, { passive: true });

    window.addEventListener("resize", atualizarFinal);
    atualizarFinal();

    document.getElementById("outroUp")?.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
}


// mini leitor
// ======================================================
const musicaSite = window.ArthrMusic;
const miniLeitor = document.getElementById("miniPlayer");

if (musicaSite && miniLeitor) {
    const barraLeitor = document.getElementById("pmBar");
    let barraVisivel = false;

    const sincronizar = (estado) => {
        document.getElementById("mpTrack").textContent = estado.track;
        miniLeitor.classList.toggle("is-playing", estado.playing);
        const tapado = !document.getElementById("projFrame")?.hidden || document.body.classList.contains("paper-lock");
        miniLeitor.classList.toggle("show", estado.started && (!barraVisivel || tapado));
    };

    if (barraLeitor) {
        new IntersectionObserver((entradas) => {
            barraVisivel = entradas[0].isIntersecting;
            sincronizar(musicaSite.state());
        }, { threshold: 0.4 }).observe(barraLeitor);
    }

    musicaSite.onChange(sincronizar);
    new MutationObserver(() => sincronizar(musicaSite.state())).observe(document.body, { attributes: true, attributeFilter: ["class"] });

    document.getElementById("mpPlay").addEventListener("click", () => musicaSite.toggle());
    document.getElementById("mpNext").addEventListener("click", () => musicaSite.next());
}


// pausar animações com uma janela aberta
// ======================================================
const verificarJanelas = () => {
    const classes = document.body.classList;
    const aberta =
        classes.contains("paper-lock") ||
        classes.contains("pmodal-lock") ||
        classes.contains("contact-open") ||
        !!document.querySelector(".lightbox.active");
    classes.toggle("overlay-open", aberta);
};

new MutationObserver(verificarJanelas).observe(document.body, { attributes: true, attributeFilter: ["class"] });


// idioma
// ======================================================
const PT = {
    "nav.home": "Início",
    "outro.the": "o",
    "pv.site": "Site",
    "pv.web": "App Web",
    "pv.desk": "App Desktop",
    "pv.android": "App Android",
    "pv.demo": "Demonstração",
    "ab2.p1": "Do Arthur",
    "ab2.p2": "Código",
    "ab2.p3": "Media",
    "ab2.others": "Outros",
    "kp.t1": "CRIA",
    "kp.t2": "SÊ AUTÊNTICO",
    "kp.code": "CÓDIGO",
    "kp.music": "MÚSICA",
    "kh.pull": "Puxa para saberes mais sobre mim",
    "kh.badge": "Arthur Sal · Desenvolvedor de Software",
    "kh.sub": "Sites, apps e sistemas — feitos com código e criatividade.",
    "kh.cta": "Ver projetos",
    "contact.tab": "Contacto",
    "contact.kicker": "Vamos falar",
    "contact.sub": "Tens um projeto ou uma oportunidade? Envia-me uma mensagem e eu respondo-te.",
    "nav.about": "Sobre",
    "nav.projects": "Projetos",
    "about.title": "Sobre Mim",
    "about.text": "Sou estudante de Desenvolvimento de Software, focado em programação e análise de sistemas. Gosto de juntar tecnologia e criatividade para criar projetos práticos e interessantes. Neste momento procuro oportunidades onde possa aprender, desenvolver as minhas competências e ganhar experiência na área da tecnologia.",
    "resume.title": "Currículo",
    "resume.cv": "Descarrega o meu CV para teres uma visão rápida do meu percurso, competências e experiência.",
    "resume.cvBtn": "Descarregar CV",
    "resume.gh": "Visita o meu GitHub para explorares mais projetos e tudo aquilo em que tenho trabalhado.",
    "skills.lang": "Linguagens",
    "skills.tools": "Ferramentas e Outros",
    "projects.title": "Projetos Recentes",
    "pm.kicker": "Projetos",
    "pm.sub": "Algumas coisas que construí. Escolhe um projeto e carrega em ▶ para veres os detalhes.",
    "pm.credit2": "Carrega em ▶ para ouvires música enquanto navegas",
    "card.pin": "Mood boards e colagens",
    "pv.play": "Reproduzir",
    "ab2.about": "Sobre",
    "ab2.archive": "Arquivo",
    "ab2.l1": "Sobre",
    "ab2.l2": "Competências",
    "ab2.l3": "Currículo",
    "ab2.skills": "Competências",
    "ab2.skillsSub": "Ferramentas que uso todos os dias — e continuo a aprender.",
    "ab2.f1": "Estudar",
    "ab2.f2": "Construir",
    "ab2.f3": "Repetir",
    "kp.1": "Cria coisas que<br>soam a ti",
    "kp.2": "Cada ideia começa<br>como uma batida",
    "kp.3": "Só original",
    "km.s1": "Desenvolvedor de software<br>web · apps · sistemas",
    "km.b1": "Disponível",
    "km.b2": "Para trabalhar",
    "outro.noun": "nome · desenvolvedor de software",
    "outro.h": "Design +<br>Desenvolvimento",
    "outro.p": "Estudante de Desenvolvimento de Software que cria sites, apps e sistemas. Cada projeto é uma oportunidade de fazer melhor do que o anterior.",
    "outro.social": "Redes:",
    "outro.up": "Voltar ao topo",
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
    "card.huroh": "Finanças, agenda e tarefas",
    "pin.p1": "Cria mood boards, vision boards e colagens — ao estilo Canva + Pinterest.",
    "pin.p2": "Um editor criativo de quadros para juntar ideias, guardar visões e partilhar com o mundo. Escolhe um modelo, arrasta formas e texto e publica o teu quadro.",
    "pin.problem": "<strong>Problema:</strong> Criar quadros visuais e colagens de ideias normalmente exige ferramentas complexas.",
    "pin.solution": "<strong>Solução:</strong> Um editor intuitivo ao estilo Canva/Pinterest para criar, guardar e partilhar mood boards e colagens diretamente no navegador.",
    "fit.p1": "O FitControl V4 é uma aplicação de gestão de ginásios desenvolvida em Python com CustomTkinter.",
    "fit.p2": "O sistema permite gerir sócios, funcionários, planos, pagamentos e presenças numa interface moderna e intuitiva — com reconhecimento facial integrado.",
    "fit.problem": "<strong>Problema:</strong> Os ginásios pequenos têm dificuldade em controlar manualmente sócios, pagamentos e acessos.",
    "fit.solution": "<strong>Solução:</strong> Um sistema de gestão completo que automatiza sócios, planos, finanças e o controlo de presenças por reconhecimento facial.",
    "contact.title": "Contacta-me",
    "contact.name": "Nome",
    "contact.msg": "Mensagem",
    "contact.send": "Enviar",
    "w.about.sub": "Estudante de Desenvolvimento de Software"
};

const EN = {};
document.querySelectorAll("[data-i18n]").forEach(el => EN[el.dataset.i18n] = el.textContent.trim());
document.querySelectorAll("[data-i18n-html]").forEach(el => EN[el.dataset.i18nHtml] = el.innerHTML.trim());
document.querySelectorAll("[data-i18n-ph]").forEach(el => EN[el.dataset.i18nPh] = el.placeholder);

const botaoIdioma = document.getElementById("langBtn");
const botaoIdiomaAbout = document.getElementById("langBtn2");

const setIdioma = (idioma) => {
    const textos = idioma === "pt" ? PT : EN;
    document.documentElement.lang = idioma;

    document.querySelectorAll("[data-i18n]").forEach(el => {
        if (textos[el.dataset.i18n]) el.textContent = textos[el.dataset.i18n];
    });
    document.querySelectorAll("[data-i18n-html]").forEach(el => {
        if (textos[el.dataset.i18nHtml]) el.innerHTML = textos[el.dataset.i18nHtml];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
        if (textos[el.dataset.i18nPh]) el.placeholder = textos[el.dataset.i18nPh];
    });

    [botaoIdioma, botaoIdiomaAbout].forEach(botao => {
        if (!botao) return;
        botao.dataset.lang = idioma;
        botao.setAttribute("aria-label", idioma === "pt" ? "Switch to English" : "Mudar para português");
    });

    window.ppRefresh?.();
    try { localStorage.setItem("lang", idioma); } catch (erro) {}
};

let idiomaInicial = "en";
try { idiomaInicial = localStorage.getItem("lang") || "en"; } catch (erro) {}
setIdioma(idiomaInicial);

const trocarIdioma = () => setIdioma(botaoIdioma.dataset.lang === "pt" ? "en" : "pt");
botaoIdioma?.addEventListener("click", trocarIdioma);
botaoIdiomaAbout?.addEventListener("click", trocarIdioma);


// about (folha que se puxa de cima)
// ======================================================
const folha = document.getElementById("aboutPaper");
const papel = document.getElementById("paperSheet");
const abaAbrir = document.getElementById("aboutPull");
const abaFechar = document.getElementById("paperPull");
let esperaFolha = null;

// p: 0 = fechada, 1 = aberta
const posicaoFolha = (p, animar) => {
    papel.classList.toggle("is-anim", !!animar);
    const valor = Math.max(0, Math.min(1, p)).toFixed(4);
    papel.style.setProperty("--pp", valor);
    folha.style.setProperty("--pp", valor);
};

const abrirFolha = () => {
    if (!folha) return;
    setMenu(false);
    folha.classList.add("open");
    folha.setAttribute("aria-hidden", "false");
    abaAbrir?.setAttribute("aria-expanded", "true");
    document.body.classList.add("paper-lock");
    requestAnimationFrame(() => posicaoFolha(1, true));
    clearTimeout(esperaFolha);
    esperaFolha = setTimeout(() => folha.classList.add("settled"), 900);
    setTimeout(() => document.getElementById("paperClose")?.focus({ preventScroll: true }), 700);
};

const fecharFolha = () => {
    if (!folha || !folha.classList.contains("open")) return;
    clearTimeout(esperaFolha);
    folha.classList.remove("settled");
    posicaoFolha(0, true);
    abaAbrir?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("paper-lock");

    setTimeout(() => {
        if (papel.style.getPropertyValue("--pp") === "0.0000") {
            folha.classList.remove("open");
            folha.setAttribute("aria-hidden", "true");
            papel.querySelector(".paper-scroll").scrollTop = 0;
        }
    }, 900);
};

// arrastar a aba de cima (abre) ou a de baixo (fecha)
const arrastarFolha = (aba, abrir) => {
    if (!aba) return;
    let inicioY = null;
    let mexeu = false;

    aba.addEventListener("pointerdown", (e) => {
        inicioY = e.clientY;
        mexeu = false;
        aba.setPointerCapture(e.pointerId);
        clearTimeout(esperaFolha);
        folha.classList.remove("settled");

        if (abrir) {
            folha.classList.add("open");
            folha.setAttribute("aria-hidden", "false");
            setMenu(false);
        }
    });

    aba.addEventListener("pointermove", (e) => {
        if (inicioY === null) return;
        const dy = e.clientY - inicioY;
        if (Math.abs(dy) > 4) mexeu = true;
        if (!mexeu) return;
        posicaoFolha(abrir ? dy / innerHeight : 1 + dy / innerHeight, false);
    });

    const largar = (e) => {
        if (inicioY === null) return;
        const dy = e.clientY - inicioY;
        inicioY = null;

        if (!mexeu) {
            abrir ? abrirFolha() : fecharFolha();
            return;
        }

        if (abrir) (dy > 110 ? abrirFolha : fecharFolha)();
        else (dy < -110 ? fecharFolha : abrirFolha)();
    };

    aba.addEventListener("pointerup", largar);
    aba.addEventListener("pointercancel", largar);
};

arrastarFolha(abaAbrir, true);
arrastarFolha(abaFechar, false);

document.getElementById("paperClose")?.addEventListener("click", fecharFolha);

document.getElementById("ab2Up")?.addEventListener("click", () => {
    document.querySelector(".paper-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelectorAll('.ab2-links a[href^="#"]').forEach(link => link.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(link.getAttribute("href"))?.scrollIntoView({ behavior: "smooth", block: "start" });
}));

document.querySelectorAll("[data-open-panel]").forEach(link => link.addEventListener("click", (e) => {
    e.preventDefault();
    abrirFolha();
}));

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharFolha();
});

});
