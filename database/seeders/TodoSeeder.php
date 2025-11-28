<?php

namespace Database\Seeders;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Database\Seeder;

class TodoSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'test@example.com')->first();
        
        if (!$user) {
            echo "Test user not found. Run DatabaseSeeder first.\n";
            return;
        }

        // Create sample todos
        Todo::create([
            'title' => 'Complete project documentation',
            'description' => 'Write comprehensive documentation for the Todo API',
            'user_id' => $user->id,
            'due_date' => now()->addDays(3),
            'is_completed' => false
        ]);

        Todo::create([
            'title' => 'Review pull requests',
            'description' => 'Check and merge pending pull requests from team',
            'user_id' => $user->id,
            'due_date' => now()->addDays(5),
            'is_completed' => false
        ]);

        Todo::create([
            'title' => 'Update npm dependencies',
            'description' => 'Update all outdated packages to latest versions',
            'user_id' => $user->id,
            'due_date' => now()->addDays(15),
            'is_completed' => false
        ]);

        Todo::create([
            'title' => 'Fix authentication bug',
            'description' => 'Resolve critical login issue in production',
            'user_id' => $user->id,
            'due_date' => now()->subDays(2), // Overdue
            'is_completed' => false
        ]);

        Todo::create([
            'title' => 'Setup CI/CD pipeline',
            'description' => 'Configure GitHub Actions for automated testing',
            'user_id' => $user->id,
            'due_date' => null,
            'is_completed' => true,
            'completed_at' => now()
        ]);

        Todo::create([
            'title' => 'Refactor database queries',
            'description' => 'Optimize slow queries identified in monitoring',
            'user_id' => $user->id,
            'due_date' => now()->addDays(1), // Urgent
            'is_completed' => false
        ]);

        echo "Sample todos created successfully!\n";
    }
}
