TRUNCATE products;
INSERT INTO dataset (singleton, date, source)
VALUES (TRUE, '2026-01-01T00:00:00.000Z', 'example')
ON CONFLICT (singleton) DO UPDATE
SET date = EXCLUDED.date, source = EXCLUDED.source;
INSERT INTO products (id, pzn, kind, name, ingredient) VALUES
  ('1', '12345678', 'Tabletten', 'Ibuprofen AL 400', 'Ibuprofen'),
  ('2', '87654321', 'Tabletten', 'Paracetamol 500', 'Paracetamol'),
  ('3', '01234567', 'Kapseln', 'Omeprazol 20', 'Omeprazol'),
  ('4', '10000001', 'Tabletten', 'Acetylsalicylsäure 500', 'Acetylsalicylsäure'),
  ('5', '10000002', 'Tabletten', 'Metformin 500', 'Metformin'),
  ('6', '10000003', 'Tabletten', 'Ramipril 5', 'Ramipril'),
  ('7', '10000004', 'Tabletten', 'Amlodipin 5', 'Amlodipin'),
  ('8', '10000005', 'Tabletten', 'Simvastatin 20', 'Simvastatin'),
  ('9', '10000006', 'Tabletten', 'Bisoprolol 5', 'Bisoprolol'),
  ('10', '10000007', 'Tabletten', 'Torasemid 10', 'Torasemid'),
  ('11', '10000008', 'Kapseln', 'Amoxicillin 500', 'Amoxicillin'),
  ('12', '10000009', 'Tabletten', 'Cetirizin 10', 'Cetirizin'),
  ('13', '10000010', 'Tabletten', 'Loratadin 10', 'Loratadin'),
  ('14', '10000011', 'Tabletten', 'Pantoprazol 40', 'Pantoprazol'),
  ('15', '10000012', 'Tabletten', 'Diclofenac 50', 'Diclofenac'),
  ('16', '10000013', 'Tabletten', 'Metamizol 500', 'Metamizol'),
  ('17', '10000014', 'Tabletten', 'Levothyroxin 50', 'Levothyroxin'),
  ('18', '10000015', 'Tabletten', 'Candesartan 8', 'Candesartan'),
  ('19', '10000016', 'Kapseln', 'Pregabalin 75', 'Pregabalin'),
  ('20', '10000017', 'Tabletten', 'Metoprolol 47,5', 'Metoprolol');
