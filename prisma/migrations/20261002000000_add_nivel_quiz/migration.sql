ALTER TABLE "Quiz" ADD COLUMN "nivel" TEXT NOT NULL DEFAULT 'FACIL';

CREATE INDEX "Quiz_ativo_nivel_idx" ON "Quiz"("ativo", "nivel");
