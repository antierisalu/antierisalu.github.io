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
          user {
            auditRatio
            attrs
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
    const auditRatio = data.data.user[0].auditRatio;
    const attrs = data.data.user[0].attrs;

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

    populateProfile(firstName, lastName, email, tel, personalIdentificationCode, addressStreet, addressCity, addressCountry)

    console.log("Audit Ratio:", auditRatio);
  } catch (error) {
    console.error("Error fetching user data:", error.message);
  }
}

function populateProfile(firstName, lastName, email, tel, personalIdentificationCode, addressStreet, addressCity, addressCountry) {
  // Get the element with id "profile"
  let profileElement = document.getElementById("profile");

  // Update the inner HTML of the profile element with the dynamic data
  profileElement.innerHTML = `
  <div class="boxData">${firstName} ${lastName}</div>
  <div class="boxData">${email}</div>
  <div class="boxData">${tel}</div>
  <div class="boxData">${personalIdentificationCode}</div>
  <div class="boxData">${addressStreet}, ${addressCity}, ${addressCountry}</div>
`;
}

