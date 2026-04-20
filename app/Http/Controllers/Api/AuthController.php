<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\JsonResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PragmaRX\Google2FALaravel\Support\Authenticator;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    use JsonResponseTrait;

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation error', 422, $validator->errors());
        }

        if (Auth::attempt($request->only('email', 'password'))) {
            $request->session()->regenerate();
            $user = Auth::user()->load(['company', 'roles']);

            // If 2FA is enabled but not verified yet for this session
            if ($user->two_factor_confirmed_at) {
                // Return a special status so the frontend knows to show the 2FA input
                // We keep the user logged in but the frontend should restrict access 
                // until verify2FA is called.
                return $this->success([
                    'two_factor_required' => true,
                    'user' => [
                        'id' => $user->id,
                        'email' => $user->email
                    ]
                ], 'Two-factor authentication required');
            }

            return $this->success([
                'user' => $user,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'company' => $user->company
            ], 'Login successful');
        }

        return $this->error('Invalid credentials', 401);
    }

    /**
     * Generate 2FA Secret and QR Code.
     */
    public function generate2FA(Request $request): JsonResponse
    {
        $user = $request->user();
        $google2fa = new Google2FA();

        if (!$user->two_factor_secret) {
            $user->two_factor_secret = $google2fa->generateSecretKey();
            $user->save();
        }

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $user->two_factor_secret
        );

        return $this->success([
            'secret' => $user->two_factor_secret,
            'qr_code_url' => $qrCodeUrl
        ], '2FA setup generated');
    }

    /**
     * Confirm and enable 2FA.
     */
    public function confirm2FA(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required'
        ]);

        $user = $request->user();
        $google2fa = new Google2FA();

        if ($google2fa->verifyKey($user->two_factor_secret, $request->code)) {
            $user->two_factor_confirmed_at = now();
            $user->save();

            return $this->success(null, '2FA enabled successfully');
        }

        return $this->error('Invalid verification code', 422);
    }

    /**
     * Verify 2FA code during login.
     */
    public function verify2FA(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required'
        ]);

        $user = Auth::user();
        if (!$user) {
             return $this->error('Unauthorized', 401);
        }

        $google2fa = new Google2FA();

        if ($google2fa->verifyKey($user->two_factor_secret, $request->code)) {
            // Store in session that 2FA is verified
            $request->session()->put('2fa_verified', true);

            $user->load(['company', 'roles']);

            return $this->success([
                'user' => $user,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'company' => $user->company
            ], '2FA verification successful');
        }

        return $this->error('Invalid verification code', 422);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['company', 'roles']);
        
        return $this->success([
            'user' => $user,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'company' => $user->company
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return $this->success(null, 'Logged out successfully');
    }
}
