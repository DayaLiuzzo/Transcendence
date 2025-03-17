export default function toggleNavMenu() {
  const navbar = document.getElementById("navbar");
  navbar.classList.toggle("active");
}

export default function closeNavMenu() {
  const navbar = document.getElementById("navbar");
  navbar.classList.remove("active");
}
