// Versículos Bíblicos Aleatorios para Casa de Oración
(function() {
    'use strict';

    // Base de datos de versículos bíblicos
    const biblicalVerses = [
        { text: "Donde dos o tres se reúnen en mi nombre, allí estoy en medio de ellos.", reference: "Mateo 18:20" },
        { text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", reference: "Juan 3:16" },
        { text: "Confía en el Señor con todo tu corazón, y no te apoyes en tu propia prudencia.", reference: "Proverbios 3:5" },
        { text: "El Señor es mi pastor, nada me faltará.", reference: "Salmos 23:1" },
        { text: "Todo lo puedo en Cristo que me fortalece.", reference: "Filipenses 4:13" },
        { text: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te fortalezco.", reference: "Isaías 41:10" },
        { text: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice el Señor, pensamientos de paz, y no de mal.", reference: "Jeremías 29:11" },
        { text: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.", reference: "Salmos 91:1" },
        { text: "Cerca está el Señor a todos los que le invocan, a todos los que le invocan de verdad.", reference: "Salmos 145:18" },
        { text: "La alegría del Señor es vuestra fuerza.", reference: "Nehemías 8:10" },
        { text: "Buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", reference: "Mateo 6:33" },
        { text: "Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.", reference: "Juan 14:6" },
        { text: "No te angusties por nada, sino que en todo, por oración y súplica, con acción de gracias, sean conocidas vuestras peticiones delante de Dios.", reference: "Filipenses 4:6" },
        { text: "El Señor tu Dios está contigo en medio de ti, poderoso para salvar.", reference: "Sofonías 3:17" },
        { text: "Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios.", reference: "Efesios 2:8" }
    ];

    // Función para cargar un versículo aleatorio
    function loadRandomVerse() {
        // Seleccionar un versículo aleatorio
        const randomIndex = Math.floor(Math.random() * biblicalVerses.length);
        const selectedVerse = biblicalVerses[randomIndex];

        // Actualizar el DOM
        const verseElement = document.getElementById('random-verse');
        const referenceElement = document.getElementById('verse-reference');

        if (verseElement && referenceElement) {
            verseElement.textContent = selectedVerse.text;
            referenceElement.textContent = selectedVerse.reference;
        }
    }

    // Función para inicializar cuando el DOM esté listo
    function initializeRandomVerses() {
        // Cargar versículo aleatorio al inicio
        loadRandomVerse();

        // Opcional: Cambiar versículo cada cierto tiempo (cada 30 segundos)
        setInterval(loadRandomVerse, 30000);
    }

    // Inicializar cuando el documento esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeRandomVerses);
    } else {
        initializeRandomVerses();
    }

    // Hacer la función global para poder llamarla desde otros scripts si es necesario
    window.loadRandomVerse = loadRandomVerse;

})();
