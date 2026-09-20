import math
def db_add(*ls): return 10*math.log10(sum(10**(l/10) for l in ls))
def point(Lref, d, dref=50, rate=20): return Lref - rate*math.log10(d/dref)
def leq_events(SEL, N, T=3600): return SEL + 10*math.log10(N) - 10*math.log10(T)
def leq_duty(Lmax, N, dur, T=3600): return Lmax + 10*math.log10(N*dur/T)

# --- sourced inputs at 50 ft ---
SEL_truck = 85.0      # Saxelby/Roseville: truck parking-lot movement SEL 85 dBA @50 ft (VERIFIED)
L_idle3 = 69.0        # LSA/Long Beach DEIR: 3 idling trucks Lw 101 -> 69 dBA @50 ft (VERIFIED)
alarm_4ft = 97.0      # SAE J994 Type C alarm 97 dB(A) rated (FedSig) ; at ~4 ft (ASSP/OSHA convention)
L_alarm50 = alarm_4ft - 20*math.log10(50/4)   # -> ~75.1 dBA @50 ft (derived)
Lmax_dock100 = 81.0   # Saxelby: loading dock Lmax 81 @100 ft (air brake, backing, TRU)
Lmax_dock50 = Lmax_dock100 + 6   # 87 @50 ft (derived, 6 dB/dd)
TRU_Lw = 102.0        # RWDI avg TRU sound power 102 dBA (VERIFIED)
L_TRU50 = TRU_Lw - 20*math.log10(15.24) - 8   # hemispherical -> ~70.4 @50 ft
HVAC50 = 59.0         # Saxelby: 50-ton rooftop unit 59 dBA Leq @50 ft (mfr data)

for label, trips in (("avg weekday (555 trips/day)",555),("peak day (809 trips/day)",809)):
    N_hr = trips/24.0            # 24/7 uniform (estimate)
    movements = 2*N_hr           # arrive + depart maneuver near docks (estimate)
    L_pass = leq_events(SEL_truck, movements)
    idlers = 5                   # estimate: 5 trucks idling at once
    L_idle = L_idle3 + 10*math.log10(idlers/3)
    L_alarm = leq_duty(L_alarm50, movements, 10)   # 10 s alarm per movement (LSG&A Brewster assumption)
    L_dock = db_add(L_pass, L_idle, L_alarm)
    print(f"\n== {label}: {N_hr:.1f} trips/hr, {movements:.1f} dock movements/hr ==")
    print(f" pass-by Leq @50ft {L_pass:.1f} | idling({idlers}) {L_idle:.1f} | alarms {L_alarm:.1f} | COMPOSITE dock Leq @50ft {L_dock:.1f} dBA")
    print(f" Lmax events @50ft: backup alarm {L_alarm50:.1f}; air-brake/coupling {Lmax_dock50:.1f}; TRU cont. {L_TRU50:.1f}")
    amb = {"day":55.0,"night":45.0}   # FTA Table 5-7 row 3000-10000 ppl/sq mi: day 55 / night 45 (VERIFIED); PSEG Lake Ronkonkoma measured night 49-56
    for d in (300,1000,2500,5280):
        base = point(L_dock, d)                     # hard/flat 6 dB per doubling
        soft = point(L_dock, d, rate=25)            # soft ground ~7.5 dB/dd (Long Beach DEIR: +1.5 dB/dd soft site)
        buf = 5.0 if d>=300 else 0                  # 240-ft dense buffer: DEC 3-7 dB (>=100 ft), FHWA 5 dB/100 ft, cap 10
        wall = 5.0                                  # FHWA: 5 dB when LOS broken; 10 dB good design
        wall10 = 10.0
        lmax_alarm = point(L_alarm50, d); lmax_ab = point(Lmax_dock50, d)
        row = []
        for per,A in amb.items():
            proj = base; tot = db_add(A, proj); inc = tot-A
            projb = base-buf; totb = db_add(A, projb); incb=totb-A
            projw = base-buf-wall; totw = db_add(A,projw); incw=totw-A
            projw10 = base-buf-wall10; totw10 = db_add(A,projw10); incw10=totw10-A
            row.append(f"{per}: FC-only {proj:.1f} | +buf {projb:.1f} | +buf+wall5 {projw:.1f} | +buf+wall10 {projw10:.1f} || total/incr: none {tot:.1f}(+{inc:.1f}) buf {totb:.1f}(+{incb:.1f}) wall5 {totw:.1f}(+{incw:.1f}) wall10 {totw10:.1f}(+{incw10:.1f})")
        print(f" d={d} ft: base(6dB/dd) {base:.1f}, soft(7.5dB/dd) {soft:.1f}; Lmax alarm {lmax_alarm:.1f}, air-brake/coupling {lmax_ab:.1f}")
        for r in row: print("   ",r)
