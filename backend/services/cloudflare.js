const axios = require("axios");
const API = require("../config/api");
require("dotenv").config();

const CLOUDFLARE_API_TOKEN = (process.env.CLOUDFLARE_API_TOKEN || "").trim();
const CLOUDFLARE_ZONE_ID = (process.env.CLOUDFLARE_ZONE_ID || "").trim();
const ROOT_DOMAIN = process.env.ROOT_DOMAIN || "go-live.me";

const isCloudflareConfigured = () => {
  return (
    CLOUDFLARE_API_TOKEN &&
    CLOUDFLARE_ZONE_ID &&
    !CLOUDFLARE_API_TOKEN.startsWith("your-") &&
    !CLOUDFLARE_ZONE_ID.startsWith("your-")
  );
};

const cfClient = () => {
  return axios.create({
    baseURL: API.CLOUDFLARE.ZONE_DNS_RECORDS(CLOUDFLARE_ZONE_ID),
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });
};

/**
 * Creates a DNS record on Cloudflare (CNAME, A, TXT) with automatic duplicate recovery
 */
async function createDnsRecord({ name, target = "cname.vercel-dns.com", type = "CNAME", proxied = false }) {
  if (!isCloudflareConfigured()) {
    console.log(`[Cloudflare Notice] Real Cloudflare credentials not set in .env. Subdomain '${name}' stored in DB.`);
    return {
      success: true,
      configured: false,
      recordId: null,
      status: "SKIPPED",
      message: "Cloudflare credentials not configured in backend/.env",
    };
  }

  const cleanName = (name || "").trim().replace(/\.$/, "");
  let fullRecordName = `${cleanName}.${ROOT_DOMAIN}`;
  if (cleanName === "@" || cleanName === ROOT_DOMAIN) {
    fullRecordName = ROOT_DOMAIN;
  } else if (cleanName.endsWith(`.${ROOT_DOMAIN}`)) {
    fullRecordName = cleanName;
  }

  const recType = (type || "CNAME").toUpperCase();
  const recContent = (target || "").trim().replace(/\.$/, "");

  try {
    const response = await cfClient().post("", {
      type: recType,
      name: fullRecordName,
      content: recContent,
      ttl: 1, // Auto
      proxied: recType === "TXT" ? false : Boolean(proxied),
      comment: `Provisioned by Go-Live (${recType})`,
    });

    if (response.data && response.data.success) {
      console.log(`[Cloudflare] ${recType} record created successfully for ${fullRecordName}: ID ${response.data.result.id}`);
      return {
        success: true,
        configured: true,
        recordId: response.data.result.id,
        status: "ACTIVE",
        result: response.data.result,
      };
    } else {
      console.warn(`[Cloudflare Error]`, response.data.errors);
      return {
        success: false,
        configured: true,
        status: "ERROR",
        errors: response.data.errors,
      };
    }
  } catch (error) {
    const errorData = error.response?.data;
    // If record already exists in Cloudflare, fetch and update it
    if (errorData?.errors?.some((e) => e.code === 81057 || e.message?.includes("already exists"))) {
      try {
        const lookup = await cfClient().get(`?name=${encodeURIComponent(fullRecordName)}`);
        const records = lookup.data?.result || [];

        // For TXT records, check if identical content exists
        if (recType === "TXT") {
          const exactMatch = records.find((r) => r.type === "TXT" && r.content === recContent);
          if (exactMatch) {
            console.log(`[Cloudflare] TXT challenge record already active for ${fullRecordName}.`);
            return {
              success: true,
              configured: true,
              recordId: exactMatch.id,
              status: "ACTIVE",
              result: exactMatch,
            };
          }
        }

        // For CNAME or A records, update existing record with new target
        const existingRecord = records.find((r) => r.type === recType) || records[0];
        if (existingRecord) {
          console.log(`[Cloudflare] Updating existing ${existingRecord.type} record ${existingRecord.id} for ${fullRecordName} -> ${recContent}`);
          await updateDnsRecord({
            recordId: existingRecord.id,
            name: cleanName,
            target: recContent,
            type: recType,
            proxied: recType === "TXT" ? false : proxied,
          });
          return {
            success: true,
            configured: true,
            recordId: existingRecord.id,
            status: "ACTIVE",
            result: existingRecord,
          };
        }
      } catch (lookupErr) {
        console.warn(`[Cloudflare Recovery Warning]`, lookupErr.message);
      }
    }

    const errorDetails = error.response?.data || error.message;
    console.error(`[Cloudflare API Exception] Failed to create ${recType} DNS record for ${fullRecordName}:`, errorDetails);
    return {
      success: false,
      configured: true,
      status: "ERROR",
      error: typeof errorDetails === "string" ? errorDetails : JSON.stringify(errorDetails),
    };
  }
}

/**
 * Updates a DNS record on Cloudflare
 */
async function updateDnsRecord({ recordId, name, target, type = "CNAME", proxied = false }) {
  if (!isCloudflareConfigured() || !recordId) {
    return { success: true, configured: false };
  }

  try {
    const response = await axios.put(
      API.CLOUDFLARE.RECORD(CLOUDFLARE_ZONE_ID, recordId),
      {
        type: type.toUpperCase(),
        name: `${name}.${ROOT_DOMAIN}`,
        content: target,
        ttl: 1,
        proxied: Boolean(proxied),
      },
      {
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: response.data?.success || false,
      result: response.data?.result,
    };
  } catch (error) {
    console.error(`[Cloudflare API Exception] Failed to update DNS record:`, error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Deletes a DNS record from Cloudflare
 */
async function deleteDnsRecord(recordId) {
  if (!isCloudflareConfigured() || !recordId) {
    return { success: true, configured: false };
  }

  try {
    const response = await axios.delete(
      API.CLOUDFLARE.RECORD(CLOUDFLARE_ZONE_ID, recordId),
      {
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
      }
    );
    return { success: response.data?.success || false };
  } catch (error) {
    console.error(`[Cloudflare API Exception] Failed to delete DNS record:`, error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Deletes ANY DNS record matching `${name}.${ROOT_DOMAIN}` on Cloudflare
 */
async function deleteDnsRecordByName(name) {
  if (!isCloudflareConfigured() || !name) {
    return { success: true, configured: false, deletedCount: 0 };
  }

  const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
  const fullDomainName = `${cleanName}.${ROOT_DOMAIN}`;

  try {
    const lookup = await cfClient().get(`?name=${encodeURIComponent(fullDomainName)}`);
    const records = lookup.data?.result || [];
    let deletedCount = 0;

    for (const rec of records) {
      try {
        await axios.delete(
          API.CLOUDFLARE.RECORD(CLOUDFLARE_ZONE_ID, rec.id),
          {
            headers: {
              Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
            },
          }
        );
        deletedCount++;
        console.log(`[Cloudflare] Purged DNS record ${rec.id} for ${fullDomainName}`);
      } catch (delErr) {
        console.warn(`[Cloudflare] Failed to purge record ${rec.id}:`, delErr.message);
      }
    }

    return { success: true, deletedCount };
  } catch (err) {
    console.error(`[Cloudflare] Error looking up records to delete for ${fullDomainName}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Test credentials validity against Cloudflare API
 */
async function verifyCloudflareConnection() {
  if (!isCloudflareConfigured()) {
    return {
      configured: false,
      valid: false,
      message: "Credentials missing in backend/.env",
    };
  }

  try {
    const response = await cfClient().get("?per_page=1");
    return {
      configured: true,
      valid: response.data?.success || false,
      zoneId: CLOUDFLARE_ZONE_ID,
      recordsCount: response.data?.result_info?.total_count || 0,
    };
  } catch (error) {
    return {
      configured: true,
      valid: false,
      error: error.response?.data?.errors?.[0]?.message || error.message,
    };
  }
}

module.exports = {
  createDnsRecord,
  updateDnsRecord,
  deleteDnsRecord,
  deleteDnsRecordByName,
  verifyCloudflareConnection,
};
