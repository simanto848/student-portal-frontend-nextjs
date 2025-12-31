export const getId = (item: any): string => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (typeof item === "object") {
        if (item.id) return String(item.id);
        if (item._id) return String(item._id);
    }
    return "";
};
