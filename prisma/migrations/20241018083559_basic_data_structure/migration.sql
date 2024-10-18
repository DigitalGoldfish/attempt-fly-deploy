-- CreateTable
CREATE TABLE "MailAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentType" TEXT NOT NULL,
    "blob" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mailId" TEXT NOT NULL,
    CONSTRAINT "MailAttachment_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sender" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forwardedTo" TEXT,
    "forwardedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "blob" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Incoming" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "documentId" TEXT,
    "type" TEXT NOT NULL,
    "bereich" TEXT NOT NULL,
    "mitarbeiter" TEXT NOT NULL,
    "kundennr" TEXT,
    "neuanlage" BOOLEAN NOT NULL,
    "kvnotwendig" BOOLEAN NOT NULL,
    "orderNr" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "printed" BOOLEAN NOT NULL,
    "printedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mailId" TEXT,
    CONSTRAINT "Incoming_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incoming_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_additionalDocuments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_additionalDocuments_A_fkey" FOREIGN KEY ("A") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_additionalDocuments_B_fkey" FOREIGN KEY ("B") REFERENCES "Incoming" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MailAttachment_mailId_idx" ON "MailAttachment"("mailId");

-- CreateIndex
CREATE UNIQUE INDEX "Incoming_documentId_key" ON "Incoming"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "_additionalDocuments_AB_unique" ON "_additionalDocuments"("A", "B");

-- CreateIndex
CREATE INDEX "_additionalDocuments_B_index" ON "_additionalDocuments"("B");
