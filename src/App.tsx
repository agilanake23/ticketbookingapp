import { useState, useEffect, CSSProperties } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type TransportMode = "bus" | "train" | "car";
type TripType      = "one-way" | "round" | "multi";

interface Trip {
  id:       number;
  operator: string;
  opName:   string;
  dep:      string;
  arr:      string;
  duration: string;
  price:    number;
  seats:    number;
  tags:     string[];
  color:    string;
}

interface SearchParams {
  from:       string;
  to:         string;
  passengers: number;
}

interface PassengerForm {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  age:       string;
  gender:    string;
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const TRIPS: Record<TransportMode, Trip[]> = {
  bus: [
    { id: 1, operator: "🚌", opName: "VRL Travels",    dep: "06:00", arr: "22:30", duration: "16h 30m", price: 850,  seats: 12, tags: ["AC","Sleeper","WiFi"],        color: "#dbeafe" },
    { id: 2, operator: "🚌", opName: "KSRTC Express",  dep: "08:30", arr: "23:45", duration: "15h 15m", price: 650,  seats: 24, tags: ["AC","Meals"],                 color: "#dcfce7" },
    { id: 3, operator: "🚌", opName: "Orange Tours",   dep: "14:00", arr: "06:30", duration: "16h 30m", price: 1100, seats: 5,  tags: ["AC","Sleeper","WiFi","Meals"], color: "#fef3c7" },
    { id: 4, operator: "🚌", opName: "SRS Travels",    dep: "21:00", arr: "13:00", duration: "16h 00m", price: 780,  seats: 18, tags: ["Sleeper"],                    color: "#f3e8ff" },
  ],
  train: [
    { id: 5, operator: "🚂", opName: "Rajdhani Express", dep: "07:00", arr: "23:30", duration: "16h 30m", price: 1250, seats: 45, tags: ["AC","Meals","WiFi"], color: "#fee2e2" },
    { id: 6, operator: "🚂", opName: "Duronto Express",  dep: "11:15", arr: "04:45", duration: "17h 30m", price: 980,  seats: 22, tags: ["AC","Sleeper"],      color: "#dbeafe" },
    { id: 7, operator: "🚂", opName: "Mumbai Mail",      dep: "19:00", arr: "11:45", duration: "16h 45m", price: 620,  seats: 67, tags: ["Sleeper"],           color: "#dcfce7" },
  ],
  car: [
    { id: 8, operator: "🚗", opName: "GoCabs Premium",     dep: "On demand", arr: "~20h", duration: "~20h drive", price: 6500, seats: 4, tags: ["AC","WiFi"], color: "#dbeafe" },
    { id: 9, operator: "🚗", opName: "OlaCabs Outstation", dep: "On demand", arr: "~20h", duration: "~20h drive", price: 5800, seats: 4, tags: ["AC"],        color: "#f3e8ff" },
  ],
};

const TAG_STYLES: Record<string, CSSProperties> = {
  AC:      { background: "#dbeafe", color: "#1d4ed8" },
  Meals:   { background: "#dcfce7", color: "#166534" },
  WiFi:    { background: "#fef3c7", color: "#92400e" },
  Sleeper: { background: "#f3e8ff", color: "#6b21a8" },
};

const TAKEN_SEATS: number[] = [2, 5, 8, 11, 14, 17];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S: Record<string, CSSProperties | ((...args: any[]) => CSSProperties)> = {
  app:        { fontFamily: "'DM Sans', sans-serif", background: "#f5f2eb", minHeight: "100vh", color: "#0d0d0d" } as CSSProperties,
  header:     { background: "#0d0d0d", color: "#f5f2eb", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 } as CSSProperties,
  logo:       { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: 8 } as CSSProperties,
  logoDot:    { width: 8, height: 8, background: "#e84d2f", borderRadius: "50%", display: "inline-block" } as CSSProperties,
  nav:        { display: "flex", gap: "1.5rem" } as CSSProperties,
  navLink:    { color: "#aaa", fontSize: "0.85rem", textDecoration: "none" } as CSSProperties,

  hero:       { background: "#0d0d0d", color: "#f5f2eb", padding: "4rem 2rem 5rem", textAlign: "center" } as CSSProperties,
  heroLabel:  { fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "#c9a84c", marginBottom: "1rem", fontWeight: 600 } as CSSProperties,
  heroH1:     { fontFamily: "'Syne', sans-serif", fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05, marginBottom: "1rem" } as CSSProperties,
  heroP:      { color: "#888", fontSize: "1rem", maxWidth: 400, margin: "0 auto 2.5rem", lineHeight: 1.6 } as CSSProperties,

  modeTabs:   { display: "flex", justifyContent: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 4, maxWidth: 380, margin: "0 auto 2rem" } as CSSProperties,
  tabBtn:     (active: boolean): CSSProperties => ({ flex: 1, padding: "10px 20px", background: active ? "#f5f2eb" : "transparent", border: "none", color: active ? "#0d0d0d" : "#888", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", fontWeight: active ? 600 : 500, cursor: "pointer", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.25s" }),

  card:       { background: "#fff", maxWidth: 820, margin: "-2.5rem auto 3rem", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden", position: "relative", zIndex: 10 } as CSSProperties,
  tripRow:    { display: "flex", borderBottom: "1px solid #d9d4c8", padding: "0 1.5rem" } as CSSProperties,
  tripBtn:    (active: boolean): CSSProperties => ({ background: "none", border: "none", padding: "1rem 1.2rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", fontWeight: active ? 600 : 500, color: active ? "#e84d2f" : "#7a7568", cursor: "pointer", borderBottom: `2px solid ${active ? "#e84d2f" : "transparent"}`, marginBottom: -1, transition: "all 0.2s" }),
  formBody:   { padding: "1.5rem" } as CSSProperties,
  formRow:    { display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0, marginBottom: "1rem", alignItems: "center" } as CSSProperties,
  formRow2:   { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" } as CSSProperties,
  formGroup:  { display: "flex", flexDirection: "column", gap: 4 } as CSSProperties,
  label:      { fontSize: "0.7rem", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600, color: "#7a7568" } as CSSProperties,
  input:      { border: "1.5px solid #d9d4c8", borderRadius: 10, padding: "12px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", color: "#0d0d0d", background: "#ede9df", outline: "none", width: "100%" } as CSSProperties,
  swapBtn:    { width: 38, height: 38, borderRadius: "50%", border: "2px solid #d9d4c8", background: "#f5f2eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1rem", margin: "20px 8px 0", flexShrink: 0, transition: "all 0.2s" } as CSSProperties,
  searchBtn:  { width: "100%", background: "#e84d2f", color: "#fff", border: "none", padding: 15, borderRadius: 12, fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" } as CSSProperties,

  results:    { maxWidth: 820, margin: "0 auto 4rem", padding: "0 1rem" } as CSSProperties,
  resHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" } as CSSProperties,
  resTitle:   { fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", fontWeight: 700 } as CSSProperties,
  resCount:   { fontSize: "0.8rem", color: "#7a7568", background: "#ede9df", padding: "4px 12px", borderRadius: 20 } as CSSProperties,

  tCard:      { background: "#fff", borderRadius: 16, border: "1.5px solid #d9d4c8", marginBottom: "1rem", overflow: "hidden", cursor: "pointer", transition: "all 0.2s" } as CSSProperties,
  tMain:      { display: "grid", gridTemplateColumns: "auto 1fr auto auto", alignItems: "center", gap: "1.5rem", padding: "1.2rem 1.5rem" } as CSSProperties,
  opLogo:     (color: string): CSSProperties => ({ width: 48, height: 48, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0, background: color }),
  timeRow:    { display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: 4 } as CSSProperties,
  time:       { fontFamily: "'Syne', sans-serif", fontSize: "1.3rem", fontWeight: 700 } as CSSProperties,
  cityRow:    { display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#7a7568" } as CSSProperties,
  tags:       { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 } as CSSProperties,
  tag:        (style: CSSProperties): CSSProperties => ({ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 20, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", ...style }),
  priceBlock: { textAlign: "right" } as CSSProperties,
  price:      { fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, color: "#e84d2f" } as CSSProperties,
  priceLabel: { fontSize: "0.7rem", color: "#7a7568", marginBottom: 6 } as CSSProperties,
  seatsLeft:  { fontSize: "0.72rem", color: "#16a34a", fontWeight: 500 } as CSSProperties,
  bookBtn:    { background: "#0d0d0d", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontFamily: "'Syne', sans-serif", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" } as CSSProperties,
  tFooter:    { padding: "0.7rem 1.5rem", display: "flex", gap: "1rem", fontSize: "0.75rem", color: "#7a7568", borderTop: "1px dashed #d9d4c8" } as CSSProperties,

  features:   { background: "#0d0d0d", color: "#f5f2eb", padding: "3rem 2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2rem", maxWidth: 820, margin: "0 auto 3rem", borderRadius: 20 } as CSSProperties,
  feature:    { textAlign: "center" } as CSSProperties,
  featIcon:   { fontSize: "2rem", marginBottom: "0.7rem" } as CSSProperties,
  featTitle:  { fontFamily: "'Syne', sans-serif", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.3rem" } as CSSProperties,
  featDesc:   { fontSize: "0.8rem", color: "#888", lineHeight: 1.5 } as CSSProperties,

  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" } as CSSProperties,
  modal:      { background: "#fff", borderRadius: 20, maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto" } as CSSProperties,
  mHeader:    { padding: "1.5rem", borderBottom: "1px solid #d9d4c8", display: "flex", justifyContent: "space-between", alignItems: "center" } as CSSProperties,
  mTitle:     { fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 700 } as CSSProperties,
  closeBtn:   { width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #d9d4c8", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: "#7a7568" } as CSSProperties,
  mBody:      { padding: "1.5rem" } as CSSProperties,

  jSummary:   { background: "#ede9df", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" } as CSSProperties,
  jFromTo:    { fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 700 } as CSSProperties,
  jMeta:      { fontSize: "0.78rem", color: "#7a7568", marginTop: 2 } as CSSProperties,
  secTitle:   { fontSize: "0.7rem", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600, color: "#7a7568", marginBottom: "0.8rem" } as CSSProperties,
  inputGrid:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "0.8rem" } as CSSProperties,
  mInput:     { border: "1.5px solid #d9d4c8", borderRadius: 10, padding: "10px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "#0d0d0d", background: "#ede9df", outline: "none", width: "100%" } as CSSProperties,

  seatGrid:   { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: "1.5rem" } as CSSProperties,
  seat:       (taken: boolean, selected: boolean): CSSProperties => ({
    aspectRatio: "1", borderRadius: 6,
    border: `1.5px solid ${selected ? "#2563eb" : "#d9d4c8"}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.65rem", fontWeight: 600,
    cursor: taken ? "not-allowed" : "pointer",
    background: taken ? "#ede9df" : selected ? "#2563eb" : "#fff",
    color: taken ? "#bbb" : selected ? "#fff" : "#0d0d0d",
    transition: "all 0.15s",
  }),
  seatLegend: { display: "flex", gap: "1rem", marginBottom: "1rem", fontSize: "0.72rem", color: "#7a7568" } as CSSProperties,
  legendDot:  (bg: string, border?: string): CSSProperties => ({ width: 12, height: 12, borderRadius: 3, background: bg, border: `1.5px solid ${border ?? bg}` }),

  priceSumm:  { background: "#ede9df", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem" } as CSSProperties,
  prRow:      { display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 6, color: "#7a7568" } as CSSProperties,
  prTotal:    { display: "flex", justifyContent: "space-between", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0d0d0d", paddingTop: 8, borderTop: "1px solid #d9d4c8", marginTop: 8 } as CSSProperties,
  payBtn:     { width: "100%", background: "#e84d2f", color: "#fff", border: "none", padding: 14, borderRadius: 12, fontFamily: "'Syne', sans-serif", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 } as CSSProperties,

  successWrap: { textAlign: "center", padding: "3rem 1.5rem" } as CSSProperties,
  successIcon: { width: 72, height: 72, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 1.2rem" } as CSSProperties,
  bookingId:   { background: "#ede9df", borderRadius: 10, padding: "0.8rem 1.2rem", margin: "1.2rem 0", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "2px" } as CSSProperties,
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Header(): JSX.Element {
  return (
    <header style={S.header as CSSProperties}>
      <div style={S.logo as CSSProperties}>
        <span style={S.logoDot as CSSProperties} /> GoTravel
      </div>
      <nav style={S.nav as CSSProperties}>
        <a href="#" style={S.navLink as CSSProperties}>Trips</a>
        <a href="#" style={S.navLink as CSSProperties}>Hotels</a>
        <a href="#" style={S.navLink as CSSProperties}>Support</a>
      </nav>
    </header>
  );
}

// ── ModeTabs ──
interface ModeTabsProps {
  mode:    TransportMode;
  setMode: (m: TransportMode) => void;
}

function ModeTabs({ mode, setMode }: ModeTabsProps): JSX.Element {
  const tabs: { key: TransportMode; label: string; icon: string }[] = [
    { key: "bus",   label: "Bus",   icon: "🚌" },
    { key: "train", label: "Train", icon: "🚂" },
    { key: "car",   label: "Car",   icon: "🚗" },
  ];
  return (
    <div style={S.modeTabs as CSSProperties}>
      {tabs.map((t) => (
        <button
          key={t.key}
          style={(S.tabBtn as (a: boolean) => CSSProperties)(mode === t.key)}
          onClick={() => setMode(t.key)}
        >
          <span>{t.icon}</span> {t.label}
        </button>
      ))}
    </div>
  );
}

// ── BookingForm ──
interface BookingFormProps {
  mode:      TransportMode;
  setMode:   (m: TransportMode) => void;
  onSearch:  (p: SearchParams) => void;
}

function BookingForm({ mode, setMode, onSearch }: BookingFormProps): JSX.Element {
  const today = new Date().toISOString().split("T")[0];
  const [from,     setFrom]     = useState<string>("Chennai");
  const [to,       setTo]       = useState<string>("Mumbai");
  const [depDate,  setDepDate]  = useState<string>(today);
  const [retDate,  setRetDate]  = useState<string>("");
  const [passengers, setPass]   = useState<number>(1);
  const [tripType, setTripType] = useState<TripType>("one-way");

  const swap = (): void => { setFrom(to); setTo(from); };

  const tripTypes: { key: TripType; label: string }[] = [
    { key: "one-way", label: "One Way"    },
    { key: "round",   label: "Round Trip" },
    { key: "multi",   label: "Multi-City" },
  ];

  return (
    <div style={S.card as CSSProperties}>
      <div style={S.tripRow as CSSProperties}>
        {tripTypes.map((t) => (
          <button
            key={t.key}
            style={(S.tripBtn as (a: boolean) => CSSProperties)(tripType === t.key)}
            onClick={() => setTripType(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={S.formBody as CSSProperties}>
        <div style={{ marginBottom: "1.2rem" }}>
          <ModeTabs mode={mode} setMode={setMode} />
        </div>

        <div style={S.formRow as CSSProperties}>
          <div style={S.formGroup as CSSProperties}>
            <label style={S.label as CSSProperties}>From</label>
            <input style={S.input as CSSProperties} value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Departure city" />
          </div>
          <button style={S.swapBtn as CSSProperties} onClick={swap} title="Swap cities">⇆</button>
          <div style={S.formGroup as CSSProperties}>
            <label style={S.label as CSSProperties}>To</label>
            <input style={S.input as CSSProperties} value={to} onChange={(e) => setTo(e.target.value)} placeholder="Destination city" />
          </div>
        </div>

        <div style={S.formRow2 as CSSProperties}>
          <div style={S.formGroup as CSSProperties}>
            <label style={S.label as CSSProperties}>Departure</label>
            <input style={S.input as CSSProperties} type="date" value={depDate} onChange={(e) => setDepDate(e.target.value)} />
          </div>
          <div style={{ ...(S.formGroup as CSSProperties), opacity: tripType === "round" ? 1 : 0.4, pointerEvents: tripType === "round" ? "all" : "none" }}>
            <label style={S.label as CSSProperties}>Return</label>
            <input style={S.input as CSSProperties} type="date" value={retDate} onChange={(e) => setRetDate(e.target.value)} />
          </div>
          <div style={S.formGroup as CSSProperties}>
            <label style={S.label as CSSProperties}>Passengers</label>
            <select style={S.input as CSSProperties} value={passengers} onChange={(e) => setPass(Number(e.target.value))}>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n} Passenger{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
        </div>

        <button style={S.searchBtn as CSSProperties} onClick={() => onSearch({ from, to, passengers })}>
          🔍 Search Available Trips
        </button>
      </div>
    </div>
  );
}

// ── TicketCard ──
interface TicketCardProps {
  trip:       Trip;
  passengers: number;
  onBook:     (t: Trip) => void;
}

function TicketCard({ trip, onBook }: TicketCardProps): JSX.Element {
  const urgency =
    trip.seats <= 5
      ? <span style={{ color: "#dc2626" }}>⚡ Only {trip.seats} left!</span>
      : <span>{trip.seats} seats available</span>;

  return (
    <div style={S.tCard as CSSProperties}>
      <div style={S.tMain as CSSProperties}>
        <div style={(S.opLogo as (c: string) => CSSProperties)(trip.color)}>{trip.operator}</div>

        <div>
          <div style={S.timeRow as CSSProperties}>
            <span style={S.time as CSSProperties}>{trip.dep}</span>
            <div style={{ flex: 1, height: 1, background: "#d9d4c8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ background: "#ede9df", padding: "2px 8px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 600, color: "#7a7568", whiteSpace: "nowrap" }}>
                {trip.duration}
              </span>
            </div>
            <span style={S.time as CSSProperties}>{trip.arr}</span>
          </div>
          <div style={S.cityRow as CSSProperties}>
            <span>Departure</span>
            <span style={{ fontWeight: 500 }}>{trip.opName}</span>
            <span>Arrival</span>
          </div>
          <div style={S.tags as CSSProperties}>
            {trip.tags.map((tag) => (
              <span key={tag} style={(S.tag as (s: CSSProperties) => CSSProperties)(TAG_STYLES[tag] ?? {})}>{tag}</span>
            ))}
          </div>
        </div>

        <div style={S.priceBlock as CSSProperties}>
          <div style={S.priceLabel as CSSProperties}>per person</div>
          <div style={S.price as CSSProperties}>₹{trip.price.toLocaleString()}</div>
          <div style={S.seatsLeft as CSSProperties}>{urgency}</div>
        </div>

        <button style={S.bookBtn as CSSProperties} onClick={() => onBook(trip)}>Book Now →</button>
      </div>
      <div style={S.tFooter as CSSProperties}>
        <span>🎫 E-Ticket</span>
        <span>💳 EMI available</span>
        <span>🔄 Free cancellation</span>
      </div>
    </div>
  );
}

// ── ResultsSection ──
interface ResultsSectionProps {
  mode:       TransportMode;
  from:       string;
  to:         string;
  passengers: number;
  onBook:     (t: Trip) => void;
}

function ResultsSection({ mode, from, to, passengers, onBook }: ResultsSectionProps): JSX.Element {
  const modeLabel: Record<TransportMode, string> = { bus: "Bus", train: "Train", car: "Car" };
  const trips = TRIPS[mode] ?? [];

  return (
    <div style={S.results as CSSProperties}>
      <div style={S.resHeader as CSSProperties}>
        <div style={S.resTitle as CSSProperties}>{modeLabel[mode]} trips: {from} → {to}</div>
        <span style={S.resCount as CSSProperties}>{trips.length} results</span>
      </div>
      {trips.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#7a7568" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
          <h3 style={{ fontFamily: "'Syne', sans-serif" }}>No trips found</h3>
          <p>Try different dates or cities.</p>
        </div>
      ) : (
        trips.map((trip) => (
          <TicketCard key={trip.id} trip={trip} passengers={passengers} onBook={onBook} />
        ))
      )}
    </div>
  );
}

// ── SeatGrid ──
interface SeatGridProps {
  selectedSeats: number[];
  onToggle:      (n: number) => void;
}

function SeatGrid({ selectedSeats, onToggle }: SeatGridProps): JSX.Element {
  return (
    <>
      <div style={S.seatLegend as CSSProperties}>
        {[
          { bg: "#ede9df", border: "#d9d4c8", label: "Taken"     },
          { bg: "#fff",    border: "#d9d4c8", label: "Available"  },
          { bg: "#2563eb", border: undefined,  label: "Selected"  },
        ].map(({ bg, border, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={(S.legendDot as (b: string, bo?: string) => CSSProperties)(bg, border)} />
            {label}
          </div>
        ))}
      </div>
      <div style={S.seatGrid as CSSProperties}>
        {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => {
          const taken    = TAKEN_SEATS.includes(n);
          const selected = selectedSeats.includes(n);
          return (
            <div
              key={n}
              style={(S.seat as (t: boolean, s: boolean) => CSSProperties)(taken, selected)}
              onClick={() => !taken && onToggle(n)}
            >
              {n}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── BookingModal ──
interface BookingModalProps {
  trip:       Trip;
  passengers: number;
  onClose:    () => void;
}

function BookingModal({ trip, passengers, onClose }: BookingModalProps): JSX.Element | null {
  const [seats,     setSeats]     = useState<number[]>([]);
  const [success,   setSuccess]   = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string>("");
  const [form,      setForm]      = useState<PassengerForm>({
    firstName: "", lastName: "", email: "", phone: "", age: "", gender: "Male",
  });

  const toggleSeat = (n: number): void =>
    setSeats((prev) => prev.includes(n) ? prev.filter((s) => s !== n) : [...prev, n]);

  const base  = trip.price * passengers;
  const fee   = 49;
  const gst   = Math.round(base * 0.05);
  const total = base + fee + gst;

  const handlePay = (): void => {
    setBookingId("GT" + Date.now().toString().slice(-8).toUpperCase());
    setSuccess(true);
  };

  const handleChange =
    (field: keyof PassengerForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  if (!trip) return null;

  return (
    <div style={S.overlay as CSSProperties} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.modal as CSSProperties}>
        <div style={S.mHeader as CSSProperties}>
          <h2 style={S.mTitle as CSSProperties}>{success ? "Booking Confirmed!" : `Book — ${trip.opName}`}</h2>
          <button style={S.closeBtn as CSSProperties} onClick={onClose}>✕</button>
        </div>

        <div style={S.mBody as CSSProperties}>
          {success ? (
            <div style={S.successWrap as CSSProperties}>
              <div style={S.successIcon as CSSProperties}>✅</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Booking Confirmed!
              </h3>
              <p style={{ fontSize: "0.88rem", color: "#7a7568", lineHeight: 1.6 }}>
                Your e-ticket has been sent to your email. Have a great journey!
              </p>
              <div style={S.bookingId as CSSProperties}>{bookingId}</div>
              <p style={{ fontSize: "0.8rem", color: "#7a7568" }}>
                {trip.opName} · {trip.dep} → {trip.arr}
              </p>
              <button style={{ ...(S.payBtn as CSSProperties), marginTop: "1.5rem" }} onClick={onClose}>
                Done ✓
              </button>
            </div>
          ) : (
            <>
              <div style={S.jSummary as CSSProperties}>
                <div>
                  <div style={S.jFromTo as CSSProperties}>Journey Details</div>
                  <div style={S.jMeta as CSSProperties}>{trip.dep} → {trip.arr} · {trip.duration}</div>
                </div>
                <div style={{ fontSize: "0.8rem", background: "#fff", padding: "4px 10px", borderRadius: 20, fontWeight: 600 }}>
                  {trip.opName}
                </div>
              </div>

              {/* Passenger form */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={S.secTitle as CSSProperties}>Passenger Details</div>
                {[
                  [{ field: "firstName" as const, placeholder: "Rahul",             label: "First Name", type: "text"   },
                   { field: "lastName"  as const, placeholder: "Kumar",             label: "Last Name",  type: "text"   }],
                  [{ field: "email"     as const, placeholder: "rahul@email.com",   label: "Email",      type: "email"  },
                   { field: "phone"     as const, placeholder: "+91 9000000000",    label: "Phone",      type: "tel"    }],
                  [{ field: "age"       as const, placeholder: "25",                label: "Age",        type: "number" }],
                ].map((row, ri) => (
                  <div key={ri} style={S.inputGrid as CSSProperties}>
                    {row.map(({ field, placeholder, label, type }) => (
                      <div key={field} style={S.formGroup as CSSProperties}>
                        <label style={S.label as CSSProperties}>{label}</label>
                        <input style={S.mInput as CSSProperties} type={type} placeholder={placeholder} value={form[field]} onChange={handleChange(field)} />
                      </div>
                    ))}
                    {ri === 2 && (
                      <div style={S.formGroup as CSSProperties}>
                        <label style={S.label as CSSProperties}>Gender</label>
                        <select style={S.mInput as CSSProperties} value={form.gender} onChange={handleChange("gender")}>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={S.secTitle as CSSProperties}>Select Seat{passengers > 1 ? "s" : ""}</div>
              <SeatGrid selectedSeats={seats} onToggle={toggleSeat} />

              <div style={S.priceSumm as CSSProperties}>
                <div style={S.prRow as CSSProperties}><span>Base Fare × {passengers}</span><span>₹{base.toLocaleString()}</span></div>
                <div style={S.prRow as CSSProperties}><span>Convenience Fee</span><span>₹{fee}</span></div>
                <div style={S.prRow as CSSProperties}><span>GST (5%)</span><span>₹{gst}</span></div>
                <div style={S.prTotal as CSSProperties}><span>Total Payable</span><span>₹{total.toLocaleString()}</span></div>
              </div>

              <button style={S.payBtn as CSSProperties} onClick={handlePay}>
                🔒 Pay & Confirm Booking
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Features ──
function Features(): JSX.Element {
  const items = [
    { icon: "⚡", title: "Instant Booking",  desc: "Confirm your seat in under 60 seconds with real-time availability." },
    { icon: "🔒", title: "Safe & Secure",     desc: "256-bit encrypted payments with full money-back guarantee."        },
    { icon: "📱", title: "E-Ticket",          desc: "Your ticket lives on your phone — no printing required."           },
    { icon: "🔄", title: "Free Cancellation", desc: "Cancel up to 24 hours before departure at zero cost."              },
  ];
  return (
    <div style={S.features as CSSProperties}>
      {items.map((f) => (
        <div key={f.title} style={S.feature as CSSProperties}>
          <div style={S.featIcon as CSSProperties}>{f.icon}</div>
          <h4 style={S.featTitle as CSSProperties}>{f.title}</h4>
          <p style={S.featDesc as CSSProperties}>{f.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App(): JSX.Element {
  const [mode,        setMode]        = useState<TransportMode>("bus");
  const [search,      setSearch]      = useState<SearchParams>({ from: "Chennai", to: "Mumbai", passengers: 1 });
  const [showResults, setShowResults] = useState<boolean>(false);
  const [selected,    setSelected]    = useState<Trip | null>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const handleSearch = (params: SearchParams): void => {
    setSearch(params);
    setShowResults(true);
  };

  return (
    <div style={S.app as CSSProperties}>
      <Header />

      <section style={S.hero as CSSProperties}>
        <div style={S.heroLabel as CSSProperties}>Book in seconds, travel in style</div>
        <h1 style={S.heroH1 as CSSProperties}>
          Every journey<br />starts{" "}
          <em style={{ color: "#e84d2f", fontStyle: "normal" }}>here.</em>
        </h1>
        <p style={S.heroP as CSSProperties}>
          Bus, train, or car — find the fastest route to your next destination.
        </p>
      </section>

      <BookingForm mode={mode} setMode={setMode} onSearch={handleSearch} />

      {showResults && (
        <ResultsSection
          mode={mode}
          from={search.from}
          to={search.to}
          passengers={search.passengers}
          onBook={setSelected}
        />
      )}

      <Features />

      {selected && (
        <BookingModal
          trip={selected}
          passengers={search.passengers}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}