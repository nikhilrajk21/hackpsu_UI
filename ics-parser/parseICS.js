import fs from "fs";
import ical from "ical";
import { DateTime } from "luxon";
import admin from "firebase-admin";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// You'll need to create a serviceAccountKey.json file with your Firebase service account credentials
// Download it from Firebase Console > Project Settings > Service Accounts
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
  });
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.error('Firebase initialization error:', error.stack);
  }
}

const db = admin.firestore();
db.settings({ 
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true
});

// Parse ICS file
const data = fs.readFileSync("./schedule.ics", "utf-8");
const events = ical.parseFile("./schedule.ics");

// Define time window (next 7 days)
const startRange = new Date();
const endRange = new Date();
endRange.setDate(startRange.getDate() + 7);

const parsedEvents = Object.values(events)
  .filter(e => e.type === "VEVENT")
  .flatMap(e => {
    // Handle recurring events
    if (e.rrule) {
      const between = e.rrule.between(startRange, endRange, true);
      return between.map(date => {
        const start = DateTime.fromJSDate(date)
          .setZone("America/New_York");
        const end = start.plus({ milliseconds: e.end - e.start });

        return {
          summary: e.summary,
          location: e.location || "N/A",
          date: start.toFormat("ccc, dd LLL yyyy"),
          start: start.toFormat("hh:mm a"),
          end: end.toFormat("hh:mm a"),
          startTime: start.toJSDate(), // Store as Date object for easier querying
          endTime: end.toJSDate(), // Store as Date object for easier querying
          dayOfWeek: start.weekday, // Store day of week (1-7)
          isRecurring: true,
          originalEventId: e.uid || e.summary, // Use for tracking
        };
      });
    }

    // Handle one-time events
    else {
      const start = DateTime.fromJSDate(e.start).setZone("America/New_York");
      const end = DateTime.fromJSDate(e.end).setZone("America/New_York");

      return [{
        summary: e.summary,
        location: e.location || "N/A",
        date: start.toFormat("ccc, dd LLL yyyy"),
        start: start.toFormat("hh:mm a"),
        end: end.toFormat("hh:mm a"),
        startTime: start.toJSDate(),
        endTime: end.toJSDate(),
        dayOfWeek: start.weekday,
        isRecurring: false,
        originalEventId: e.uid || e.summary,
      }];
    }
  })
  .sort((a, b) => DateTime.fromFormat(a.date, "ccc, dd LLL yyyy") - DateTime.fromFormat(b.date, "ccc, dd LLL yyyy"));

console.log("📚 Classes for the Upcoming Week:");
console.table(parsedEvents);

// Upload to Firestore
async function uploadToFirestore() {
  try {
    // First try to access Firestore to verify connection
    const testRef = db.collection("_test_").doc("_test_");
    await testRef.set({ timestamp: admin.firestore.FieldValue.serverTimestamp() });
    await testRef.delete();
    console.log("✅ Firebase connection verified!");

    // Clear existing data
    const ref = db.collection("classSchedules");
    const snapshot = await ref.get();
    
    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log("🗑️ Cleared existing schedule data");
    }

    // Upload new data in smaller batches
    let batch = db.batch();
    let batchCount = 0;
    const batchSize = 20;

    for (const ev of parsedEvents) {
      const docRef = ref.doc();
      batch.set(docRef, {
        ...ev,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      batchCount++;

      if (batchCount >= batchSize) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`✅ Successfully uploaded ${parsedEvents.length} classes to Firestore!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error uploading to Firestore:");
    if (error.code === 5) {
      console.error("This error suggests that either:");
      console.error("1. The Firebase project doesn't exist");
      console.error("2. The service account lacks permissions");
      console.error("3. The Firestore database hasn't been created");
      console.error("\nPlease check the Firebase Console and verify:");
      console.error(`- Project '${serviceAccount.project_id}' exists`);
      console.error("- Firestore database is created");
      console.error(`- Service account '${serviceAccount.client_email}' has proper permissions`);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

uploadToFirestore();
