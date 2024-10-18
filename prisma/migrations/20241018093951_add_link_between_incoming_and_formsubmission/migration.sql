-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Incoming" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "documentId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'Unknown',
    "bereich" TEXT,
    "mitarbeiter" TEXT,
    "kundennr" TEXT,
    "neuanlage" BOOLEAN NOT NULL DEFAULT false,
    "kvnotwendig" BOOLEAN NOT NULL DEFAULT false,
    "orderNr" TEXT,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "printedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mailId" TEXT,
    CONSTRAINT "Incoming_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incoming_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "FormSubmission" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incoming_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Incoming" ("bereich", "comment", "createdAt", "documentId", "id", "kundennr", "kvnotwendig", "mailId", "mitarbeiter", "neuanlage", "orderNr", "printed", "printedAt", "source", "status", "type", "updatedAt") SELECT "bereich", "comment", "createdAt", "documentId", "id", "kundennr", "kvnotwendig", "mailId", "mitarbeiter", "neuanlage", "orderNr", "printed", "printedAt", "source", "status", "type", "updatedAt" FROM "Incoming";
DROP TABLE "Incoming";
ALTER TABLE "new_Incoming" RENAME TO "Incoming";
CREATE UNIQUE INDEX "Incoming_documentId_key" ON "Incoming"("documentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
