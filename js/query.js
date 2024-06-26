function getUserData() {
  displayMainPage();
  
  let functions = [displayProfile, displayXps, displayGrades, displayAudit];
  functions.forEach((func) => {
      func().catch((err) => {
          console.error(`function ${func.name}: ${err.message}`);
      });
  });
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

function handleMouseOver(event) {
  const hoveredBar = event.target;
  const hoveredBarIndex = [...hoveredBar.parentElement.children]
    .filter(child => child.tagName !== 'text') 
    .indexOf(hoveredBar);

  hoveredTaskText = taskTextElements[hoveredBarIndex];
  hoveredTaskText.style.display = 'block'
}

const taskTextElements = [];
const spacing = 5;

async function makeQuery(query) {
 
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


}

async function displayProfile() {

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

}

async function displayXps() {

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

  xpData.sort((a, b) => b.amount - a.amount)

  const dataContainer = document.getElementById('xp');
  dataContainer.innerHTML = '';

  document.getElementById("totalXp").innerHTML = `<div class="boxData">Total Experience Points: ${totalXpAmount.toFixed(2)} Kb</div>`;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', (dataContainer.clientWidth - 50) + 'px'); 

  const barsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  const barHeight = 20;
  const totalHeight = xpData.length * (barHeight + spacing);
  svg.setAttribute('height', totalHeight);

  const maxAmount = Math.max(...xpData.map(item => item.amount));

  xpData.forEach((item, index) => {
    const barWidth = (item.amount / maxAmount) * 100; 

    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bar.setAttribute('x', 0);
    bar.setAttribute('y', index * (barHeight + spacing));
    bar.setAttribute('width', barWidth + '%' );
    bar.setAttribute('height', barHeight);
    bar.style.fill = 'darkviolet';

    const amountText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    amountText.setAttribute('x', 0); 
    amountText.setAttribute('y', index * (barHeight + spacing) + barHeight / 2); 
    amountText.setAttribute('dominant-baseline', 'middle');
    amountText.style.fill = 'gainsboro'; 
    amountText.textContent = `${item.amount} Kb`;

    const taskText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    taskText.setAttribute('x', 150); 
    taskText.setAttribute('y', index * (barHeight + spacing) + barHeight / 2); // Center text vertically
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

async function displayGrades() {
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

  gradeData.sort((a, b) => b.grade - a.grade) 

  const dataContainer = document.getElementById('grades');
  dataContainer.innerHTML = '';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const containerWidth = dataContainer.clientWidth - 30; 
  svg.setAttribute('width', containerWidth + 'px');

  const barsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  const totalBars = gradeData.length;

  const totalBarWidth = containerWidth - (spacing * (totalBars));
  const barWidth = totalBarWidth / totalBars;

  const containerHeight = dataContainer.clientHeight - 30;

  svg.setAttribute('height', containerHeight + 'px');

  const maxAmount = Math.max(...gradeData.map(item => item.grade));

  gradeData.forEach((item, index) => {
      const barHeight = (item.grade / maxAmount) * containerHeight; 

      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bar.setAttribute('x', index * (barWidth + spacing)); 
      bar.setAttribute('y', containerHeight - barHeight); 
      bar.setAttribute('width', barWidth);
      bar.setAttribute('height', barHeight);
      bar.style.fill = 'darkviolet';
      bar.addEventListener('mouseover', handleMouseOver);
      bar.addEventListener('mouseover', () => {
        gradesText.style.display = 'none'});
      bar.addEventListener('mouseout', () => {
        taskTextElements.forEach(text => text.style.display = 'none'); 
        gradesText.style.display = 'block'; 
      });

      const amountText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      amountText.setAttribute('x', index * (barWidth + spacing) + barWidth / 2);
      amountText.setAttribute('y', containerHeight - barHeight + spacing); 
      amountText.setAttribute('text-anchor', 'start'); 
      amountText.setAttribute('transform', `rotate(90 ${index * (barWidth + spacing) + barWidth / 2}, ${containerHeight - barHeight})`);
      amountText.style.fill = 'gainsboro';
      amountText.textContent = `${item.grade}`;

      const taskText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      taskText.setAttribute('x', containerWidth / 2);
      taskText.setAttribute('y', containerHeight / 10); 
      taskText.setAttribute('text-anchor', 'middle'); 
      taskText.setAttribute('data-type', 'taskText')
      taskText.style.fill = 'gainsboro';
      taskText.textContent = `${item.name}`;
      taskText.style.display = 'none'; 

      taskTextElements.push(taskText); 
      
      barsGroup.appendChild(bar);
      barsGroup.appendChild(amountText);
      barsGroup.appendChild(taskText);
  });

  const gradesText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  gradesText.setAttribute('x', containerWidth / 2);
  gradesText.setAttribute('y', containerHeight / 10); 
  gradesText.setAttribute('text-anchor', 'middle'); 
  gradesText.style.fill = 'gainsboro';
  gradesText.textContent = "Grades";
  gradesText.style.display = 'block';
  
  svg.appendChild(barsGroup);
  svg.appendChild(gradesText)
  dataContainer.appendChild(svg);
  
}

async function displayAudit() {
  
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

    const dataContainer = document.getElementById('auditXp');
    dataContainer.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', (dataContainer.clientWidth - 50) + 'px');

    const barsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const barHeight = 20; 
    const totalHeight = Math.max(combinedXpDownData.length + combinedXpUpData.length) * (barHeight + spacing) ;
    svg.setAttribute('height', totalHeight);

    const maxAmount = Math.max(...combinedXpDownData.map(item => item.amount), ...combinedXpUpData.map(item => item.amount));

    combinedXpDownData.forEach((item, index) => {
      const barWidth = (item.amount / maxAmount) * 100; 

      const containerWidth = dataContainer.clientWidth - 50; 
      const barX = containerWidth - (barWidth * containerWidth / 100); 

      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bar.setAttribute('x', barX);
      bar.setAttribute('y', index * (barHeight + spacing));
      bar.setAttribute('width', barWidth + '%');
      bar.setAttribute('height', barHeight);
      bar.style.fill = 'DarkOrange';

      const amountText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      amountText.setAttribute('x', 0); 
      amountText.setAttribute('y', index * (barHeight + spacing) + barHeight / 2); 
      amountText.setAttribute('dominant-baseline', 'middle');
      amountText.style.fill = 'gainsboro'; 
      amountText.textContent = `Lost: ${item.amount} Kb`;

      const taskText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      taskText.setAttribute('x', 200); 
      taskText.setAttribute('y', index * (barHeight + spacing) + barHeight / 2); 
      taskText.setAttribute('dominant-baseline', 'middle');
      taskText.style.fill = 'gainsboro'; 
      taskText.textContent = `${item.name}`;

      barsGroup.appendChild(bar);
      barsGroup.appendChild(amountText);
      barsGroup.appendChild(taskText); 
      
    });

    combinedXpUpData.forEach((item, index) => {
      const barWidth = (item.amount / maxAmount) * 100; 

      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bar.setAttribute('x', 0);
      bar.setAttribute('y', (index + combinedXpDownData.length) * (barHeight + spacing));
      bar.setAttribute('width', barWidth + '%');
      bar.setAttribute('height', barHeight);
      bar.style.fill = 'MediumSeaGreen';

      const amountText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      amountText.setAttribute('x', 0); 
      amountText.setAttribute('y', (index + combinedXpDownData.length) * (barHeight + spacing) + barHeight / 2); 
      amountText.setAttribute('dominant-baseline', 'middle');
      amountText.style.fill = 'gainsboro'; 
      amountText.textContent = `Gained: ${item.amount} Kb`;

      const taskText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      taskText.setAttribute('x', 200); 
      taskText.setAttribute('y', (index + combinedXpDownData.length) * (barHeight + spacing) + barHeight / 2); 
      taskText.setAttribute('dominant-baseline', 'middle');
      taskText.style.fill = 'gainsboro'; 
      taskText.textContent = `${item.name}`;

      barsGroup.appendChild(bar);
      barsGroup.appendChild(amountText);
      barsGroup.appendChild(taskText); 

    });

    document.getElementById("auditRatio").innerHTML += `<br>Total XP Lost ${totalXpDownAmount.toFixed(0)} Kb & Total XP Gained ${totalXpUpAmount.toFixed(0)} Kb`;

    svg.appendChild(barsGroup);
    dataContainer.appendChild(svg);

}
