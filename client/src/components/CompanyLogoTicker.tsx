import { getCompanyLogoUrl } from "@/lib/companyLogo";
import { Link } from "wouter";

interface CompanyLogoTickerProps {
  companies: { id: string; name: string; photo?: string | null; logoUrl?: string | null }[];
}

export function CompanyLogoTicker({ companies }: CompanyLogoTickerProps) {
  if (!companies.length) return null;

  const items = [...companies, ...companies];

  return (
    <section className="py-10 bg-muted/30 border-y overflow-hidden" aria-label="Partner companies">
      <div className="overflow-hidden">
        <div className="flex w-max animate-scroll items-center">
          {items.map((company, i) => {
            const logoSrc = getCompanyLogoUrl(company.name, company.logoUrl ?? company.photo);

            return (
              <Link
                key={`${company.id}-${i}`}
                href={`/company/${company.id}`}
                // Added 'group' class to coordinate image scaling with card hovering
                // Removed the rotation for a cleaner, more professional lift effect
                className="group mx-5 flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#0d3d2e]/30 hover:shadow-[0_12px_28px_rgba(13,61,46,0.12)]"
              >
                {/* Increased padding (p-5) to give the logo more breathing room so it doesn't touch the edges */}
                <div className="flex h-full w-full items-center justify-center p-5">
                  <img
                    src={logoSrc}
                    alt={company.name}
                    // Changed to explicit w-full h-full to force bounds, combined with object-contain to prevent any clipping
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}