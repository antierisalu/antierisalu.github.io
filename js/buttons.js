function logOutButton() {
    document.querySelector('.loginPage').style.display = 'flex';
    document.querySelector('.indexPage').style.display = 'none';
    document.querySelector('.errorOnPage').textContent = "";
    localStorage.removeItem('jwt');
}

function logInButton() {
    const username = document.querySelector('.loginInput').value;
    const password = document.querySelector('.passwordInput').value;
    login(username, password)
        .then(() => {
            getUserData()
            document.querySelector('.loginInput').value = "";
            document.querySelector('.passwordInput').value = "";
            // displayMainPage()
        })
        .catch(error => {
            console.error(error);
            document.querySelector('.errorOnPage').textContent = error.message
        });
}

function displayMainPage () {
    document.querySelector('.loginPage').style.display = 'none';
    document.querySelector('.indexPage').style.display = 'block';
}