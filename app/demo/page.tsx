"use client";

import { useState } from "react";

const COLORS = {
  white: "#FFFFFF",
  offwhite: "#F8F9FB",
  black: "#08080A",
  text: "#111118",
  textSec: "#52525E",
  textMuted: "#8E8E9A",
  blue: "#2563EB",
  blueDark: "#1D4ED8",
  blueLight: "#EFF4FF",
  blueGlow: "rgba(37,99,235,0.12)",
  green: "#059669",
  greenLight: "#ECFDF5",
  greenBorder: "#A7F3D0",
  red: "#DC2626",
  redLight: "#FEF2F2",
  amber: "#D97706",
  amberLight: "#FFFBEB",
  border: "#E4E4EA",
  borderLight: "rgba(0,0,0,0.04)",
};

// ─── MOCK DATA ──────────────────────────────
const TRIP = {
  id: "abc-123-def",
  name: "Lisbon 2026",
  destination: "Lisbon, Portugal",
  startDate: "Mar 14, 2026",
  endDate: "Mar 18, 2026",
  days: 4,
  budgetPerPerson: 500,
  depositAmount: 25,
  organizer: "Ezra",
  status: "open",
  commitmentDeadline: "Mar 7, 2026",
  preferenceDeadline: "Mar 10, 2026",
};

const MEMBERS = [
  { name: "Ezra", email: "ezra@email.com", status: "committed", paid: true, isOrganizer: true, preferences: true },
  { name: "Marcus", email: "marcus@email.com", status: "committed", paid: true, isOrganizer: false, preferences: true },
  { name: "Aisha", email: "aisha@email.com", status: "committed", paid: true, isOrganizer: false, preferences: false },
  { name: "Jordan", email: "jordan@email.com", status: "pending", paid: false, isOrganizer: false, preferences: false },
  { name: "Priya", email: "priya@email.com", status: "committed", paid: true, isOrganizer: false, preferences: true },
];

const AI_OPTIONS = [
  {
    id: "opt-1",
    name: "The Culture Crawl",
    description: "A balanced mix of Lisbon's best — historic neighborhoods in the morning, world-class food in the afternoon, and rooftop bars at sunset. Built for groups that want to see everything without feeling rushed.",
    accommodation: "Airbnb in Alfama — 3BR apartment with terrace overlooking the Tagus. Walking distance to everything.",
    days: [
      { day: 1, morning: "Walking tour of Alfama + São Jorge Castle", afternoon: "Lunch at Time Out Market, explore Bairro Alto", evening: "Sunset drinks at Park Bar rooftop" },
      { day: 2, morning: "Belém Tower + Pastéis de Belém", afternoon: "LX Factory for street art + vintage shops", evening: "Fado dinner at A Tasca do Chico" },
      { day: 3, morning: "Sintra day trip — Pena Palace", afternoon: "Cabo da Roca (westernmost point of Europe)", evening: "Seafood dinner in Cascais" },
      { day: 4, morning: "Free morning — beach or shopping", afternoon: "Group lunch at Cervejaria Ramiro", evening: "Farewell drinks in Príncipe Real" },
    ],
    costPerPerson: 480,
    whyItWorks: "Balances everyone's interests — culture for the explorers, food for the foodies, and enough downtime that nobody burns out. The Sintra day trip gives the group a shared adventure moment.",
    votes: 2,
  },
  {
    id: "opt-2",
    name: "The Foodie Trail",
    description: "Eat your way through Lisbon. Every meal is an event — from hole-in-the-wall tascas to Michelin-recommended spots. With cooking classes, market tours, and wine tastings woven in.",
    accommodation: "Boutique hotel in Santos — central location near the best restaurant neighborhoods.",
    days: [
      { day: 1, morning: "Guided food tour through Mouraria", afternoon: "Wine tasting at Garrafeira Nacional", evening: "Dinner at Ponto Final (hidden gem across the river)" },
      { day: 2, morning: "Portuguese cooking class — pastéis de nata + bacalhau", afternoon: "Mercado da Ribeira deep dive", evening: "Dinner at Belcanto (Michelin star, shared tasting menu)" },
      { day: 3, morning: "Sintra with food focus — Piriquita bakery + queijadas", afternoon: "Seafood lunch in Ericeira", evening: "Ginjinha bar crawl in Rossio" },
      { day: 4, morning: "Breakfast at Landeau (best chocolate cake in Lisbon)", afternoon: "Final market haul + souvenirs", evening: "Sunset farewell dinner at a rooftop" },
    ],
    costPerPerson: 550,
    whyItWorks: "Food was the #1 activity interest across the group. This itinerary makes every meal intentional while still covering Lisbon's highlights. The cooking class gives everyone a skill to take home.",
    votes: 1,
  },
  {
    id: "opt-3",
    name: "The Off-Script",
    description: "Skip the tourist checklist. This itinerary leans into the unexpected — neighborhood walks the locals actually do, a surf lesson, a night across the river in Almada, and a lot of spontaneous discovery.",
    accommodation: "Hostel/co-living in Cais do Sodré — social vibe, common area, steps from the waterfront.",
    days: [
      { day: 1, morning: "Rent bikes, ride along the Tagus to Belém", afternoon: "Street art walk in Graça with a local guide (Withlocals)", evening: "Drinks at Pensao Amor (converted bordello bar)" },
      { day: 2, morning: "Surf lesson in Costa da Caparica", afternoon: "Lunch in Almada, sunset at Cristo Rei viewpoint", evening: "Dinner at a local's home (EatWith experience)" },
      { day: 3, morning: "Flea market at Feira da Ladra", afternoon: "Kayaking under the 25 de Abril bridge", evening: "Live music at MusicBox, late night in Cais do Sodré" },
      { day: 4, morning: "Morning run along the waterfront", afternoon: "Brunch at Dear Breakfast", evening: "Farewell — wherever the day takes you" },
    ],
    costPerPerson: 420,
    whyItWorks: "The cheapest option that still packs a punch. Perfect for the group members who marked 'adventure' and 'outdoors' as interests. The spontaneous structure respects everyone's pace preferences.",
    votes: 0,
  },
];

// ─── SCREEN COMPONENTS ──────────────────────

function TripDashboard({ onNavigate, tripStatus }: { onNavigate: (screen: string) => void; tripStatus: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = "rally-app.vercel.app/trip/abc-123-def";
  const committed = MEMBERS.filter(m => m.status === "committed").length;
  const prefsSubmitted = MEMBERS.filter(m => m.preferences).length;

  return (
    <div>
      {/* Trip Header Card */}
      <div style={{ background: COLORS.offwhite, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: COLORS.black, margin: "0 0 4px", fontWeight: 400 }}>{TRIP.name}</h2>
            <p style={{ fontSize: 14, color: COLORS.textSec, margin: 0 }}>{TRIP.destination}</p>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 100,
            background: tripStatus === "locked" ? COLORS.greenLight : tripStatus === "voting" ? COLORS.blueLight : COLORS.amberLight,
            color: tripStatus === "locked" ? COLORS.green : tripStatus === "voting" ? COLORS.blue : COLORS.amber,
            textTransform: "uppercase", letterSpacing: 0.5,
          }}>
            {tripStatus}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Dates", value: `${TRIP.startDate} — ${TRIP.endDate}` },
            { label: "Budget", value: `$${TRIP.budgetPerPerson}/person` },
            { label: "Deposit", value: `$${TRIP.depositAmount}` },
          ].map((item, i) => (
            <div key={i}>
              <p style={{ fontSize: 11, color: COLORS.textMuted, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>{item.label}</p>
              <p style={{ fontSize: 13, color: COLORS.text, margin: 0, fontWeight: 600 }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Share Link */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, padding: "10px 14px", background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, fontSize: 13, color: COLORS.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {shareUrl}
          </div>
          <button
            onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{
              padding: "10px 20px", background: copied ? COLORS.green : COLORS.black, color: COLORS.white,
              border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
            }}
          >
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Crew Status */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, margin: 0 }}>Crew — {committed}/{MEMBERS.length} committed</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MEMBERS.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: m.status === "committed" ? COLORS.blue : COLORS.border,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: m.status === "committed" ? COLORS.white : COLORS.textMuted,
                }}>
                  {m.name[0]}
                </div>
                <div>
                  <p style={{ fontSize: 14, color: COLORS.text, margin: 0, fontWeight: 600 }}>
                    {m.name} {m.isOrganizer && <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 400 }}>· organizer</span>}
                  </p>
                  <p style={{ fontSize: 12, color: COLORS.textMuted, margin: 0 }}>{m.email}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600,
                  background: m.paid ? COLORS.greenLight : COLORS.redLight,
                  color: m.paid ? COLORS.green : COLORS.red,
                }}>
                  {m.paid ? "Paid" : "Unpaid"}
                </span>
                {tripStatus !== "open" && (
                  <span style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600,
                    background: m.preferences ? COLORS.blueLight : COLORS.offwhite,
                    color: m.preferences ? COLORS.blue : COLORS.textMuted,
                  }}>
                    {m.preferences ? "Prefs in" : "Waiting"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress / Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tripStatus === "open" && (
          <button onClick={() => onNavigate("preferences")} style={{
            width: "100%", padding: 16, background: COLORS.blue, color: COLORS.white, border: "none", borderRadius: 14,
            fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
          }}>
            Move to Preferences Phase
          </button>
        )}
        {tripStatus === "preferences" && (
          <button onClick={() => onNavigate("options")} style={{
            width: "100%", padding: 16, background: COLORS.blue, color: COLORS.white, border: "none", borderRadius: 14,
            fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>
            Generate AI Itinerary Options ({prefsSubmitted}/{committed} preferences in)
          </button>
        )}
        {tripStatus === "voting" && (
          <button onClick={() => onNavigate("vote")} style={{
            width: "100%", padding: 16, background: COLORS.blue, color: COLORS.white, border: "none", borderRadius: 14,
            fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>
            Go to Voting
          </button>
        )}
        {tripStatus === "locked" && (
          <div style={{ padding: 20, background: COLORS.greenLight, border: `1px solid ${COLORS.greenBorder}`, borderRadius: 14, textAlign: "center" }}>
            <p style={{ fontSize: 18, fontFamily: "'Instrument Serif', serif", color: COLORS.green, margin: "0 0 4px" }}>Trip is locked!</p>
            <p style={{ fontSize: 13, color: COLORS.textSec, margin: 0 }}>The Culture Crawl won with 3 votes. See you in Lisbon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function JoinScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  return (
    <div>
      <button onClick={() => onNavigate("dashboard")} style={{ background: "none", border: "none", fontSize: 14, color: COLORS.blue, cursor: "pointer", marginBottom: 20, padding: 0, fontWeight: 600 }}>
        &larr; Back to dashboard
      </button>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: COLORS.black, margin: "0 0 8px", fontWeight: 400 }}>
          You're invited to <em style={{ color: COLORS.blue }}>{TRIP.name}</em>
        </h2>
        <p style={{ fontSize: 15, color: COLORS.textSec, margin: 0 }}>
          {TRIP.organizer} is putting together a trip to {TRIP.destination}
        </p>
      </div>

      <div style={{ background: COLORS.offwhite, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {[
            { label: "Where", value: TRIP.destination },
            { label: "When", value: `${TRIP.startDate} — ${TRIP.endDate}` },
            { label: "Budget", value: `$${TRIP.budgetPerPerson} per person` },
            { label: "Crew so far", value: `${MEMBERS.filter(m => m.paid).length} people committed` },
          ].map((item, i) => (
            <div key={i}>
              <p style={{ fontSize: 11, color: COLORS.textMuted, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>{item.label}</p>
              <p style={{ fontSize: 14, color: COLORS.text, margin: 0, fontWeight: 600 }}>{item.value}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: COLORS.textMuted, margin: 0 }}>Commitment deadline: {TRIP.commitmentDeadline}</p>
      </div>

      {!paid ? (
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>Your name</label>
            <input type="text" placeholder="Your name" style={{ width: "100%", padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>Your email</label>
            <input type="email" placeholder="you@email.com" style={{ width: "100%", padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ background: COLORS.blueLight, border: `1px solid rgba(37,99,235,0.15)`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: COLORS.text, margin: "0 0 4px", fontWeight: 600 }}>Commitment deposit: ${TRIP.depositAmount}</p>
            <p style={{ fontSize: 12, color: COLORS.textSec, margin: 0 }}>Your deposit goes toward the trip fund. If the trip happens, it's applied to your share. This is how we make sure everyone's actually in.</p>
          </div>

          <button
            onClick={() => { setPaying(true); setTimeout(() => { setPaying(false); setPaid(true); }, 1500); }}
            disabled={paying}
            style={{
              width: "100%", padding: 16, background: COLORS.blue, color: COLORS.white, border: "none", borderRadius: 14,
              fontSize: 15, fontWeight: 700, cursor: paying ? "not-allowed" : "pointer", opacity: paying ? 0.7 : 1,
            }}
          >
            {paying ? "Processing payment..." : `Commit & Pay $${TRIP.depositAmount}`}
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 24, background: COLORS.greenLight, border: `1px solid ${COLORS.greenBorder}`, borderRadius: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 22, color: COLORS.white }}>
            &#10003;
          </div>
          <p style={{ fontSize: 18, fontFamily: "'Instrument Serif', serif", color: COLORS.green, margin: "0 0 8px" }}>You're committed!</p>
          <p style={{ fontSize: 13, color: COLORS.textSec, margin: "0 0 16px" }}>$25 deposit confirmed. You'll get a notification when it's time to submit your preferences.</p>
          <button onClick={() => onNavigate("preferences")} style={{ padding: "10px 24px", background: COLORS.blue, color: COLORS.white, border: "none", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Submit Preferences Now
          </button>
        </div>
      )}
    </div>
  );
}

function PreferencesScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [budget, setBudget] = useState("");
  const [accom, setAccom] = useState("");
  const [pace, setPace] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [hardNos, setHardNos] = useState("");

  const toggleInterest = (val: string) => {
    setInterests(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", paddingTop: 40 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 26, color: COLORS.white }}>&#10003;</div>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: COLORS.black, margin: "0 0 8px" }}>Preferences saved</h2>
        <p style={{ fontSize: 15, color: COLORS.textSec, margin: "0 0 24px" }}>3 of 4 crew members have submitted. Once everyone's in, AI generates your itinerary options.</p>
        <button onClick={() => onNavigate("dashboard")} style={{ padding: "12px 28px", background: COLORS.blue, color: COLORS.white, border: "none", borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Back to Trip
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => onNavigate("dashboard")} style={{ background: "none", border: "none", fontSize: 14, color: COLORS.blue, cursor: "pointer", marginBottom: 16, padding: 0, fontWeight: 600 }}>
        &larr; Back to trip
      </button>

      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: COLORS.black, margin: "0 0 6px", fontWeight: 400 }}>
        Your travel preferences
      </h2>
      <p style={{ fontSize: 14, color: COLORS.textSec, margin: "0 0 28px" }}>
        This helps AI build itinerary options that actually work for everyone. Takes 2 minutes.
      </p>

      {/* Budget Flexibility */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Budget flexibility</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["strict", "flexible", "whatever"].map(val => (
            <button key={val} onClick={() => setBudget(val)} style={{
              flex: 1, padding: "10px 0", border: `1.5px solid ${budget === val ? COLORS.blue : COLORS.border}`,
              borderRadius: 12, background: budget === val ? COLORS.blueLight : COLORS.white,
              color: budget === val ? COLORS.blue : COLORS.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer",
              textTransform: "capitalize", transition: "all 0.15s",
            }}>
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Accommodation */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Accommodation style</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {["hostel", "airbnb", "hotel", "no preference"].map(val => (
            <button key={val} onClick={() => setAccom(val)} style={{
              padding: "10px 0", border: `1.5px solid ${accom === val ? COLORS.blue : COLORS.border}`,
              borderRadius: 12, background: accom === val ? COLORS.blueLight : COLORS.white,
              color: accom === val ? COLORS.blue : COLORS.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer",
              textTransform: "capitalize", transition: "all 0.15s",
            }}>
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>What are you into? (pick all that apply)</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["food", "nightlife", "outdoors", "culture", "relaxation", "adventure"].map(val => (
            <button key={val} onClick={() => toggleInterest(val)} style={{
              padding: "8px 16px", border: `1.5px solid ${interests.includes(val) ? COLORS.blue : COLORS.border}`,
              borderRadius: 100, background: interests.includes(val) ? COLORS.blueLight : COLORS.white,
              color: interests.includes(val) ? COLORS.blue : COLORS.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer",
              textTransform: "capitalize", transition: "all 0.15s",
            }}>
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Pace */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Preferred pace</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { val: "packed", desc: "See everything" },
            { val: "balanced", desc: "Mix of plans & free time" },
            { val: "chill", desc: "Go with the flow" },
          ].map(item => (
            <button key={item.val} onClick={() => setPace(item.val)} style={{
              flex: 1, padding: "10px 8px", border: `1.5px solid ${pace === item.val ? COLORS.blue : COLORS.border}`,
              borderRadius: 12, background: pace === item.val ? COLORS.blueLight : COLORS.white,
              color: pace === item.val ? COLORS.blue : COLORS.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer",
              textTransform: "capitalize", transition: "all 0.15s", textAlign: "center",
            }}>
              <div>{item.val}</div>
              <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, color: COLORS.textMuted }}>{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Hard Nos */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Any hard no's?</label>
        <textarea
          value={hardNos} onChange={(e) => setHardNos(e.target.value)}
          placeholder="Anything you absolutely don't want on this trip (e.g. no hostels, no early mornings, no museums...)"
          style={{ width: "100%", padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, fontSize: 13, minHeight: 80, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
        />
      </div>

      <button onClick={() => setSubmitted(true)} style={{
        width: "100%", padding: 16, background: COLORS.blue, color: COLORS.white, border: "none", borderRadius: 14,
        fontSize: 15, fontWeight: 700, cursor: "pointer",
      }}>
        Submit Preferences
      </button>
    </div>
  );
}

function OptionsScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [loading, setLoading] = useState(true);

  useState(() => {
    setTimeout(() => setLoading(false), 2500);
  });

  if (loading) {
    return (
      <div style={{ textAlign: "center", paddingTop: 60 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%", background: COLORS.blueLight,
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
          animation: "pulse 2s ease-in-out infinite",
        }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: `3px solid ${COLORS.blue}`, borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
        </div>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: COLORS.black, margin: "0 0 8px" }}>Generating your options...</h2>
        <p style={{ fontSize: 14, color: COLORS.textSec, margin: 0, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
          AI is analyzing 4 people's preferences to build itinerary options that work for everyone.
        </p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => onNavigate("dashboard")} style={{ background: "none", border: "none", fontSize: 14, color: COLORS.blue, cursor: "pointer", marginBottom: 16, padding: 0, fontWeight: 600 }}>
        &larr; Back to trip
      </button>

      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: COLORS.black, margin: "0 0 6px", fontWeight: 400 }}>
        3 options for your crew
      </h2>
      <p style={{ fontSize: 14, color: COLORS.textSec, margin: "0 0 24px" }}>
        AI built these from everyone's preferences. Review them, then vote.
      </p>

      {AI_OPTIONS.map((opt, i) => (
        <div key={opt.id} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 20, overflow: "hidden", marginBottom: 16 }}>
          {/* Option Header */}
          <div style={{ padding: "20px 20px 16px", background: i === 0 ? COLORS.blueLight : COLORS.white }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 11, color: COLORS.textMuted, margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Option {i + 1}</p>
                <h3 style={{ fontSize: 20, fontFamily: "'Instrument Serif', serif", color: COLORS.black, margin: "0 0 6px", fontWeight: 400 }}>{opt.name}</h3>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.blue }}>${opt.costPerPerson}<span style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted }}>/pp</span></span>
            </div>
            <p style={{ fontSize: 13, color: COLORS.textSec, margin: 0, lineHeight: 1.5 }}>{opt.description}</p>
          </div>

          {/* Day by Day */}
          <div style={{ padding: "0 20px 16px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.8, margin: "16px 0 10px" }}>Day by day</p>
            {opt.days.map((day, j) => (
              <div key={j} style={{ padding: "10px 0", borderBottom: j < opt.days.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.blue, margin: "0 0 4px" }}>Day {day.day}</p>
                <p style={{ fontSize: 12, color: COLORS.textSec, margin: 0, lineHeight: 1.5 }}>
                  <span style={{ color: COLORS.text, fontWeight: 600 }}>AM</span> {day.morning} &nbsp;·&nbsp;
                  <span style={{ color: COLORS.text, fontWeight: 600 }}>PM</span> {day.afternoon} &nbsp;·&nbsp;
                  <span style={{ color: COLORS.text, fontWeight: 600 }}>EVE</span> {day.evening}
                </p>
              </div>
            ))}
          </div>

          {/* Why it works */}
          <div style={{ padding: "0 20px 20px" }}>
            <div style={{ background: COLORS.offwhite, borderRadius: 12, padding: 14, borderLeft: `3px solid ${COLORS.blue}` }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Why this works for your group</p>
              <p style={{ fontSize: 13, color: COLORS.textSec, margin: 0, lineHeight: 1.5 }}>{opt.whyItWorks}</p>
            </div>
          </div>
        </div>
      ))}

      <button onClick={() => onNavigate("vote")} style={{
        width: "100%", padding: 16, background: COLORS.blue, color: COLORS.white, border: "none", borderRadius: 14,
        fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8,
      }}>
        Ready to Vote
      </button>
    </div>
  );
}

function VoteScreen({ onNavigate, onLock }: { onNavigate: (screen: string) => void; onLock: () => void }) {
  const [myVote, setMyVote] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const totalVoters = 4;

  const getVoteCount = (optId: string) => {
    const base = AI_OPTIONS.find(o => o.id === optId)?.votes || 0;
    return myVote === optId ? base + 1 : base;
  };

  const handleVote = (optId: string) => {
    setMyVote(optId);
    if (optId === "opt-1") {
      setTimeout(() => { setLocked(true); onLock(); }, 1500);
    }
  };

  if (locked) {
    return (
      <div style={{ textAlign: "center", paddingTop: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 30, color: COLORS.white }}>
          &#10003;
        </div>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: COLORS.black, margin: "0 0 8px" }}>Trip locked!</h2>
        <p style={{ fontSize: 16, color: COLORS.textSec, margin: "0 0 4px" }}>The Culture Crawl won with 3 votes</p>
        <p style={{ fontSize: 14, color: COLORS.textMuted, margin: "0 0 32px" }}>{TRIP.destination} · {TRIP.startDate} — {TRIP.endDate}</p>

        <div style={{ background: COLORS.offwhite, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 24, textAlign: "left", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: COLORS.black, margin: "0 0 8px" }}>The Culture Crawl</h3>
          <p style={{ fontSize: 13, color: COLORS.textSec, margin: "0 0 16px", lineHeight: 1.5 }}>{AI_OPTIONS[0].description}</p>
          <p style={{ fontSize: 13, color: COLORS.text, margin: "0 0 4px", fontWeight: 600 }}>Accommodation</p>
          <p style={{ fontSize: 13, color: COLORS.textSec, margin: "0 0 16px" }}>{AI_OPTIONS[0].accommodation}</p>
          <p style={{ fontSize: 13, color: COLORS.text, margin: "0 0 4px", fontWeight: 600 }}>Cost per person</p>
          <p style={{ fontSize: 20, color: COLORS.blue, margin: 0, fontWeight: 700 }}>${AI_OPTIONS[0].costPerPerson}</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onNavigate("dashboard")} style={{
            flex: 1, padding: 14, background: COLORS.blue, color: COLORS.white, border: "none", borderRadius: 14,
            fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>
            View Trip Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => onNavigate("dashboard")} style={{ background: "none", border: "none", fontSize: 14, color: COLORS.blue, cursor: "pointer", marginBottom: 16, padding: 0, fontWeight: 600 }}>
        &larr; Back to trip
      </button>

      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: COLORS.black, margin: "0 0 6px", fontWeight: 400 }}>
        Cast your vote
      </h2>
      <p style={{ fontSize: 14, color: COLORS.textSec, margin: "0 0 24px" }}>
        Majority wins. {getVoteCount("opt-1") + getVoteCount("opt-2") + getVoteCount("opt-3")} of {totalVoters} votes in.
      </p>

      {AI_OPTIONS.map((opt) => {
        const votes = getVoteCount(opt.id);
        const pct = Math.round((votes / totalVoters) * 100);
        const isSelected = myVote === opt.id;

        return (
          <div key={opt.id} style={{
            border: `2px solid ${isSelected ? COLORS.blue : COLORS.border}`,
            borderRadius: 18, padding: 20, marginBottom: 12, cursor: myVote ? "default" : "pointer",
            background: isSelected ? COLORS.blueLight : COLORS.white, transition: "all 0.2s",
          }}
            onClick={() => !myVote && handleVote(opt.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <h3 style={{ fontSize: 18, fontFamily: "'Instrument Serif', serif", color: COLORS.black, margin: "0 0 2px" }}>{opt.name}</h3>
                <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0 }}>${opt.costPerPerson}/person</p>
              </div>
              {isSelected && (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: COLORS.white }}>
                  &#10003;
                </div>
              )}
            </div>

            {/* Vote bar */}
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: COLORS.textSec }}>{votes} vote{votes !== 1 ? "s" : ""}</span>
                <span style={{ fontSize: 12, color: COLORS.blue, fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: COLORS.offwhite, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: COLORS.blue, borderRadius: 3, transition: "width 0.5s ease" }} />
              </div>
            </div>
          </div>
        );
      })}

      {!myVote && (
        <p style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center", marginTop: 16 }}>
          Tap an option to vote. When majority is reached, the trip locks automatically.
        </p>
      )}
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────
export default function RallyMVP() {
  const [screen, setScreen] = useState("dashboard");
  const [tripStatus, setTripStatus] = useState("open");

  const navigate = (target: string) => {
    if (target === "preferences") {
      setTripStatus("preferences");
      setScreen("preferences");
    } else if (target === "options") {
      setTripStatus("voting");
      setScreen("options");
    } else if (target === "vote") {
      setScreen("vote");
    } else {
      setScreen(target);
    }
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  const handleLock = () => {
    setTripStatus("locked");
  };

  return (
    <div style={{
      maxWidth: 520, margin: "0 auto", minHeight: "100vh",
      fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif",
      background: COLORS.white,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${COLORS.white}; }
      `}</style>

      {/* Nav */}
      <nav style={{
        padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${COLORS.borderLight}`, position: "sticky", top: 0, background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px)", zIndex: 50,
      }}>
        <a style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: COLORS.black, textDecoration: "none", letterSpacing: -0.5, cursor: "pointer" }} onClick={() => navigate("dashboard")}>
          Rally<span style={{ color: COLORS.blue }}>.</span>
        </a>
        <div style={{ display: "flex", gap: 8 }}>
          {screen !== "join" && (
            <button onClick={() => navigate("join")} style={{
              padding: "8px 16px", background: COLORS.offwhite, border: `1px solid ${COLORS.border}`,
              borderRadius: 100, fontSize: 12, fontWeight: 600, color: COLORS.textSec, cursor: "pointer",
            }}>
              Preview Join Page
            </button>
          )}
        </div>
      </nav>

      {/* Screen Router */}
      <div style={{ padding: "24px 20px 60px" }}>
        {screen === "dashboard" && <TripDashboard onNavigate={navigate} tripStatus={tripStatus} />}
        {screen === "join" && <JoinScreen onNavigate={navigate} />}
        {screen === "preferences" && <PreferencesScreen onNavigate={navigate} />}
        {screen === "options" && <OptionsScreen onNavigate={navigate} />}
        {screen === "vote" && <VoteScreen onNavigate={navigate} onLock={handleLock} />}
      </div>
    </div>
  );
}
