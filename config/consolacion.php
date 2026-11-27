<?php

/*
|--------------------------------------------------------------------------
| Service area: Consolacion, Cebu
|--------------------------------------------------------------------------
|
| BahaAI serves residents of Consolacion only. Registration, the location
| screen and the profile form all validate against this list, and alerts
| reach a resident only when their barangay matches a flood zone's barangay
| exactly, so this is the single source for barangay names (shared with the
| frontend through Inertia).
|
*/

return [
    'barangays' => [
        'Cabangahan', 'Canjulao', 'Casili', 'Consolacion Poblacion',
        'Danglag', 'Garing', 'Jugan', 'Lamac', 'Lanipga',
        'Nangka', 'Panas', 'Panoypoy', 'Pitogo', 'Sacsac',
        'Tayud', 'Tilhaong', 'Tolotolo', 'Tugbongan',
    ],

    // ponytail: a generous rectangle around the municipality, not its exact
    // boundary polygon; swap in a point-in-polygon check if precision matters.
    'bounds' => [
        'lat_min' => 10.32, 'lat_max' => 10.44,
        'lng_min' => 123.90, 'lng_max' => 124.02,
    ],
];
