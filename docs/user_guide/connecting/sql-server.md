---
title: SQL Server
summary: "Connect to Microsoft SQL Server."
description: "Supersedure Studio connects to SQL Server with SQL logins and Domain (NTLM) authentication."
icon: material/database
---

# How To Connect to SQL Server

Supersedure Studio supports several ways to authenticate to Microsoft SQL Server.
Pick the one that matches how your server is set up:

### SQL Login

A **username and password** managed by SQL Server itself. This is the default and
works everywhere with **no extra setup**.
Choose this if your DBA gave you a SQL Server login, or for local/development
instances using `sa`.

### Domain (NTLM)

Enter a **username, password, and Domain** on the connection form. This performs
password-based **NTLM** authentication against a Windows domain account. It is

## Host, instance, and port

The **Host** field accepts the same forms SSMS does. Surrounding whitespace is trimmed,
so a pasted value with a stray space still works.

| Host | Connects to |
| --- | --- |
| `db.example.com` | The default instance, on the port in the **Port** field. |
| `localhost` | The default instance on this machine. |
| `.` | Shorthand for `localhost`. |
| `(local)` | Shorthand for `localhost`. |
| `db.example.com\SQLEXPRESS` | The named instance `SQLEXPRESS`. |

### Named instances and the SQL Server Browser

A named instance normally listens on a **dynamic port**, so its port has to be looked up
from the **SQL Server Browser** service over **UDP 1434**. Leave **Port** at the default
`1433` and that lookup happens automatically.

The browser service is often stopped, or UDP 1434 is blocked by a firewall, and the
lookup then fails with a timeout. Either:

- Start the SQL Server Browser service and allow **UDP 1434** through the firewall, or
- Give the instance a **static TCP port** in SQL Server Configuration Manager and enter
  that port in the **Port** field. Any port other than `1433` connects directly and skips
  the browser lookup entirely.

To read the port an instance is currently listening on, run this from any tool already
connected to it:

```sql
SELECT local_tcp_port FROM sys.dm_exec_connections WHERE session_id = @@SPID;
```

## Certificates

Every stock SQL Server presents a **self-signed certificate**, and the driver validates
certificates by default. New connections therefore have **Trust Server Certificate**
enabled, so a default install connects with no extra setup.

Clear the checkbox to validate the certificate against the operating system's trust
store. The server then needs a certificate issued by a certificate authority the machine
already trusts — a self-signed one is rejected.

## Connecting

1. Add a new SQL Server connection.
2. Enter the server **hostname** (or `host\instance`) and port.
3. Enter your SQL Server username and password, or a Domain for NTLM.
4. Connect.

## Troubleshooting

- **"The server presented a self-signed certificate"** — the server's certificate is not
  signed by a CA this machine trusts. Enable **Trust Server Certificate**, or install a
  trusted certificate on the server. See [Certificates](#certificates).
- **"No response from the SQL Server Browser service ... (UDP 1434)"** — the instance
  name could not be resolved to a port. See
  [Named instances and the SQL Server Browser](#named-instances-and-the-sql-server-browser).
