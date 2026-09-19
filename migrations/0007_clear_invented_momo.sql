-- Clear a previously seeded mobile-money number that was not provided by staff.
update settings set value = '', updated_at = now()
where key = 'momo_number' and value = '0788668652';
