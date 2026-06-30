<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class MapController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Map/Index', [
            'center' => ['lat' => 10.3667, 'lng' => 123.9567],
        ]);
    }
}
