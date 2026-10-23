import sqlite3

def migrate():
    conn = sqlite3.connect('examlens.db')
    c = conn.cursor()
    c.execute("PRAGMA table_info(Flashcard)")
    cols = c.fetchall()
    print("Initial cols:", cols)

    # Check if note_id is nullable (cols[1][3] is 'notnull' flag: 0 if nullable, 1 if NOT NULL)
    if cols and cols[1][3] == 1:
        print("Migrating Flashcard table to make note_id nullable...")
        c.execute("""
            CREATE TABLE Flashcard_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                note_id INTEGER NULL REFERENCES Note(id) ON DELETE CASCADE,
                front VARCHAR NOT NULL,
                back VARCHAR NOT NULL,
                linked_question_id INTEGER NULL REFERENCES Question(id) ON DELETE SET NULL
            );
        """)
        c.execute("""
            INSERT INTO Flashcard_new (id, note_id, front, back, linked_question_id)
            SELECT id, note_id, front, back, linked_question_id FROM Flashcard;
        """)
        c.execute("DROP TABLE Flashcard;")
        c.execute("ALTER TABLE Flashcard_new RENAME TO Flashcard;")
        conn.commit()
        print("Migration complete!")
    else:
        print("Flashcard table already allows nullable note_id.")

    c.execute("PRAGMA table_info(Flashcard)")
    print("Final cols:", c.fetchall())
    conn.close()

if __name__ == "__main__":
    migrate()
