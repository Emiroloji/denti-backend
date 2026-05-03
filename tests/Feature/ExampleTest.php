<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        // API login endpoint var mı kontrol et
        $response = $this->postJson('/api/login', []);

        // 422 validation hatası dönmeli (credentials eksik)
        $response->assertStatus(422);
    }
}
