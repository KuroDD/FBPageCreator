import { test, expect, chromium, BrowserContext } from "@playwright/test";

const authenticator = [
    {
        id: 1,
        username : '100091843406258',
        password : 'gFf1pn2NS',
        twofactorCode: 'LJBDSNIABXQCTE3K5SK7HT554SVOZCC5'
    }
];

test('Login to Facebook', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();

    const facebookLoginPage = await context.newPage();
    await facebookLoginPage.goto('https://mbasic.facebook.com');

    const usernameInput = facebookLoginPage.getByRole('textbox', { name: 'Phone number or email address' });
    const passwordInput = facebookLoginPage.getByRole('textbox', { name: 'Password' });
    const loginButton = facebookLoginPage.getByRole('button', { name: 'Log In' });

    await usernameInput.fill(authenticator[0].username);
    await passwordInput.fill(authenticator[0].password);
    await loginButton.click();
    await expect(facebookLoginPage).toHaveTitle('Enter login code to continue');

    const codeFacebookInput = facebookLoginPage.locator('#approvals_code');
    const submitBtn = facebookLoginPage.getByRole('button', { name: 'Submit Code' });

    const twoFaVerification = await context.newPage();
    await twoFaVerification.goto('https://2fa.live/');

    const inputCode = twoFaVerification.getByPlaceholder('BK5V TVQ7 D2RB...');
    await inputCode.fill(authenticator[0].twofactorCode);
    await twoFaVerification.getByText('Submit').click();

    await expect(twoFaVerification.getByPlaceholder('ABC|2FA Code')).toHaveValue(/.+/g);

    const twoFAcode = await twoFaVerification.getByPlaceholder('ABC|2FA Code').inputValue();
    const twoFAcodeNumber = twoFAcode.split('|')[1];

    await codeFacebookInput.fill(twoFAcodeNumber);
    await submitBtn.click();

    await expect(facebookLoginPage).toHaveTitle('Remember Browser');
    await facebookLoginPage.locator('#checkpointSubmitButton').click();


    await twoFaVerification.close();

    const facebookPage = await context.newPage();
    await facebookPage.goto('https://facebook.com');
    await expect(facebookLoginPage).toHaveTitle('Facebook');
})