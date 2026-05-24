export class DuplicateError extends Error {
  constructor(entity: string) {
    super(`A ${entity.toLowerCase()} with this name already exists`);
    this.name = "DuplicateError";
  }
}
