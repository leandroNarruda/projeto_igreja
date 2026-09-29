-- RenameColumn
ALTER TABLE "Biblia" RENAME COLUMN "verso" TO "enunciado";

-- Seed initial Bible questions
INSERT INTO "Biblia" (
    "enunciado",
    "alternativaA",
    "alternativaB",
    "alternativaC",
    "alternativaD",
    "alternativaE",
    "respostaCorreta",
    "ranking",
    "updatedAt"
) VALUES
(
    'Quem construiu a arca para sobreviver ao dilúvio?',
    'Abraão',
    'Moisés',
    'Noé',
    'Davi',
    'Elias',
    'C',
    1,
    CURRENT_TIMESTAMP
),
(
    'Qual foi o primeiro livro da Bíblia?',
    'Êxodo',
    'Gênesis',
    'Levítico',
    'Mateus',
    'Salmos',
    'B',
    2,
    CURRENT_TIMESTAMP
),
(
    'Quem foi lançado na cova dos leões?',
    'José',
    'Daniel',
    'Sansão',
    'Jonas',
    'Pedro',
    'B',
    3,
    CURRENT_TIMESTAMP
),
(
    'Qual discípulo negou Jesus três vezes?',
    'João',
    'Tiago',
    'Pedro',
    'Tomé',
    'André',
    'C',
    4,
    CURRENT_TIMESTAMP
),
(
    'Em que cidade Jesus nasceu?',
    'Nazaré',
    'Jerusalém',
    'Belém',
    'Cafarnaum',
    'Betânia',
    'C',
    5,
    CURRENT_TIMESTAMP
),
(
    'Quem recebeu os Dez Mandamentos no monte Sinai?',
    'Josué',
    'Moisés',
    'Arão',
    'Samuel',
    'Ezequiel',
    'B',
    6,
    CURRENT_TIMESTAMP
),
(
    'Qual profeta foi engolido por um grande peixe?',
    'Isaías',
    'Jeremias',
    'Jonas',
    'Amós',
    'Oséias',
    'C',
    7,
    CURRENT_TIMESTAMP
),
(
    'Quem derrotou Golias?',
    'Saul',
    'Davi',
    'Salomão',
    'Jônatas',
    'Gideão',
    'B',
    8,
    CURRENT_TIMESTAMP
),
(
    'Qual era o ofício de José, pai terreno de Jesus?',
    'Pescador',
    'Pastor',
    'Carpinteiro',
    'Sacerdote',
    'Cobrador de impostos',
    'C',
    9,
    CURRENT_TIMESTAMP
),
(
    'Quem foi vendido pelos próprios irmãos?',
    'Isaque',
    'Jacó',
    'José',
    'Benjamim',
    'Esaú',
    'C',
    10,
    CURRENT_TIMESTAMP
),
(
    'Qual livro bíblico fala principalmente dos cânticos e orações de Davi?',
    'Provérbios',
    'Salmos',
    'Eclesiastes',
    'Cantares',
    'Jó',
    'B',
    11,
    CURRENT_TIMESTAMP
),
(
    'Quem batizou Jesus no rio Jordão?',
    'João Batista',
    'Pedro',
    'Paulo',
    'Tiago',
    'Filipe',
    'A',
    12,
    CURRENT_TIMESTAMP
),
(
    'Qual foi o primeiro milagre de Jesus registrado em João?',
    'Multiplicar pães',
    'Curar um cego',
    'Transformar água em vinho',
    'Acalmar a tempestade',
    'Ressuscitar Lázaro',
    'C',
    13,
    CURRENT_TIMESTAMP
),
(
    'Quem liderou o povo de Israel na entrada da terra prometida?',
    'Moisés',
    'Josué',
    'Calebe',
    'Gideão',
    'Samuel',
    'B',
    14,
    CURRENT_TIMESTAMP
),
(
    'Qual apóstolo ficou conhecido como missionário entre os gentios?',
    'Pedro',
    'João',
    'Paulo',
    'Tiago',
    'Tomé',
    'C',
    15,
    CURRENT_TIMESTAMP
),
(
    'Quem interpretou sonhos no Egito e se tornou governador?',
    'Daniel',
    'José',
    'Moisés',
    'Neemias',
    'Esdras',
    'B',
    16,
    CURRENT_TIMESTAMP
),
(
    'Quantos livros há no Novo Testamento?',
    '24',
    '25',
    '26',
    '27',
    '39',
    'D',
    17,
    CURRENT_TIMESTAMP
),
(
    'Qual mulher foi rainha e ajudou a salvar seu povo?',
    'Rute',
    'Ester',
    'Débora',
    'Miriã',
    'Ana',
    'B',
    18,
    CURRENT_TIMESTAMP
),
(
    'Quem foi chamado por Deus ainda menino enquanto servia no templo?',
    'Samuel',
    'Davi',
    'Salomão',
    'Elias',
    'Eliseu',
    'A',
    19,
    CURRENT_TIMESTAMP
),
(
    'Qual é o último livro da Bíblia?',
    'Judas',
    'Hebreus',
    'Apocalipse',
    'Atos',
    'Romanos',
    'C',
    20,
    CURRENT_TIMESTAMP
);
