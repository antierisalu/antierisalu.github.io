function logOutButton() {
    document.querySelector('.loginPage').style.display = 'flex';
    document.querySelector('.indexPage').style.display = 'none';
}

function logInButton() {
    document.querySelector('.loginPage').style.display = 'none';
    document.querySelector('.indexPage').style.display = 'block';
}