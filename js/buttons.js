function logOutButton() {
    document.querySelector('.loginPage').style.display = 'flex';
    document.querySelector('.indexPage').style.display = 'none';
    document.querySelector('.errorOnPage').textContent = "";
}

function logInButton() {
    const username = document.querySelector('.loginInput').value;
    const password = document.querySelector('.passwordInput').value;
    login(username, password)
        .then(() => {
            document.querySelector('.loginInput').value = "";
            document.querySelector('.passwordInput').value = "";
            document.querySelector('.loginPage').style.display = 'none';
            document.querySelector('.indexPage').style.display = 'block';
        })
        .catch(error => {
            console.error(error);
            document.querySelector('.errorOnPage').textContent = error.message
        });
}