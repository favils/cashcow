-- CashCow ATM Management - Seed Data
--   1. Low Cash Alert          -> atms.cash_level < 20, status != 'OFFLINE'
--   2. Co-Location Discrepancy -> service_calls joined to atms/technicians where branch_id differs
--   3. Reliability Metrics     -> service_calls.status (Completed/Failed) grouped by atms.model
--   4. Maintenance Flags       -> % of atms per branch with status = 'MAINTENANCE'
--   5. Reporting Lines         -> technicians (via branches.supervisor_id) with active service_calls
--
-- psql "$DATABASE_URL"
-- \i backend/db/seed.sql

-- ============================================================
-- branches
-- addreses 5. supervisor 501 covers two branches (Austin + Denver) on purpose
-- ============================================================
INSERT INTO branches (id, name, location_region, capacity, supervisor_id) VALUES
    (1, 'Downtown Austin Branch',   'US-Central', 30, 501),
    (2, 'Miami Beach Branch',       'US-East',    20, 502),
    (3, 'Denver Foothills Branch',  'US-Central', 25, 501),
    (4, 'Seattle Waterfront Branch','US-West',    15, 503);

-- ============================================================
-- technicians
-- 101/102/103 report (via branch) to supervisor 501
-- 104 -> supervisor 502, 105 -> supervisor 503
-- ============================================================
INSERT INTO technicians (id, name, branch_id) VALUES
    (101, 'A. Rivera', 1),
    (102, 'B. Nguyen', 1),
    (103, 'C. Osei',   3),
    (104, 'D. Kim',    2),
    (105, 'E. Palmer', 4);

-- ============================================================
-- atms
-- Branch 1 (Austin):  4 atms, 1 in MAINTENANCE -> 25%  (below 30% threshold)
-- Branch 2 (Miami):   3 atms, 2 in MAINTENANCE -> 67%  (flags branch)
-- Branch 3 (Denver):  2 atms, 1 in MAINTENANCE -> 50%  (flags branch)
-- Branch 4 (Seattle): 3 atms, 0 in MAINTENANCE -> 0%
-- cash_level is a 0-100 percentage (matches ATMBase.cash_level Decimal ge=0/le=100
-- and the /atm?max_cash= query param) -- NOT a dollar amount.
-- Low-cash (<20%) atms below: 2 (12%), 9 (18%), 12 (15%)
-- ============================================================
INSERT INTO atms (id, serial_number, status, model, cash_level, branch_id) VALUES
    (1,  'ATM-1001', 'Operational', 'NCR SelfServ 84',    85, 1),
    (2,  'ATM-1002', 'Low Cash',    'Diebold Opteva 590', 12, 1),
    (3,  'ATM-1003', 'MAINTENANCE', 'NCR SelfServ 84',    55, 1),
    (4,  'ATM-1004', 'Operational', 'Hyosung Halo II',    90, 1),

    (5,  'ATM-2001', 'MAINTENANCE', 'Diebold Opteva 590', 30, 2),
    (6,  'ATM-2002', 'MAINTENANCE', 'NCR SelfServ 84',    60, 2),
    (7,  'ATM-2003', 'Operational', 'Diebold Opteva 590', 95, 2),

    (8,  'ATM-3001', 'MAINTENANCE', 'Hyosung Halo II',    40, 3),
    (9,  'ATM-3002', 'Operational', 'NCR SelfServ 84',    18, 3),

    (10, 'ATM-4001', 'Operational', 'Diebold Opteva 590', 70, 4),
    (11, 'ATM-4002', 'OFFLINE',     'Hyosung Halo II',     5, 4),
    (12, 'ATM-4003', 'Low Cash',    'NCR SelfServ 84',    15, 4);

-- ============================================================
-- service_calls
-- Mix of same-branch (clean) and cross-branch (discrepancy) technician/atm pairs,
-- multiple Completed/Failed per model for the reliability ratio, and a handful of
-- Pending/In-Progress ("active") calls spread across supervisors for question 5.
--
-- Reliability tally this produces:
--   NCR SelfServ 84:    3 Completed / 2 Failed
--   Diebold Opteva 590: 2 Completed / 2 Failed
--   Hyosung Halo II:    2 Completed / 1 Failed
--
-- Co-location discrepancies (technician branch != atm branch): calls 3 and 7
-- ============================================================
INSERT INTO service_calls (id, title, priority, status, atm_id, technician_id) VALUES
    (1,  'Cash Cassette Jam',            'Critical', 'Completed',   2,  101),  -- branch1/branch1
    (2,  'Network Connectivity Loss',    'Critical', 'Failed',      5,  104),  -- branch2/branch2
    (3,  'Software Update',              'Low',      'Completed',  7,  102),  -- DISCREPANCY: branch2 atm / branch1 tech
    (4,  'Receipt Printer Error',        'Medium',   'Failed',     10,  105),  -- branch4/branch4
    (5,  'Card Reader Fault',            'Critical', 'Completed',  1,  101),  -- branch1/branch1
    (6,  'Firmware Upgrade',             'Low',      'Completed',  3,  102),  -- branch1/branch1
    (7,  'Dispenser Jam',                'Critical', 'Failed',      6,  103),  -- DISCREPANCY: branch2 atm / branch3 tech
    (8,  'Routine Inspection',           'Low',      'Completed',  9,  103),  -- branch3/branch3
    (9,  'Card Reader Fault - Recheck',  'Medium',   'Failed',     12,  105),  -- branch4/branch4
    (10, 'Vibration Sensor Check',       'Medium',   'Completed',  4,  101),  -- branch1/branch1
    (11, 'Camera Alignment',             'Low',      'Completed',  8,  103),  -- branch3/branch3
    (12, 'Cooling Fan Replacement',      'Critical', 'Failed',     11,  105),  -- branch4/branch4

    -- active calls (Pending / In-Progress) for the reporting-lines question:
    -- supervisor 501 -> technicians 101 & 103 have active calls, 102 does not
    (13, 'Cash Cassette Refill',         'Critical', 'Pending',     2,  101),
    (14, 'Card Skimmer Investigation',   'Critical', 'In-Progress', 9,  103),
    (15, 'Battery Replacement',          'Medium',   'Pending',    10,  105),
    (16, 'Network Diagnostics',          'Low',      'In-Progress', 5,  104);

-- ============================================================
-- diagnostic_reports
-- ============================================================
INSERT INTO diagnostic_reports (id, service_call_id, file_url, notes) VALUES
    (1, 1,  's3://cashcow-diagnostics/atm1002-cassette-001.pdf', 'Cassette sensor misaligned, jam cleared manually'),
    (2, 2,  's3://cashcow-diagnostics/atm2001-network-001.pdf',  'Modem unresponsive, escalated to network team'),
    (3, 5,  's3://cashcow-diagnostics/atm1001-card-001.pdf',     'Card reader contacts cleaned, fault resolved'),
    (4, 8,  's3://cashcow-diagnostics/atm3002-inspect-001.pdf',  'Routine inspection, no issues found'),
    (5, 10, 's3://cashcow-diagnostics/atm1004-vibration-001.pdf','Vibration within tolerance');

-- ============================================================
-- users (for exercising RBAC / login)
-- password for all three demo accounts: Password123!
-- ============================================================
INSERT INTO users (id, username, hashed_password, role) VALUES
    (1, 'admin_ops',   '$2b$12$uYkHGQGocd.bon6XhzKpWO6b0q11A.Iv/x8AlZFYkJSC1E7D0JRjW', 'Operations Admin'),
    (2, 'tech_rivera', '$2b$12$o9278PneshSoB5rXu8C.5eLxMv2RMXFENW9OGQcKYbw4dNKhktrkO', 'Field Technician'),
    (3, 'auditor_lee', '$2b$12$Ua/4//.K381/zib7OUFHT.3Iynpae3azk6Q.UGxsgdiFJ1pazRumu', 'Auditor');

-- ============================================================
-- Reset sequences so future inserts via the API don't collide with these ids
-- ============================================================
SELECT setval('branches_id_seq',         (SELECT MAX(id) FROM branches));
SELECT setval('technicians_id_seq',      (SELECT MAX(id) FROM technicians));
SELECT setval('atms_id_seq',             (SELECT MAX(id) FROM atms));
SELECT setval('service_calls_id_seq',    (SELECT MAX(id) FROM service_calls));
SELECT setval('diagnostic_reports_id_seq', (SELECT MAX(id) FROM diagnostic_reports));
SELECT setval('users_id_seq',            (SELECT MAX(id) FROM users));
