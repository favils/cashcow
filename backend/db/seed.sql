-- CashCow ATM Management - Seed 
-- psql "$DATABASE_URL"
-- \i backend/db/seed.sql

-- branches records
INSERT INTO branches (id, name, location_region, capacity, supervisor_id) VALUES
    (1, 'Downtown Austin Branch', 'US-Central', 30, 501),
    (2, 'Miami Beach Branch', 'US-East', 20, 502);

-- atms records
INSERT INTO atms (id, serial_number, status, model, cash_level, branch_id) VALUES
    (1, 'ATM-1001', 'Operational', 'NCR SelfServ 84', 8500, 1),
    (2, 'ATM-1002', 'Low Cash', 'Diebold Opteva 590', 400, 1),
    (3, 'ATM-1003', 'OFFLINE', 'NCR SelfServ 84', 10, 2),
    (4, 'ATM-1004', 'MAINTENANCE', 'Diebold Opteva 590', 2200, 2);

-- service_calls records
INSERT INTO service_calls (id, title, priority, status, atm_id, technician_id) VALUES
    (1, 'Cash Cassette Jam', 'Critical', 'In-Progress', 2, 701),
    (2, 'Network Connectivity Loss', 'Critical', 'Pending', 3, 702),
    (3, 'Scheduled Maintenance', 'Low', 'Completed', 4, 701),
    (4, 'Receipt Printer Error', 'Medium', 'Failed', 1, 702);

-- diagnostic_reports records
INSERT INTO diagnostic_reports (id, service_call_id, file_url, notes) VALUES
    (1, 1, 's3://cashcow-diagnostics/atm1002-cassette-001.pdf', 'Cassette sensor misaligned, jam cleared manually'),
    (2, 3, 's3://cashcow-diagnostics/atm1004-maint-001.pdf', 'Routine service, no issues found');


-- Reset sequences for tables with a real SERIAL/IDENTITY primary key
SELECT setval('branches_id_seq', (SELECT MAX(id) FROM branches));
SELECT setval('atms_id_seq', (SELECT MAX(id) FROM atms));

-- NOTE: service_calls.id and diagnostic_reports.id are not primary_key columns
-- in their SQLAlchemy models, so no sequence exists for them yet.
-- Once that's fixed, add:
-- SELECT setval('service_calls_id_seq', (SELECT MAX(id) FROM service_calls));
-- SELECT setval('diagnostic_reports_id_seq', (SELECT MAX(id) FROM diagnostic_reports));
