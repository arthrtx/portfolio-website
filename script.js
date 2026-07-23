// Projetos

const projetos = [

    {
        titulo: "FitControl",
        descricao: "Sistema de gestão para ginásios.",
        link: "https://github.com/arthrtx/FitControl"
    },

    {
        titulo: "Sistema de Segurança",
        descricao: "Aplicação em Python com Tkinter.",
        link: "https://github.com/arthrtx/Sistema-de-Seguran-a"
    },

    {
        titulo: "Website Responsivo",
        descricao: "Projeto em HTML, CSS e JavaScript.",
        link: "#"
    }

];

const listaProjetos = document.querySelector("#listaProjetos");

projetos.forEach(projeto => {

    listaProjetos.innerHTML += `
        <a href="${projeto.link}" target="_blank" class="card">
            <h3>${projeto.titulo}</h3>
            <p>${projeto.descricao}</p>
        </a>
    `;

});



document.querySelector("#btnProjetos").addEventListener("click", () => {

    document.querySelector("#portfolio").scrollIntoView({
        behavior: "smooth"
    });

});



const topo = document.querySelector("#topo");

window.addEventListener("scroll", () => {

    topo.style.display = window.scrollY > 300 ? "block" : "none";

});

topo.addEventListener("click", () => {

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

});



topo.addEventListener("click", () => {

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

});