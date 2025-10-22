# RocketSQL File Format Visualizer

This [website](https://m0hossam.github.io/rocketsql-viz/) visualizes the internal structure of the database file used in my own RDBMS ([RocketSQL](https://github.com/m0hossam/rocketsql)).

The database file consists of interleaved 512B pages, where each page represents a node in some B+ Tree structure. Each table stored in the database is stored in one B+ Tree. B+ Tree nodes have two types: interior and leaf nodes. Interior nodes contain keys (PKs of the table's rows) and pointers to other nodes/pages. Leaf nodes contain PKs and their corresponding rows. This approach is called **index-organized tables** and is popular in RDBMSs like SQLite and MySQL (InnoDB).

Refer to RocketSQL's [README](https://github.com/m0hossam/rocketsql/blob/main/README.md) to know exactly what type of SQL statements are supported and gain a deeper understanding of the file format.

This file format borrows greatly from [SQLite's File Format](https://sqlite.org/fileformat.html).

This project is heavily inspired by [SQLite's File Format Viewer](https://github.com/invisal/sqlite-internal).

Also, this was 90% vibe-coded. I suck at frontend.
