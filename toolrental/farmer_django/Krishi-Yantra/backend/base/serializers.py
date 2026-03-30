from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Tool, Booking
from .availability import available_units_for_tool


class ToolSerializer(serializers.ModelSerializer):
    available_units = serializers.SerializerMethodField(read_only=True)
    is_bookable = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Tool
        fields = [
            "id",
            "owner",
            "name",
            "image",
            "category",
            "description",
            "price_per_day",
            "quantity",
            "is_available",
            "available_units",
            "is_bookable",
        ]
        read_only_fields = ["owner", "available_units", "is_bookable"]

    def get_available_units(self, obj):
        return available_units_for_tool(obj)

    def get_is_bookable(self, obj):
        return available_units_for_tool(obj) > 0


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', read_only=True)
    phone_number = serializers.CharField(source='profile.phone_number', read_only=True, default='')
    address = serializers.CharField(source='profile.address', read_only=True, default='')
    location = serializers.CharField(source='profile.location', read_only=True, default='')

    class Meta:
        model = User
        fields = ["id", "username", "email", "name", "phone_number", "address", "location"]


class BookingSerializer(serializers.ModelSerializer):
    tool = ToolSerializer(read_only=True)
    renter = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = (
            "id",
            "tool",
            "renter",
            "start_date",
            "end_date",
            "units",
            "total_price",
            "status",
        )
