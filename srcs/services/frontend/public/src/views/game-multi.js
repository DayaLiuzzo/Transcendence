let ready = 1;

export default function() {
if (ready)
  return `
      <h1>Play on the same keyboard</h1>
      <p>Ici on va jouuuuer</p>
      <img src="../assets/images/pong_1.gif" alt="Profile picture" class="profile-img">
    `;
else
  return `
  <h1>Wait room</h1>
  <div id="loader-container">
    <div class="loader"></div>
  </div>
  `;

  }
