---
title: Data Storage Location
summary: "Where Supersedure Studio stores your SQL queries and connections when you save them."
old_url: "https://docs.supersedurestudio.io/docs/deep-dive-overview"
---

When you save connections and SQL queries in Supersedure Studio they are persisted to a SQLite database in the application configuration directory.

## Database Location

The database is named `app.db` and is stored in the `userData` folder which the operating system provides for Supersedure Studio to store settings and preferences.

### UserData directory locations:

- Windows: `<User Directory>\AppData\Roaming\supersedure-studio`
- MacOS: `~/Library/Application Support/Supersedure Studio`
    - Note: The ~/Library directory is typically hidden in Finder. However, you can use Go -> Go to Folder to open this directory.
- Linux: `~/.config/supersedure-studio`

## Access the Supersedure Studio Database....From Supersedure Studio

If you navigate to `Help -> Add Supersedure's Database` the app will add a new database connection for you to use - Supersedure's database itself.

You can use this connection to explore your saved data, export SQL queries, or do whatever you need.
