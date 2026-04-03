// Simple cn utility - merges class names
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
