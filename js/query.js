async function getUserData() {
  try {
    const response = await fetch(
      "https://01.kood.tech/api/graphql-engine/v1/graphql",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `{
            user{
              auditRatio
              login
              attrs
              xps (where: { event: { id: { _eq: 148  } } } ){
                path
                amount
                event {
                  id
                }
              }
            }
            
            result (where: {type: {_eq: "user_audit"}}) {
                      grade
                      path

                    }
          }`,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error fetching user data");
    }

    const data = await response.json();
    console.log(data);
    

    const auditRatio = data.data.user[0].auditRatio.toFixed(2)
    const attrs = data.data.user[0].attrs;
    const login = data.data.user[0].login

    const grades = data.data.result
    const gradeData = []

    const xp = data.data.user[0].xps
    const xpData = [];
    let totalXpAmount = 0;

    xp.forEach(item => {
      xpData.push({
        path: item.path,
        amount: (item.amount / 1000).toFixed(0)
      });
      totalXpAmount += item.amount / 1000
    });

    grades.forEach(item => {
      gradeData.push({
        path: item.path,
        grade: item.grade.toFixed(2)
      })

    })

    let {
      tel,
      email,
      lastName,
      firstName,
      addressCity,
      addressStreet,
      addressCountry,
      personalIdentificationCode,
    } = attrs;

    displayProfile(firstName, lastName, email, tel, personalIdentificationCode, addressStreet, addressCity, addressCountry)
    displayXps(xpData, totalXpAmount)
    displayGrades(gradeData, auditRatio)

    document.getElementById("topBarUserName").innerHTML = login

  } catch (error) {
    console.error("Error fetching user data:", error.message);
  }
}

function displayProfile(firstName, lastName, email, tel, personalIdentificationCode, addressStreet, addressCity, addressCountry) {

  document.getElementById("profile").innerHTML = `
  <div class="boxData">${firstName} ${lastName}</div>
  <div class="boxData">${email}</div>
  <div class="boxData">${tel}</div>
  <div class="boxData">${personalIdentificationCode}</div>
  <div class="boxData">${addressStreet}, ${addressCity}, ${addressCountry}</div>
`;
}

function displayGrades(gradeData, auditRatio) {

  document.getElementById("auditRatio").innerHTML = `<div class="boxData">Audit Ratio: ${auditRatio}</div>`;

  const dataContainer = document.getElementById('grades')
  dataContainer.innerHTML = ''

  gradeData.forEach(item => {
    const itemDiv = document.createElement('div')
    
    const pathElement = document.createElement('p')
    pathElement.textContent = `Task: ${item.path}`

    const gradeElement = document.createElement('p')
    gradeElement.textContent = `Grade: ${item.grade}`

    itemDiv.appendChild(pathElement)
    itemDiv.appendChild(gradeElement)

    dataContainer.appendChild(itemDiv)
  })
}

function displayXps(xpData, totalXpAmount) {

  document.getElementById("totalXp").innerHTML = `<div class="boxData">Total Experience Points: ${totalXpAmount} Kb</div>`;
  
  const dataContainer = document.getElementById('xp');
  dataContainer.innerHTML = '';

  xpData.forEach(item => {
    const itemDiv = document.createElement('div');

    const pathElement = document.createElement('p');
    pathElement.textContent = `Task: ${item.path}`;

    const amountElement = document.createElement('p');
    amountElement.textContent = `Experience Points: ${item.amount} Kb`;

    itemDiv.appendChild(pathElement);
    itemDiv.appendChild(amountElement);

    dataContainer.appendChild(itemDiv);
  });
}