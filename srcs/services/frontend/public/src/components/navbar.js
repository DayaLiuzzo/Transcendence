export default function Navbar() {
    return `
        <nav>
			<ul>
          		<li><a class="nav-link" href="/home">Home</a></li>
          		<li><a class="nav-link" href="/play">Play</a></li>
          		<li><a class="nav-link" href="/about">About</a></li>
          		<li><a class="nav-link" href="/log-in">Log-in</a></li>
				<li><a class="nav-link" href="/test_daya">Test_daya</a></li>
          		<li><a onclick="alert('Language changed !')"><img src="./assets/images/flag.png" alt="english" class="flag"></a></li>
          		<li><a onclick="alert('Accessibility mode on')"><img src="./assets/images/accessibility.png" alt="accessibility" class="accessibility"></a></li>
        	</ul>
        </nav>
    `;
}
