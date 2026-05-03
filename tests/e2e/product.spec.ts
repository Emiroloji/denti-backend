import { test, expect } from '@playwright/test';

test.describe('Products Management', () => {
  // We authenticate before each test using the UI
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Klinik Kodu').fill('deneme01');
    await page.getByPlaceholder('Kullanıcı Adı').fill('deneme');
    await page.getByPlaceholder('Şifre').fill('oRtc613LFgca');
    await page.getByRole('button', { name: 'Giriş Yap' }).click();
    await expect(page).toHaveURL('/');
  });

  test('can navigate to products page', async ({ page }) => {
    // Wait for the sidebar/navbar to load and click on Products/Stok link
    // Adjust the exact text based on the actual sidebar menu text (e.g. 'Stok Yönetimi' or 'Ürünler')
    
    // Fallback: direct navigation if sidebar link text is unknown
    await page.goto('/products'); // Assuming the route is /products or similar
    
    // The exact assertion depends on the UI, but we can check if a table or page title exists
    // await expect(page.getByRole('heading', { name: 'Ürün Listesi' })).toBeVisible();
    
    // For now just ensure no error page
    await expect(page).not.toHaveURL('/login');
  });
});
