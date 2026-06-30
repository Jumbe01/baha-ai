<?php

namespace App\Http\Controllers;

use App\Models\AlertRecipient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = AlertRecipient::with(['alert.floodZone:id,name,barangay'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unreadCount' => $this->unreadCount($request),
        ]);
    }

    public function markRead(Request $request, AlertRecipient $notification): RedirectResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        if (! $notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return redirect()->back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        AlertRecipient::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return redirect()->back();
    }

    private function unreadCount(Request $request): int
    {
        return AlertRecipient::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();
    }
}
