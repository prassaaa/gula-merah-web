<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
        ])->validate();

        return User::create([
            'name' => $input['name'],
            'username' => $this->generateUsername($input['email']),
            'email' => $input['email'],
            'password' => $input['password'],
        ]);
    }

    private function generateUsername(string $email): string
    {
        $base = Str::slug(Str::before($email, '@'), '_') ?: Str::random(8);
        $username = Str::limit($base, 50, '');
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $suffix = '_'.$counter++;
            $username = Str::limit($base, 50 - strlen($suffix), '').$suffix;
        }

        return $username;
    }
}
