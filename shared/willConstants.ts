export const CONSULTANTS = [
  {
    name: "Jacques Chery",
    email: "jacques.chery@genesisestateplanning.info",
    phone: "+44 7479 538275",
  },
  {
    name: "Ruth Stephenson",
    email: "ruth.stephenson@genesisestateplanning.info",
    phone: "+44 7790 892524",
  },
  {
    name: "Kayleigh Morley",
    email: "kayleigh.morley@genesisestateplanning.co.uk",
    phone: "+44 330 118 0937",
  },
  {
    name: "Lee Freer",
    email: "lee.freer@genesisestateplanning.info",
    phone: "+44 7773 536808",
  },
  {
    name: "Amelia Fox",
    email: "amelia.fox@genesisestateplanning.co.uk",
    phone: "+44 7479 538275",
  },
  {
    name: "Elli-Lou",
    email: "elli-lou@genesisestateplanning.info",
    phone: "+44 330 118 0937",
  },
  {
    name: "Lee Mellon",
    email: "lee.mellon@genesisestateplanning.info",
    phone: "+44 7790 892524",
  },
] as const;

export const CASE_COORDINATORS = [
  {
    name: "Kayleigh Morley",
    email: "kayleigh.morley@genesisestateplanning.co.uk",
    phone: "0330 118 0937",
  },
  {
    name: "Amelia Fox",
    email: "amelia.fox@genesisestateplanning.co.uk",
    phone: "0330 118 0937",
  },
] as const;

export const PRODUCTS = [
  { id: "single_will", label: "Single Will" },
  { id: "mirror_wills", label: "Mirror Wills" },
  { id: "lpa_property_finance", label: "LPA – Property & Finance" },
  { id: "lpa_health_welfare", label: "LPA – Health & Welfare" },
  { id: "both_lpas", label: "Both LPAs (Property & Finance + Health & Welfare)" },
  { id: "ppt", label: "Protective Property Trust (PPT)" },
  { id: "aat", label: "Family Trust (Asset Allocation Trust / AAT)" },
  { id: "right_to_occupy", label: "Right To Occupy" },
  { id: "discretionary_trust", label: "Discretionary Trust" },
  { id: "vulnerable_trust", label: "Vulnerable Person's Trust" },
  { id: "storage", label: "Will Storage" },
  { id: "bpr_trust", label: "BPR Trust (Business Property Relief Trust)" },
] as const;

export const ADMIN_EMAILS = [
  "office@genesisestateplanning.info",
  "customer-support@genesisestateplanning.info",
  "amelia@genesisestateplanning.info",
] as const;

export const PREFIXES = ["Mr.", "Mrs.", "Miss.", "Ms.", "Dr.", "Rev.", "Prof."] as const;

export const MARITAL_STATUSES = [
  "Single",
  "Married",
  "Civil Partnership",
  "Separated",
  "Divorced",
  "Widowed",
  "Partner / Common Law Spouse",
] as const;

export const CHILDREN_BENEFIT_AGES = ["18", "21", "25", "30"] as const;

export const PROPERTY_OWNERSHIP_TYPES = [
  "Sole Owner",
  "Joint Tenants",
  "Tenants in Common (Equal Shares)",
  "Tenants in Common (Unequal Shares)",
] as const;

export const FUNERAL_TYPES = ["Burial", "Cremation", "No Preference"] as const;

export const FORM_STEPS = [
  { id: 1,  title: "Appointment",    subtitle: "Consultant & products" },
  { id: 2,  title: "Clients",        subtitle: "Client 1 & Client 2" },
  { id: 3,  title: "Family",         subtitle: "Background & children" },
  { id: 4,  title: "Background",     subtitle: "Residency & capacity" },
  { id: 5,  title: "Due Diligence",  subtitle: "Compliance questions" },
  { id: 6,  title: "Executors",      subtitle: "Trustees & guardians" },
  { id: 7,  title: "Property",       subtitle: "Assets & overseas" },
  { id: 8,  title: "Life Insurance", subtitle: "Policies & protection" },
  { id: 9,  title: "Business",       subtitle: "Business interests" },
  { id: 10, title: "Pets",           subtitle: "Pet provisions" },
  { id: 11, title: "Funeral Wishes", subtitle: "Ceremony & organ donation" },
  { id: 12, title: "Gifts",          subtitle: "Legacies & charities" },
  { id: 13, title: "Beneficiaries",  subtitle: "Shares & conditions" },
  { id: 14, title: "Disaster & Notes", subtitle: "Clause & final notes" },
  { id: 15, title: "Review",         subtitle: "Preview & submit" },
] as const;
