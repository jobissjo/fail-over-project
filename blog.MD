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

All nodes (`pg1`, `pg2`, `pg3`) now use **persistent volumes** and **health checks** to ensure data survival and reliable startup.

#### `pg1` (initial “primary” candidate)

In `docker-compose.yml`, `pg1` is configured with:

- Image: `postgres:16`
- Port mapping: `5433:5432`
- **Persistence**: Using named volume `pg1_data:/var/lib/postgresql/data`.
- **Health check**: Uses `pg_isready` to ensure the DB is fully initialized before dependent services (like HAProxy) start.
- Initializes a database: `POSTGRES_DB: testdb`
- Runs `./primary/init.sql` at startup.

#### `pg2` and `pg3` (standby candidates)

- `pg2` maps `5434:5432` with volume `pg2_data`.
- `pg3` maps `5435:5432` with volume `pg3_data`.

> [!IMPORTANT]
> **Data Persistence**: By adding named volumes, your data now survives container restarts and even `docker compose down`.
> **Startup Order**: HAProxy now waits for these Postgres nodes to be "healthy" before it begins routing traffic.

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

### 5.2 Read frontend (port 5001)

Now fully exposed in `docker-compose.yml`:
- `haproxy:5001` (internal)
- `localhost:5001` (external)

### 5.3 Backends & Service Dependencies

HAProxy now depends on the health of the underlying Postgres nodes:

```yml
depends_on:
  pg1:
    condition: service_healthy
  pg2:
    condition: service_healthy
  pg3:
    condition: service_healthy
```

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

- Make HAProxy primary/replica aware using SQL checks.
- Configure `pg2` and `pg3` as real replicas (base backup + standby signal + replication settings).
- Use proper secrets and stronger credentials.

> [!NOTE]
> **Crossing into Advanced Territory**: Up to this point, our code implements a solid "connectivity" failover. The sections below describe the limitations of this current setup and how we can solve them in our next guide using automated tools.

## 11) Limitations of this Setup

While this architecture is robust for local development and a great starting point for HA, it has several critical limitations:

### 11.1 Manual Failover Only
The setup provides **connectivity failover**, not **logic failover**. HAProxy will stop sending traffic to `pg1` if it goes down, but it will not automatically "promote" `pg2` to be a new primary. In a production environment, you would need a manager like **Patroni** or **repmgr** to handle the election of a new leader.

### 11.2 Lack of Automated Streaming Replication
Although `init.sql` prepares the primary for replication, the standby nodes (`pg2`, `pg3`) are not automatically performing a `pg_basebackup` or following the primary. Without active replication, failing over to `pg2` means you are connecting to an independent, likely empty, database.

### 11.3 Write Consistency Risks
Because HAProxy currently uses basic TCP checks, if multiple nodes are running but not replicating, a "failover" to a standby node could result in **Data Inconsistency**. Writes would go to a node that doesn't have the history of the previous primary.

### 11.4 Single Point of Failure (SPOF)
HAProxy and PgBouncer are themselves individual containers. If the `haproxy` container crashes, the entire database stack becomes unreachable, even if all Postgres nodes are healthy.

### 11.5 Transaction Mode vs Session Mode
PgBouncer is set to `pool_mode = transaction`. While efficient, this means you **cannot use session-based features** like temporary tables or certain session-level SET commands.

## Conclusion & Next Steps

This Docker Compose setup is a powerful foundation, now enhanced with **persistence** and **healthchecks**. It solves the immediate problem of data loss and connection stability during startup.

However, as we've seen, true High Availability requires automation. **In our next article, we will look at how Patroni solves these limitations** by providing automated leader election, seamless replication management, and dynamic HAProxy configuration.

Stay tuned for the next part where we take this architecture to a production-ready level!
