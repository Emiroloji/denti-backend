import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    // Go to the login page
    await page.goto('/login');

    // Assuming the fields are based on what we saw in LoginForm.tsx
    // The inputs have antd ids or placeholder, but using placeholder is easier since they are present.
    await page.getByPlaceholder('Klinik Kodu').fill('deneme01');
    await page.getByPlaceholder('Kullanıcı Adı').fill('deneme');
    await page.getByPlaceholder('Şifre').fill('oRtc613LFgca');

    // Click the login button
    await page.getByRole('button', { name: 'Giriş Yap' }).click();

    // Expect to be redirected to the homepage/dashboard
    await expect(page).toHaveURL('/');
    
    // Optionally wait for a dashboard element to be visible
    // await expect(page.getByText('Denti')).toBeVisible();
  });

  test('shows error message on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Klinik Kodu').fill('invalid_code');
    await page.getByPlaceholder('Kullanıcı Adı').fill('wrong_user');
    await page.getByPlaceholder('Şifre').fill('wrong_pass');

    await page.getByRole('button', { name: 'Giriş Yap' }).click();

    // Expect validation error message to appear
    await expect(page.getByText('Geçersiz kullanıcı adı veya şifre')).toBeVisible();
  });
});
