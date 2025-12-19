<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Company;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:8',
        ]);

        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser) {
            return response()->json([
                'success' => false,
                'error' => 'Email already registered'
            ], 400);
        }

        $company = Company::first();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'company_id' => $company?->id,
            'is_manager' => false,
        ]);

        $token = Str::random(60);

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'company_id' => $user->company_id,
                'is_manager' => $user->is_manager,
            ],
            'company' => $company ? [
                'id' => $company->id,
                'name' => $company->name,
                'tier' => $company->tier,
            ] : null,
            'token' => $token,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'User not found'
            ], 404);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid credentials'
            ], 401);
        }

        $company = $user->company_id ? Company::find($user->company_id) : null;
        $token = Str::random(60);

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'company_id' => $user->company_id,
                'is_manager' => $user->is_manager,
            ],
            'company' => $company ? [
                'id' => $company->id,
                'name' => $company->name,
                'tier' => $company->tier,
            ] : null,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    public function me(Request $request)
    {
        $token = $request->header('Authorization');

        if (!$token) {
            return response()->json([
                'success' => false,
                'error' => 'Not authenticated'
            ], 401);
        }

        return response()->json([
            'success' => false,
            'error' => 'Not authenticated'
        ], 401);
    }
}
