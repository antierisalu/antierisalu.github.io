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
            }
            transaction(where: { type: {_eq:"xp"}, object: { type: {_eq: "project"} } }) {
              amount
              object {
                name
              }
            }
            result (where: {type: {_eq: "user_audit"}}) {
              grade
              object {
                name
              }
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

    const gradeData = []
    const xpData = [];
    let totalXpAmount = 0;

    const userData = data.data.user[0]
    const auditRatio = userData.auditRatio.toFixed(2)
    const attrs = userData.attrs;
    const login = userData.login
    const xp = data.data.transaction
    const grades = data.data.result
    console.log(grades)

    xp.forEach(item => {
      xpData.push({
        name: item.object.name,
        amount: (item.amount / 1000).toFixed(0)
      });
      totalXpAmount += item.amount / 1000
    });

    grades.forEach(item => {
      gradeData.push({
        name: item.object.name,
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

    displayMainPage()
    displayProfile(firstName, lastName, email, tel, personalIdentificationCode, addressStreet, addressCity, addressCountry)
    displayXps(xpData, totalXpAmount)
    displayGrades(gradeData, auditRatio)

    document.getElementById("topBarUserName").innerHTML = `01 ${login}`

  } catch (error) {
    console.error("Error fetching user data:", error.message);
  }
}

function displayProfile(firstName, lastName, email, tel, personalIdentificationCode, addressStreet, addressCity, addressCountry) {

  document.getElementById("profile").innerHTML = `
  <div class="boxData">${firstName} ${lastName}</div>
  <div class="boxData">${personalIdentificationCode}</div>
  <div class="boxData">${email}</div>
  <div class="boxData">${tel}</div>
  <div class="boxData">${addressStreet}, ${addressCity}, ${addressCountry}</div>
`;
}

function displayGrades(gradeData, auditRatio) {
  const dataContainer = document.getElementById('grades');
  dataContainer.innerHTML = '';

  document.getElementById("auditRatio").innerHTML = `<div class="boxData">Audit Ratio: ${auditRatio}</div>`;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', (dataContainer.clientWidth - 50) + 'px');

  const barsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  const barHeight = 20; 
  const totalHeight = gradeData.length * barHeight;
  svg.setAttribute('height', totalHeight);

  const maxAmount = Math.max(...gradeData.map(item => item.grade));

  gradeData.forEach((item, index) => {
    const barWidth = (item.grade / maxAmount) * 100; // Scale based on max amount

    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bar.setAttribute('x', 0);
    bar.setAttribute('y', index * barHeight);
    bar.setAttribute('width', barWidth + '100');
    bar.setAttribute('height', barHeight);
    bar.style.fill = 'darkviolet';

    const amountText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    amountText.setAttribute('x', 0); 
    amountText.setAttribute('y', index * barHeight + barHeight / 2); // Center text vertically
    amountText.setAttribute('dominant-baseline', 'middle');
    amountText.style.fill = 'gainsboro'; 
    amountText.textContent = `Grade: ${item.grade} `;

    const taskText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    taskText.setAttribute('x', 150); 
    taskText.setAttribute('y', index * barHeight + barHeight / 2); // Center text vertically
    taskText.setAttribute('dominant-baseline', 'middle');
    taskText.style.fill = 'gainsboro'; 
    taskText.textContent = `${item.name}`;

    barsGroup.appendChild(bar);
    barsGroup.appendChild(amountText);
    barsGroup.appendChild(taskText); 
  });

  svg.appendChild(barsGroup);
  dataContainer.appendChild(svg);
}

function displayXps(xpData, totalXpAmount) {
  const dataContainer = document.getElementById('xp');
  dataContainer.innerHTML = '';

  document.getElementById("totalXp").innerHTML = `<div class="boxData">Total Experience Points: ${totalXpAmount} Kb</div>`;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', (dataContainer.clientWidth - 50) + 'px'); 

  const barsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Calculate the total height based on the number of items
  const barHeight = 20;
  const totalHeight = xpData.length * barHeight;
  svg.setAttribute('height', totalHeight);

  const maxAmount = Math.max(...xpData.map(item => item.amount));

  xpData.forEach((item, index) => {
    const barWidth = (item.amount / maxAmount) * 100; // Scale based on max amount

    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bar.setAttribute('x', 0);
    bar.setAttribute('y', index * barHeight);
    bar.setAttribute('width', barWidth + '%');
    bar.setAttribute('height', barHeight);
    bar.style.fill = 'darkviolet';

    const amountText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    amountText.setAttribute('x', 0); // Adjust text position as needed
    amountText.setAttribute('y', index * barHeight + barHeight / 2); // Center text vertically
    amountText.setAttribute('dominant-baseline', 'middle');
    amountText.style.fill = 'gainsboro'; 
    amountText.textContent = `${item.amount} Kb`;

    const taskText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    taskText.setAttribute('x', 150); // Adjust text position relative to bar width
    taskText.setAttribute('y', index * barHeight + barHeight / 2); // Center text vertically
    taskText.setAttribute('dominant-baseline', 'middle');
    taskText.style.fill = 'gainsboro'; 
    taskText.textContent = `${item.name}`;

    barsGroup.appendChild(bar);
    barsGroup.appendChild(amountText);
    barsGroup.appendChild(taskText);
  });

  svg.appendChild(barsGroup);
  dataContainer.appendChild(svg);
}