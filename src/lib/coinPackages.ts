// Coin packages for top-up - MODULE 2: Advanced Mock Payment
// This is a separate file because 'use server' files can only export async functions

export interface CoinPackage {
    id: string;
    coins: number;
    priceVND: number;
    priceUSD: number;
    label: { vi: string; en: string };
    popular?: boolean;
    bestValue?: boolean;
}

/**
 * Coin packages for top-up
 * Each package has specific test behavior:
 * - Packages < 500 coins: Always succeed (for testing success flow)
 * - Packages >= 500 coins: Always fail with mock error (for testing error UI)
 */
export const COIN_PACKAGES: CoinPackage[] = [
    {
        id: 'starter',
        coins: 20,
        priceVND: 10000,
        priceUSD: 1,
        label: { vi: 'Gói Khởi động', en: 'Starter Pack' },
    },
    {
        id: 'popular',
        coins: 100,
        priceVND: 50000,
        priceUSD: 5,
        label: { vi: 'Gói Phổ biến', en: 'Popular Pack' },
        popular: true,
    },
    {
        id: 'value',
        coins: 300,
        priceVND: 120000,
        priceUSD: 12,
        label: { vi: 'Gói Tiết kiệm', en: 'Value Pack' },
        bestValue: true,
    },
    {
        id: 'whale',
        coins: 500,
        priceVND: 200000,
        priceUSD: 20,
        label: { vi: 'Gói Đại gia', en: 'Whale Pack' },
        // Note: This package is designed to fail for testing error UI
    },
];

// Helper to get package by ID
export function getCoinPackageById(id: string): CoinPackage | undefined {
    return COIN_PACKAGES.find(pkg => pkg.id === id);
}
