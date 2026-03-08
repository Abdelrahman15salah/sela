export const toSlug = (name) =>
    String(name || '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
