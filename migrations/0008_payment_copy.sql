-- Generic "Pay by bank" labels. Mobile money uses the company WhatsApp number.
update settings set value = '', updated_at = now()
  where key = 'bank_name' and value = 'I&M Bank';

update settings set value = '0763533786', updated_at = now()
  where key = 'momo_number' and (value is null or value = '');

update settings set value = 'Shefa Venturez', updated_at = now()
  where key = 'momo_name' and (value is null or value = '');

update site_pages
set
  body = replace(replace(body,
    'Academy fees are paid to Shefa Venturez I&M Bank accounts (USD or UGX) or Uganda MTN / Airtel mobile money.',
    'Academy fees are paid by bank transfer (USD or UGX) or Uganda mobile money.'),
    'A place is confirmed after we see the payment on I&M Bank or Uganda mobile money.',
    'A place is confirmed after we see the payment by bank transfer or Uganda mobile money.'),
  lede = replace(lede,
    'Pay to Shefa Venturez I&M Bank accounts (USD worldwide, UGX in Uganda) or Uganda MTN / Airtel.',
    'Pay by bank (USD worldwide, UGX in Uganda) or Uganda mobile money.'),
  updated_at = now()
where body like '%I&M%' or lede like '%I&M%';

update programs
set body = replace(body,
  'A place is confirmed after we see the payment on I&M Bank or Uganda mobile money.',
  'A place is confirmed after we see the payment by bank transfer or Uganda mobile money.'),
  updated_at = now()
where body like '%I&M%';
