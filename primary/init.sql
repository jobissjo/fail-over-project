CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'replica_pass';

ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET hot_standby = on;