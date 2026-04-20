<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Models\Role;
use App\Traits\JsonResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    use JsonResponseTrait;

    /**
     * Display a listing of the users for the authenticated user's company.
     */
    public function index(): JsonResponse
    {
        $companyId = Auth::user()->company_id;

        $users = User::where('company_id', $companyId)
            ->with('roles')
            ->get();

        return $this->success($users, 'Users retrieved successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(int $id): JsonResponse
    {
        $companyId = Auth::user()->company_id;

        $user = User::where('company_id', $companyId)
            ->with('roles')
            ->find($id);

        if (!$user) {
            return $this->error('User not found or unauthorized access.', 404);
        }

        return $this->success($user, 'User details retrieved successfully.');
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $companyId = Auth::user()->company_id;

        $user = User::where('company_id', $companyId)->find($id);

        if (!$user) {
            return $this->error('User not found or unauthorized access.', 404);
        }

        // Update user details
        $user->update($request->only(['name', 'is_active']));

        // Sync roles
        $role = Role::where('company_id', $companyId)
            ->where('id', $request->role_id)
            ->first();

        if ($role) {
            $user->syncRoles([$role->name]);
        }

        return $this->success($user->load('roles'), 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $currentUser = Auth::user();
        $companyId = $currentUser->company_id;

        $userToDelete = User::where('company_id', $companyId)->find($id);

        if (!$userToDelete) {
            return $this->error('User not found or unauthorized access.', 404);
        }

        // SECURITY: Prevent the authenticated user from deleting themselves
        if ($currentUser->id === $userToDelete->id) {
            return $this->error('You cannot delete your own account.', 403);
        }

        // SECURITY: Protect the main "Company Owner" from being deleted (assuming Owner role name is 'Owner')
        // Note: This logic can be refined based on specific "Owner" identification criteria
        if ($userToDelete->hasRole('Owner')) {
            return $this->error('The Company Owner cannot be deleted.', 403);
        }

        $userToDelete->delete();

        return $this->success(null, 'User deleted successfully.');
    }
}
