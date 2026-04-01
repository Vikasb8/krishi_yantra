"""Inventory: multiple units per tool; overlap uses peak concurrent bookings."""
from datetime import date, timedelta

ACTIVE_BOOKING_STATUSES = ("PENDING", "CONFIRMED")


def _intervals_for_tool(tool):
    today = date.today()
    qs = tool.booking_set.filter(status__in=ACTIVE_BOOKING_STATUSES)
    for b in qs:
        # Do not count bookings that are entirely in the past.
        if b.end_date < today:
            continue

        # Pending requests that are past the end date are not active, but pending ones
        # with current/future date ranges are still treated as real reservations.
        u = getattr(b, "units", None) or 1
        yield b.start_date, b.end_date, int(u)


def max_concurrent_units(tool, extra_intervals=None):
    """
    Peak total units committed on any single day (inclusive date ranges).
    extra_intervals: iterable of (start_date, end_date, units) proposed additions.
    """
    events = []
    for start, end, units in _intervals_for_tool(tool):
        events.append((start, units))
        events.append((end + timedelta(days=1), -units))
    if extra_intervals:
        for start, end, units in extra_intervals:
            events.append((start, int(units or 1)))
            events.append((end + timedelta(days=1), -int(units or 1)))
    if not events:
        return 0
    # Same calendar day: apply returns (-delta) before new starts (+delta) to avoid false peaks
    events.sort(key=lambda x: (x[0], x[1] > 0))
    current = 0
    peak = 0
    for _, delta in events:
        current += delta
        if current > peak:
            peak = current
    return peak


def available_units_for_tool(tool):
    """How many units are free at the busiest overlapping period."""
    qty = getattr(tool, "quantity", None) or 1
    return max(0, int(qty) - max_concurrent_units(tool))


def can_book_units(tool, start_date, end_date, units=1):
    """True if adding this booking does not exceed tool.quantity on any day."""
    if start_date >= end_date:
        return False
    qty = getattr(tool, "quantity", None) or 1
    peak = max_concurrent_units(tool, extra_intervals=[(start_date, end_date, units)])
    return peak <= int(qty)
