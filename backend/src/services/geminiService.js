const { GoogleGenAI } = require("@google/genai");
const Animal = require("../models/Animal");
const Adoption = require("../models/Adoption");
const Rescue = require("../models/Rescue");
const LostFound = require("../models/LostFound");
const MedicalRecord = require("../models/MedicalRecord");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateResponse = async (userMessage) => {
  try {
    // Fetch live backend data from all modules in parallel
    const [cats, adoptions, rescues, lostFounds, medicalRecords] = await Promise.all([
      Animal.find({}),
      Adoption.find({}).populate('animal').populate('user'),
      Rescue.find({}),
      LostFound.find({}),
      MedicalRecord.find({}).populate('animal')
    ]);

    // Format live summaries
    const catsSummary = cats.map(c => `- Name: ${c.name}, Breed: ${c.breed}, Age: ${c.age}, Health: ${c.healthStatus}, Vaccination: ${c.vaccinationStatus || 'Pending'}, Status: ${c.adoptionStatus}, Region: ${c.location || 'N/A'}`).join('\n');
    
    const adoptionsSummary = adoptions.map(ad => {
        const catName = ad.animal ? ad.animal.name : 'Unknown';
        const userName = ad.user ? ad.user.name : 'Guest User';
        return `- Cat: ${catName}, Applicant: ${userName}, Email: ${ad.user ? ad.user.email : 'N/A'}, Status: ${ad.status}`;
    }).join('\n');

    const rescuesSummary = rescues.map(r => `- Title: ${r.title}, Cat: ${r.animalName}, Breed: ${r.breed}, Urgency: ${r.urgency}, Location: ${r.location}, Status: ${r.status}`).join('\n');

    const lostFoundsSummary = lostFounds.map(lf => `- Type: ${lf.type}, Title: ${lf.title}, Location: ${lf.location}, Status: ${lf.status}`).join('\n');

    // Aggregate statistics for Analytics
    const totalCats = cats.length;
    const adoptedCats = cats.filter(c => c.adoptionStatus === 'Adopted').length;
    const availableCats = cats.filter(c => c.adoptionStatus === 'Available' || c.adoptionStatus === 'Ready for Adoption').length;
    const pendingAdoptions = adoptions.filter(ad => ad.status === 'pending').length;
    const approvedAdoptions = adoptions.filter(ad => ad.status === 'approved').length;
    const rejectedAdoptions = adoptions.filter(ad => ad.status === 'rejected').length;
    
    const adoptedRate = totalCats > 0 ? ((adoptedCats / totalCats) * 100).toFixed(1) : 0;

    // Health distribution breakdown
    const healthDistribution = {};
    cats.forEach(c => {
        healthDistribution[c.healthStatus] = (healthDistribution[c.healthStatus] || 0) + 1;
    });

    // Vaccination summary breakdown
    const vaccinationSummary = {};
    cats.forEach(c => {
        const status = c.vaccinationStatus || "Pending";
        vaccinationSummary[status] = (vaccinationSummary[status] || 0) + 1;
    });

    // Regional distribution
    const regionalDistribution = {};
    cats.forEach(c => {
        const loc = c.location || "Unknown";
        regionalDistribution[loc] = (regionalDistribution[loc] || 0) + 1;
    });

    // Sort cats by creation time to get latest intakes
    const latestCats = [...cats]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
        .map(c => `- Name: ${c.name}, Breed: ${c.breed}, Intake Date: ${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}`)
        .join('\n');

    // Compile Recent Activities dynamically from database logs
    const activities = [];
    cats.forEach(c => {
        activities.push({
            date: c.createdAt || new Date(),
            text: `Intake recorded: ${c.name} (${c.breed})`
        });
    });
    adoptions.forEach(ad => {
        const catName = ad.animal ? ad.animal.name : 'Unknown';
        const userName = ad.user ? ad.user.name : 'Guest';
        activities.push({
            date: ad.createdAt || new Date(),
            text: `Application submitted for ${catName} by ${userName} (Status: ${ad.status})`
        });
    });
    rescues.forEach(r => {
        activities.push({
            date: r.createdAt || new Date(),
            text: `Rescue alert logged: "${r.title}" at ${r.location}`
        });
    });
    lostFounds.forEach(lf => {
        activities.push({
            date: lf.createdAt || new Date(),
            text: `Lost/Found post created: "${lf.title}" (${lf.type})`
        });
    });
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentActivitiesList = activities.slice(0, 5).map(a => `- [${new Date(a.date).toLocaleDateString()}] ${a.text}`).join('\n');

    // Compile Important Tasks dynamically
    const tasks = [];
    const underObs = cats.filter(c => c.healthStatus === 'Under Observation');
    if (underObs.length > 0) {
        tasks.push(`- Conduct daily medical checkups for cats under observation: ${underObs.map(c => c.name).join(', ')}.`);
    }
    const pendingVax = cats.filter(c => c.vaccinationStatus === 'Pending' || c.vaccinationStatus === 'First Dose Only');
    if (pendingVax.length > 0) {
        tasks.push(`- Administer vaccines to pending residents: ${pendingVax.map(c => c.name).join(', ')}.`);
    }
    if (pendingAdoptions > 0) {
        tasks.push(`- Review ${pendingAdoptions} pending adoption applications.`);
    }
    const highUrgencyRescues = rescues.filter(r => r.urgency === 'High' && r.status === 'Pending');
    if (highUrgencyRescues.length > 0) {
        tasks.push(`- Coordinate urgent intakes for rescue reports: ${highUrgencyRescues.map(r => `"${r.title}"`).join(', ')}.`);
    }
    const importantTasksList = tasks.join('\n') || "- No urgent tasks scheduled for today!";

    // Specific Search Pre-parsing
    let searchInstructions = "";
    const cleanMessage = userMessage.toLowerCase().trim();
    if (cleanMessage.includes("find cat") || cleanMessage.includes("tell me about")) {
        const match = userMessage.match(/(?:find cat|tell me about)\s+([a-zA-Z0-9\s]+)/i);
        if (match && match[1]) {
            const catName = match[1].trim().toLowerCase();
            const foundCat = cats.find(c => c.name.toLowerCase() === catName);
            if (foundCat) {
                searchInstructions = `
[USER SPECIFIC CAT SEARCH RESULT]
The user is searching for cat "${foundCat.name}". Here are the matching database details:
- Name: ${foundCat.name}
- Breed: ${foundCat.breed}
- Age: ${foundCat.age}
- Health Status: ${foundCat.healthStatus}
- Vaccination Status: ${foundCat.vaccinationStatus || 'Pending'}
- Adoption Status: ${foundCat.adoptionStatus}
Present this cat's details exactly and clearly in bullet points as requested.
`;
            } else {
                searchInstructions = `
[USER SPECIFIC CAT SEARCH RESULT]
The user is searching for cat "${match[1].trim()}" but no matching cat was found in the database.
Reply politely informing the user that no matching cat exists in our database, and suggest they check the Shelter Management module to add or verify our residents.
`;
            }
        }
    }

    const prompt = `
You are Fanny AI, the intelligent "KittyVerse AI Copilot" and Assistant for the KittyVerse Shelter Management platform.

You have access to the LIVE shelter database and backend records. Use this live information to answer user questions accurately.

--- LIVE DATABASE CONTEXT ---

[SHELTER DATA]
Total Cats in Shelter: ${totalCats}
Available Cats: ${availableCats}
Adopted Cats: ${adoptedCats}
Under Treatment Cats: ${cats.filter(c => c.healthStatus !== 'Healthy').length}
${catsSummary || 'No cats in the database.'}

[LATEST INTAKES]
${latestCats || 'No recent intakes.'}

[ADOPTION PIPELINE]
Total Applications: ${adoptions.length}
Pending Applications: ${pendingAdoptions}
Approved Applications: ${approvedAdoptions}
Rejected Applications: ${rejectedAdoptions}
${adoptionsSummary || 'No active adoption requests.'}

[RESCUE LOGS & OPERATIONS]
Total Rescue Alerts: ${rescues.length}
${rescuesSummary || 'No active rescue reports.'}

[LOST & FOUND ALERTS]
${lostFoundsSummary || 'No lost or found posts.'}

[ANALYTICS & METRICS]
Adoption Rate: ${adoptedRate}%
Health Distribution: ${JSON.stringify(healthDistribution)}
Vaccination Summary: ${JSON.stringify(vaccinationSummary)}
Regional Regions Distribution: ${JSON.stringify(regionalDistribution)}

[DASHBOARD LOGS & RUNTIMES]
[DYNAMIC RECENT ACTIVITIES]
${recentActivitiesList || 'No recent logs.'}

[DYNAMIC IMPORTANT TASKS]
${importantTasksList}

${searchInstructions}

-----------------------------

Your Purpose:
- Act as the intelligent KittyVerse AI Copilot.
- Answer user queries using the live database context provided above. Do not hardcode names, counts, or dates.
- Handle shelter, adoption, analytics, and dashboard queries.

Query Guide Rules:
- "How many rescued cats are there?": Display the count: ${totalCats}.
- "Which cats are available for adoption?": List cats with status "Available" or "Ready for Adoption".
- "Which cats are under treatment?": List cats with health status "Under Observation", "Needs Vet Visit", or not "Healthy".
- "Which cats need vaccination?": List cats with vaccination status "Pending", "First Dose Only", or not "Fully Vaccinated".
- "Find cat <name>" or "Tell me about <cat name>": Use the [USER SPECIFIC CAT SEARCH RESULT] block.
- "Show latest rescued cats": Display the [LATEST INTAKES] list.
- "How many pending adoption requests?": Show count: ${pendingAdoptions}.
- "Show approved adoptions": List adoptions with status "approved" showing cat and adopter names.
- "Show rejected applications": List adoptions with status "rejected".
- "Which applications need review?": List adoptions with status "pending".
- "Give shelter statistics" or "Total rescued cats": Summary of total counts of cats, adoptions, rescues, and users.
- "Adoption rate": Show adoption rate (${adoptedRate}%).
- "Health distribution": Breakdown count of cats by health status.
- "Vaccination summary": Breakdown count of cats by vaccination status.
- "Give today's overview": Overview summary of cats, pending applications, and rescues.
- "Show recent activities": Output the [DYNAMIC RECENT ACTIVITIES] list.
- "Show today's important tasks": Output the [DYNAMIC IMPORTANT TASKS] list.

Formatting Rules:
1. When listing cats, always format them clearly using:
   - Name: <Name>
   - Breed: <Breed>
   - Age: <Age>
   - Health Status: <Health Status>
   - Vaccination Status: <Vaccination Status>
   - Adoption Status: <Adoption Status>
2. Keep responses friendly, structured, under 150 words.
3. If information is unavailable, respond politely.
4. End every response with:
"⚠️ This information is for educational purposes only and is not a substitute for professional veterinary advice."

User Question:
${userMessage}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;

  } catch (error) {
    console.error("Gemini Error:", error);
    
    // Fallback: rule-based response parsing using the same live database summaries to avoid crashing/placeholders!
    const cleanMessage = userMessage.toLowerCase().trim();
    let reply = "";
    
    if (cleanMessage.includes("available") || cleanMessage.includes("ready for adoption")) {
      const availList = cats.filter(c => c.adoptionStatus === 'Available' || c.adoptionStatus === 'Ready for Adoption');
      if (availList.length === 0) {
        reply = "There are currently no cats available for adoption in the shelter.";
      } else {
        reply = `Here are the cats currently available for adoption:\n\n` + 
          availList.map(c => `- **${c.name}** (${c.breed}, ${c.age} yrs)\n  - Health: ${c.healthStatus}\n  - Vaccination: ${c.vaccinationStatus || 'Pending'}\n  - Adoption Status: ${c.adoptionStatus}`).join('\n\n');
      }
    } else if (cleanMessage.includes("pending adoption") || cleanMessage.includes("pending requests") || cleanMessage.includes("pending applications")) {
      const pendingList = adoptions.filter(ad => ad.status === 'pending');
      if (pendingList.length === 0) {
        reply = "There are currently no pending adoption requests.";
      } else {
        reply = `There are currently **${pendingList.length}** pending adoption applications awaiting review:\n\n` +
          pendingList.map(ad => {
              const catName = ad.animal ? ad.animal.name : 'Unknown Cat';
              const userName = ad.user ? ad.user.name : 'Guest User';
              return `- **Cat:** ${catName}\n  - **Applicant:** ${userName}\n  - **Email:** ${ad.user ? ad.user.email : 'N/A'}\n  - **Status:** ${ad.status.toUpperCase()}`;
          }).join('\n\n');
      }
    } else if (cleanMessage.includes("vaccinated")) {
      const vacList = cats.filter(c => c.vaccinationStatus === 'Vaccinated' || c.vaccinationStatus === 'Fully Vaccinated');
      if (vacList.length === 0) {
        reply = "No cats are currently marked as fully vaccinated in the database.";
      } else {
        reply = `Here are the cats with active vaccination records:\n\n` +
          vacList.map(c => `- **${c.name}** (${c.breed})\n  - Health: ${c.healthStatus}\n  - Vaccination Status: ${c.vaccinationStatus}`).join('\n\n');
      }
    } else if (cleanMessage.includes("shelter summary") || cleanMessage.includes("today's overview") || cleanMessage.includes("overview")) {
      reply = `### KittyVerse Shelter Overview\n\n` +
        `- **Total Registered Cats:** ${totalCats}\n` +
        `- **Available for Adoption:** ${availableCats}\n` +
        `- **Adopted Residents:** ${adoptedCats}\n` +
        `- **Under Active Treatment:** ${cats.filter(c => c.healthStatus !== 'Healthy').length}\n` +
        `- **Pending Adoption Requests:** ${pendingAdoptions}\n` +
        `- **High Urgency Rescues:** ${rescues.filter(r => r.urgency === 'High' && r.status === 'Pending').length}\n\n` +
        `Our database lists **${totalCats}** rescued cats with a current adoption success rate of **${adoptedRate}%**.`;
    } else if (cleanMessage.includes("analytics") || cleanMessage.includes("statistics") || cleanMessage.includes("metrics")) {
      reply = `### Live Analytics Summary\n\n` +
        `- **Rescue to Adoption Conversion Rate:** ${adoptedRate}%\n` +
        `- **Health Breakdown:** ${JSON.stringify(healthDistribution).replace(/[{""}]/g, ' ')}\n` +
        `- **Vaccination Breakdown:** ${JSON.stringify(vaccinationSummary).replace(/[{""}]/g, ' ')}\n` +
        `- **Region Distribution:** ${JSON.stringify(regionalDistribution).replace(/[{""}]/g, ' ')}`;
    } else if (cleanMessage.includes("tell me about") || cleanMessage.includes("find cat")) {
      const match = userMessage.match(/(?:find cat|tell me about)\s+([a-zA-Z0-9\s]+)/i);
      const catName = match ? match[1].trim().toLowerCase() : "";
      const foundCat = cats.find(c => c.name.toLowerCase() === catName);
      if (foundCat) {
        reply = `Here are the details for **${foundCat.name}**:\n\n` +
          `- **Breed:** ${foundCat.breed}\n` +
          `- **Age:** ${foundCat.age} years\n` +
          `- **Health Status:** ${foundCat.healthStatus}\n` +
          `- **Vaccination Status:** ${foundCat.vaccinationStatus || 'Pending'}\n` +
          `- **Adoption Status:** ${foundCat.adoptionStatus}\n` +
          `- **Location:** ${foundCat.location || 'Shelter'}`;
      } else {
        reply = `I couldn't find a cat named "${catName || 'that'}" in our database. You can manage and verify all residents in the **Shelter Management** panel.`;
      }
    } else {
      reply = `Hello! I am Fanny, your intelligent KittyVerse AI Copilot. Here's a quick summary of what I can help you find from our LIVE database:\n\n` +
        `- **Total rescued cats:** ${totalCats}\n` +
        `- **Available for adoption:** ${availableCats}\n` +
        `- **Pending adoption requests:** ${pendingAdoptions}\n` +
        `- **Rescue to adoption conversion rate:** ${adoptedRate}%\n\n` +
        `Feel free to ask me about available cats, pending adoptions, vaccinated cats, shelter summaries, or any specific cat's details!`;
    }
    
    return reply + "\n\n⚠️ This information is for educational purposes only and is not a substitute for professional veterinary advice.";
  }
};

console.log(
  "Using Gemini key:",
  process.env.GEMINI_API_KEY?.substring(0, 8)
);

module.exports = {
  generateResponse,
};