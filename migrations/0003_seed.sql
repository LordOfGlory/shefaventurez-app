insert into programs (slug,name,price_label,duration,summary,status,sort_order,amount_usd,amount_ugx) values
  ('it','IT Academy','$349 · ≈ UGX 1,300,000','12 weeks','Practical skills to build, operate and support websites, systems and IT work.','published',0,349,1300000),
  ('cyber','Cyber Academy','$429 · ≈ UGX 1,600,000','12 weeks','Defensive security: assessments, monitoring, response, authorization.','published',1,429,1600000),
  ('forex','Forex Academy','$299 · ≈ UGX 1,100,000','8 weeks paid','Free foundation then supervised written-plan practice. Education only.','published',2,299,1100000)
on conflict (slug) do nothing;

insert into settings (key, value) values
  ('wise_link', ''),
  ('wise_email', 'shefaventurez@outlook.com'),
  ('momo_number', '0788668652'),
  ('momo_name', 'Shefa Venturez'),
  ('vip_whatsapp_invite', ''),
  ('currency', 'USD')
on conflict (key) do nothing;

insert into articles (slug,title,category,excerpt,body,minutes,status) values
('scoping-an-it-project','How to scope an IT project so it can finish','IT','In, out, owners, and a first release that is allowed to be small.','<p>Write the user and the job in one sentence. List what is out. Name owners. First release should be smaller than the slide.</p><p>Shefa will not start build work without this written.</p>',10,'published'),
('authorized-pentest-scope','Authorized pentest scope','Cybersecurity','Written permission is the first control.','<p>Testing someone else''s system without permission is not practice. It is illegal. A usable authorization names the legal entity, the assets, the window of time, and the techniques allowed.</p>',9,'published'),
('one-program-focus','Why one academy at a time','Academy','Attention is the scarce resource in training.','<p>IT, cybersecurity and forex use different weekly habits. Payment in full for one place is an attention device. Forex still starts free. Pay only if you want supervision after that.</p>',6,'published'),
('forex-risk-first','Forex education starts with risk','Forex','A written plan before size.','<p>Nothing here is a profit guarantee. Position size and a written plan come before entries. If you cannot explain the loss you will accept, you are not ready to pay for supervision.</p>',8,'published')
on conflict (slug) do nothing;
