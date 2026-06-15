-- 036_seed_catalyst_fellows.sql
-- Seed the Catalyst Fellows roster from the Fellowship Tracker (June 2026).
-- Emails are the login match: when a fellow signs into AgriPro with this email
-- and opens /fellowship/portal, their record links automatically.
-- Re-runnable: ON CONFLICT(email) refreshes role/country/designation without
-- touching anything the fellow has already filled in themselves.

INSERT INTO public.catalyst_fellows (slug, full_name, email, designation, role_in_agripro, country)
VALUES
  -- Director
  ('araba-andoh',                'Araba Andoh',                 'helloarabaandoh@gmail.com',        'director', 'Fellowship Director',  'Ghana'),

  -- Regional Leads
  ('persistence-gutukunhuhwa',   'Persistence Gutukunhuhwa',    'pgutukunhuhwa@gmail.com',          'fellow',   'Regional Lead',        'Zimbabwe'),
  ('chinomso-onwukwe-ibe',       'Chinomso Onwukwe-Ibe',        'nomso.global@gmail.com',           'fellow',   'Regional Lead',        'Nigeria'),
  ('fridah-jebowen-keitany',     'Fridah Jebowen Keitany',      'fridahjebowen@gmail.com',          'fellow',   'Regional Lead',        'Kenya'),

  -- Operations Fellows
  ('clemencia-laadi-atengkpieng','Clemencia Laadi Atengkpieng', 'atengclemencia97@gmail.com',       'fellow',   'Operations Fellow',    'Ghana'),
  ('beryl-atieno-onyango',       'Beryl Atieno Onyango',        'aberyl046@gmail.com',              'fellow',   'Operations Fellow',    'Kenya'),
  ('chidimma-ibeagwa',           'Chidimma Ibeagwa',            'chidimmajoyibeagwa@gmail.com',     'fellow',   'Operations Fellow',    'Nigeria'),
  ('venus-vimbai-nheya',         'Venus Vimbai Nheya',          'nheyav@gmail.com',                 'fellow',   'Operations Fellow',    'Zimbabwe'),
  ('evelyne-niyigena-irahoza',   'Evelyne Niyigena Irahoza',    'niyigenaev235@gmail.com',          'fellow',   'Operations Fellow',    'Rwanda'),
  ('nuwagaba-faith',             'Nuwagaba Faith',              'faithnuwa88@gmail.com',            'fellow',   'Operations Fellow',    'Uganda'),
  ('gesuokon-gloria',            'Gesuokon Gloria',             'gloriagesuokon@gmail.com',         'fellow',   'Operations Fellow',    'Ghana'),

  -- Partnerships Fellows
  ('aminata-ouattara',           'Aminata Ouattara',            'dan.agro.bf@gmail.com',            'fellow',   'Partnerships Fellow',  'Burkina Faso'),
  ('abdoul-mansour-ouro-dami',   'Abdoul-Mansour Ouro-Dami',    'mansourourodami190@gmail.com',     'fellow',   'Partnerships Fellow',  'Togo'),
  ('micheal-delali-tachie',      'Micheal Delali Tachie',       'mdtachie@gmail.com',               'fellow',   'Partnerships Fellow',  'Ghana'),
  ('sharon-wambui',              'Sharon Wambui',               'sharoncpa09@gmail.com',            'fellow',   'Partnerships Fellow',  'Kenya'),

  -- Comms Fellows
  ('mbambu-joselyne-kimberly',   'Mbambu Joselyne Kimberly',    'mjkimgh@gmail.com',                'fellow',   'Comms Fellow',         'Uganda'),
  ('dorcase-lesly-nana-tounda',  'Dorcase Lesly Nana Tounda',   'd.nanatoun@alustudent.com',        'fellow',   'Comms Fellow',         'Rwanda'),
  ('esther-fortune',             'Esther Fortune',              'esthercheps888@gmail.com',         'fellow',   'Comms Fellow',         'Kenya'),
  ('dora-naana-addotey',         'Dora Naana Addotey',          'naanaedwynns@gmail.com',           'fellow',   'Comms Fellow',         'Ghana'),

  -- Outreach Fellows
  ('timilehin-faith-ola-olowoyo','Timilehin Faith Ola-Olowoyo', 'olowoyotf@gmail.com',              'fellow',   'Outreach Fellow',      'Nigeria'),
  ('tatenda-everjoy-muwomo',     'Tatenda Everjoy Muwomo',      'muwomotatendaeverjoy@gmail.com',   'fellow',   'Outreach Fellow',      'Zimbabwe'),
  ('niyibikora-thabita',         'Niyibikora Thabita',          'niyithabita@gmail.com',            'fellow',   'Outreach Fellow',      'Rwanda'),
  ('nancy-nalova',               'Nancy Nalova',                'nalovanancy1@gmail.com',           'fellow',   'Outreach Fellow',      'Cameroon'),
  ('umutoniwase-ange',           'Umutoniwase Ange',            'umutoniwaseange5@gmail.com',       'fellow',   'Outreach Fellow',      'Rwanda'),
  ('dusabinema-claire',          'Dusabinema Claire',           'dusabinemaclaire@gmail.com',       'fellow',   'Outreach Fellow',      'Rwanda'),
  ('mourene-francis-luhende',    'Mourene Francis Luhende',     'mourenefrancis@yahoo.com',         'fellow',   'Outreach Fellow',      'Tanzania'),
  ('grace-wairimu-maranga',      'Grace Wairimu Maranga',       'gracewnginga@gmail.com',           'fellow',   'Outreach Fellow',      'Kenya'),
  ('duke-ogeto-jesai',           'Duke Ogeto Jesai',            'dukejesai2017@gmail.com',          'fellow',   'Outreach Fellow',      'Kenya'),
  ('binta-bilal',                'Binta Bilal',                 'bilalbinta@gmail.com',             'fellow',   'Outreach Fellow',      'Nigeria')
ON CONFLICT (email) DO UPDATE SET
  designation     = EXCLUDED.designation,
  role_in_agripro = EXCLUDED.role_in_agripro,
  country         = COALESCE(public.catalyst_fellows.country, EXCLUDED.country);

-- Chinomso has a second email in the tracker; note it so admins can switch the
-- login email if she signs up with the other one.
UPDATE public.catalyst_fellows
SET admin_notes = COALESCE(admin_notes || E'\n', '') || 'Alt email from tracker: nomsoplc@gmail.com'
WHERE email = 'nomso.global@gmail.com'
  AND (admin_notes IS NULL OR admin_notes NOT LIKE '%nomsoplc@gmail.com%');
