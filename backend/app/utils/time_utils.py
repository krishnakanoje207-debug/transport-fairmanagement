"""
Time Utilities
Time slab identification, scheduling, and time-based operations
"""
from datetime import datetime, time, timedelta
from typing import Optional, Tuple, List
from enum import Enum


class TimeSlab(str, Enum):
    """Time slab enum"""
    MORNING_PEAK = "morning_peak"    # 7-10 AM
    AFTERNOON = "afternoon"          # 10 AM - 4 PM
    EVENING_PEAK = "evening_peak"    # 4-8 PM
    NIGHT = "night"                  # 8 PM - 12 AM
    LATE_NIGHT = "late_night"        # 12 AM - 7 AM


class TimeUtils:
    """Time-related utility functions"""
    
    # Time slab definitions (hour ranges)
    TIME_SLABS = {
        TimeSlab.LATE_NIGHT: (0, 7),
        TimeSlab.MORNING_PEAK: (7, 10),
        TimeSlab.AFTERNOON: (10, 16),
        TimeSlab.EVENING_PEAK: (16, 20),
        TimeSlab.NIGHT: (20, 24),
    }
    
    @staticmethod
    def get_current_time_slab() -> TimeSlab:
        """
        Get current time slab based on current hour
        
        Returns:
            Current time slab
        """
        return TimeUtils.get_time_slab_for_hour(datetime.now().hour)
    
    @staticmethod
    def get_time_slab_for_hour(hour: int) -> TimeSlab:
        """
        Get time slab for a specific hour
        
        Args:
            hour: Hour of day (0-23)
        
        Returns:
            Time slab for that hour
        """
        for slab, (start, end) in TimeUtils.TIME_SLABS.items():
            if start <= hour < end:
                return slab
        return TimeSlab.LATE_NIGHT
    
    @staticmethod
    def get_time_slab_for_datetime(dt: datetime) -> TimeSlab:
        """
        Get time slab for a specific datetime
        
        Args:
            dt: Datetime object
        
        Returns:
            Time slab for that datetime
        """
        return TimeUtils.get_time_slab_for_hour(dt.hour)
    
    @staticmethod
    def get_time_slab_range(slab: TimeSlab) -> Tuple[int, int]:
        """
        Get hour range for a time slab
        
        Args:
            slab: Time slab
        
        Returns:
            Tuple of (start_hour, end_hour)
        """
        return TimeUtils.TIME_SLABS.get(slab, (0, 24))
    
    @staticmethod
    def get_time_slab_label(slab: TimeSlab) -> str:
        """
        Get human-readable label for time slab
        
        Args:
            slab: Time slab
        
        Returns:
            Label string
        """
        labels = {
            TimeSlab.MORNING_PEAK: "Morning Peak (7–10 AM)",
            TimeSlab.AFTERNOON: "Afternoon (10 AM–4 PM)",
            TimeSlab.EVENING_PEAK: "Evening Peak (4–8 PM)",
            TimeSlab.NIGHT: "Night (8 PM–12 AM)",
            TimeSlab.LATE_NIGHT: "Late Night (12 AM–7 AM)",
        }
        return labels.get(slab, "Unknown")
    
    @staticmethod
    def is_peak_hour(hour: Optional[int] = None) -> bool:
        """
        Check if a given hour is peak hour
        
        Args:
            hour: Hour to check (defaults to current hour)
        
        Returns:
            True if peak hour, False otherwise
        """
        if hour is None:
            hour = datetime.now().hour
        
        slab = TimeUtils.get_time_slab_for_hour(hour)
        return slab in [TimeSlab.MORNING_PEAK, TimeSlab.EVENING_PEAK]
    
    @staticmethod
    def is_within_quiet_hours(
        current_time: Optional[datetime] = None,
        quiet_start: str = "22:00",
        quiet_end: str = "07:00"
    ) -> bool:
        """
        Check if current time is within quiet hours
        
        Args:
            current_time: Time to check (defaults to now)
            quiet_start: Quiet hours start time (HH:MM format)
            quiet_end: Quiet hours end time (HH:MM format)
        
        Returns:
            True if within quiet hours, False otherwise
        """
        if current_time is None:
            current_time = datetime.now()
        
        try:
            start_hour, start_min = map(int, quiet_start.split(':'))
            end_hour, end_min = map(int, quiet_end.split(':'))
            
            current_minutes = current_time.hour * 60 + current_time.minute
            start_minutes = start_hour * 60 + start_min
            end_minutes = end_hour * 60 + end_min
            
            # Handle overnight quiet hours (e.g., 22:00 to 07:00)
            if start_minutes > end_minutes:
                return current_minutes >= start_minutes or current_minutes < end_minutes
            else:
                return start_minutes <= current_minutes < end_minutes
        
        except Exception:
            return False
    
    @staticmethod
    def format_duration(seconds: int) -> str:
        """
        Format duration in seconds to human-readable string
        
        Args:
            seconds: Duration in seconds
        
        Returns:
            Formatted string (e.g., "1h 23m", "45m", "12s")
        """
        if seconds < 60:
            return f"{seconds}s"
        elif seconds < 3600:
            minutes = seconds // 60
            return f"{minutes}m"
        else:
            hours = seconds // 3600
            minutes = (seconds % 3600) // 60
            if minutes > 0:
                return f"{hours}h {minutes}m"
            return f"{hours}h"
    
    @staticmethod
    def get_all_time_slabs() -> List[dict]:
        """
        Get all time slabs with their details
        
        Returns:
            List of time slab dictionaries
        """
        slabs = []
        for slab in TimeSlab:
            start, end = TimeUtils.get_time_slab_range(slab)
            slabs.append({
                "id": slab.value,
                "label": TimeUtils.get_time_slab_label(slab),
                "start_hour": start,
                "end_hour": end,
                "is_peak": slab in [TimeSlab.MORNING_PEAK, TimeSlab.EVENING_PEAK]
            })
        return slabs
    
    @staticmethod
    def add_minutes(dt: datetime, minutes: int) -> datetime:
        """Add minutes to datetime"""
        return dt + timedelta(minutes=minutes)
    
    @staticmethod
    def minutes_until(target_time: datetime) -> int:
        """Calculate minutes from now until target time"""
        delta = target_time - datetime.now()
        return int(delta.total_seconds() / 60)


# Convenience functions
def get_current_time_slab() -> TimeSlab:
    """Get current time slab"""
    return TimeUtils.get_current_time_slab()


def is_peak_hour() -> bool:
    """Check if current time is peak hour"""
    return TimeUtils.is_peak_hour()


def format_duration(seconds: int) -> str:
    """Format duration"""
    return TimeUtils.format_duration(seconds)


def is_within_quiet_hours(quiet_start: str = "22:00", quiet_end: str = "07:00") -> bool:
    """Check if within quiet hours"""
    return TimeUtils.is_within_quiet_hours(None, quiet_start, quiet_end)
