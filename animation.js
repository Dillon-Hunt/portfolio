document.querySelector('body').onscroll = () => {
    projects = document.querySelectorAll('.featured-projects .featured-project .project-details') ?? []

    window.innerWidth > 1250 ? 
    projects.forEach(project => {
        project.style.marginTop = `${ (project.getClientRects()[0].y - (window.innerHeight  / 2) + (project.getClientRects()[0].height / 2)) / 4 }px`
    }) : projects.forEach(project => {
        project.style.marginTop = '-4px'
    })
}
