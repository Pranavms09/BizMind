/**
 * Sample datasets for the GOAT Consumer Electronics demo story.
 *
 * Story progression:
 * 1. December: Normal operations across GOAT Rockerz 550, GOAT Airdopes 141, GOAT Nirvana 751.
 * 2. January: GOAT Rockerz 550 revenue drops ~24% due to aggressive competitor discounting (Situation detected!).
 *    - Decision recorded: 10% price reduction on GOAT Rockerz 550 from ₹1,499 to ₹1,349 (Retained into Hindsight).
 * 3. February: After price adjustment to ₹1,349, GOAT Rockerz 550 units surge +35% and revenue recovers +21.5%!
 *    - Outcome evaluated: Marked "better_than_expected", lesson retained into Hindsight memory.
 * 4. March: GOAT Airdopes 141 shows softening sales under competitor pressure.
 *    - User asks: "What happens if GOAT reduces the Rockerz 550 price by 10%?" or "Should GOAT reduce the price of the Rockerz 550 from ₹1,499 to ₹1,349?"
 *    - Hindsight Recalls previous GOAT pricing experience, while live web research queries real competitors (boAt, Noise, Boult, JBL, Sony)
 *      to model 3 response scenarios.
 */

// Previous baseline period (December 2025)
export const DECEMBER_SALES_CSV = `date,product,quantity,revenue,region,channel
2025-12-02,GOAT Rockerz 550,55,82445,South,Online
2025-12-05,GOAT Rockerz 550,52,77948,North,Retail
2025-12-08,GOAT Airdopes 141,75,97425,South,Online
2025-12-10,GOAT Rockerz 550,54,80946,West,Online
2025-12-12,GOAT Nirvana 751,58,202942,North,Retail
2025-12-15,GOAT Rockerz 550,50,74950,South,Retail
2025-12-18,GOAT Airdopes 141,80,103920,East,Online
2025-12-20,GOAT Rockerz 550,53,79447,North,Online
2025-12-22,GOAT Nirvana 751,62,216938,West,Retail
2025-12-25,GOAT Rockerz 550,51,76449,East,Online
2025-12-28,GOAT Airdopes 141,82,106518,South,Retail
2025-12-30,GOAT Rockerz 550,55,82445,West,Retail
2025-12-31,GOAT Nirvana 751,65,227435,South,Online`;

// January Sales: GOAT Rockerz 550 drops ~24% MoM (unit price ₹1,499)
export const JANUARY_SALES_CSV = `date,product,quantity,revenue,region,channel
2026-01-02,GOAT Rockerz 550,45,67455,South,Online
2026-01-05,GOAT Rockerz 550,40,59960,North,Retail
2026-01-08,GOAT Airdopes 141,80,103920,South,Online
2026-01-10,GOAT Rockerz 550,35,52465,West,Online
2026-01-12,GOAT Nirvana 751,60,209940,North,Retail
2026-01-15,GOAT Rockerz 550,38,56962,South,Retail
2026-01-18,GOAT Airdopes 141,85,110415,East,Online
2026-01-20,GOAT Rockerz 550,42,62958,North,Online
2026-01-22,GOAT Nirvana 751,65,227435,West,Retail
2026-01-25,GOAT Rockerz 550,36,53964,East,Online
2026-01-28,GOAT Airdopes 141,90,116910,South,Retail
2026-01-30,GOAT Rockerz 550,44,65956,West,Retail
2026-01-31,GOAT Nirvana 751,70,244930,South,Online`;

// February Sales: after 10% price reduction on GOAT Rockerz 550 (₹1,349), units jump to 428 (+52.8%), revenue reaches ₹5,77,372 (+37.5% MoM)
export const FEBRUARY_SALES_CSV = `date,product,quantity,revenue,region,channel
2026-02-02,GOAT Rockerz 550,58,78242,South,Online
2026-02-05,GOAT Rockerz 550,62,83638,North,Retail
2026-02-08,GOAT Airdopes 141,82,106518,South,Online
2026-02-10,GOAT Rockerz 550,60,80940,West,Online
2026-02-12,GOAT Nirvana 751,64,223936,North,Retail
2026-02-15,GOAT Rockerz 550,65,87685,South,Retail
2026-02-18,GOAT Airdopes 141,86,111714,East,Online
2026-02-20,GOAT Rockerz 550,59,79591,North,Online
2026-02-22,GOAT Nirvana 751,66,230934,West,Retail
2026-02-25,GOAT Rockerz 550,61,82289,East,Online
2026-02-27,GOAT Airdopes 141,88,114312,South,Retail
2026-02-28,GOAT Rockerz 550,63,84987,West,Retail`;

// March Sales: Softening observed in GOAT Airdopes 141
export const MARCH_SALES_CSV = `date,product,quantity,revenue,region,channel
2026-03-02,GOAT Rockerz 550,62,83638,South,Online
2026-03-05,GOAT Airdopes 141,65,84435,North,Retail
2026-03-08,GOAT Airdopes 141,68,88332,South,Online
2026-03-10,GOAT Rockerz 550,64,86336,West,Online
2026-03-12,GOAT Nirvana 751,66,230934,North,Retail
2026-03-15,GOAT Airdopes 141,62,80538,South,Retail
2026-03-18,GOAT Airdopes 141,64,83136,East,Online
2026-03-20,GOAT Rockerz 550,60,80940,North,Online
2026-03-22,GOAT Nirvana 751,68,237932,West,Retail
2026-03-25,GOAT Airdopes 141,60,77940,East,Online
2026-03-28,GOAT Airdopes 141,63,81837,South,Retail
2026-03-30,GOAT Rockerz 550,65,87685,West,Retail`;
