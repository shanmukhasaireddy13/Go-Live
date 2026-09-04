import { ImageResponse } from "next/og";

export const alt = "Go-Live.me — Instant Anycast Subdomains for Developers";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f4f5f3",
          padding: "56px 64px",
          fontFamily: "monospace",
          color: "#14181b",
          backgroundImage: "radial-gradient(#DADDD6 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      >
        {/* Top Navbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderBottom: "2px solid #DADDD6",
            paddingBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px", fontWeight: 900, color: "#1b4dff" }}>▲</span>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#14181b", letterSpacing: "-0.5px" }}>
              Go-Live
            </span>
            <span style={{ color: "#DADDD6", fontSize: "20px" }}>/</span>
            <span style={{ color: "#5e6668", fontSize: "16px", fontWeight: 600 }}>go-live.me</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 16px",
              borderRadius: "999px",
              backgroundColor: "#ffffff",
              border: "1.5px solid #DADDD6",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#059669",
              }}
            />
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#14181b" }}>
              Anycast Network Live
            </span>
          </div>
        </div>

        {/* Middle Main Content Split */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "48px",
            width: "100%",
            margin: "auto 0",
          }}
        >
          {/* Left Hero & Search Box */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "660px" }}>
            <h1
              style={{
                fontSize: "58px",
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-2px",
                color: "#14181b",
                margin: 0,
              }}
            >
              Go-Live
            </h1>

            <p
              style={{
                fontSize: "19px",
                color: "#5e6668",
                lineHeight: 1.45,
                margin: 0,
                fontFamily: "sans-serif",
              }}
            >
              Your site. Your subdomain. Live. Get a free developer subdomain and connect your project in seconds.
            </p>

            {/* Signature Search Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginTop: "12px",
                flexWrap: "nowrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  fontSize: "36px",
                  fontWeight: 900,
                }}
              >
                <span
                  style={{
                    color: "#14181b",
                    borderBottom: "4px solid #1b4dff",
                    paddingBottom: "2px",
                  }}
                >
                  portfolio
                </span>
                <span style={{ color: "#5e6668", opacity: 0.65, marginLeft: "2px" }}>
                  .go-live.me
                </span>
              </div>

              {/* Claim Button */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 22px",
                  borderRadius: "12px",
                  backgroundColor: "#1b4dff",
                  color: "#ffffff",
                  fontSize: "18px",
                  fontWeight: 800,
                  boxShadow: "0 4px 12px rgba(27, 77, 255, 0.25)",
                }}
              >
                <span>Claim</span>
                <span style={{ fontSize: "16px" }}>→</span>
              </div>
            </div>

            {/* Available Status Pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#059669",
                }}
              />
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#059669" }}>
                portfolio.go-live.me is available!
              </span>
            </div>
          </div>

          {/* Right Visual Orbit/Globe Illustration Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "360px",
              height: "280px",
              borderRadius: "20px",
              backgroundColor: "#ffffff",
              border: "2px solid #DADDD6",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.06)",
              padding: "24px",
              position: "relative",
            }}
          >
            {/* Edge Node Points */}
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                border: "2px dashed #1b4dff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(27, 77, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1.5px solid #1b4dff",
                }}
              >
                <span style={{ fontSize: "32px" }}>🌐</span>
              </div>

              {/* Orbiting Satellite Dots */}
              <div
                style={{
                  position: "absolute",
                  top: "-6px",
                  left: "50%",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#059669",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-6px",
                  right: "20px",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#1b4dff",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "18px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#14181b" }}>
                300+ Edge Locations
              </span>
              <span style={{ fontSize: "13px", color: "#5e6668", fontFamily: "sans-serif" }}>
                Global Sub-30ms Latency
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #DADDD6",
            paddingTop: "20px",
            fontSize: "14px",
            fontWeight: 700,
            color: "#5e6668",
          }}
        >
          <span>▲ 1-Click Vercel Deploy</span>
          <span>•</span>
          <span>🔒 Auto TLS 1.3 SSL</span>
          <span>•</span>
          <span>⚡ Global Cloudflare Anycast</span>
          <span>•</span>
          <span>⭐ Free Forever via GitHub</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
