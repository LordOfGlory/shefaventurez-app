-- Staff allowlist (first signed-in account is bootstrapped in code).
insert into settings (key, value) values ('staff_emails', '')
on conflict (key) do nothing;

insert into settings (key, value) values ('momo_number', ''), ('momo_name', 'Shefa Venturez'), ('vip_whatsapp_invite', '')
on conflict (key) do nothing;
