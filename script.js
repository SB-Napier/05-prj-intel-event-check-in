//Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const attendeeList = document.getElementById("attendeeList");

//Track attendance
let count = 0;
const maxCount = 50;
const storageKey = "sustainabilitySummitAttendance";
const teamIds = ["water", "zero", "power"];
const teamCounts = {
  water: 0,
  zero: 0,
  power: 0
};
const attendees = [];

const savedAttendance = localStorage.getItem(storageKey);

if (savedAttendance !== null) {
  let attendanceData;

  try {
    attendanceData = JSON.parse(savedAttendance);
  } catch (error) {
    console.error("Saved attendance data could not be read.", error);
  }

  if (typeof attendanceData === "object" && attendanceData !== null) {
    let teamTotal = 0;
    let isValid =
      Number.isInteger(attendanceData.count) && attendanceData.count >= 0;
    let savedAttendees = [];

    if (attendanceData.attendees !== undefined) {
      savedAttendees = attendanceData.attendees;
    }

    if (!Array.isArray(savedAttendees)) {
      isValid = false;
    } else {
      for (let i = 0; i < savedAttendees.length; i++) {
        const attendee = savedAttendees[i];

        if (
          typeof attendee !== "object" ||
          attendee === null ||
          typeof attendee.name !== "string" ||
          !teamIds.includes(attendee.team)
        ) {
          isValid = false;
        }
      }
    }

    for (let i = 0; i < teamIds.length; i++) {
      const teamId = teamIds[i];
      const teamCount =
        attendanceData.teamCounts && attendanceData.teamCounts[teamId];

      if (!Number.isInteger(teamCount) || teamCount < 0) {
        isValid = false;
      } else {
        teamTotal += teamCount;
      }
    }

    if (isValid && teamTotal === attendanceData.count) {
      count = attendanceData.count;

      for (let i = 0; i < teamIds.length; i++) {
        const teamId = teamIds[i];
        teamCounts[teamId] = attendanceData.teamCounts[teamId];
      }

      for (let i = 0; i < savedAttendees.length; i++) {
        attendees.push(savedAttendees[i]);
      }
    } else {
      console.error("Saved attendance data is invalid; starting with zero counts.");
    }
  } else if (attendanceData !== undefined) {
    console.error("Saved attendance data is invalid; starting with zero counts.");
  }
}

function updateAttendanceDisplay() {
  attendeeCount.textContent = count;

  const percentage = Math.round((count / maxCount) * 100) + "%";
  progressBar.style.width = percentage;

  for (let i = 0; i < teamIds.length; i++) {
    const teamId = teamIds[i];
    const teamCounter = document.getElementById(teamId + "Count");
    teamCounter.textContent = teamCounts[teamId];
  }

  while (attendeeList.firstChild) {
    attendeeList.removeChild(attendeeList.firstChild);
  }

  if (attendees.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.classList.add("empty-attendee-list");
    emptyMessage.textContent = "No attendees checked in yet.";
    attendeeList.appendChild(emptyMessage);
  } else {
    for (let i = 0; i < attendees.length; i++) {
      const attendeeItem = document.createElement("li");
      const attendeeName = document.createElement("span");
      const attendeeTeam = document.createElement("span");
      let attendeeTeamName = "";

      for (let j = 0; j < teamSelect.options.length; j++) {
        if (teamSelect.options[j].value === attendees[i].team) {
          attendeeTeamName = teamSelect.options[j].text;
          break;
        }
      }

      attendeeItem.classList.add("attendee-item");
      attendeeName.classList.add("attendee-name");
      attendeeTeam.classList.add("attendee-team");
      attendeeTeam.textContent = attendeeTeamName;
      attendeeName.textContent = attendees[i].name;
      attendeeItem.appendChild(attendeeName);
      attendeeItem.appendChild(attendeeTeam);
      attendeeList.appendChild(attendeeItem);
    }
  }
}

updateAttendanceDisplay();

// Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get form values
  const name = nameInput.value;
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;
  attendees.push({
    name: name,
    team: team
  });

  console.log(name, teamName);

  //Increment count
  count++;
  teamCounts[team]++;
  updateAttendanceDisplay();
  console.log("Total check-ins: ", count);
  const percentage = Math.round((count / maxCount) * 100) + "%";

  //Save attendance for the next visit
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      count: count,
      teamCounts: teamCounts,
      attendees: attendees
    })
  );
  console.log(`Progress: ${percentage}`);

  //Show a celebration when the attendance goal is reached
  if (count === maxCount) {
    let winningCount = 0;
    const winningTeams = [];

    for (let i = 0; i < teamSelect.options.length; i++) {
      const option = teamSelect.options[i];

      if (option.value === "") {
        continue;
      }

      const teamCount = Number(
        document.getElementById(option.value + "Count").textContent
      );

      if (teamCount > winningCount) {
        winningCount = teamCount;
        winningTeams.length = 0;
        winningTeams.push(option.text);
      } else if (teamCount === winningCount) {
        winningTeams.push(option.text);
      }
    }

    greeting.textContent = "🏆 Attendance goal reached! Winning team: ";
    const winnerName = document.createElement("strong");
    winnerName.textContent = winningTeams.join(" and ");
    greeting.appendChild(winnerName);
    greeting.classList.remove("success-message");
    greeting.classList.add("celebration-message");
    console.log(greeting.textContent);
  } else {
    const message = `✅ Success! Welcome ${name} from ${teamName}!`;
    greeting.textContent = message;
    greeting.classList.remove("celebration-message");
    greeting.classList.add("success-message");
    console.log(message);
  }

  form.reset();
});
