const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
export const rupiah = (n: number) => idr.format(Math.round(n));
/** YYYY-MM-DD di zona Asia/Jakarta. */
export const todayJakarta = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
