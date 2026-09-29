/**
 * Sample datasets perfectly crafted for the Hackathon demo story.
 *
 * Story progression:
 * 1. Base / Dec data: Normal operations across Product A, Product B, Product C.
 * 2. January data: Product A revenue drops ~18% (Situation detected!).
 *    - User records decision: 10% price reduction on Product A to counter competitor pressure (Retained into Hindsight).
 * 3. February data: Product A revenue surges +21.4% (Outcome evaluated!).
 *    - System calculates +21.4% growth vs expected +15%, marks strategy successful, retains experience into Hindsight!
 * 4. March data: Product B shows declining sales. User asks: "Should we reduce Product B's price?"
 *    - Hindsight Recalls and Reflects on Product A's pricing experience, comparing margins and elasticity!
 */

export const JANUARY_SALES_CSV = `date,product,quantity,revenue,region,channel
2026-01-02,Product A,45,45000,South,Online
2026-01-05,Product A,40,40000,North,Retail
2026-01-08,Product B,80,96000,South,Online
2026-01-10,Product A,35,35000,West,Online
2026-01-12,Product C,60,72000,North,Retail
2026-01-15,Product A,38,38000,South,Retail
2026-01-18,Product B,85,102000,East,Online
2026-01-20,Product A,42,42000,North,Online
2026-01-22,Product C,65,78000,West,Retail
2026-01-25,Product A,36,36000,East,Online
2026-01-28,Product B,90,108000,South,Retail
2026-01-30,Product A,44,44000,West,Retail
2026-01-31,Product C,70,84000,South,Online`;

// Previous baseline period (e.g. December) for Product A: ~4,20,000 revenue
export const DECEMBER_SALES_CSV = `date,product,quantity,revenue,region,channel
2025-12-02,Product A,55,55000,South,Online
2025-12-05,Product A,52,52000,North,Retail
2025-12-08,Product B,75,90000,South,Online
2025-12-10,Product A,54,54000,West,Online
2025-12-12,Product C,58,69600,North,Retail
2025-12-15,Product A,50,50000,South,Retail
2025-12-18,Product B,80,96000,East,Online
2025-12-20,Product A,53,53000,North,Online
2025-12-22,Product C,62,74400,West,Retail
2025-12-25,Product A,51,51000,East,Online
2025-12-28,Product B,82,98400,South,Retail
2025-12-30,Product A,55,55000,West,Retail
2025-12-31,Product C,65,78000,South,Online`;

// February Sales: after 10% price drop (unit price 900 instead of 1000), quantity jumps to ~480 units, revenue reaches ~₹4,32,000 (+21.4% MoM)
export const FEBRUARY_SALES_CSV = `date,product,quantity,revenue,region,channel
2026-02-02,Product A,58,52200,South,Online
2026-02-05,Product A,62,55800,North,Retail
2026-02-08,Product B,82,98400,South,Online
2026-02-10,Product A,60,54000,West,Online
2026-02-12,Product C,64,76800,North,Retail
2026-02-15,Product A,65,58500,South,Retail
2026-02-18,Product B,86,103200,East,Online
2026-02-20,Product A,59,53100,North,Online
2026-02-22,Product C,66,79200,West,Retail
2026-02-25,Product A,61,54900,East,Online
2026-02-27,Product B,88,105600,South,Retail
2026-02-28,Product A,63,56700,West,Retail`;

export const MARCH_SALES_CSV = `date,product,quantity,revenue,region,channel
2026-03-02,Product A,62,55800,South,Online
2026-03-05,Product B,65,78000,North,Retail
2026-03-08,Product B,68,81600,South,Online
2026-03-10,Product A,64,57600,West,Online
2026-03-12,Product C,66,79200,North,Retail
2026-03-15,Product B,62,74400,South,Retail
2026-03-18,Product B,64,76800,East,Online
2026-03-20,Product A,60,54000,North,Online
2026-03-22,Product C,68,81600,West,Retail
2026-03-25,Product B,60,72000,East,Online
2026-03-28,Product B,63,75600,South,Retail
2026-03-30,Product A,65,58500,West,Retail`;
