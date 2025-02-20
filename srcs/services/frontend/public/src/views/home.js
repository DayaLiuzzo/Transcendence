import BaseView from './BaseView.js';
let connected = 1;

export default class Home extends BaseView{
    constructor(params){
        super(params);
    }
    async render(){
      if (connected)
        {
          return `
          <h1>Bienvenue sur la page d'accueil</h1>
          <p>C'est la vue principale de notre SPA.</p>

          <div class="grid-container">

            </div>

            <div class="item">
              <h2>Play</h2>
              <p>
              Ici on mettra une overview du jeu !

              </p>
            </div>
          <div id="follow-scroll-elements">

          <p>(I follow)</p>

          </div>
          <p id="test-text">Test</p>
              `;
            }
        else {
          return `
          <h1>Bienvenue sur la page d'accueil</h1>
          <p>C'est la vue principale de notre SPA.</p>
          <div class="profile">
          <div><a href="/edit-profile">Log-in</a></div>
          <div><a href="/edit-profile">Sign up</a></div>
          </div>
          <div class="item">
          <p>
          Ici on mettra une overview du jeu !
          </p>
          </div>
          <div id="follow-scroll-elements">
          <p>(I follow)</p>
          </div>
          <p id="test-text">Test</p>
          <div class="item">
            <h2>Custom game</h2>
            <p>Ici on mettra une overview des settings du jeu !</p>
          </div>
              `;
        }
    }
    attachEvents(){
        console.log('Events attached (Home)');
        const text = document.getElementById("test-text");

        const originalText = text.textContent;
        console.log(originalText);
        text.addEventListener("mouseover", ()=> {
          text.querySelectorAll("span").forEach(letter => {
            const randomX = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 20;
            letter.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${(Math.random() - 0.5) * 20}deg)`;
          });
  };
}
};

// document.addEventListener("DOMContentLoaded", () => {
//   const text = document.getElementById("test-text");
//   console.log(text);
//   const originalText = text.textContent;

//   text.innerHTML = originalText.split("").map(char => `<span>${char}</span>`).join("");

//
//   });

//   text.addEventListener("mouseleave", () => {
//       text.querySelectorAll("span").forEach(letter => {
//           letter.style.transform = "translate(0,0) rotate(0)";
//       });
//   });
// });

