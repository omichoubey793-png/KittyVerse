const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Animal = require('./models/Animal');

const MONGO_URI = process.env.MONGO_URI || "mongodb://ShelterAdmin:KittyVerseAi2026@ac-8ytntiz-shard-00-00.t5x9ypq.mongodb.net:27017,ac-8ytntiz-shard-00-01.t5x9ypq.mongodb.net:27017,ac-8ytntiz-shard-00-02.t5x9ypq.mongodb.net:27017/?ssl=true&replicaSet=atlas-u2u8fi-shard-0&authSource=admin&appName=KittyVerseAI";

const cats = [
  {
    name: "Luna",
    breed: "Domestic Shorthair",
    age: 2,
    gender: "Female",
    color: "Black",
    location: "Main Shelter - Seattle",
    vaccinationStatus: "Vaccinated",
    healthStatus: "Healthy",
    adoptionStatus: "Available",
    description: "Luna is a playful and affectionate domestic shorthair who loves chasing laser pointers.",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Milo",
    breed: "Ginger Tabby",
    age: 1,
    gender: "Male",
    color: "Orange",
    location: "Zone B - Tokyo",
    vaccinationStatus: "Vaccinated",
    healthStatus: "Ready for Adoption",
    adoptionStatus: "Available",
    description: "Milo is a friendly ginger tabby kitten found near a local train station.",
    imageUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Bella",
    breed: "Calico",
    age: 3,
    gender: "Female",
    color: "Tricolor",
    location: "Main Shelter - London",
    vaccinationStatus: "Pending Booster",
    healthStatus: "Under Observation",
    adoptionStatus: "Available",
    description: "Bella is a quiet calico who prefers sunny spots and gentle scratches behind the ears.",
    imageUrl: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Oliver",
    breed: "Tuxedo",
    age: 4,
    gender: "Male",
    color: "Black and White",
    location: "Zone C - Munich",
    vaccinationStatus: "Vaccinated",
    healthStatus: "Adopted",
    adoptionStatus: "Adopted",
    description: "Oliver is a classy tuxedo cat who recently found his forever home.",
    imageUrl: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Leo",
    breed: "Tabby",
    age: 2,
    gender: "Male",
    color: "Brown Striped",
    location: "North Wing - Sydney",
    vaccinationStatus: "Vaccinated",
    healthStatus: "Healthy",
    adoptionStatus: "Available",
    description: "Leo is an active striped tabby cat who gets along well with other shelter cats.",
    imageUrl: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Nala",
    breed: "Siamese Mix",
    age: 3,
    gender: "Female",
    color: "Seal Point",
    location: "Main Shelter - Seattle",
    vaccinationStatus: "Vaccinated",
    healthStatus: "Ready for Adoption",
    adoptionStatus: "Available",
    description: "Nala is an elegant Siamese mix who is very vocal and loves holding conversations.",
    imageUrl: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Simba",
    breed: "Ginger Tabby",
    age: 5,
    gender: "Male",
    color: "Dark Orange",
    location: "Zone B - Tokyo",
    vaccinationStatus: "First Dose Only",
    healthStatus: "Under Observation",
    adoptionStatus: "Pending",
    description: "Simba is a large, gentle ginger tabby cat recovering from a minor skin condition.",
    imageUrl: "https://images.unsplash.com/photo-1561948955-570b270e7c36?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Coco",
    breed: "Persian Mix",
    age: 4,
    gender: "Female",
    color: "Grey Fluffy",
    location: "Main Shelter - London",
    vaccinationStatus: "Vaccinated",
    healthStatus: "Healthy",
    adoptionStatus: "Available",
    description: "Coco is a sweet Persian mix who enjoys daily grooming sessions.",
    imageUrl: "https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Mochi",
    breed: "Domestic Longhair",
    age: 1,
    gender: "Female",
    color: "White Fluffy",
    location: "Zone C - Munich",
    vaccinationStatus: "Vaccinated",
    healthStatus: "Ready for Adoption",
    adoptionStatus: "Available",
    description: "Mochi is a tiny, energetic domestic longhair kitten full of curiosity.",
    imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Charlie",
    breed: "Maine Coon Mix",
    age: 6,
    gender: "Male",
    color: "Silver Grey",
    location: "North Wing - Sydney",
    vaccinationStatus: "Vaccinated",
    healthStatus: "Healthy",
    adoptionStatus: "Available",
    description: "Charlie is a majestic Maine Coon mix with a fluffy tail and a heart of gold.",
    imageUrl: "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Rosie",
    breed: "Calico",
    age: 2,
    gender: "Female",
    color: "White and Ginger",
    location: "Main Shelter - Seattle",
    vaccinationStatus: "Vaccinated",
    healthStatus: "Adopted",
    adoptionStatus: "Adopted",
    description: "Rosie is a sweet calico cat who found her loving family last week.",
    imageUrl: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=400&auto=format&fit=crop"
  },
  {
    name: "Daisy",
    breed: "Tuxedo",
    age: 1,
    gender: "Female",
    color: "Black and White",
    location: "Zone B - Tokyo",
    vaccinationStatus: "Pending Booster",
    healthStatus: "Under Observation",
    adoptionStatus: "Available",
    description: "Daisy is a curious tuxedo kitten rescued from a garden center.",
    imageUrl: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=400&auto=format&fit=crop"
  }
];

async function seed() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB!");

    console.log("Clearing old animals collection...");
    await Animal.deleteMany({});
    console.log("Collection cleared.");

    console.log("Inserting seeded cat records...");
    const created = await Animal.insertMany(cats);
    console.log(`Successfully seeded ${created.length} cats!`);

    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
