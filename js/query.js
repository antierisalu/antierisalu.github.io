function getUserData() {
  displayMainPage()
  displayProfile()
  displayXps()
  displayGrades()
  displayAudit()
}

function combineDuplicates(data) {
  const combinedData = [];

  data.forEach(item => {
    const existingItem = combinedData.find(i => i.name === item.name);

    if (existingItem) {
      existingItem.amount = Number(existingItem.amount) + Number(item.amount);
    } else {
      combinedData.push({...item, amount: Number(item.amount)});
    }
  });
  combinedData.sort((a, b) => a.amount - b.amount);

  return combinedData;
}

async function makeQuery(query) {
  try {
  const response = await fetch(
    "https://01.kood.tech/api/graphql-engine/v1/graphql",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({query: query}),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error fetching user data");
  }
  const data = await response.json();
  return data

} catch (error) {
  console.error("Error fetching user data:", error.message);
}

}

async function displayProfile() {
  try {
  let userQuery = `{
    user{
      auditRatio
      login
      attrs
    }
  }`

  const data = await makeQuery(userQuery)
  const userData = data.data.user[0]
  const auditRatio = userData.auditRatio.toFixed(2)
  const attrs = userData.attrs;
  const login = userData.login

  const {
    tel,
    email,
    lastName,
    firstName,
    addressCity,
    addressStreet,
    addressCountry,
    personalIdentificationCode,
  } = attrs;

  document.getElementById("auditRatio").innerHTML = `<div class="boxData">Audit Ratio: ${auditRatio}</div>`;
  document.getElementById("topBarUserName").innerHTML = `01 ${login}`

  document.getElementById("profile").innerHTML = `
  <div class="boxData">${firstName} ${lastName}</div>
  <div class="boxData">${personalIdentificationCode}</div>
  <div class="boxData">${email}</div>
  <div class="boxData">${tel}</div>
  <div class="boxData">${addressStreet}, ${addressCity}, ${addressCountry}</div>
`;
} catch (error) {
  console.error("Error fetching user data:", error.message);
}
}

async function displayXps() {
try {
  let xpQuery = `{
    transaction(where: { type: {_eq:"xp"}, object: { type: {_eq: "project"} } }) {
      amount
      object {
        name
      }
    }
  }`

  const data = await makeQuery(xpQuery)
  const xpData = [];
  const xp = data.data.transaction
  let totalXpAmount = 0;

  xp.forEach(item => {
    xpData.push({
      name: item.object.name,
      amount: (item.amount / 1000).toFixed(0)
    });
    totalXpAmount += item.amount / 1000
  });

  xpData.sort((a, b) => a.amount - b.amount)

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

} catch (error) {
  console.error("Error fetching xps:", error.message);
}
}

async function displayGrades() {
  try {
    let gradeQuery = `{
      result (where: {type: {_eq: "user_audit"}}) {
        grade
        object {
          name
        }
      }
    }`

    const data = await makeQuery(gradeQuery)
    const gradeData = []
    const grades = data.data.result

    grades.forEach(item => {
      gradeData.push({
        name: item.object.name,
        grade: item.grade.toFixed(2)
      })
    })

  gradeData.sort((a, b) => a.grade - b.grade)

  const dataContainer = document.getElementById('grades');
  dataContainer.innerHTML = '';

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

} catch (error) {
  console.error("Error fetching grades:", error.message);
}
}

  
async function displayAudit() {
  try {
    const downQuery = `{
      transaction(where: { type: {_eq:"down"}, object: { type: {_eq: "project"}} }) {
        amount
        object {
          name
        }
      }
    }`

    const lostXp = await makeQuery(downQuery)
    const xpDownData = [];
    const xpDown = lostXp.data.transaction
    let totalXpDownAmount = 0;

    xpDown.forEach(item => {
      xpDownData.push({
        name: item.object.name,
        amount: (item.amount / 1000).toFixed(0)
      });
      totalXpDownAmount += item.amount / 1000
    });

    const combinedXpDownData = combineDuplicates(xpDownData)
    console.log(combinedXpDownData)

    const upQuery = `{
      transaction(where: { type: {_eq:"up"}, object: { type: {_eq: "project"}} }) {
        amount
        object {
          name
        }
      }
    }`

    const gainedXp = await makeQuery(upQuery)
    const xpUpData = [];
    const xpUp = gainedXp.data.transaction
    let totalXpUpAmount = 0;

    xpUp.forEach(item => {
      xpUpData.push({
        name: item.object.name,
        amount: (item.amount / 1000).toFixed(0)
      });
      totalXpUpAmount += item.amount / 1000
    });

    const combinedXpUpData = combineDuplicates(xpUpData)
    console.log(combinedXpUpData)

    const dataContainer = document.getElementById('auditXp');
    dataContainer.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', (dataContainer.clientWidth - 50) + 'px');

    const barsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const barHeight = 20; 
    const totalHeight = Math.max(combinedXpDownData.length + combinedXpUpData.length) * barHeight ;
    svg.setAttribute('height', totalHeight);

    const maxAmount = Math.max(...combinedXpDownData.map(item => item.amount), ...combinedXpUpData.map(item => item.amount));

    combinedXpDownData.forEach((item, index) => {
      const barWidth = (item.amount / maxAmount) * 100; // Scale based on max amount

      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bar.setAttribute('x', 0);
      bar.setAttribute('y', index * barHeight);
      bar.setAttribute('width', barWidth + '%');
      bar.setAttribute('height', barHeight);
      bar.style.fill = 'rebeccapurple';

      const amountText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      amountText.setAttribute('x', 0); 
      amountText.setAttribute('y', index * barHeight + barHeight / 2); // Center text vertically
      amountText.setAttribute('dominant-baseline', 'middle');
      amountText.style.fill = 'gainsboro'; 
      amountText.textContent = `Lost: ${item.amount} Kb`;

      const taskText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      taskText.setAttribute('x', 200); 
      taskText.setAttribute('y', index * barHeight + barHeight / 2); // Center text vertically
      taskText.setAttribute('dominant-baseline', 'middle');
      taskText.style.fill = 'gainsboro'; 
      taskText.textContent = `${item.name}`;

      barsGroup.appendChild(bar);
      barsGroup.appendChild(amountText);
      barsGroup.appendChild(taskText); 
      
    });


    combinedXpUpData.forEach((item, index) => {
      const barWidth = (item.amount / maxAmount) * 100; // Scale based on max amount

      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bar.setAttribute('x', 0);
      bar.setAttribute('y', (index + combinedXpDownData.length) * barHeight);
      bar.setAttribute('width', barWidth + '%');
      bar.setAttribute('height', barHeight);
      bar.style.fill = 'indigo';

      const amountText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      amountText.setAttribute('x', 0); 
      amountText.setAttribute('y', (index + combinedXpDownData.length) * barHeight + barHeight / 2); // Center text vertically
      amountText.setAttribute('dominant-baseline', 'middle');
      amountText.style.fill = 'gainsboro'; 
      amountText.textContent = `Gained: ${item.amount} Kb`;

      const taskText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      taskText.setAttribute('x', 200); 
      taskText.setAttribute('y', (index + combinedXpDownData.length) * barHeight + barHeight / 2); // Center text vertically
      taskText.setAttribute('dominant-baseline', 'middle');
      taskText.style.fill = 'gainsboro'; 
      taskText.textContent = `${item.name}`;

      barsGroup.appendChild(bar);
      barsGroup.appendChild(amountText);
      barsGroup.appendChild(taskText); 
    });

    const totalUp = document.createElement('div')
    totalUp.innerHTML = `Total XP Lost ${totalXpDownAmount.toFixed(0)} Kb<br> Total XP Gained ${totalXpUpAmount.toFixed(0)} Kb`
    dataContainer.appendChild(totalUp)
    dataContainer.appendChild(document.createElement('br'))

    svg.appendChild(barsGroup);
    dataContainer.appendChild(svg);

  } catch (error) {
    console.error(error);
  }
}
