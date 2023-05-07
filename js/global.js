/* Burger */
function menuMobile(){
    //on récupère les éléments
    const header = document.querySelector('header');
    const btn = document.querySelector('.burger');
    const links = document.querySelectorAll('.navbar a');

    //lors d'un click sur le burger, on affiche ou cache le menu
    btn.addEventListener('click', () =>{
        header.classList.toggle('show-nav');
    });

    //lors d'un click sur un lien (exemple : accueil ou contact) on cache le menu
    links.forEach(link =>{
        link.addEventListener('click',()=>{
            header.classList.remove('show-nav');
        });
    });
}

menuMobile();
/* Burger */

/* Projets */
//Système de filtre des projets
function tabsFilters(){
    //On récupère les éléments
    const tabs = document.querySelectorAll('.portfolio-filters a');
    let oldTab = tabs[0];
    const projets = document.querySelectorAll('.portfolio .card');

    //Pour tous les projets, on affiche ceux qui sont concernés par le filtre.
    const showProjects = (element) =>{
        projets.forEach(projet =>{
            //On récupère la catégorie de la carte
            let filter = projet.getAttribute('data-category');

            filter !== element && element !=="all" ? projet.parentNode.classList.add('hide'):projet.parentNode.classList.remove('hide');
        });
    }

    //Pour chaque filtre
    tabs.forEach(element =>{
       element.addEventListener('click', (event) => {
           //On empêche la redirection
           event.preventDefault();

           //On récupère le type de filtre
           let filter = element.getAttribute('data-filter');
           showProjects(filter);

           //On actualise la tab active
           oldTab.classList.remove('active');
           element.classList.add('active');
           oldTab = element;
       });
    });
}
tabsFilters();

function showProjectDetails(){
    //On récupère les éléments
    const links = document.querySelectorAll('.card a');
    const annexe = document.querySelectorAll('.bloc-e4__content a');
    const modals = document.querySelectorAll('.modal');
    const btns = document.querySelectorAll('.modal__close');

    //On cache l'ensemble des modaux
    const hideModals =() => {
        modals.forEach(modal =>{
            modal.classList.remove('show');
        });
    }

    //Lors du click sur une carte
    links.forEach(element => {
        element.addEventListener('click', (event) => {
            event.preventDefault();
            document.querySelector(`[id=${element.dataset.id}]`).classList.add('show');
        });
    });

    //Lors du click sur une carte
    annexe.forEach(element => {
        if(element.hasAttribute('data-id')){
            element.addEventListener('click', (event) => {
                event.preventDefault();
                document.querySelector(`[id=${element.dataset.id}]`).classList.add('show');
            });
        }
    });

    //Fonction lors du click pour fermer un modal
    btns.forEach(btn => {
        btn.addEventListener('click', (event) =>{
            hideModals();
        });
    });
}

showProjectDetails();
/* Projets */

/* Effets */
const observerIntersectionAnimation = () =>{
    const sections = document.querySelectorAll('section');
    const skills = document.querySelectorAll('.skills .bar');

    /* sections */
    sections.forEach((section, index) =>{
        if(index == 0) return;
        section.style.opacity = "0";
        section.style.transition = "all 1.6s";
    });

    let sectionObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry =>{
            if(entry.isIntersecting){
                let element = entry.target;
                element.style.opacity = "1";
            }
        });
    });

    sections.forEach((section) =>{
        sectionObserver.observe((section));
    });
    /* sections */

    /* skills */
    skills.forEach((skill, index) =>{
        skill.style.width = "0";
        skill.style.transition = "all 1.6s";

    });

    let skillObserver = new IntersectionObserver(function (entries, observer) {

        entries.forEach(entry =>{
            if(entry.isIntersecting){
                let element = entry.target;
                element.style.width = element.dataset.width + '%';
            }
        });
    });

    skills.forEach((skill) =>{
        skillObserver.observe(skill);
    });
    /* skills */
}
observerIntersectionAnimation()
/* Effets */
