import type { Company as SchemaCompany, Medicine as SchemaMedicine } from "../schema";

/** UI catalog types — same as API with optional legacy display fields */
export type Company = SchemaCompany & {
  categoryId?: string | null;
};

export type Medicine = SchemaMedicine & {
  mgo?: string | null;
  qty?: string | null;
  usage?: string | null;
  sideeffects?: string | null;
};
