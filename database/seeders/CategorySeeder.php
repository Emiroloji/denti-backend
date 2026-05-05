<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Sarf Malzemeler', 'color' => '#1890ff', 'description' => 'Genel sarf malzemeleri'],
            ['name' => 'Dolgu Malzemeleri', 'color' => '#52c41a', 'description' => 'Kompozit, amalgam vb.'],
            ['name' => 'Endodontik Malzemeler', 'color' => '#faad14', 'description' => 'Kanal tedavisi malzemeleri'],
            ['name' => 'Cerrahi Malzemeler', 'color' => '#ff4d4f', 'description' => 'Cerrahi alet ve sarflar'],
            ['name' => 'Protez Malzemeleri', 'color' => '#722ed1', 'description' => 'Ölçü maddeleri, porselen vb.'],
            ['name' => 'Ortodontik Malzemeler', 'color' => '#eb2f96', 'description' => 'Braket, tel vb.'],
            ['name' => 'Periodontolojik Malzemeler', 'color' => '#13c2c2', 'description' => 'Diş eti tedavisi malzemeleri'],
            ['name' => 'Pedodontik Malzemeler', 'color' => '#2f54eb', 'description' => 'Çocuk diş hekimliği malzemeleri'],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::create([
                'name' => $category['name'],
                'color' => $category['color'],
                'description' => $category['description'],
                'is_active' => true,
                'company_id' => 1, // Denti Merkez Klinik
            ]);
        }
    }
}
