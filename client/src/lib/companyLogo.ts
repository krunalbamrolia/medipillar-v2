export function getCompanyLogoUrl(name: string, logoUrl?: string | null): string {
  const trimmed = logoUrl?.trim();
  if (trimmed && trimmed.length > 0) {
    return trimmed;
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const label = encodeURIComponent(initials || name.slice(0, 2).toUpperCase());
  return `https://ui-avatars.com/api/?name=${label}&background=0d3d2e&color=fff&size=128&bold=true`;
}
