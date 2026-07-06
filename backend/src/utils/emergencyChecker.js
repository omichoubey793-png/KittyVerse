const emergencyKeywords = [
  "bleeding",
  "blood",
  "seizure",
  "unconscious",
  "not breathing",
  "can't breathe",
  "poison",
  "poisoned",
  "collapsed",
  "collapse",
  "hit by car",
  "accident",
  "fracture",
  "broken leg",
  "severe injury",
  "vomiting blood",
  "difficulty breathing",
  "snake bite",
  "electric shock"
];

const checkEmergency = (message) => {
  const text = message.toLowerCase();

  return emergencyKeywords.some(keyword =>
    text.includes(keyword)
  );
};

module.exports = {
  checkEmergency,
};