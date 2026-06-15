-- Supprime les notifications "Score BCX encore faible" générées avant la
-- correction du calcul de stabilité des revenus (bug : un nouveau compte
-- recevait un bonus neutre de 12,5 pts donnant un score de 15/100 au lieu
-- de ~3/100). Ces notifications affichent un ancien score incorrect.
DELETE FROM notifications WHERE message LIKE '%encore faible%/100%';
