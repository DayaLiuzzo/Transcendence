import BaseView from './BaseView.js';

export default class Home extends BaseView{
    constructor(router, params){
        super(router,params);
    }
    async render(){
      if (this.isAuthenticated())
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
          <div id="test-text">
            <p>Test</p>
          </div>
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
          <div id="test-text">
          <p>Test</p>
          </div>
          <div class="item">
            <h2>Custom game</h2>
            <p>Ici on mettra une overview des settings du jeu !</p>
          </div>
              `;
        }
    }
    attachEvents(){
        console.log('Events attached (Home)');

    }
}
