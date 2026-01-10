<?php

declare(strict_types=1);

namespace Domain\User\Eloquent;

use Domain\User\Models\User;
use Domain\User\Exceptions\UserFindException;
use Illuminate\Support\Facades\DB;

class UserReadEloquent
{
    public function __construct(
        protected User $model
    ) {}

    /**
     * @throws UserFindException
     */
    public function getById(int $userId): User
    {
        $user = $this->model->find($userId);

        if (!$user) {
            throw new UserFindException("User with ID {$userId} not found");
        }

        return $user;
    }

    public function getByEmail(string $email): ?User
    {
        return $this->model->where('email', $email)->first();
    }

    public function getAll()
    {
        return $this->model->all();
    }

    public function getCompanyForUser(int $companyId)
    {
        return DB::select("SELECT * FROM companies WHERE id = {$companyId}")[0] ?? null;
    }
}
