require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

const emailToPromote = process.argv[2];

if (!emailToPromote) {
  console.log("Usage:\n  node promote-admin.js <email-address>");
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🗄️  Connected to database.");

    const user = await User.findOne({ email: emailToPromote });

    if (!user) {
      console.log(`❌ No user found with email: ${emailToPromote}. Please register the account on the frontend signup page first.`);
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log(`\n🎉 Success! ${user.name} (${user.email}) has been promoted to 'admin'.\n`);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
