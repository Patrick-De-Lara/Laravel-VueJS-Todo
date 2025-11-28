<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAuthToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if auth token exists in localStorage (frontend handles this)
        // For server-side, we verify the token through Sanctum
        $token = $request->bearerToken() ?? $request->cookie('auth_token');
        
        if (!$token) {
            // Redirect to login if no token found
            return redirect()->route('login');
        }

        // Verify token with Sanctum
        try {
            $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;
            
            if (!$user) {
                return redirect()->route('login');
            }

            // Token is valid, set the authenticated user
            auth()->setUser($user);
            
        } catch (\Exception $e) {
            return redirect()->route('login');
        }

        return $next($request);
    }
}
