const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL || "https://mock.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-service-key";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
