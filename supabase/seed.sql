-- IGAI Phase 4 realistic Tamil Nadu proposal dataset.
-- Run in the Supabase SQL Editor as a database owner after schema.sql and the
-- Phase 3 migration. At least one real authenticated NGO profile must exist.
--
-- The script deliberately reuses a real NGO profile instead of inventing an
-- auth UUID. Fixed proposal UUIDs make repeat runs idempotent. Existing RLS is
-- unchanged; corporate users can read these submitted/review proposals through
-- the normal "Corporates can read reviewable proposals" policy.

do $$
declare
  demo_owner_id uuid;
begin
  select id
    into demo_owner_id
    from public.profiles
   where role = 'ngo'
   order by created_at, id
   limit 1;

  if demo_owner_id is null then
    raise exception 'IGAI seed requires one authenticated user with an NGO profile. Sign up an NGO user first, then rerun this file.';
  end if;

  insert into public.proposals (
    id, created_by, ngo_name, title, description,
    impact_statement, evidence_description, sector, state, district,
    latitude, longitude, requested_amount, beneficiaries, duration_months,
    impact_score, geo_need_score, feasibility_score, risk_score, evidence_score,
    status, created_at, updated_at
  ) values
    (
      '41000000-0000-4000-8000-000000000001', demo_owner_id, 'Anbu Ability Foundation',
      'Inclusive Classrooms for Children with Disabilities',
      'Equips 30 government schools with accessible learning kits, teacher training and classroom support for children with visual, hearing and mobility disabilities.',
      'Children with disabilities will participate consistently in mainstream classrooms and improve foundational learning outcomes.',
      'A two-year school pilot and district disability registry provide a strong beneficiary baseline and measured attendance gains.',
      'Education', 'Tamil Nadu', 'Chennai', 13.0827, 80.2707,
      3500000, 1800, 24, 91, 62, 83, 29, 94, 'under_review', now() - interval '18 days', now() - interval '2 days'
    ),
    (
      '41000000-0000-4000-8000-000000000002', demo_owner_id, 'Namma Digital Trust',
      'Community Digital Access Labs',
      'Creates evening digital access labs in peri-urban libraries with devices, assisted e-governance services and job-search support for first-generation users.',
      'Residents gain practical digital skills and reliable access to essential public services and employment opportunities.',
      'Local library footfall is documented, but employment outcome tracking is still being established.',
      'Digital Inclusion', 'Tamil Nadu', 'Chengalpattu', 12.6819, 79.9888,
      1200000, 7200, 18, 80, 68, 90, 22, 66, 'submitted', now() - interval '17 days', now() - interval '3 days'
    ),
    (
      '41000000-0000-4000-8000-000000000003', demo_owner_id, 'Vidiyal Child Development Society',
      'Early Learning and Nutrition Centres',
      'Strengthens anganwadi-linked early learning through play materials, caregiver sessions and nutrition screening across 42 villages.',
      'Young children enter primary school healthier and better prepared for age-appropriate learning.',
      'Baseline nutrition screening is available for 70 percent of target villages with quarterly follow-up planned.',
      'Education', 'Tamil Nadu', 'Kanchipuram', 12.8342, 79.7036,
      2200000, 4600, 30, 86, 74, 81, 31, 82, 'submitted', now() - interval '16 days', now() - interval '4 days'
    ),
    (
      '41000000-0000-4000-8000-000000000004', demo_owner_id, 'Uyir Mobile Health Alliance',
      'Mobile Healthcare Vans for Industrial Corridors',
      'Operates three diagnostic vans delivering primary care, non-communicable disease screening and referrals to underserved settlements near industrial corridors.',
      'Early diagnosis and referral will reduce avoidable complications among mobile and informal-sector families.',
      'The operating partner has five years of service data, although fuel and specialist availability create delivery risk.',
      'Healthcare', 'Tamil Nadu', 'Tiruvallur', 13.1439, 79.9089,
      4500000, 15800, 24, 94, 78, 75, 48, 88, 'under_review', now() - interval '15 days', now() - interval '1 day'
    ),
    (
      '41000000-0000-4000-8000-000000000005', demo_owner_id, 'Thiran Rural Futures',
      'Rural Skill Development Network',
      'Links six block-level training centres with local employers to deliver certified electrical, tailoring, logistics and food-processing courses.',
      'Rural youth transition into locally relevant wage employment or supported self-employment.',
      'Employer demand surveys are complete, with placement evidence available from one earlier centre.',
      'Livelihood', 'Tamil Nadu', 'Villupuram', 11.9401, 79.4861,
      3000000, 6500, 30, 85, 84, 80, 34, 79, 'submitted', now() - interval '14 days', now() - interval '4 days'
    ),
    (
      '41000000-0000-4000-8000-000000000006', demo_owner_id, 'Nalam Village Collective',
      'Community Sanitation Upgrade',
      'Repairs shared sanitation blocks, installs menstrual-waste systems and trains village committees to maintain facilities in flood-prone communities.',
      'Safe and functional sanitation will reduce exposure to waterborne disease for women, children and older residents.',
      'Village-level facility audits identify priority repairs; long-term maintenance collections remain untested.',
      'Water & Sanitation', 'Tamil Nadu', 'Cuddalore', 11.7480, 79.7714,
      1800000, 9800, 16, 83, 88, 87, 27, 74, 'submitted', now() - interval '13 days', now() - interval '5 days'
    ),
    (
      '41000000-0000-4000-8000-000000000007', demo_owner_id, 'Marutham Health Network',
      'Telemedicine Support for Primary Health Centres',
      'Adds teleconsultation equipment, nurse facilitation and referral coordination to 12 rural primary health centres serving remote habitations.',
      'Patients receive specialist advice earlier while reducing travel time and out-of-pocket costs.',
      'Hospital referral logs and a successful six-month teleconsultation pilot support the proposed operating model.',
      'Digital Inclusion', 'Tamil Nadu', 'Vellore', 12.9165, 79.1325,
      1500000, 11200, 18, 88, 75, 91, 19, 92, 'submitted', now() - interval '12 days', now() - interval '3 days'
    ),
    (
      '41000000-0000-4000-8000-000000000008', demo_owner_id, 'Arivu Renewable Learning Trust',
      'Solar Learning Centres',
      'Installs solar-powered learning rooms with offline digital content in 20 villages affected by unreliable electricity and limited after-school support.',
      'Students gain dependable evening study access and teachers can use digital learning material throughout the year.',
      'Energy audits are complete and attendance will be measured, but learning-outcome evidence is currently limited.',
      'Education', 'Tamil Nadu', 'Tiruvannamalai', 12.2253, 79.0747,
      1200000, 5200, 15, 79, 87, 89, 24, 63, 'submitted', now() - interval '11 days', now() - interval '4 days'
    ),
    (
      '41000000-0000-4000-8000-000000000009', demo_owner_id, 'Sakthi Enterprise Network',
      'Women Entrepreneurship Hubs',
      'Builds three shared production and market-access hubs for women-led food, textile and natural-product microenterprises.',
      'Women entrepreneurs increase stable household income through shared equipment, formalisation and buyer connections.',
      'Self-help group records verify demand; sales forecasts depend on buyer agreements that are still under negotiation.',
      'Women Empowerment', 'Tamil Nadu', 'Ranipet', 12.9249, 79.3333,
      2500000, 2800, 24, 87, 76, 78, 41, 76, 'submitted', now() - interval '10 days', now() - interval '2 days'
    ),
    (
      '41000000-0000-4000-8000-000000000010', demo_owner_id, 'Ilamai Wellness Foundation',
      'Adolescent Mental Health and Wellness Program',
      'Trains school counsellors, runs confidential referral clinics and equips teachers to identify early signs of distress among adolescents.',
      'Students access timely psychosocial support and schools develop safer referral pathways for vulnerable adolescents.',
      'A validated screening tool is planned, although specialist retention and referral completion are material risks.',
      'Healthcare', 'Tamil Nadu', 'Tirupattur', 12.4960, 78.5678,
      2200000, 7400, 24, 84, 82, 72, 52, 71, 'submitted', now() - interval '9 days', now() - interval '3 days'
    ),
    (
      '41000000-0000-4000-8000-000000000011', demo_owner_id, 'Arogya Amma Trust',
      'Rural Maternal Health Access',
      'Deploys nurse-led maternal outreach, transport coordination and high-risk pregnancy follow-up across hard-to-reach tribal and rural settlements.',
      'Pregnant women complete antenatal care and reach appropriate facilities before preventable complications escalate.',
      'Public health records establish need and the NGO has independently reviewed maternal referral outcomes from an earlier district program.',
      'Healthcare', 'Tamil Nadu', 'Dharmapuri', 12.1211, 78.1582,
      4000000, 8200, 24, 96, 95, 79, 39, 93, 'under_review', now() - interval '8 days', now() - interval '1 day'
    ),
    (
      '41000000-0000-4000-8000-000000000012', demo_owner_id, 'Malar Farmer Producer Trust',
      'Climate-Resilient Millet Livelihoods',
      'Supports smallholder farmers with millet seed banks, water-efficient cultivation, aggregation and contracts with institutional buyers.',
      'Rain-fed farming households increase income while reducing crop failure and input costs.',
      'Farmer enrolment is verified, but buyer pricing and rainfall variability leave moderate outcome uncertainty.',
      'Livelihood', 'Tamil Nadu', 'Krishnagiri', 12.5186, 78.2137,
      1800000, 3900, 20, 82, 90, 77, 43, 73, 'submitted', now() - interval '7 days', now() - interval '2 days'
    ),
    (
      '41000000-0000-4000-8000-000000000013', demo_owner_id, 'Pasumai Neer Initiative',
      'Urban Lake Catchment Restoration',
      'Restores feeder channels, establishes community water-quality monitoring and creates native buffer planting around two stressed urban lakes.',
      'Improved catchment function will increase seasonal water retention and reduce polluted runoff into neighbourhood water bodies.',
      'Hydrology mapping is complete, while encroachment permissions and multi-agency coordination create higher execution risk.',
      'Environment', 'Tamil Nadu', 'Salem', 11.6643, 78.1460,
      3000000, 18500, 30, 89, 69, 68, 58, 81, 'submitted', now() - interval '6 days', now() - interval '2 days'
    ),
    (
      '41000000-0000-4000-8000-000000000014', demo_owner_id, 'Blue Coast Tamil Nadu',
      'Coastal Plastic Recovery Program',
      'Organises fisher collectives, shoreline recovery teams and verified recycling partnerships across vulnerable coastal villages.',
      'Plastic leakage into marine ecosystems falls while coastal workers gain supplementary income from verified material recovery.',
      'Waste audits cover six beaches and recycler receipts will provide monthly evidence of recovered material.',
      'Environment', 'Tamil Nadu', 'Nagapattinam', 10.7672, 79.8449,
      1500000, 22400, 18, 84, 93, 88, 25, 86, 'submitted', now() - interval '5 days', now() - interval '1 day'
    ),
    (
      '41000000-0000-4000-8000-000000000015', demo_owner_id, 'Kaveri Enterprise Collective',
      'Farmer Value-Addition Micro Units',
      'Establishes shared grading, processing and packaging units for women and small farmers producing pulses, banana and traditional rice products.',
      'Producer groups retain more value locally and access larger institutional markets with consistent quality.',
      'Production records and buyer interviews support demand, but working-capital management capacity varies across groups.',
      'Rural Development', 'Tamil Nadu', 'Thanjavur', 10.7870, 79.1378,
      2500000, 5100, 27, 86, 81, 76, 44, 78, 'submitted', now() - interval '4 days', now() - interval '1 day'
    ),
    (
      '41000000-0000-4000-8000-000000000016', demo_owner_id, 'Neer Vazhi Foundation',
      'Village Drinking Water Mission',
      'Installs community purification units, source testing and trained local maintenance teams in saline-affected coastal settlements.',
      'Families gain reliable access to safer drinking water without recurring high household purchase costs.',
      'Laboratory water tests and household expenditure surveys provide a strong baseline for each selected village.',
      'Water & Sanitation', 'Tamil Nadu', 'Ramanathapuram', 9.3639, 78.8395,
      2200000, 10400, 18, 90, 97, 86, 23, 91, 'submitted', now() - interval '3 days', now() - interval '12 hours'
    ),
    (
      '41000000-0000-4000-8000-000000000017', demo_owner_id, 'Vidya Government Schools Foundation',
      'Digital Government Schools Initiative',
      'Equips 40 government schools with shared smart classrooms, offline bilingual content and sustained teacher coaching focused on mathematics and science.',
      'Students improve subject confidence and teachers routinely integrate high-quality digital resources into lessons.',
      'Learning assessments from a smaller pilot show gains, with a third-party evaluation included in the expansion design.',
      'Digital Inclusion', 'Tamil Nadu', 'Madurai', 9.9252, 78.1198,
      2500000, 12600, 24, 89, 73, 87, 26, 90, 'submitted', now() - interval '2 days', now() - interval '8 hours'
    ),
    (
      '41000000-0000-4000-8000-000000000018', demo_owner_id, 'Vaigai Watershed Forum',
      'Village Rainwater Recharge Network',
      'Revives recharge shafts, school rainwater systems and community water budgeting across drought-prone villages.',
      'Affordable local water measures improve groundwater recharge and reduce seasonal tanker dependence.',
      'Well-depth monitoring exists for half the villages; attribution to individual structures remains difficult.',
      'Rural Development', 'Tamil Nadu', 'Virudhunagar', 9.5680, 77.9624,
      800000, 8700, 15, 78, 91, 92, 18, 61, 'submitted', now() - interval '1 day', now() - interval '4 hours'
    )
  on conflict (id) do update set
    ngo_name = excluded.ngo_name,
    title = excluded.title,
    description = excluded.description,
    impact_statement = excluded.impact_statement,
    evidence_description = excluded.evidence_description,
    sector = excluded.sector,
    state = excluded.state,
    district = excluded.district,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    requested_amount = excluded.requested_amount,
    beneficiaries = excluded.beneficiaries,
    duration_months = excluded.duration_months,
    impact_score = excluded.impact_score,
    geo_need_score = excluded.geo_need_score,
    feasibility_score = excluded.feasibility_score,
    risk_score = excluded.risk_score,
    evidence_score = excluded.evidence_score,
    status = excluded.status,
    updated_at = excluded.updated_at;

  raise notice 'IGAI seed complete: 18 proposals linked to NGO profile %', demo_owner_id;
end $$;
