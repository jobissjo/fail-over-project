---
title: "Docker Compose PostgreSQL Master/Slave Failover (HAProxy + PgBouncer) — Database Setup Walkthrough"
description: "A practical explanation of a Docker Compose-based Postgres architecture using 3 DB nodes, HAProxy for routing/health checks, and PgBouncer for connection pooling."
---

# Docker Compose PostgreSQL Master/Slave Failover (HAProxy + PgBouncer) — Database Setup Walkthrough

This post explains a Docker Compose database setup that runs multiple PostgreSQL nodes and places **HAProxy** and **PgBouncer** in front of them, giving your application a **single stable connection endpoint** and a foundation you can extend into **true primary/replica failover**.

The examples below are based on this project structure:

- `docker-compose.yml`
- `haproxy/haproxy.cfg`
- `pgbouncer/pgbouncer.ini`
- `pgbouncer/userlist.txt`
- `primary/init.sql`

## 1) What are we building?

### Goals

- Keep your application configuration simple (one DB address).
- Add connection pooling to protect PostgreSQL from too many client connections.
- Route traffic only to healthy database nodes.
- Prepare for “master/slave” (primary/replica) behavior and failover.

### High-level components

- **PostgreSQL nodes**: `pg1`, `pg2`, `pg3`
- **HAProxy**: a TCP proxy that can health-check and route DB traffic
- **PgBouncer**: a connection pooler that your application connects to

## 2) Architecture & traffic flow

### Traffic flow (how requests reach the database)

Your application connects like this:

```
Application -> PgBouncer (6432) -> HAProxy (5000) -> PostgreSQL (pg1/pg2/pg3)
```

This means:

- Your app connects to **PgBouncer** on port `6432`.
- PgBouncer forwards to **HAProxy**.
- HAProxy forwards to whichever Postgres node it thinks is healthy.

## 3) Docker Compose services (walkthrough)

### PostgreSQL nodes

#### `pg1` (initial “primary” candidate)

In `docker-compose.yml`, `pg1` is configured with:

- Image: `postgres:16`
- Port mapping: `5433:5432`
- Initializes a database: `POSTGRES_DB: testdb`
- Runs `./primary/init.sql` at startup via:

```yml
volumes:
  - ./primary/init.sql:/docker-entrypoint-initdb.d/init.sql
```

#### `pg2` and `pg3` (additional nodes)

`pg2` and `pg3` also run Postgres 16:

- `pg2` maps `5434:5432`
- `pg3` maps `5435:5432`

Important: **as currently written, `pg2` and `pg3` are not configured as streaming replicas yet.**
They start as separate Postgres instances unless you add replica initialization and replication configuration.

## 4) Primary initialization (`primary/init.sql`)

Your `primary/init.sql` contains:

```sql
CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'replica_pass';

ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET hot_standby = on;
```

### Why these settings matter

- **`replicator` role**: intended for replication connections from replicas.
- **`wal_level = replica`**: enables WAL logging required for replication.
- **`max_wal_senders`**: controls how many replica connections can stream WAL.
- **`hot_standby = on`**: allows read-only queries on standby nodes.

This is a great first step—but by itself it doesn’t make `pg2` and `pg3` replicate. They still need to be explicitly configured as standbys.

## 5) HAProxy: TCP load balancing + health checks

Your HAProxy config is in `haproxy/haproxy.cfg`.

### 5.1 Write frontend (port 5000)

```haproxy
frontend postgres_write
    bind *:5000
    default_backend primary_db
```

This creates a stable endpoint for “write” traffic:

- `haproxy:5000` (inside Docker network)
- `localhost:5000` (published via compose)

### 5.2 Read frontend (port 5001) — defined but not published in compose

```haproxy
frontend postgres_read
    bind *:5001
    default_backend replica_db
```

This is intended to be used for read-only traffic. However, note:

- In `docker-compose.yml`, only `5000:5000` is published.
- If you want to access the read frontend from your host machine, you would also publish `5001:5001`.

### 5.3 Backends: which DB nodes HAProxy can route to

Both backends include all nodes. We use `option tcp-check` for basic connectivity verification:

```haproxy
backend primary_db
    option tcp-check
    tcp-check connect
    
    server pg1 pg1:5432 check
    server pg2 pg2:5432 check
    server pg3 pg3:5432 check

backend replica_db
    balance roundrobin
    option tcp-check
    tcp-check connect
    
    server pg1 pg1:5432 check
    server pg2 pg2:5432 check
    server pg3 pg3:5432 check
```

### What this means in practice

- HAProxy is performing **TCP health checks**. By using `tcp-check connect`, we ensure that the Postgres service is listening and can successfully establish a TCP handshake.
- While advanced binary checks (like sending a startup packet) can verify if Postgres is fully initialized, they are often sensitive to specific version handshakes or SSL requirements.
- A simple TCP check is generally more reliable for basic high-availability, confirming that the container and the database process are running and accessible.

## 6) PgBouncer: the single entry point your app should use

PgBouncer is configured in `pgbouncer/pgbouncer.ini`:

```ini
[databases]
testdb = host=haproxy port=5000 dbname=testdb

[pgbouncer]
listen_port = 6432
listen_addr = 0.0.0.0

auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt

pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

### Why PgBouncer is valuable

- PostgreSQL doesn’t like thousands of concurrent connections.
- PgBouncer keeps a smaller pool of server connections and multiplexes client traffic.
- `pool_mode = transaction` is commonly used in APIs because connections are released after each transaction.

### Authentication note

Your `pgbouncer/userlist.txt` is:

```txt
"postgres" "postgres"
```

With `auth_type = md5`, PgBouncer typically expects MD5-hashed passwords. Depending on image behavior and settings, plain passwords may or may not work the way you expect—so it’s worth verifying authentication is working correctly in your environment.

## 7) How to connect (what your app should use)

Instead of connecting directly to `pg1/pg2/pg3`, connect to PgBouncer:

- Host: `127.0.0.1` (from your host machine)
- Port: `6432`
- Database: `testdb`
- User: `postgres`
- Password: `postgres`

Example DSN:

```text
postgres://postgres:postgres@127.0.0.1:6432/testdb
```

## 8) Testing “failover” behavior (what you can test today)

You can test the “routing to healthy nodes” aspect like this:

1. Start services:

   ```bash
   docker compose up -d
   ```

2. Connect your client to PgBouncer (`localhost:6432`) and run a simple query.

3. Stop a node (example: `pg1`):

   ```bash
   docker stop pg1
   ```

If HAProxy sees `pg2` or `pg3` as healthy, it can route traffic to them.

### But does this guarantee data continuity?

Not yet. Because `pg2` and `pg3` are not configured as replicas in the current setup, failing over to them may mean connecting to a different database state.

## 9) What’s missing for a true master/slave failover

To turn this into a real primary/replica failover architecture, you typically add:

### 9.1 Real streaming replication

- `pg2` and `pg3` must be configured as standbys:
  - base backup from primary (`pg_basebackup`)
  - `primary_conninfo`
  - `standby.signal`
  - appropriate `pg_hba.conf` rules

### 9.2 Role-aware routing in HAProxy

- “Write” backend should only include the primary node.
- “Read” backend should only include replicas.
- This usually requires a check like:
  - primary: `pg_is_in_recovery() = false`
  - replica: `pg_is_in_recovery() = true`

### 9.3 Automatic promotion on primary failure

Common approaches:

- Patroni
- repmgr
- Stolon
- Custom orchestration (not recommended without careful safeguards)

## 10) Practical improvements you can do next

- Publish HAProxy read port:
  - Add `5001:5001` in `docker-compose.yml` for the `haproxy` service.
- Make HAProxy primary/replica aware using SQL checks.
- Configure `pg2` and `pg3` as real replicas (base backup + standby signal + replication settings).
- Use proper secrets and stronger credentials.

## Conclusion

This Docker Compose setup provides:

- Multiple Postgres nodes ready to be used behind a proxy
- HAProxy health-checked routing
- PgBouncer connection pooling and a stable endpoint for your application

It’s an excellent foundation. With a few additions—standby configuration, role-aware routing, and promotion tooling—you can evolve it into a robust master/slave failover database architecture suitable for real-world usage.
