-- Stronger homepage copy (matches the public Tesla-like site).
update site_pages
set
  heading = 'We build the systems, defend them, and train the people who keep both running.',
  lede = 'Shefa Venturez is a Uganda technology practice for organisations that need software they can operate, security work that stays legal, and academy training that does not split attention. New academy students enroll every month.',
  cta_label = 'Talk to an expert',
  updated_at = now()
where slug = 'home';
