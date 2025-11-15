-- Popola il database con dati finti per testing

-- Post professionali (20 post variati)
INSERT INTO professional_posts (pro_id, content, post_type, visibility, likes_count, created_at) VALUES
  ('10000001-0000-0000-0000-000000000001', 'Nuovo taglio sfumato realizzato oggi! ✂️ Quando il cliente sorride così, sappiamo di aver fatto un ottimo lavoro. #haircut #barber', 'work_showcase', 'public', 45, NOW() - INTERVAL '2 hours'),
  ('10000001-0000-0000-0000-000000000001', '💡 Consiglio del giorno: Per mantenere il taglio fresco più a lungo, usa sempre shampoo senza solfati e condiziona solo le punte!', 'tip', 'public', 28, NOW() - INTERVAL '1 day'),
  ('10000001-0000-0000-0000-000000000001', '🔥 Nuova tendenza: il mullet moderno sta tornando! Chi vuole provare?', 'announcement', 'public', 15, NOW() - INTERVAL '3 days'),
  
  ('10000002-0000-0000-0000-000000000002', '🎉 Offerta Speciale! Fino a domenica, -20% su tutti i trattamenti di colorazione. Prenota subito!', 'offer', 'public', 67, NOW() - INTERVAL '3 hours'),
  ('10000002-0000-0000-0000-000000000002', 'Balayage perfetto per la primavera! ☀️ Questo è il risultato dopo 3 ore di lavoro certosino. #balayage #haircolor', 'work_showcase', 'public', 89, NOW() - INTERVAL '5 days'),
  ('10000002-0000-0000-0000-000000000002', 'Pro tip: Mai lavare i capelli colorati con acqua troppo calda! Usa acqua tiepida per far durare il colore più a lungo 💜', 'tip', 'public', 34, NOW() - INTERVAL '7 days'),
  
  ('10000003-0000-0000-0000-000000000003', 'Barba perfettamente curata oggi! 🧔 Il grooming maschile è un''arte. #barber #grooming', 'work_showcase', 'public', 52, NOW() - INTERVAL '5 hours'),
  ('10000003-0000-0000-0000-000000000003', '⚠️ Importante: Abbiamo nuovi orari! Ora siamo aperti anche la domenica mattina dalle 9 alle 13.', 'announcement', 'public', 23, NOW() - INTERVAL '2 days'),
  ('10000003-0000-0000-0000-000000000003', 'Offerta weekend: Taglio + Barba a soli €25! Valido sabato e domenica.', 'offer', 'public', 78, NOW() - INTERVAL '6 hours'),
  
  ('10000004-0000-0000-0000-000000000004', 'Hair transformation: da lungo a pixie cut! 💇‍♀️ Il cambiamento fa sempre bene. #hairtransformation', 'work_showcase', 'public', 102, NOW() - INTERVAL '1 day'),
  ('10000004-0000-0000-0000-000000000004', 'Consiglio: Se hai i capelli secchi, applica una maschera nutriente almeno una volta a settimana! I tuoi capelli ti ringrazieranno 🙏', 'tip', 'public', 41, NOW() - INTERVAL '4 days'),
  
  ('10000005-0000-0000-0000-000000000005', '✨ Piega perfetta per un evento speciale! Quando i dettagli fanno la differenza. #hairstyle #wedding', 'work_showcase', 'public', 94, NOW() - INTERVAL '8 hours'),
  ('10000005-0000-0000-0000-000000000005', '🎊 Promozione San Valentino! Pacchetto bellezza completo a €60 invece di €80. Prenota entro il 10 febbraio!', 'offer', 'public', 56, NOW() - INTERVAL '12 hours'),
  ('10000005-0000-0000-0000-000000000005', 'Tutorial: Come mantenere i ricci definiti? Usa prodotti senza siliconi e asciuga con diffusore a bassa temperatura!', 'tip', 'public', 38, NOW() - INTERVAL '6 days');

-- Recensioni per professionisti (15 recensioni)
INSERT INTO reviews (pro_id, client_id, rating, comment, created_at) VALUES
  ('10000001-0000-0000-0000-000000000001', '5bd5cd08-7ea7-42de-bfb8-8ea652cc17c6', 5, 'Fantastico! Miglior taglio che abbia mai avuto. Simone è un vero professionista e sa esattamente cosa vuoi.', NOW() - INTERVAL '3 days'),
  ('10000001-0000-0000-0000-000000000001', '5bd5cd08-7ea7-42de-bfb8-8ea652cc17c6', 5, 'Sempre impeccabile. Vado da lui da 2 anni e non mi ha mai deluso.', NOW() - INTERVAL '1 month'),
  ('10000001-0000-0000-0000-000000000001', '5bd5cd08-7ea7-42de-bfb8-8ea652cc17c6', 4, 'Ottimo servizio, ambiente pulito. Unica pecca: a volte bisogna aspettare un po''.', NOW() - INTERVAL '2 months'),
  
  ('10000002-0000-0000-0000-000000000002', '5bd5cd08-7ea7-42de-bfb8-8ea652cc17c6', 5, 'Il balayage è venuto perfetto! Sono super soddisfatta. Cristina è bravissima!', NOW() - INTERVAL '1 week'),
  ('10000002-0000-0000-0000-000000000002', '5bd5cd08-7ea7-42de-bfb8-8ea652cc17c6', 5, 'Salone bellissimo e pulitissimo. Personale gentile e professionale. Ci tornerò sicuramente.', NOW() - INTERVAL '2 weeks'),
  ('10000002-0000-0000-0000-000000000002', '5bd5cd08-7ea7-42de-bfb8-8ea652cc17c6', 4, 'Molto bravi, prezzi leggermente alti ma ne vale la pena.', NOW() - INTERVAL '3 weeks'),
  
  ('10000003-0000-0000-0000-000000000003', '5bd5cd08-7ea7-42de-bfb8-8ea652cc17c6', 5, 'Il mio barbiere di fiducia! Marco sa fare le sfumature perfette.', NOW() - INTERVAL '5 days'),
  ('10000003-0000-0000-0000-000000000003', '5bd5cd08-7ea7-42de-bfb8-8ea652cc17c6', 5, 'Ambiente rilassante, ottimo caffè e taglio impeccabile. Cosa chiedere di più?', NOW() - INTERVAL '10 days'),
  ('10000003-0000-0000-0000-000000000003', '5bd5cd08-7ea7-42de-bfb8-8ea652cc17c6', 4, 'Bravo, ma consiglio di prenotare perché è sempre pieno.', NOW() - INTERVAL '1 month'),
  
  ('10000004-0000-0000-0000-000000000004', '5bd5cd08-7ea7-42de-bfb8-8ea652cc17c6', 5, 'Ho fatto un cambio drastico e non potrei essere più felice! Laura ha capito perfettamente cosa volevo.', NOW() - INTERVAL '2 days'),
  ('10000004-0000-0000-0000-000000000004', '5bd5cd08-7ea7-42de-bfb8-8ea652cc17c6', 5, 'Professionalità top! Mi hanno consigliato il taglio perfetto per il mio viso.', NOW() - INTERVAL '2 weeks'),
  
  ('10000005-0000-0000-0000-000000000005', '5bd5cd08-7ea7-42de-bfb8-8ea652cc17c6', 5, 'Piega perfetta per il mio matrimonio! Sono rimasta così tutto il giorno. Grazie Elena!', NOW() - INTERVAL '1 week'),
  ('10000005-0000-0000-0000-000000000005', '5bd5cd08-7ea7-42de-bfb8-8ea652cc17c6', 4, 'Molto brava e attenta ai dettagli. Prezzi nella media.', NOW() - INTERVAL '3 weeks'),
  ('10000005-0000-0000-0000-000000000005', '5bd5cd08-7ea7-42de-bfb8-8ea652cc17c6', 5, 'Finalmente ho trovato una parrucchiera che sa come trattare i capelli ricci!', NOW() - INTERVAL '1 month');